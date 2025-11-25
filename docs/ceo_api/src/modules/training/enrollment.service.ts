import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentFilterDto,
  EnrollmentStatus,
} from './dto/training.dto';
import * as sql from 'mssql';

/**
 * Enrollment Service
 * Manages course enrollments and access
 */
@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure enrollment tables exist
   */
  private async ensureEnrollmentTables(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='training_enrollments' AND xtype='U')
      BEGIN
        CREATE TABLE training_enrollments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          course_id INT NOT NULL,
          user_id INT NOT NULL,
          status NVARCHAR(50) NOT NULL DEFAULT 'pending',
          payment_reference NVARCHAR(100) NULL,
          payment_amount DECIMAL(10, 2) NULL,
          payment_date DATETIME NULL,
          enrolled_at DATETIME DEFAULT GETDATE(),
          expires_at DATETIME NULL,
          completed_at DATETIME NULL,
          progress_percentage DECIMAL(5, 2) DEFAULT 0,
          last_accessed_at DATETIME NULL,
          total_time_spent INT DEFAULT 0, -- in seconds
          notes NVARCHAR(MAX) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (course_id) REFERENCES training_courses(id),
          FOREIGN KEY (user_id) REFERENCES [user](id),
          UNIQUE (course_id, user_id)
        )

        CREATE INDEX idx_training_enrollments_course ON training_enrollments(course_id)
        CREATE INDEX idx_training_enrollments_user ON training_enrollments(user_id)
        CREATE INDEX idx_training_enrollments_status ON training_enrollments(status)
      END
    `);
  }

  /**
   * Create enrollment
   */
  async createEnrollment(dto: CreateEnrollmentDto, tenantId: number, enrolledByUserId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureEnrollmentTables(pool);

    const userId = dto.userId || enrolledByUserId;

    // Check if course exists
    const course = await pool.request().input('courseId', sql.Int, dto.courseId).query(`
      SELECT * FROM training_courses WHERE id = @courseId AND deleted_at IS NULL
    `);

    if (course.recordset.length === 0) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    const courseData = course.recordset[0];

    // Check if already enrolled
    const existing = await pool
      .request()
      .input('courseId', sql.Int, dto.courseId)
      .input('userId', sql.Int, userId).query(`
        SELECT id FROM training_enrollments
        WHERE course_id = @courseId AND user_id = @userId AND deleted_at IS NULL
      `);

    if (existing.recordset.length > 0) {
      throw new BadRequestException('User is already enrolled in this course');
    }

    // Check max enrollments
    if (courseData.max_enrollments) {
      const count = await pool.request().input('courseId', sql.Int, dto.courseId).query(`
        SELECT COUNT(*) as count FROM training_enrollments
        WHERE course_id = @courseId AND status IN ('active', 'completed') AND deleted_at IS NULL
      `);

      if (count.recordset[0].count >= courseData.max_enrollments) {
        throw new BadRequestException('Course has reached maximum enrollments');
      }
    }

    // Determine initial status
    let initialStatus = EnrollmentStatus.PENDING;
    if (!courseData.require_approval && (!courseData.price || dto.paymentReference)) {
      initialStatus = EnrollmentStatus.ACTIVE;
    }

    // Calculate expiry date
    let expiresAt: Date | null = null;
    if (courseData.enrollment_expiry_days) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + courseData.enrollment_expiry_days);
    }

    const result = await pool
      .request()
      .input('course_id', sql.Int, dto.courseId)
      .input('user_id', sql.Int, userId)
      .input('status', sql.NVarChar, initialStatus)
      .input('payment_reference', sql.NVarChar, dto.paymentReference || null)
      .input('payment_amount', sql.Decimal(10, 2), courseData.price || null)
      .input('payment_date', sql.DateTime, dto.paymentReference ? new Date() : null)
      .input('expires_at', sql.DateTime, expiresAt)
      .input('notes', sql.NVarChar, dto.notes || null).query(`
        INSERT INTO training_enrollments (
          course_id, user_id, status, payment_reference, payment_amount,
          payment_date, expires_at, notes
        )
        OUTPUT INSERTED.id
        VALUES (
          @course_id, @user_id, @status, @payment_reference, @payment_amount,
          @payment_date, @expires_at, @notes
        )
      `);

    const enrollmentId = result.recordset[0].id;

    // Update course enrollment count
    await pool.request().input('courseId', sql.Int, dto.courseId).query(`
      UPDATE training_courses
      SET enrollment_count = (
        SELECT COUNT(*) FROM training_enrollments
        WHERE course_id = @courseId AND status IN ('active', 'completed') AND deleted_at IS NULL
      )
      WHERE id = @courseId
    `);

    this.logger.log(`Enrollment created: Course ${dto.courseId}, User ${userId} (ID: ${enrollmentId})`);
    return this.getEnrollmentById(enrollmentId, tenantId);
  }

  /**
   * List enrollments
   */
  async listEnrollments(tenantId: number, filters: EnrollmentFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureEnrollmentTables(pool);

    const { courseId, userId, status, page = 1, pageSize = 20 } = filters;

    const offset = (page - 1) * pageSize;
    const conditions: string[] = ['e.deleted_at IS NULL'];
    const request = pool.request();

    if (courseId) {
      conditions.push('e.course_id = @courseId');
      request.input('courseId', sql.Int, courseId);
    }

    if (userId) {
      conditions.push('e.user_id = @userId');
      request.input('userId', sql.Int, userId);
    }

    if (status) {
      conditions.push('e.status = @status');
      request.input('status', sql.NVarChar, status);
    }

    const whereClause = conditions.join(' AND ');

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM training_enrollments e WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get data
    request.input('offset', sql.Int, offset).input('pageSize', sql.Int, pageSize);

    const result = await request.query(`
      SELECT
        e.*,
        c.title AS course_title,
        c.cover_image AS course_cover_image,
        u.full_name AS user_name,
        u.email AS user_email
      FROM training_enrollments e
      INNER JOIN training_courses c ON e.course_id = c.id
      INNER JOIN [user] u ON e.user_id = u.id
      WHERE ${whereClause}
      ORDER BY e.enrolled_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: result.recordset,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureEnrollmentTables(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        e.*,
        c.title AS course_title,
        c.slug AS course_slug,
        c.cover_image AS course_cover_image,
        c.passing_score AS course_passing_score,
        c.certificate_enabled AS course_certificate_enabled,
        u.full_name AS user_name,
        u.email AS user_email,
        u.foto_url AS user_photo
      FROM training_enrollments e
      INNER JOIN training_courses c ON e.course_id = c.id
      INNER JOIN [user] u ON e.user_id = u.id
      WHERE e.id = @id AND e.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Get enrollment by course and user
   */
  async getEnrollmentByUserAndCourse(userId: number, courseId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureEnrollmentTables(pool);

    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('courseId', sql.Int, courseId).query(`
        SELECT
          e.*,
          c.title AS course_title,
          c.passing_score AS course_passing_score
        FROM training_enrollments e
        INNER JOIN training_courses c ON e.course_id = c.id
        WHERE e.user_id = @userId AND e.course_id = @courseId AND e.deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(id: number, dto: UpdateEnrollmentDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureEnrollmentTables(pool);

    // Check if exists
    const enrollment = await this.getEnrollmentById(id, tenantId);

    const updates: string[] = ['updated_at = GETDATE()'];
    const request = pool.request().input('id', sql.Int, id);

    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);

      // If status changed to completed, set completed_at
      if (dto.status === EnrollmentStatus.COMPLETED) {
        updates.push('completed_at = GETDATE()');
        updates.push('progress_percentage = 100');
      }
    }

    if (dto.expiresAt !== undefined) {
      updates.push('expires_at = @expires_at');
      request.input('expires_at', sql.DateTime, dto.expiresAt ? new Date(dto.expiresAt) : null);
    }

    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (updates.length > 1) {
      await request.query(`UPDATE training_enrollments SET ${updates.join(', ')} WHERE id = @id`);

      // Update course stats if status changed
      if (dto.status !== undefined) {
        await this.updateCourseStats(enrollment.course_id, tenantId);
      }
    }

    this.logger.log(`Enrollment updated: ${id}`);
    return this.getEnrollmentById(id, tenantId);
  }

  /**
   * Approve enrollment
   */
  async approveEnrollment(id: number, tenantId: number) {
    return this.updateEnrollment(id, { status: EnrollmentStatus.ACTIVE }, tenantId);
  }

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(id: number, tenantId: number) {
    return this.updateEnrollment(id, { status: EnrollmentStatus.CANCELLED }, tenantId);
  }

  /**
   * Check if user has access to course
   */
  async hasAccessToCourse(userId: number, courseId: number, tenantId: number): Promise<boolean> {
    const enrollment = await this.getEnrollmentByUserAndCourse(userId, courseId, tenantId);

    if (!enrollment) {
      return false;
    }

    // Check if enrollment is active
    if (enrollment.status !== EnrollmentStatus.ACTIVE && enrollment.status !== EnrollmentStatus.COMPLETED) {
      return false;
    }

    // Check if enrollment is expired
    if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) {
      // Automatically expire
      await this.updateEnrollment(enrollment.id, { status: EnrollmentStatus.EXPIRED }, tenantId);
      return false;
    }

    return true;
  }

  /**
   * Update last accessed timestamp
   */
  async updateLastAccessed(enrollmentId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool.request().input('id', sql.Int, enrollmentId).query(`
      UPDATE training_enrollments
      SET last_accessed_at = GETDATE()
      WHERE id = @id
    `);
  }

  /**
   * Add time spent to enrollment
   */
  async addTimeSpent(enrollmentId: number, seconds: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, enrollmentId)
      .input('seconds', sql.Int, seconds).query(`
        UPDATE training_enrollments
        SET
          total_time_spent = total_time_spent + @seconds,
          last_accessed_at = GETDATE()
        WHERE id = @id
      `);
  }

  /**
   * Update course statistics
   */
  private async updateCourseStats(courseId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool.request().input('courseId', sql.Int, courseId).query(`
      UPDATE training_courses
      SET
        enrollment_count = (
          SELECT COUNT(*) FROM training_enrollments
          WHERE course_id = @courseId AND status IN ('active', 'completed') AND deleted_at IS NULL
        ),
        completion_count = (
          SELECT COUNT(*) FROM training_enrollments
          WHERE course_id = @courseId AND status = 'completed' AND deleted_at IS NULL
        )
      WHERE id = @courseId
    `);
  }

  /**
   * Get user's enrolled courses
   */
  async getUserEnrolledCourses(userId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureEnrollmentTables(pool);

    const result = await pool.request().input('userId', sql.Int, userId).query(`
      SELECT
        e.*,
        c.title,
        c.slug,
        c.description,
        c.cover_image,
        c.level,
        c.category,
        c.certificate_enabled
      FROM training_enrollments e
      INNER JOIN training_courses c ON e.course_id = c.id
      WHERE e.user_id = @userId AND e.deleted_at IS NULL
      ORDER BY e.enrolled_at DESC
    `);

    return result.recordset;
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const enrollment = await this.getEnrollmentById(id, tenantId);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE training_enrollments SET deleted_at = GETDATE() WHERE id = @id
    `);

    // Update course stats
    await this.updateCourseStats(enrollment.course_id, tenantId);

    this.logger.log(`Enrollment deleted: ${id}`);
    return { message: 'Enrollment deleted successfully' };
  }
}
