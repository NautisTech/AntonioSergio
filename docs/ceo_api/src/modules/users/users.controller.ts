import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserDetailDto,
  UserListDto,
  ChangePasswordDto,
  AssignCompaniesDto,
  AssignProfilesDto,
  AssignUserPermissionsDto,
} from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Lista utilizadores com paginação e filtros
   */
  @Get()
  @RequirePermissions('users.list')
  @ApiOperation({
    summary: 'List all users',
    description:
      'Returns a paginated list of users with optional filters. Supports searching by email, name, and filtering by admin status.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter by email, first name, last name, or full name',
    example: 'john',
  })
  @ApiQuery({
    name: 'isAdmin',
    required: false,
    type: Boolean,
    description: 'Filter by admin status (true/false)',
    example: false,
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted users in results',
    example: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records per page',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UserListDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('isAdmin') isAdmin?: boolean,
    @Query('includeDeleted') includeDeleted?: boolean,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<UserListDto> {
    const tenantId = req.user.tenantId;
    return this.usersService.findAll(
      tenantId,
      search,
      isAdmin,
      includeDeleted || false,
      limit || 50,
      offset || 0,
    );
  }

  /**
   * Busca utilizador por ID
   */
  @Get(':id')
  @RequirePermissions('users.view')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Returns detailed information about a specific user. Optionally includes related data such as companies, user profiles, and direct permissions.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiQuery({
    name: 'includeDetails',
    required: false,
    type: Boolean,
    description: 'Include detailed information (companies, profiles, permissions)',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('includeDetails') includeDetails?: boolean,
  ): Promise<UserDetailDto> {
    const tenantId = req.user.tenantId;
    return this.usersService.findOne(tenantId, id, includeDetails || false);
  }

  /**
   * Cria novo utilizador
   */
  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({
    summary: 'Create new user',
    description:
      'Creates a new user with the specified details. Optionally assigns companies, user profiles, and direct permissions during creation. Password is automatically hashed using bcrypt.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
    examples: {
      basic: {
        summary: 'Basic user',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe',
          language: 'pt',
          timezone: 'Europe/Lisbon',
          theme: 'light',
        },
      },
      admin: {
        summary: 'Admin user with companies',
        value: {
          email: 'admin@example.com',
          password: 'AdminPassword123!',
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true,
          companyIds: [1, 2],
          primaryCompanyId: 1,
          userProfileIds: [1],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(
    @Request() req,
    @Body(ValidationPipe) createDto: CreateUserDto,
  ): Promise<UserDto> {
    const tenantId = req.user.tenantId;
    return this.usersService.create(tenantId, createDto);
  }

  /**
   * Atualiza utilizador
   */
  @Put(':id')
  @RequirePermissions('users.update')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates user information. All fields are optional. If first name or last name is changed, the full name is automatically recalculated. Email uniqueness is validated.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data (all fields optional)',
    examples: {
      basicInfo: {
        summary: 'Update basic info',
        value: {
          firstName: 'Jane',
          lastName: 'Smith',
          timezone: 'America/New_York',
        },
      },
      makeAdmin: {
        summary: 'Make user admin',
        value: {
          isAdmin: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
  })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateUserDto,
  ): Promise<UserDto> {
    const tenantId = req.user.tenantId;
    return this.usersService.update(tenantId, id, updateDto);
  }

  /**
   * Remove utilizador (soft delete)
   */
  @Delete(':id')
  @RequirePermissions('users.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete user (soft delete)',
    description:
      'Soft deletes a user by setting the deleted_at timestamp. The user record is preserved in the database but excluded from normal queries.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID to delete',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<void> {
    const tenantId = req.user.tenantId;
    await this.usersService.remove(tenantId, id);
  }

  /**
   * Altera senha do utilizador
   */
  @Put(':id/password')
  @RequirePermissions('users.update')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Changes the password for a user. The new password is automatically hashed using bcrypt with 10 salt rounds. Updates password_changed_at timestamp.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'New password (minimum 8 characters)',
    examples: {
      example1: {
        summary: 'Change password',
        value: {
          newPassword: 'NewSecurePassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid password format',
  })
  async changePassword(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    await this.usersService.changePassword(tenantId, id, changePasswordDto.newPassword);
  }

  /**
   * Atribui empresas ao utilizador
   */
  @Put(':id/companies')
  @RequirePermissions('users.update')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Assign companies to user',
    description:
      'Replaces all company assignments for a user. Optionally sets one company as primary. All existing associations are removed and replaced with the new list.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiBody({
    type: AssignCompaniesDto,
    description: 'Company IDs and optional primary company',
    examples: {
      example1: {
        summary: 'Assign multiple companies',
        value: {
          companyIds: [1, 2, 3],
          primaryCompanyId: 1,
        },
      },
      example2: {
        summary: 'Assign single company',
        value: {
          companyIds: [1],
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Companies assigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'One or more company IDs are invalid',
  })
  async assignCompanies(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) assignDto: AssignCompaniesDto,
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    await this.usersService.assignCompanies(
      tenantId,
      id,
      assignDto.companyIds,
      assignDto.primaryCompanyId,
    );
  }

  /**
   * Atribui perfis de utilizador
   */
  @Put(':id/profiles')
  @RequirePermissions('users.permissions')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Assign user profiles to user',
    description:
      'Replaces all user profile assignments for a user. User profiles determine which permissions the user inherits. All existing associations are removed and replaced with the new list.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiBody({
    type: AssignProfilesDto,
    description: 'User profile IDs to assign',
    examples: {
      example1: {
        summary: 'Assign multiple profiles',
        value: {
          userProfileIds: [1, 2],
        },
      },
      example2: {
        summary: 'Assign single profile',
        value: {
          userProfileIds: [1],
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'User profiles assigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'One or more profile IDs are invalid',
  })
  async assignProfiles(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) assignDto: AssignProfilesDto,
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    await this.usersService.assignProfiles(tenantId, id, assignDto.userProfileIds);
  }

  /**
   * Atribui permissões diretas ao utilizador
   */
  @Put(':id/permissions')
  @RequirePermissions('users.permissions')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Assign direct permissions to user',
    description:
      'Replaces all direct permission assignments for a user. These are permissions assigned directly to the user, independent of user profiles. All existing direct permissions are removed and replaced with the new list.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiBody({
    type: AssignUserPermissionsDto,
    description: 'Permission IDs to assign directly to user',
    examples: {
      example1: {
        summary: 'Assign multiple permissions',
        value: {
          permissionIds: [1, 2, 3, 4],
        },
      },
      example2: {
        summary: 'Remove all direct permissions',
        value: {
          permissionIds: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Permissions assigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'One or more permission IDs are invalid',
  })
  async assignPermissions(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) assignDto: AssignUserPermissionsDto,
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    await this.usersService.assignPermissions(tenantId, id, assignDto.permissionIds);
  }
}
