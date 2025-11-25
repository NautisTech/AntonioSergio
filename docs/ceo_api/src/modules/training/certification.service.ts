import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { IssueCertificateDto, RevokeCertificateDto, CertificateStatus } from './dto/training.dto';
import * as sql from 'mssql';
import * as crypto from 'crypto';

/**
 * Certification Service
 * Manages certificate issuance, PDF generation, and verification
 */
@Injectable()
export class CertificationService {
  private readonly logger = new Logger(CertificationService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure certificate tables exist
   */
  private async ensureCertificateTables(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='training_certificates' AND xtype='U')
      BEGIN
        CREATE TABLE training_certificates (
          id INT IDENTITY(1,1) PRIMARY KEY,
          enrollment_id INT NOT NULL,
          certificate_number NVARCHAR(100) NOT NULL UNIQUE,
          verification_code NVARCHAR(100) NOT NULL UNIQUE,
          status NVARCHAR(50) NOT NULL DEFAULT 'issued',
          student_name NVARCHAR(200) NOT NULL,
          student_email NVARCHAR(200) NOT NULL,
          course_title NVARCHAR(200) NOT NULL,
          completion_date DATETIME NOT NULL,
          final_score DECIMAL(5, 2) NULL,
          instructor_name NVARCHAR(200) NULL,
          custom_data NVARCHAR(MAX) NULL, -- JSON
          pdf_url NVARCHAR(500) NULL,
          issued_at DATETIME DEFAULT GETDATE(),
          revoked_at DATETIME NULL,
          revocation_reason NVARCHAR(500) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (enrollment_id) REFERENCES training_enrollments(id)
        )

        CREATE INDEX idx_training_certificates_enrollment ON training_certificates(enrollment_id)
        CREATE INDEX idx_training_certificates_number ON training_certificates(certificate_number)
        CREATE INDEX idx_training_certificates_verification ON training_certificates(verification_code)
        CREATE INDEX idx_training_certificates_status ON training_certificates(status)
      END
    `);
  }

  /**
   * Issue certificate
   */
  async issueCertificate(dto: IssueCertificateDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCertificateTables(pool);

    // Get enrollment with course and user info
    const enrollment = await pool.request().input('enrollmentId', sql.Int, dto.enrollmentId).query(`
      SELECT
        e.*,
        c.id AS course_id,
        c.title AS course_title,
        c.certificate_enabled,
        c.instructor_id,
        u.full_name AS student_name,
        u.email AS student_email,
        i.name AS instructor_name
      FROM training_enrollments e
      INNER JOIN training_courses c ON e.course_id = c.id
      INNER JOIN [user] u ON e.user_id = u.id
      LEFT JOIN [user] i ON c.instructor_id = i.id
      WHERE e.id = @enrollmentId AND e.deleted_at IS NULL
    `);

    if (enrollment.recordset.length === 0) {
      throw new NotFoundException(`Enrollment with ID ${dto.enrollmentId} not found`);
    }

    const enrollmentData = enrollment.recordset[0];

    // Check if certificate is enabled for this course
    if (!enrollmentData.certificate_enabled) {
      throw new BadRequestException('Certificates are not enabled for this course');
    }

    // Check if enrollment is completed
    if (enrollmentData.status !== 'completed') {
      throw new BadRequestException('Student must complete the course before receiving a certificate');
    }

    // Check if certificate already exists
    const existing = await pool.request().input('enrollmentId', sql.Int, dto.enrollmentId).query(`
      SELECT id FROM training_certificates
      WHERE enrollment_id = @enrollmentId AND status != 'revoked'
    `);

    if (existing.recordset.length > 0) {
      throw new BadRequestException('Certificate already issued for this enrollment');
    }

    // Generate certificate number and verification code
    const certificateNumber = this.generateCertificateNumber(tenantId);
    const verificationCode = this.generateVerificationCode();

    // Get completion date (use completed_at or current date)
    const completionDate = enrollmentData.completed_at || new Date();

    // Calculate final score (average of all quiz scores)
    const quizScores = await pool.request().input('enrollmentId', sql.Int, dto.enrollmentId).query(`
      SELECT AVG(score) AS avg_score
      FROM (
        SELECT quiz_id, MAX(score) AS score
        FROM training_quiz_attempts
        WHERE enrollment_id = @enrollmentId
        GROUP BY quiz_id
      ) AS best_scores
    `);

    const finalScore = quizScores.recordset[0].avg_score || null;

    // Insert certificate
    const result = await pool
      .request()
      .input('enrollmentId', sql.Int, dto.enrollmentId)
      .input('certificateNumber', sql.NVarChar, certificateNumber)
      .input('verificationCode', sql.NVarChar, verificationCode)
      .input('status', sql.NVarChar, CertificateStatus.ISSUED)
      .input('studentName', sql.NVarChar, enrollmentData.student_name)
      .input('studentEmail', sql.NVarChar, enrollmentData.student_email)
      .input('courseTitle', sql.NVarChar, dto.customData?.title || enrollmentData.course_title)
      .input('completionDate', sql.DateTime, completionDate)
      .input('finalScore', sql.Decimal(5, 2), finalScore)
      .input('instructorName', sql.NVarChar, enrollmentData.instructor_name)
      .input('customData', sql.NVarChar, dto.customData ? JSON.stringify(dto.customData) : null).query(`
        INSERT INTO training_certificates (
          enrollment_id, certificate_number, verification_code, status,
          student_name, student_email, course_title, completion_date,
          final_score, instructor_name, custom_data
        )
        OUTPUT INSERTED.id
        VALUES (
          @enrollmentId, @certificateNumber, @verificationCode, @status,
          @studentName, @studentEmail, @courseTitle, @completionDate,
          @finalScore, @instructorName, @customData
        )
      `);

    const certificateId = result.recordset[0].id;

    this.logger.log(`Certificate issued: ${certificateNumber} for enrollment ${dto.enrollmentId}`);

    // Generate PDF (this could be done asynchronously in production)
    const certificate = await this.getCertificateById(certificateId, tenantId);
    await this.generateCertificatePDF(certificate, tenantId);

    return this.getCertificateById(certificateId, tenantId);
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCertificateTables(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        c.*,
        e.course_id,
        e.user_id
      FROM training_certificates c
      INNER JOIN training_enrollments e ON c.enrollment_id = e.id
      WHERE c.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return this.parseCertificate(result.recordset[0]);
  }

  /**
   * Get certificate by number
   */
  async getCertificateByNumber(certificateNumber: string, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCertificateTables(pool);

    const result = await pool.request().input('certificateNumber', sql.NVarChar, certificateNumber).query(`
      SELECT * FROM training_certificates WHERE certificate_number = @certificateNumber
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Certificate with number ${certificateNumber} not found`);
    }

    return this.parseCertificate(result.recordset[0]);
  }

  /**
   * Verify certificate
   */
  async verifyCertificate(certificateNumber: string, verificationCode: string, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCertificateTables(pool);

    const result = await pool
      .request()
      .input('certificateNumber', sql.NVarChar, certificateNumber)
      .input('verificationCode', sql.NVarChar, verificationCode).query(`
        SELECT * FROM training_certificates
        WHERE certificate_number = @certificateNumber AND verification_code = @verificationCode
      `);

    if (result.recordset.length === 0) {
      return {
        valid: false,
        message: 'Certificate not found or verification code is invalid',
      };
    }

    const certificate = this.parseCertificate(result.recordset[0]);

    if (certificate.status === CertificateStatus.REVOKED) {
      return {
        valid: false,
        message: 'Certificate has been revoked',
        reason: certificate.revocation_reason,
        revokedAt: certificate.revoked_at,
      };
    }

    return {
      valid: true,
      message: 'Certificate is valid',
      certificate,
    };
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(dto: RevokeCertificateDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCertificateTables(pool);

    // Check if exists
    await this.getCertificateById(dto.certificateId, tenantId);

    await pool
      .request()
      .input('id', sql.Int, dto.certificateId)
      .input('reason', sql.NVarChar, dto.reason).query(`
        UPDATE training_certificates
        SET
          status = 'revoked',
          revoked_at = GETDATE(),
          revocation_reason = @reason,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Certificate ${dto.certificateId} revoked: ${dto.reason}`);
    return this.getCertificateById(dto.certificateId, tenantId);
  }

  /**
   * Get certificates by enrollment
   */
  async getCertificatesByEnrollment(enrollmentId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCertificateTables(pool);

    const result = await pool.request().input('enrollmentId', sql.Int, enrollmentId).query(`
      SELECT * FROM training_certificates WHERE enrollment_id = @enrollmentId ORDER BY issued_at DESC
    `);

    return result.recordset.map(this.parseCertificate);
  }

  /**
   * Get certificates by user
   */
  async getCertificatesByUser(userId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCertificateTables(pool);

    const result = await pool.request().input('userId', sql.Int, userId).query(`
      SELECT
        c.*,
        co.title AS course_title,
        co.slug AS course_slug
      FROM training_certificates c
      INNER JOIN training_enrollments e ON c.enrollment_id = e.id
      INNER JOIN training_courses co ON e.course_id = co.id
      WHERE e.user_id = @userId
      ORDER BY c.issued_at DESC
    `);

    return result.recordset.map(this.parseCertificate);
  }

  /**
   * Generate certificate PDF
   * This is a placeholder - in production, you would use a proper PDF generation library
   * like puppeteer, pdfkit, or a service like CloudConvert
   */
  private async generateCertificatePDF(certificate: any, tenantId: number) {
    // Generate HTML template
    const html = this.generateCertificateHTML(certificate);

    // In production, you would:
    // 1. Use puppeteer to convert HTML to PDF
    // 2. Upload PDF to cloud storage (S3, Azure Blob, etc.)
    // 3. Update certificate record with PDF URL

    // For now, we'll just generate a data URL (base64 HTML)
    const pdfUrl = `data:text/html;base64,${Buffer.from(html).toString('base64')}`;

    // Update certificate with PDF URL
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await pool
      .request()
      .input('id', sql.Int, certificate.id)
      .input('pdfUrl', sql.NVarChar, pdfUrl).query(`
        UPDATE training_certificates SET pdf_url = @pdfUrl WHERE id = @id
      `);

    this.logger.log(`Certificate PDF generated for ${certificate.certificate_number}`);
  }

  /**
   * Generate certificate HTML template
   */
  private generateCertificateHTML(certificate: any): string {
    const completionDate = new Date(certificate.completion_date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado - ${certificate.certificate_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .certificate {
      background: white;
      width: 297mm;
      height: 210mm;
      padding: 40mm;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      position: relative;
      border: 15px solid #667eea;
    }

    .certificate::before {
      content: '';
      position: absolute;
      top: 20mm;
      left: 20mm;
      right: 20mm;
      bottom: 20mm;
      border: 2px solid #764ba2;
      pointer-events: none;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    .header p {
      font-size: 18px;
      color: #666;
      font-style: italic;
    }

    .content {
      text-align: center;
      margin: 40px 0;
    }

    .content .intro {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
    }

    .content .name {
      font-size: 42px;
      color: #667eea;
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
      text-decoration-color: #764ba2;
    }

    .content .course {
      font-size: 24px;
      color: #333;
      margin: 30px 0;
      line-height: 1.6;
    }

    .content .course-title {
      font-weight: bold;
      color: #764ba2;
      font-size: 28px;
    }

    .score {
      text-align: center;
      margin: 20px 0;
      font-size: 18px;
      color: #666;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #eee;
    }

    .signature {
      text-align: center;
      flex: 1;
    }

    .signature-line {
      border-top: 2px solid #333;
      width: 200px;
      margin: 0 auto 10px;
    }

    .signature-name {
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }

    .signature-title {
      font-size: 14px;
      color: #666;
      font-style: italic;
    }

    .certificate-info {
      text-align: center;
      flex: 1;
    }

    .certificate-number {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }

    .date {
      font-size: 16px;
      color: #333;
    }

    .verification {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }

    .verification-code {
      font-family: 'Courier New', monospace;
      color: #667eea;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <h1>Certificado de Conclusão</h1>
      <p>Certificate of Completion</p>
    </div>

    <div class="content">
      <p class="intro">Este certificado é atribuído a</p>
      <p class="intro" style="font-size: 16px; font-style: italic;">This certificate is awarded to</p>

      <div class="name">${certificate.student_name}</div>

      <p class="course">
        pela conclusão com sucesso do curso<br/>
        <span class="course-title">${certificate.course_title}</span>
      </p>

      ${certificate.final_score ? `
      <div class="score">
        Classificação Final: <strong>${certificate.final_score.toFixed(1)}%</strong>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-name">${certificate.instructor_name || 'Instrutor'}</div>
        <div class="signature-title">Instrutor do Curso</div>
      </div>

      <div class="certificate-info">
        <div class="certificate-number">Certificado Nº ${certificate.certificate_number}</div>
        <div class="date">${completionDate}</div>
      </div>

      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-name">Direção Académica</div>
        <div class="signature-title">Academic Board</div>
      </div>
    </div>

    <div class="verification">
      Código de Verificação: <span class="verification-code">${certificate.verification_code}</span><br/>
      Verifique a autenticidade deste certificado em https://example.com/verify
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate unique certificate number
   */
  private generateCertificateNumber(tenantId: number): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `CERT-${tenantId}-${year}-${random}`;
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Parse certificate record
   */
  private parseCertificate(record: any) {
    return {
      ...record,
      custom_data: record.custom_data ? JSON.parse(record.custom_data) : null,
    };
  }
}
