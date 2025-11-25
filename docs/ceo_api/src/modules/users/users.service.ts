import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserDetailDto,
  UserListDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Lista utilizadores com paginação e filtros
   */
  async findAll(
    tenantId: number,
    search?: string,
    isAdmin?: boolean,
    includeDeleted: boolean = false,
    limit: number = 50,
    offset: number = 0,
  ): Promise<UserListDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    let whereClause = '1=1';
    const request = pool.request();

    if (!includeDeleted) {
      whereClause += ' AND deleted_at IS NULL';
    }

    if (search) {
      whereClause += ' AND (email LIKE @search OR first_name LIKE @search OR last_name LIKE @search OR full_name LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (isAdmin !== undefined) {
      whereClause += ' AND is_admin = @isAdmin';
      request.input('isAdmin', sql.Bit, isAdmin);
    }

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM [user]
      WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get data
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);

    const result = await request.query(`
      SELECT
        id,
        email,
        first_name as firstName,
        last_name as lastName,
        full_name as fullName,
        avatar_url as avatarUrl,
        language,
        timezone,
        theme,
        is_admin as isAdmin,
        is_verified as isVerified,
        email_verified_at as emailVerifiedAt,
        two_factor_enabled as twoFactorEnabled,
        last_login_at as lastLoginAt,
        created_at as createdAt,
        updated_at as updatedAt,
        deleted_at as deletedAt
      FROM [user]
      WHERE ${whereClause}
      ORDER BY full_name
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      data: result.recordset,
      total,
      limit,
      offset,
    };
  }

  /**
   * Busca utilizador por ID com detalhes completos
   */
  async findOne(tenantId: number, id: number, includeDetails: boolean = false): Promise<UserDetailDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get user basic info
    const userResult = await pool
      .request()
      .input('id', sql.Int, id).query(`
        SELECT
          id,
          email,
          first_name as firstName,
          last_name as lastName,
          full_name as fullName,
          avatar_url as avatarUrl,
          language,
          timezone,
          theme,
          is_admin as isAdmin,
          is_verified as isVerified,
          email_verified_at as emailVerifiedAt,
          two_factor_enabled as twoFactorEnabled,
          last_login_at as lastLoginAt,
          created_at as createdAt,
          updated_at as updatedAt,
          deleted_at as deletedAt
        FROM [user]
        WHERE id = @id
      `);

    if (userResult.recordset.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user: UserDetailDto = userResult.recordset[0];

    if (includeDetails) {
      // Get companies
      const companiesResult = await pool
        .request()
        .input('userId', sql.Int, id).query(`
          SELECT
            c.id,
            c.name,
            c.code,
            uc.is_primary as isPrimary
          FROM [company] c
          INNER JOIN [user_company] uc ON c.id = uc.company_id
          WHERE uc.user_id = @userId
            AND uc.deleted_at IS NULL
          ORDER BY uc.is_primary DESC, c.name
        `);

      user.companies = companiesResult.recordset;

      // Get user profiles
      const profilesResult = await pool
        .request()
        .input('userId', sql.Int, id).query(`
          SELECT
            up.id,
            up.name,
            up.description,
            (SELECT COUNT(*) FROM [user_profile_permission] WHERE user_profile_id = up.id) as permissionCount
          FROM [user_profile] up
          INNER JOIN [user_user_profile] uup ON up.id = uup.user_profile_id
          WHERE uup.user_id = @userId
            AND up.deleted_at IS NULL
          ORDER BY up.name
        `);

      user.userProfiles = profilesResult.recordset;

      // Get direct permissions
      const permissionsResult = await pool
        .request()
        .input('userId', sql.Int, id).query(`
          SELECT
            p.id,
            p.module_code,
            p.permission_code,
            p.action,
            p.name,
            p.category
          FROM [permission] p
          INNER JOIN [user_permission] up ON p.id = up.permission_id
          WHERE up.user_id = @userId
            AND p.deleted_at IS NULL
          ORDER BY p.category, p.name
        `);

      user.directPermissions = permissionsResult.recordset;
    }

    return user;
  }

  /**
   * Cria novo utilizador
   */
  async create(tenantId: number, createDto: CreateUserDto): Promise<UserDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if email already exists
    const existsResult = await pool
      .request()
      .input('email', sql.NVarChar, createDto.email).query(`
        SELECT COUNT(*) as count
        FROM [user]
        WHERE email = @email AND deleted_at IS NULL
      `);

    if (existsResult.recordset[0].count > 0) {
      throw new ConflictException('Email already in use');
    }

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Hash password
      const passwordHash = await bcrypt.hash(createDto.password, 10);

      // Generate full name
      const fullName = `${createDto.firstName} ${createDto.lastName}`;

      // Create user
      const result = await transaction
        .request()
        .input('email', sql.NVarChar, createDto.email)
        .input('passwordHash', sql.NVarChar, passwordHash)
        .input('firstName', sql.NVarChar, createDto.firstName)
        .input('lastName', sql.NVarChar, createDto.lastName)
        .input('fullName', sql.NVarChar, fullName)
        .input('avatarUrl', sql.NVarChar, createDto.avatarUrl || null)
        .input('language', sql.NVarChar, createDto.language || 'pt')
        .input('timezone', sql.NVarChar, createDto.timezone || 'Europe/Lisbon')
        .input('theme', sql.NVarChar, createDto.theme || 'light')
        .input('isAdmin', sql.Bit, createDto.isAdmin || false).query(`
          INSERT INTO [user] (
            email, password_hash, first_name, last_name, full_name,
            avatar_url, language, timezone, theme, is_admin
          )
          OUTPUT INSERTED.id
          VALUES (
            @email, @passwordHash, @firstName, @lastName, @fullName,
            @avatarUrl, @language, @timezone, @theme, @isAdmin
          )
        `);

      const userId = result.recordset[0].id;

      // Assign companies
      if (createDto.companyIds && createDto.companyIds.length > 0) {
        for (const companyId of createDto.companyIds) {
          const isPrimary = companyId === createDto.primaryCompanyId;
          await transaction
            .request()
            .input('userId', sql.Int, userId)
            .input('companyId', sql.Int, companyId)
            .input('isPrimary', sql.Bit, isPrimary).query(`
              INSERT INTO [user_company] (user_id, company_id, is_primary)
              VALUES (@userId, @companyId, @isPrimary)
            `);
        }
      }

      // Assign user profiles
      if (createDto.userProfileIds && createDto.userProfileIds.length > 0) {
        for (const profileId of createDto.userProfileIds) {
          await transaction
            .request()
            .input('userId', sql.Int, userId)
            .input('profileId', sql.Int, profileId).query(`
              INSERT INTO [user_user_profile] (user_id, user_profile_id)
              VALUES (@userId, @profileId)
            `);
        }
      }

      // Assign direct permissions
      if (createDto.permissionIds && createDto.permissionIds.length > 0) {
        for (const permissionId of createDto.permissionIds) {
          await transaction
            .request()
            .input('userId', sql.Int, userId)
            .input('permissionId', sql.Int, permissionId).query(`
              INSERT INTO [user_permission] (user_id, permission_id)
              VALUES (@userId, @permissionId)
            `);
        }
      }

      await transaction.commit();

      return this.findOne(tenantId, userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Atualiza utilizador
   */
  async update(
    tenantId: number,
    id: number,
    updateDto: UpdateUserDto,
  ): Promise<UserDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.findOne(tenantId, id);

    // If updating email, check if not in use
    if (updateDto.email) {
      const existsResult = await pool
        .request()
        .input('email', sql.NVarChar, updateDto.email)
        .input('id', sql.Int, id).query(`
          SELECT COUNT(*) as count
          FROM [user]
          WHERE email = @email AND id != @id AND deleted_at IS NULL
        `);

      if (existsResult.recordset[0].count > 0) {
        throw new ConflictException('Email already in use');
      }
    }

    // Build update query
    const updates: string[] = [];
    const request = pool.request();

    if (updateDto.email !== undefined) {
      updates.push('email = @email');
      request.input('email', sql.NVarChar, updateDto.email);
    }

    if (updateDto.firstName !== undefined) {
      updates.push('first_name = @firstName');
      request.input('firstName', sql.NVarChar, updateDto.firstName);
    }

    if (updateDto.lastName !== undefined) {
      updates.push('last_name = @lastName');
      request.input('lastName', sql.NVarChar, updateDto.lastName);
    }

    // Update full_name if first or last name changed
    if (updateDto.firstName !== undefined || updateDto.lastName !== undefined) {
      const currentUser = await this.findOne(tenantId, id);
      const firstName = updateDto.firstName || currentUser.firstName;
      const lastName = updateDto.lastName || currentUser.lastName;
      updates.push('full_name = @fullName');
      request.input('fullName', sql.NVarChar, `${firstName} ${lastName}`);
    }

    if (updateDto.avatarUrl !== undefined) {
      updates.push('avatar_url = @avatarUrl');
      request.input('avatarUrl', sql.NVarChar, updateDto.avatarUrl);
    }

    if (updateDto.language !== undefined) {
      updates.push('language = @language');
      request.input('language', sql.NVarChar, updateDto.language);
    }

    if (updateDto.timezone !== undefined) {
      updates.push('timezone = @timezone');
      request.input('timezone', sql.NVarChar, updateDto.timezone);
    }

    if (updateDto.theme !== undefined) {
      updates.push('theme = @theme');
      request.input('theme', sql.NVarChar, updateDto.theme);
    }

    if (updateDto.isAdmin !== undefined) {
      updates.push('is_admin = @isAdmin');
      request.input('isAdmin', sql.Bit, updateDto.isAdmin);
    }

    if (updates.length > 0) {
      updates.push('updated_at = GETDATE()');

      request.input('id', sql.Int, id);

      await request.query(`
        UPDATE [user]
        SET ${updates.join(', ')}
        WHERE id = @id
      `);
    }

    return this.findOne(tenantId, id);
  }

  /**
   * Soft delete utilizador
   */
  async remove(tenantId: number, id: number): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.findOne(tenantId, id);

    await pool
      .request()
      .input('id', sql.Int, id).query(`
        UPDATE [user]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id
      `);
  }

  /**
   * Altera senha do utilizador
   */
  async changePassword(
    tenantId: number,
    id: number,
    newPassword: string,
  ): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.findOne(tenantId, id);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('passwordHash', sql.NVarChar, passwordHash).query(`
        UPDATE [user]
        SET password_hash = @passwordHash, password_changed_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id
      `);
  }

  /**
   * Atribui empresas ao utilizador
   */
  async assignCompanies(
    tenantId: number,
    id: number,
    companyIds: number[],
    primaryCompanyId?: number,
  ): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if user exists
    await this.findOne(tenantId, id);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Remove all existing company associations
      await transaction
        .request()
        .input('userId', sql.Int, id).query(`
          DELETE FROM [user_company]
          WHERE user_id = @userId
        `);

      // Add new associations
      for (const companyId of companyIds) {
        const isPrimary = companyId === primaryCompanyId;
        await transaction
          .request()
          .input('userId', sql.Int, id)
          .input('companyId', sql.Int, companyId)
          .input('isPrimary', sql.Bit, isPrimary).query(`
            INSERT INTO [user_company] (user_id, company_id, is_primary)
            VALUES (@userId, @companyId, @isPrimary)
          `);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      if (error.number === 547) {
        throw new BadRequestException('One or more company IDs are invalid');
      }
      throw error;
    }
  }

  /**
   * Atribui perfis de utilizador
   */
  async assignProfiles(
    tenantId: number,
    id: number,
    profileIds: number[],
  ): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if user exists
    await this.findOne(tenantId, id);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Remove all existing profile associations
      await transaction
        .request()
        .input('userId', sql.Int, id).query(`
          DELETE FROM [user_user_profile]
          WHERE user_id = @userId
        `);

      // Add new associations
      for (const profileId of profileIds) {
        await transaction
          .request()
          .input('userId', sql.Int, id)
          .input('profileId', sql.Int, profileId).query(`
            INSERT INTO [user_user_profile] (user_id, user_profile_id)
            VALUES (@userId, @profileId)
          `);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      if (error.number === 547) {
        throw new BadRequestException('One or more profile IDs are invalid');
      }
      throw error;
    }
  }

  /**
   * Atribui permissões diretas ao utilizador
   */
  async assignPermissions(
    tenantId: number,
    id: number,
    permissionIds: number[],
  ): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if user exists
    await this.findOne(tenantId, id);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Remove all existing direct permissions
      await transaction
        .request()
        .input('userId', sql.Int, id).query(`
          DELETE FROM [user_permission]
          WHERE user_id = @userId
        `);

      // Add new permissions
      for (const permissionId of permissionIds) {
        await transaction
          .request()
          .input('userId', sql.Int, id)
          .input('permissionId', sql.Int, permissionId).query(`
            INSERT INTO [user_permission] (user_id, permission_id)
            VALUES (@userId, @permissionId)
          `);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      if (error.number === 547) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
      throw error;
    }
  }
}
