import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionDto, PermissionListDto } from './dto/permission.dto';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions.list')
  @ApiOperation({
    summary: 'List all permissions',
    description: 'Get a paginated list of all permissions with optional filters',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category (read, write, admin, dangerous, config, data)',
    example: 'read',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in name, permission_code, module_code, or description',
    example: 'client',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of permissions retrieved successfully',
    type: PermissionListDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<PermissionListDto> {
    return this.permissionsService.findAll(
      req.user.tenantId,
      category,
      search,
      limit,
      offset,
    );
  }

  @Get('categories')
  @RequirePermissions('permissions.list')
  @ApiOperation({
    summary: 'Get all permission categories',
    description: 'Returns a list of unique permission categories (read, write, admin, etc.)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    schema: {
      example: ['read', 'write', 'admin', 'dangerous', 'config', 'data'],
    },
  })
  async getCategories(@Request() req): Promise<string[]> {
    return this.permissionsService.getCategories(req.user.tenantId);
  }

  @Get('modules')
  @RequirePermissions('permissions.list')
  @ApiOperation({
    summary: 'Get all permission modules',
    description: 'Returns a list of unique module codes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Modules retrieved successfully',
    schema: {
      example: ['CLIENTS', 'PRODUCTS', 'USERS', 'SETTINGS'],
    },
  })
  async getModules(@Request() req): Promise<string[]> {
    return this.permissionsService.getModules(req.user.tenantId);
  }

  @Get('me')
  @RequirePermissions('permissions.view')
  @ApiOperation({
    summary: 'Get current user permissions',
    description:
      'Returns all permissions assigned to the authenticated user (direct + from user profiles)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User permissions retrieved successfully',
    type: [PermissionDto],
  })
  async getMyPermissions(@Request() req): Promise<PermissionDto[]> {
    return this.permissionsService.getUserPermissions(
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get(':id')
  @RequirePermissions('permissions.view')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Returns details of a specific permission',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Permission ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission found',
    type: PermissionDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  async findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PermissionDto> {
    return this.permissionsService.findOne(req.user.tenantId, id);
  }

  @Get('code/:code')
  @RequirePermissions('permissions.view')
  @ApiOperation({
    summary: 'Get permission by code',
    description: 'Returns details of a permission by its permission code',
  })
  @ApiParam({
    name: 'code',
    type: String,
    description: 'Permission code',
    example: 'clients.list',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission found',
    type: PermissionDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  async findBySlug(
    @Request() req,
    @Param('code') code: string,
  ): Promise<PermissionDto> {
    return this.permissionsService.findBySlug(req.user.tenantId, code);
  }
}
