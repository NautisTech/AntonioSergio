import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import {
  CreateUserProfileDto,
  UpdateUserProfileDto,
  UserProfileDto,
  UserProfileDetailDto,
} from './dto/user-profile.dto';

@Injectable()
export class UserProfilesService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Lista todos os perfis com counts
   */
  async findAll(tenantId: number, includeDeleted: boolean = false): Promise<UserProfileDto[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    let whereClause = '1=1';
    if (!includeDeleted) {
      whereClause += ' AND up.deleted_at IS NULL';
    }

    const result = await pool.request().query(`
      SELECT
        up.id,
        up.name,
        up.description,
        up.is_default as isDefault,
        up.created_at as createdAt,
        up.updated_at as updatedAt,
        up.deleted_at as deletedAt,
        (SELECT COUNT(*) FROM [user_user_profile] uup WHERE uup.user_profile_id = up.id) as userCount,
        (SELECT COUNT(*) FROM [user_profile_permission] upp WHERE upp.user_profile_id = up.id) as permissionCount
      FROM [user_profile] up
      WHERE ${whereClause}
      ORDER BY up.is_default DESC, up.name
    `);

    return result.recordset;
  }

  /**
   * Busca perfil por ID com detalhes completos
   */
  async findOne(tenantId: number, id: number, includeDetails: boolean = false): Promise<UserProfileDetailDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get profile basic info
    const profileResult = await pool
      .request()
      .input('id', sql.Int, id).query(`
        SELECT
          up.id,
          up.name,
          up.description,
          up.is_default as isDefault,
          up.created_at as createdAt,
          up.updated_at as updatedAt,
          up.deleted_at as deletedAt,
          (SELECT COUNT(*) FROM [user_user_profile] uup WHERE uup.user_profile_id = up.id) as userCount,
          (SELECT COUNT(*) FROM [user_profile_permission] upp WHERE upp.user_profile_id = up.id) as permissionCount
        FROM [user_profile] up
        WHERE up.id = @id
      `);

    if (profileResult.recordset.length === 0) {
      throw new NotFoundException(`User profile with ID ${id} not found`);
    }

    const profile: UserProfileDetailDto = profileResult.recordset[0];

    if (includeDetails) {
      // Get permissions
      const permissionsResult = await pool
        .request()
        .input('profileId', sql.Int, id).query(`
          SELECT
            p.id,
            p.module_code,
            p.permission_code,
            p.action,
            p.name,
            p.category
          FROM [permission] p
          INNER JOIN [user_profile_permission] upp ON p.id = upp.permission_id
          WHERE upp.user_profile_id = @profileId
            AND p.deleted_at IS NULL
          ORDER BY p.category, p.name
        `);

      profile.permissions = permissionsResult.recordset;

      // Get users
      const usersResult = await pool
        .request()
        .input('profileId', sql.Int, id).query(`
          SELECT
            u.id,
            u.email,
            u.full_name as fullName
          FROM [user] u
          INNER JOIN [user_user_profile] uup ON u.id = uup.user_id
          WHERE uup.user_profile_id = @profileId
            AND u.deleted_at IS NULL
          ORDER BY u.full_name
        `);

      profile.users = usersResult.recordset;
    }

    return profile;
  }

  /**
   * Cria novo perfil
   */
  async create(tenantId: number, createDto: CreateUserProfileDto): Promise<UserProfileDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // If setting as default, unset other defaults
      if (createDto.isDefault) {
        await transaction
          .request().query(`
            UPDATE [user_profile]
            SET is_default = 0
            WHERE is_default = 1
          `);
      }

      // Create profile
      const result = await transaction
        .request()
        .input('name', sql.NVarChar, createDto.name)
        .input('description', sql.NVarChar, createDto.description || null)
        .input('isDefault', sql.Bit, createDto.isDefault || false).query(`
          INSERT INTO [user_profile] (name, description, is_default)
          OUTPUT INSERTED.id
          VALUES (@name, @description, @isDefault)
        `);

      const profileId = result.recordset[0].id;

      // Assign permissions if provided
      if (createDto.permissionIds && createDto.permissionIds.length > 0) {
        for (const permissionId of createDto.permissionIds) {
          await transaction
            .request()
            .input('profileId', sql.Int, profileId)
            .input('permissionId', sql.Int, permissionId).query(`
              INSERT INTO [user_profile_permission] (user_profile_id, permission_id)
              VALUES (@profileId, @permissionId)
            `);
        }
      }

      await transaction.commit();

      return this.findOne(tenantId, profileId);
    } catch (error) {
      await transaction.rollback();
      if (error.number === 2627 || error.number === 2601) {
        throw new ConflictException('A profile with this name already exists');
      }
      throw error;
    }
  }

  /**
   * Atualiza perfil
   */
  async update(
    tenantId: number,
    id: number,
    updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.findOne(tenantId, id);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // If setting as default, unset other defaults
      if (updateDto.isDefault) {
        await transaction
          .request().query(`
            UPDATE [user_profile]
            SET is_default = 0
            WHERE is_default = 1 AND id != ${id}
          `);
      }

      // Build update query dynamically
      const updates: string[] = [];
      const request = transaction.request();

      if (updateDto.name !== undefined) {
        updates.push('name = @name');
        request.input('name', sql.NVarChar, updateDto.name);
      }

      if (updateDto.description !== undefined) {
        updates.push('description = @description');
        request.input('description', sql.NVarChar, updateDto.description);
      }

      if (updateDto.isDefault !== undefined) {
        updates.push('is_default = @isDefault');
        request.input('isDefault', sql.Bit, updateDto.isDefault);
      }

      if (updates.length > 0) {
        updates.push('updated_at = GETDATE()');

        request.input('id', sql.Int, id);

        await request.query(`
          UPDATE [user_profile]
          SET ${updates.join(', ')}
          WHERE id = @id
        `);
      }

      await transaction.commit();

      return this.findOne(tenantId, id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Soft delete perfil
   */
  async remove(tenantId: number, id: number): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    const profile = await this.findOne(tenantId, id);

    // Prevent deletion of default profile if it has users
    if (profile.isDefault && (profile.userCount ?? 0) > 0) {
      throw new BadRequestException(
        'Cannot delete default profile while users are assigned. Reassign users first.',
      );
    }

    await pool
      .request()
      .input('id', sql.Int, id).query(`
        UPDATE [user_profile]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id
      `);
  }

  /**
   * Atribui permissões ao perfil (substitui todas)
   */
  async assignPermissions(
    tenantId: number,
    id: number,
    permissionIds: number[],
  ): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if profile exists
    await this.findOne(tenantId, id);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Remove all existing permissions
      await transaction
        .request()
        .input('profileId', sql.Int, id).query(`
          DELETE FROM [user_profile_permission]
          WHERE user_profile_id = @profileId
        `);

      // Add new permissions
      for (const permissionId of permissionIds) {
        await transaction
          .request()
          .input('profileId', sql.Int, id)
          .input('permissionId', sql.Int, permissionId).query(`
            INSERT INTO [user_profile_permission] (user_profile_id, permission_id)
            VALUES (@profileId, @permissionId)
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

  /**
   * Atribui utilizadores ao perfil
   */
  async assignUsers(tenantId: number, id: number, userIds: number[]): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if profile exists
    await this.findOne(tenantId, id);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      for (const userId of userIds) {
        // Check if already assigned
        const existsResult = await transaction
          .request()
          .input('userId', sql.Int, userId)
          .input('profileId', sql.Int, id).query(`
            SELECT COUNT(*) as count
            FROM [user_user_profile]
            WHERE user_id = @userId AND user_profile_id = @profileId
          `);

        if (existsResult.recordset[0].count === 0) {
          await transaction
            .request()
            .input('userId', sql.Int, userId)
            .input('profileId', sql.Int, id).query(`
              INSERT INTO [user_user_profile] (user_id, user_profile_id)
              VALUES (@userId, @profileId)
            `);
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      if (error.number === 547) {
        throw new BadRequestException('One or more user IDs are invalid');
      }
      throw error;
    }
  }

  /**
   * Remove utilizador do perfil
   */
  async removeUser(tenantId: number, id: number, userId: number): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('profileId', sql.Int, id)
      .input('userId', sql.Int, userId).query(`
        DELETE FROM [user_user_profile]
        WHERE user_profile_id = @profileId AND user_id = @userId
      `);
  }
}
