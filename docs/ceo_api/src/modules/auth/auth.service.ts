import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { MailerService } from '../mailer/mailer.service';
import { TenantGroupService } from './tenant-group.service';
import { AuthEmailTemplates } from '../../common/helpers/auth-email-templates';
import { getModuleName, getModuleIcon } from '../../common/constants/modules.constants';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as sql from 'mssql';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

interface LoginDto {
  email: string;
  password: string;
  tenantSlug?: string;
  tenant_slug?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private tenantGroupService: TenantGroupService,
  ) { }

  async getUserModules(userId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const mainPool = this.databaseService.getMainConnection();

    // Get active tenant modules
    const activeModulesResult = await mainPool
      .request()
      .input('tenantId', sql.Int, tenantId).query(`
            SELECT m.code
            FROM tenant_module tm
            INNER JOIN module m ON tm.module_id = m.id
            WHERE tm.tenant_id = @tenantId
              AND tm.is_enabled = 1
              AND tm.deleted_at IS NULL
              AND (tm.expires_at IS NULL OR tm.expires_at > GETDATE())
          `);

    const activeModules = activeModulesResult.recordset.map((m) => m.code);

    // If there are no active modules, return empty
    if (activeModules.length === 0) {
      return {
        modules: [],
        companies: [],
        totalPermissions: 0,
        permissionCodes: [],
      };
    }

    // Get user permissions filtered by active tenant modules
    const requestWithParams = pool.request().input('userId', sql.Int, userId);
    activeModules.forEach((module, i) => {
      requestWithParams.input(`module${i}`, sql.NVarChar, module);
    });

    const permissionsResult = await requestWithParams.query(`
            SELECT DISTINCT p.id, p.module_code, p.permission_code, p.action, p.name, p.description, p.category
            FROM [permission] p
            WHERE p.id IN (
              -- Direct user permissions
              SELECT permission_id FROM [user_permission] WHERE user_id = @userId
              UNION
              -- User profile permissions
              SELECT upp.permission_id
              FROM [user_profile_permission] upp
              INNER JOIN [user_user_profile] uup ON upp.user_profile_id = uup.user_profile_id
              WHERE uup.user_id = @userId
            )
            AND p.deleted_at IS NULL
            AND p.category IN (${activeModules.map((m, i) => `@module${i}`).join(', ')})
            ORDER BY p.category, p.name
          `);

    const permissions = permissionsResult.recordset;

    // Group permissions by module
    const modulesMap = new Map<string, any>();

    permissions.forEach((permission) => {
      const module = permission.category;

      if (!modulesMap.has(module)) {
        modulesMap.set(module, {
          module: module,
          name: getModuleName(module),
          icon: getModuleIcon(module),
          permissions: [],
        });
      }

      modulesMap.get(module).permissions.push({
        code: permission.permission_code,
        name: permission.name,
      });
    });

    // Convert Map to array
    const modules = Array.from(modulesMap.values());

    // Get user companies
    const companiesResult = await pool.request().input('userId', sql.Int, userId)
      .query(`
            SELECT
              uc.company_id,
              uc.is_primary,
              c.name AS company_name,
              c.code AS company_code,
              c.logo_url,
              c.color
            FROM [user_company] uc
            INNER JOIN [company] c ON uc.company_id = c.id
            WHERE uc.user_id = @userId
            ORDER BY uc.is_primary DESC
          `);

    return {
      modules,
      companies: companiesResult.recordset,
      totalPermissions: permissions.length,
      permissionCodes: permissions.map((p) => p.permission_code),
    };
  }

  async login(dto: LoginDto) {
    // Support both tenantSlug and tenant_slug for backwards compatibility
    const tenantSlug = dto.tenantSlug || dto.tenant_slug;

    // Debug logs
    // this.logger.debug(`Login attempt - tenantSlug: ${tenantSlug}, email: ${dto.email}`);

    // 1. Find tenant by slug (if provided) or email
    const tenant = await this.findTenant(tenantSlug, dto.email);

    // this.logger.debug(`Tenant found: ${tenant ? `id=${tenant.id}, slug=${tenant.slug}` : 'null'}`);

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Find user in tenant by email
    const user = await this.findUser(tenant.id, dto.email);

    // this.logger.debug(`User found: ${user ? `id=${user.id}, email=${user.email}` : 'null'}`);

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Validate password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

    // this.logger.debug(`Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3.5 Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Return partial response indicating 2FA is required
      return {
        requiresTwoFactor: true,
        userId: user.id,
        email: user.email,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      };
    }

    // 4. Get user permissions
    const permissions = await this.getUserPermissions(tenant.id, user.id);

    // 5. Get user companies
    const companies = await this.getUserCompanies(tenant.id, user.id);

    // 6. Get tenant group and available tenants
    const tenantGroupId = await this.tenantGroupService.getTenantGroupId(
      user.email,
      tenant.id,
    );
    const availableTenantIds = await this.tenantGroupService.getUserAvailableTenantIds(
      user.email,
    );

    // 7. Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: user.full_name,
      isAdmin: user.is_admin,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantGroupId: tenantGroupId,
      availableTenants: availableTenantIds,
      companies: companies.map((c) => c.company_id),
      primaryCompany: companies.find((c) => c.is_primary)?.company_id,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id, tenantId: tenant.id },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      },
    );

    // 8. Update last access
    await this.updateLastAccess(tenant.id, user.id);

    // 9. Audit log
    await this.logAccess(tenant.id, user.id, 'login');

    // 10. Get available tenant information for switcher
    const availableTenantGroups = await this.tenantGroupService.getUserAvailableTenants(
      user.email,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isAdmin: user.is_admin,
        isVerified: user.is_verified,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      companies: companies.map((c) => ({
        id: c.company_id,
        name: c.company_name,
        primary: c.is_primary,
      })),
      availableTenants: availableTenantGroups,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.findUserById(payload.tenantId, payload.sub);

      if (!user || user.deleted_at) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const permissions = await this.getUserPermissions(
        payload.tenantId,
        user.id,
      );

      const companies = await this.getUserCompanies(payload.tenantId, user.id);

      const newPayload = {
        sub: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        isAdmin: user.is_admin,
        tenantId: payload.tenantId,
        companies: companies.map((c) => c.company_id),
        primaryCompany: companies.find((c) => c.is_primary)?.company_id,
        permissions,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(userId: number, tenantId: number) {
    const user = await this.findUserById(tenantId, userId);

    if (!user || user.deleted_at) {
      return null;
    }

    return user;
  }

  // Private methods

  private async findTenant(slug?: string, email?: string) {
    const mainPool = this.databaseService.getMainConnection();

    let query = `
      SELECT id, name, slug, database_name
      FROM tenant
      WHERE deleted_at IS NULL
    `;

    const request = mainPool.request();

    if (slug) {
      query += ' AND slug = @slug';
      request.input('slug', sql.NVarChar, slug);
    } else if (email) {
      // If no slug provided, search by email domain
      const domain = email.split('@')[1];
      query += ' AND (slug = @domain OR custom_domain = @domain)';
      request.input('domain', sql.NVarChar, domain);
    } else {
      return null;
    }

    const result = await request.query(query);
    return result.recordset[0];
  }

  private async findUser(tenantId: number, emailOrName: string) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('emailOrName', sql.NVarChar, emailOrName)
      .query(`
        SELECT
          id,
          email,
          password_hash,
          first_name,
          last_name,
          full_name,
          avatar_url,
          language,
          timezone,
          theme,
          is_admin,
          is_verified,
          email_verified_at,
          two_factor_enabled,
          two_factor_secret,
          last_login_at,
          last_login_ip,
          failed_login_attempts,
          locked_until,
          password_changed_at,
          password_reset_token,
          password_reset_expires_at,
          verification_token,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM [user]
        WHERE (email = @emailOrName OR full_name = @emailOrName) AND deleted_at IS NULL
      `);

    return result.recordset[0];
  }

  private async findUserById(tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          id,
          email,
          password_hash,
          first_name,
          last_name,
          full_name,
          avatar_url,
          language,
          timezone,
          theme,
          is_admin,
          is_verified,
          email_verified_at,
          two_factor_enabled,
          two_factor_secret,
          last_login_at,
          last_login_ip,
          failed_login_attempts,
          locked_until,
          password_changed_at,
          password_reset_token,
          password_reset_expires_at,
          verification_token,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM [user]
        WHERE id = @userId AND deleted_at IS NULL
      `);

    return result.recordset[0];
  }

  private async getUserPermissions(
    tenantId: number,
    userId: number,
  ): Promise<string[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const mainPool = this.databaseService.getMainConnection();

    // Get active tenant modules
    const activeModulesResult = await mainPool
      .request()
      .input('tenantId', sql.Int, tenantId).query(`
            SELECT m.code
            FROM tenant_module tm
            INNER JOIN module m ON tm.module_id = m.id
            WHERE tm.tenant_id = @tenantId
              AND tm.is_enabled = 1
              AND tm.deleted_at IS NULL
              AND (tm.expires_at IS NULL OR tm.expires_at > GETDATE())
          `);

    const activeModules = activeModulesResult.recordset.map((m) => m.code);

    // If there are no active modules, return empty array
    if (activeModules.length === 0) {
      return [];
    }

    // Get user permissions filtered by active tenant modules
    const requestWithParams = pool.request().input('userId', sql.Int, userId);
    activeModules.forEach((module, i) => {
      requestWithParams.input(`module${i}`, sql.NVarChar, module);
    });

    const result = await requestWithParams.query(`
        SELECT DISTINCT p.permission_code
        FROM [permission] p
        WHERE p.id IN (
          -- Direct user permissions
          SELECT permission_id FROM [user_permission] WHERE user_id = @userId
          UNION
          -- User profile permissions
          SELECT upp.permission_id
          FROM [user_profile_permission] upp
          INNER JOIN [user_user_profile] uup ON upp.user_profile_id = uup.user_profile_id
          WHERE uup.user_id = @userId
        )
        AND p.deleted_at IS NULL
        AND p.category IN (${activeModules.map((m, i) => `@module${i}`).join(', ')})
      `);

    return result.recordset.map((r) => r.permission_code);
  }

  private async getUserCompanies(tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('userId', sql.Int, userId).query(`
        SELECT
          uc.company_id,
          uc.is_primary,
          c.name AS company_name,
          c.code AS company_code
        FROM [user_company] uc
        INNER JOIN [company] c ON uc.company_id = c.id
        WHERE uc.user_id = @userId
        ORDER BY uc.is_primary DESC
      `);

    return result.recordset;
  }

  private async updateLastAccess(tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool.request().input('userId', sql.Int, userId).query(`
        UPDATE [user]
        SET last_login_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @userId
      `);
  }

  private async logAccess(tenantId: number, userId: number, action: string) {
    const mainPool = this.databaseService.getMainConnection();

    await mainPool
      .request()
      .input('tenantId', sql.Int, tenantId)
      .input('logType', sql.NVarChar, 'auth')
      .input('action', sql.NVarChar, action)
      .input('message', sql.NVarChar, `User ${userId} performed ${action}`)
      .input('userId', sql.Int, userId).query(`
        INSERT INTO tenant_log (tenant_id, log_type, action, message, user_id, created_at)
        VALUES (@tenantId, @logType, @action, @message, @userId, GETDATE())
      `);
  }

  // ================================================================================
  // 2FA METHODS
  // ================================================================================

  /**
   * Generates a new 2FA secret and returns QR code for setup
   */
  async generate2FASetup(tenantId: number, userId: number) {
    const user = await this.findUserById(tenantId, userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `CEO Platform (${user.email})`,
      issuer: 'CEO Platform',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    // Save secret temporarily (not confirmed yet)
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('secret', sql.NVarChar, secret.base32).query(`
                UPDATE [user]
                SET two_factor_secret = @secret, two_factor_enabled = 0, updated_at = GETDATE()
                WHERE id = @userId
            `);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  /**
   * Confirms and enables 2FA after verifying the first code
   */
  async enable2FA(tenantId: number, userId: number, token: string) {
    const user = await this.findUserById(tenantId, userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = user.two_factor_secret;

    if (!secret) {
      throw new BadRequestException(
        '2FA not configured. Run setup first.',
      );
    }

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time periods of difference
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Enable 2FA
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('userId', sql.Int, userId).query(`
                UPDATE [user]
                SET two_factor_enabled = 1, updated_at = GETDATE()
                WHERE id = @userId
            `);

    return {
      success: true,
      message: '2FA enabled successfully',
    };
  }

  /**
   * Verifies 2FA code during login
   */
  async verify2FALogin(email: string, tenantSlug: string, token: string) {
    // Find tenant
    const tenant = await this.findTenant(tenantSlug, email);

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find user
    const user = await this.findUser(tenant.id, email);

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const secret = user.two_factor_secret;
    const enabled = user.two_factor_enabled;

    if (!enabled || !secret) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Generate JWT tokens normally
    const permissions = await this.getUserPermissions(tenant.id, user.id);
    const companies = await this.getUserCompanies(tenant.id, user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: user.full_name,
      isAdmin: user.is_admin,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      companies: companies.map((c) => c.company_id),
      primaryCompany: companies.find((c) => c.is_primary)?.company_id,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id, tenantId: tenant.id },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      },
    );

    // Update last access
    await this.updateLastAccess(tenant.id, user.id);

    // Audit log
    await this.logAccess(tenant.id, user.id, 'login_2fa');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isAdmin: user.is_admin,
        isVerified: user.is_verified,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      companies: companies.map((c) => ({
        id: c.company_id,
        name: c.company_name,
        primary: c.is_primary,
      })),
    };
  }

  /**
   * Disables 2FA after password verification
   */
  async disable2FA(tenantId: number, userId: number, password: string) {
    const user = await this.findUserById(tenantId, userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    // Disable 2FA
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('userId', sql.Int, userId).query(`
                UPDATE [user]
                SET two_factor_enabled = 0, two_factor_secret = NULL, updated_at = GETDATE()
                WHERE id = @userId
            `);

    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }

  /**
   * Checks 2FA status for a user
   */
  async get2FAStatus(tenantId: number, userId: number) {
    const user = await this.findUserById(tenantId, userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      enabled: user.two_factor_enabled === true,
      method: user.two_factor_enabled ? 'authenticator' : null,
    };
  }

  // ================================================================================
  // EMAIL VERIFICATION METHODS
  // ================================================================================

  /**
   * Sends verification email to user
   */
  async sendVerificationEmail(email: string, tenantSlug: string) {
    const tenant = await this.findTenant(tenantSlug, email);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const user = await this.findUser(tenant.id, email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_verified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Save token in database
    const pool = await this.databaseService.getTenantConnection(tenant.id);

    await pool
      .request()
      .input('userId', sql.Int, user.id)
      .input('token', sql.NVarChar, verificationToken).query(`
                UPDATE [user]
                SET verification_token = @token, updated_at = GETDATE()
                WHERE id = @userId
            `);

    // Build verification link (redirects to settings)
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const locale = this.configService.get('DEFAULT_LOCALE') || 'pt';
    const verificationLink = `${frontendUrl}/${locale}/apps/definicoes?tab=security&verifyToken=${verificationToken}&verifyEmail=${encodeURIComponent(email)}&tenant=${tenantSlug}`;

    // Send email using mailer service
    const emailHtml = AuthEmailTemplates.emailVerification({
      link: verificationLink,
    });

    await this.mailerService.sendSimpleEmail(
      email,
      tenant.id,
      'Email Verification',
      emailHtml,
    );

    return {
      success: true,
      message: 'Verification email sent successfully',
      verificationLink, // For development/debug
    };
  }

  /**
   * Verifies user email using token
   */
  async verifyEmail(token: string, email: string, tenantSlug: string) {
    const tenant = await this.findTenant(tenantSlug, email);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const user = await this.findUser(tenant.id, email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_verified) {
      return {
        success: true,
        message: 'Email was already verified',
      };
    }

    const storedToken = user.verification_token;

    if (!storedToken) {
      throw new BadRequestException('Verification token not found');
    }

    if (storedToken !== token) {
      throw new BadRequestException('Invalid verification token');
    }

    // Mark email as verified
    const pool = await this.databaseService.getTenantConnection(tenant.id);

    await pool
      .request()
      .input('userId', sql.Int, user.id).query(`
                UPDATE [user]
                SET is_verified = 1, email_verified_at = GETDATE(), verification_token = NULL, updated_at = GETDATE()
                WHERE id = @userId
            `);

    return {
      success: true,
      message: 'Email verified successfully!',
    };
  }

  // ================================================================================
  // PASSWORD RESET METHODS
  // ================================================================================

  /**
   * Initiates password recovery process
   */
  async forgotPassword(email: string, tenantSlug: string) {
    const tenant = await this.findTenant(tenantSlug, email);

    if (!tenant) {
      // Don't reveal whether tenant exists for security
      return {
        success: true,
        message:
          'If the email exists, you will receive a link to reset your password',
      };
    }

    const user = await this.findUser(tenant.id, email);

    if (!user || user.deleted_at) {
      // Don't reveal whether user exists for security
      return {
        success: true,
        message:
          'If the email exists, you will receive a link to reset your password',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    // Save token in database
    const pool = await this.databaseService.getTenantConnection(tenant.id);

    await pool
      .request()
      .input('userId', sql.Int, user.id)
      .input('resetToken', sql.NVarChar, resetToken)
      .input('expiresAt', sql.DateTime, expiresAt).query(`
                UPDATE [user]
                SET password_reset_token = @resetToken, password_reset_expires_at = @expiresAt, updated_at = GETDATE()
                WHERE id = @userId
            `);

    // Build reset link (using forgot-password with token and locale)
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const locale = this.configService.get('DEFAULT_LOCALE') || 'pt';
    const resetLink = `${frontendUrl}/${locale}/forgot-password?token=${resetToken}&email=${encodeURIComponent(email)}&tenant=${tenantSlug}`;

    // Send email using mailer service
    const emailHtml = AuthEmailTemplates.passwordReset({
      link: resetLink,
    });

    try {
      await this.mailerService.sendSimpleEmail(
        email,
        tenant.id,
        'Password Reset',
        emailHtml,
      );
    } catch (error) {
      console.error('Error sending reset email:', error);
    }

    // Audit log
    await this.logAccess(tenant.id, user.id, 'password_reset_requested');

    return {
      success: true,
      message:
        'If the email exists, you will receive a link to reset your password',
      resetLink, // For development/debug
    };
  }

  /**
   * Resets password using reset token
   */
  async resetPassword(
    token: string,
    email: string,
    tenantSlug: string,
    newPassword: string,
  ) {
    const tenant = await this.findTenant(tenantSlug, email);

    if (!tenant) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.findUser(tenant.id, email);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const storedToken = user.password_reset_token;
    const expiresAt = user.password_reset_expires_at
      ? new Date(user.password_reset_expires_at)
      : null;

    if (!storedToken) {
      throw new BadRequestException('Reset token not found');
    }

    if (storedToken !== token) {
      throw new BadRequestException('Invalid reset token');
    }

    if (expiresAt && new Date() > expiresAt) {
      throw new BadRequestException('Expired reset token');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear token
    const pool = await this.databaseService.getTenantConnection(tenant.id);

    await pool
      .request()
      .input('userId', sql.Int, user.id)
      .input('passwordHash', sql.NVarChar, newPasswordHash).query(`
                UPDATE [user]
                SET password_hash = @passwordHash, password_reset_token = NULL, password_reset_expires_at = NULL, password_changed_at = GETDATE(), updated_at = GETDATE()
                WHERE id = @userId
            `);

    // Audit log
    await this.logAccess(tenant.id, user.id, 'password_reset_completed');

    return {
      success: true,
      message: 'Password reset successfully!',
    };
  }

  /**
   * Changes password for logged-in user (requires current password)
   */
  async changePassword(
    tenantId: number,
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findUserById(tenantId, userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect current password');
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('passwordHash', sql.NVarChar, newPasswordHash).query(`
                UPDATE [user]
                SET password_hash = @passwordHash, password_changed_at = GETDATE(), updated_at = GETDATE()
                WHERE id = @userId
            `);

    // Audit log
    await this.logAccess(tenantId, userId, 'password_changed');

    return {
      success: true,
      message: 'Password changed successfully!',
    };
  }

  /**
   * Deactivates user account (soft delete)
   */
  async deactivateAccount(tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool.request().input('userId', sql.Int, userId).query(`
                UPDATE [user]
                SET deleted_at = GETDATE(), updated_at = GETDATE()
                WHERE id = @userId
            `);

    // Audit log
    await this.logAccess(tenantId, userId, 'account_deactivated');

    return {
      success: true,
      message: 'Account deactivated successfully!',
    };
  }

  // ================================================================================
  // TENANT SWITCHING METHODS
  // ================================================================================

  /**
   * Switches tenant within a group
   */
  async switchTenant(
    email: string,
    currentTenantId: number,
    targetTenantId: number,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // 1. Check if user can switch to target tenant
    const canSwitch = await this.tenantGroupService.canUserSwitchToTenant(
      email,
      targetTenantId,
    );

    if (!canSwitch) {
      throw new ForbiddenException(
        'You do not have permission to access this tenant',
      );
    }

    // 2. Get target tenant information
    const targetTenantInfo = await this.tenantGroupService.getTenantInfo(
      email,
      targetTenantId,
    );

    if (!targetTenantInfo) {
      throw new NotFoundException('Tenant not found');
    }

    // 3. Find tenant in main DB
    const mainPool = this.databaseService.getMainConnection();
    const tenantResult = await mainPool
      .request()
      .input('tenantId', sql.Int, targetTenantId).query(`
        SELECT id, name, slug, database_name
        FROM tenant
        WHERE id = @tenantId AND deleted_at IS NULL
      `);

    const targetTenant = tenantResult.recordset[0];

    if (!targetTenant) {
      throw new NotFoundException('Tenant not found or inactive');
    }

    // 4. Find user in target tenant
    const targetUser = await this.findUser(targetTenantId, email);

    if (!targetUser || targetUser.deleted_at) {
      throw new UnauthorizedException(
        'User does not exist or is inactive in this tenant',
      );
    }

    // 5. Get permissions in new tenant
    const permissions = await this.getUserPermissions(
      targetTenantId,
      targetUser.id,
    );

    // 6. Get companies in new tenant
    const companies = await this.getUserCompanies(targetTenantId, targetUser.id);

    // 7. Get tenant group ID
    const tenantGroupId = await this.tenantGroupService.getTenantGroupId(
      email,
      targetTenantId,
    );

    // 8. Get available tenants
    const availableTenantIds = await this.tenantGroupService.getUserAvailableTenantIds(
      email,
    );

    // 9. Generate new JWT with target tenant data
    const payload = {
      sub: targetUser.id,
      email: targetUser.email,
      firstName: targetUser.first_name,
      lastName: targetUser.last_name,
      fullName: targetUser.full_name,
      isAdmin: targetUser.is_admin,
      tenantId: targetTenant.id,
      tenantSlug: targetTenant.slug,
      tenantGroupId: tenantGroupId,
      availableTenants: availableTenantIds,
      companies: companies.map((c) => c.company_id),
      primaryCompany: companies.find((c) => c.is_primary)?.company_id,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: targetUser.id, tenantId: targetTenant.id },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      },
    );

    // 10. Update last access
    await this.updateLastAccess(targetTenantId, targetUser.id);

    // 11. Log switch
    if (tenantGroupId) {
      await this.tenantGroupService.logTenantSwitch(
        email,
        currentTenantId,
        targetTenantId,
        tenantGroupId,
        ipAddress,
        userAgent,
      );
    }

    // 12. Audit log
    await this.logAccess(
      targetTenantId,
      targetUser.id,
      `tenant_switch_from_${currentTenantId}`,
    );

    // 13. Get available tenant information
    const availableTenantGroups = await this.tenantGroupService.getUserAvailableTenants(
      email,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.first_name,
        lastName: targetUser.last_name,
        fullName: targetUser.full_name,
        avatarUrl: targetUser.avatar_url,
        isAdmin: targetUser.is_admin,
        isVerified: targetUser.is_verified,
      },
      tenant: {
        id: targetTenant.id,
        name: targetTenant.name,
        slug: targetTenant.slug,
      },
      companies: companies.map((c) => ({
        id: c.company_id,
        name: c.company_name,
        primary: c.is_primary,
      })),
      availableTenants: availableTenantGroups,
    };
  }

  /**
   * Returns list of available tenants for user
   */
  async getAvailableTenants(email: string) {
    return this.tenantGroupService.getUserAvailableTenants(email);
  }
}
