import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantDto,
  TenantStatsDto,
  TenantDatabaseStatsDto,
  ConnectionTestDto,
  CreateSettingDto,
  UpdateSettingDto,
  SettingDto,
  BulkUpdateSettingsDto,
  PublicSettingsDto,
  AssignModuleDto,
  UpdateTenantModuleDto,
  TenantModuleDto,
  CreateTenantConfigDto,
  UpdateTenantConfigDto,
  CreateTenantModuleDto,
  UpdateGlobalModuleDto,
  CreatePermissionTemplateDto,
  UpdatePermissionTemplateDto,
} from './dto/tenant.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // ==================== TENANT MANAGEMENT ====================

  @Post()
  @RequirePermissions('tenants.create')
  @ApiOperation({
    summary: 'Create new tenant',
    description: 'Creates a new tenant with the specified configuration. Requires tenant creation permission.',
  })
  @ApiBody({ type: CreateTenantDto })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Tenant slug already exists' })
  async create(@Body(ValidationPipe) dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'List all tenants',
    description: 'Returns a list of all active tenants in the system.',
  })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: [TenantDto] })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get('stats')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Get global tenant statistics',
    description: 'Returns overall statistics about all tenants including total count, active/inactive counts.',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: TenantStatsDto })
  async getStats() {
    return this.tenantsService.getStats();
  }

  @Get(':id')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Get tenant by ID',
    description: 'Returns detailed information about a specific tenant.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully', type: TenantDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.findOne(id);
  }

  @Get(':id/database-stats')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Get tenant database statistics',
    description: 'Returns statistics from the tenant database including user counts, company counts, etc.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: TenantDatabaseStatsDto })
  async getDatabaseStats(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getTenantDatabaseStats(id);
  }

  @Post(':id/test-connection')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Test tenant database connection',
    description: 'Tests the connection to the tenant database and returns success/failure status.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({ status: 200, description: 'Connection test completed', type: ConnectionTestDto })
  async testConnection(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.testConnection(id);
  }

  @Get(':id/health')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Health check for tenant database',
    description:
      'Comprehensive health check including connection test, response time, and critical tables validation.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Health check completed',
    schema: {
      properties: {
        success: { type: 'boolean' },
        database: { type: 'string' },
        connectionTimeMs: { type: 'number' },
        criticalTablesExist: { type: 'boolean' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async healthCheck(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.healthCheck(id);
  }

  @Put(':id')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Update tenant',
    description: 'Updates tenant information. All fields are optional.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiBody({ type: UpdateTenantDto })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('tenants.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete tenant (soft delete)',
    description: 'Deactivates a tenant. The tenant record is preserved but marked as inactive.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({ status: 204, description: 'Tenant deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.tenantsService.remove(id);
  }

  // ==================== TENANT SETTINGS (Tenant DB) ====================

  @Get('settings')
  @ApiOperation({
    summary: 'List all tenant settings',
    description: 'Returns all settings stored in the current user\'s tenant database (setting table).',
  })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully', type: [SettingDto] })
  async findAllSettings(@Request() req) {
    return this.tenantsService.findAllSettings(req.user.tenantId);
  }

  @Get('settings/:key')
  @ApiOperation({
    summary: 'Get setting by key',
    description: 'Returns a specific setting from the current user\'s tenant database.',
  })
  @ApiParam({ name: 'key', description: 'Setting key', type: String, example: 'TENANT_NAME' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully', type: SettingDto })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async findSettingByKey(
    @Request() req,
    @Param('key') key: string,
  ) {
    return this.tenantsService.findSettingByKey(req.user.tenantId, key);
  }

  @Post('settings')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Create new tenant setting',
    description: 'Creates a new setting in the current user\'s tenant database.',
  })
  @ApiBody({ type: CreateSettingDto })
  @ApiResponse({ status: 201, description: 'Setting created successfully' })
  @ApiResponse({ status: 409, description: 'Setting key already exists' })
  async createSetting(
    @Request() req,
    @Body(ValidationPipe) dto: CreateSettingDto,
  ) {
    return this.tenantsService.createSetting(req.user.tenantId, dto);
  }

  @Put('settings/:key')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Update tenant setting',
    description: 'Updates a specific setting in the current user\'s tenant database.',
  })
  @ApiParam({ name: 'key', description: 'Setting key', type: String })
  @ApiBody({ type: UpdateSettingDto })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async updateSetting(
    @Request() req,
    @Param('key') key: string,
    @Body(ValidationPipe) dto: UpdateSettingDto,
  ) {
    return this.tenantsService.updateSetting(req.user.tenantId, key, dto);
  }

  @Put('settings-bulk')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Bulk update tenant settings',
    description: 'Updates multiple settings at once in the current user\'s tenant database.',
  })
  @ApiBody({ type: BulkUpdateSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        updated: { type: 'number' },
      },
    },
  })
  async bulkUpdateSettings(
    @Request() req,
    @Body(ValidationPipe) dto: BulkUpdateSettingsDto,
  ) {
    return this.tenantsService.bulkUpdateSettings(req.user.tenantId, dto);
  }

  @Delete('settings/:key')
  @RequirePermissions('tenants.update')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete tenant setting',
    description: 'Deletes a setting from the current user\'s tenant database.',
  })
  @ApiParam({ name: 'key', description: 'Setting key', type: String })
  @ApiResponse({ status: 204, description: 'Setting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async removeSetting(
    @Request() req,
    @Param('key') key: string,
  ) {
    await this.tenantsService.removeSetting(req.user.tenantId, key);
  }

  @Public()
  @Get('public/:slug/settings')
  @ApiOperation({
    summary: 'Get public tenant settings by slug (Public endpoint)',
    description:
      'Returns public settings for a tenant identified by slug. No authentication required. Used by frontend to customize branding, portals, etc.',
  })
  @ApiParam({ name: 'slug', description: 'Tenant slug', type: String, example: 'acme' })
  @ApiResponse({ status: 200, description: 'Public settings retrieved successfully', type: PublicSettingsDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getPublicSettings(@Param('slug') slug: string) {
    return this.tenantsService.getPublicSettings(slug);
  }

  // ==================== MODULES ====================

  @Get('modules/available')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'List all available modules',
    description: 'Returns all modules available in the system that can be assigned to tenants.',
  })
  @ApiResponse({
    status: 200,
    description: 'Modules retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          code: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          route: { type: 'string' },
          order: { type: 'number' },
          active: { type: 'boolean' },
          version: { type: 'string' },
        },
      },
    },
  })
  async findAllModules() {
    return this.tenantsService.findAllModules();
  }

  @Get(':id/modules')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'List tenant modules',
    description: 'Returns all modules currently assigned to the tenant.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({ status: 200, description: 'Modules retrieved successfully', type: [TenantModuleDto] })
  async findTenantModules(@Param('id', ParseIntPipe) tenantId: number) {
    return this.tenantsService.findTenantModules(tenantId);
  }

  @Post(':id/modules')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Assign module to tenant',
    description:
      'Assigns a module to the tenant. Automatically copies module permissions template to tenant database.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiBody({ type: AssignModuleDto })
  @ApiResponse({ status: 201, description: 'Module assigned successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 409, description: 'Module already assigned to tenant' })
  async assignModule(
    @Param('id', ParseIntPipe) tenantId: number,
    @Body(ValidationPipe) dto: AssignModuleDto,
  ) {
    return this.tenantsService.assignModule(tenantId, dto);
  }

  @Put(':id/modules/:moduleId')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Update tenant module',
    description: 'Updates module settings for a tenant (activation status, dates, etc.).',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiParam({ name: 'moduleId', description: 'Module ID', type: Number })
  @ApiBody({ type: UpdateTenantModuleDto })
  @ApiResponse({ status: 200, description: 'Module updated successfully' })
  @ApiResponse({ status: 404, description: 'Module not assigned to tenant' })
  async updateTenantModule(
    @Param('id', ParseIntPipe) tenantId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body(ValidationPipe) dto: UpdateTenantModuleDto,
  ) {
    return this.tenantsService.updateTenantModule(tenantId, moduleId, dto);
  }

  @Delete(':id/modules/:moduleId')
  @RequirePermissions('tenants.update')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remove module from tenant',
    description: 'Removes module assignment from tenant.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiParam({ name: 'moduleId', description: 'Module ID', type: Number })
  @ApiResponse({ status: 204, description: 'Module removed successfully' })
  @ApiResponse({ status: 404, description: 'Module not assigned to tenant' })
  async removeModule(
    @Param('id', ParseIntPipe) tenantId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    await this.tenantsService.removeModule(tenantId, moduleId);
  }

  // ==================== GLOBAL SYSTEM SETTINGS (Main DB - tenant_setting with tenant_id IS NULL) ====================

  @Get('global-settings')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'List all global system settings',
    description:
      'Returns all system-wide settings stored in the main database (tenant_setting table with tenant_id IS NULL). These settings apply globally across all tenants.',
  })
  @ApiResponse({
    status: 200,
    description: 'Global settings retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          code: { type: 'string' },
          category: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
          value: { type: 'string' },
          isEncrypted: { type: 'boolean' },
          isSystem: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAllGlobalSettings() {
    return this.tenantsService.findAllGlobalSettings();
  }

  @Get('global-settings/:id')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Get global setting by ID',
    description: 'Returns a specific global system setting by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Global setting ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Global setting retrieved successfully',
    schema: {
      properties: {
        id: { type: 'number' },
        code: { type: 'string' },
        category: { type: 'string' },
        type: { type: 'string' },
        description: { type: 'string' },
        value: { type: 'string' },
        isEncrypted: { type: 'boolean' },
        isSystem: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Global setting not found' })
  async findGlobalSettingById(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.findGlobalSettingById(id);
  }

  @Get('global-settings/key/:key')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Get global setting by key',
    description: 'Returns a specific global system setting by its key/code.',
  })
  @ApiParam({ name: 'key', description: 'Setting key/code', type: String, example: 'API_KEY' })
  @ApiResponse({
    status: 200,
    description: 'Global setting retrieved successfully',
    schema: {
      properties: {
        id: { type: 'number' },
        code: { type: 'string' },
        category: { type: 'string' },
        type: { type: 'string' },
        description: { type: 'string' },
        value: { type: 'string' },
        isEncrypted: { type: 'boolean' },
        isSystem: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Global setting not found' })
  async findGlobalSettingByKey(@Param('key') key: string) {
    return this.tenantsService.findGlobalSettingByKey(key);
  }

  @Post('global-settings')
  @RequirePermissions('tenants.create')
  @ApiOperation({
    summary: 'Create global system setting',
    description:
      'Creates a new system-wide setting. Supports automatic encryption for sensitive values. This setting will apply globally across all tenants.',
  })
  @ApiBody({
    type: CreateTenantConfigDto,
    description: 'Global setting data',
    examples: {
      basic: {
        summary: 'Basic setting',
        value: {
          code: 'MAINTENANCE_MODE',
          description: 'Whether system is in maintenance mode',
          value: 'false',
        },
      },
      encrypted: {
        summary: 'Encrypted API key',
        value: {
          code: 'STRIPE_API_KEY',
          description: 'Stripe payment gateway API key',
          value: 'sk_test_xxxxxxxxxxxx',
          encrypt: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Global setting created successfully' })
  @ApiResponse({ status: 409, description: 'Setting key already exists' })
  async createGlobalSetting(@Body(ValidationPipe) dto: CreateTenantConfigDto) {
    return this.tenantsService.createGlobalSetting(dto);
  }

  @Put('global-settings/:id')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Update global system setting',
    description: 'Updates a global system setting. All fields are optional. Supports encryption.',
  })
  @ApiParam({ name: 'id', description: 'Global setting ID', type: Number })
  @ApiBody({
    type: UpdateTenantConfigDto,
    description: 'Updated setting data (all fields optional)',
    examples: {
      updateValue: {
        summary: 'Update value',
        value: {
          value: 'true',
        },
      },
      updateAll: {
        summary: 'Update all fields',
        value: {
          code: 'MAINTENANCE_MODE',
          description: 'System maintenance mode flag',
          value: 'false',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Global setting updated successfully' })
  @ApiResponse({ status: 404, description: 'Global setting not found' })
  async updateGlobalSetting(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTenantConfigDto,
  ) {
    return this.tenantsService.updateGlobalSetting(id, dto);
  }

  @Delete('global-settings/:id')
  @RequirePermissions('tenants.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete global system setting',
    description:
      'Soft deletes a global system setting. System-critical settings (is_system = true) cannot be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Global setting ID', type: Number })
  @ApiResponse({ status: 204, description: 'Global setting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Global setting not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system-critical setting' })
  async removeGlobalSetting(@Param('id', ParseIntPipe) id: number) {
    await this.tenantsService.removeGlobalSetting(id);
  }

  // ==================== MODULE MANAGEMENT ====================

  @Post('modules')
  @RequirePermissions('tenants.create')
  @ApiOperation({
    summary: 'Create new module',
    description: 'Creates a new module in the system. Module codes must be unique.',
  })
  @ApiBody({ type: CreateTenantModuleDto })
  @ApiResponse({ status: 201, description: 'Module created successfully' })
  @ApiResponse({ status: 409, description: 'Module code already exists' })
  async createModule(@Body(ValidationPipe) dto: CreateTenantModuleDto) {
    return this.tenantsService.createModule(dto);
  }

  @Get('modules/:id')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'Get module by ID',
    description: 'Returns detailed information about a specific module including permission count.',
  })
  @ApiParam({ name: 'id', description: 'Module ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Module retrieved successfully',
    schema: {
      properties: {
        id: { type: 'number' },
        code: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        icon: { type: 'string' },
        route: { type: 'string' },
        category: { type: 'string' },
        displayOrder: { type: 'number' },
        minPlanLevel: { type: 'number' },
        isCore: { type: 'boolean' },
        isActive: { type: 'boolean' },
        version: { type: 'string' },
        totalPermissions: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async getModuleById(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getModuleById(id);
  }

  @Put('modules/:id')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Update module',
    description: 'Updates module information. All fields are optional.',
  })
  @ApiParam({ name: 'id', description: 'Module ID', type: Number })
  @ApiBody({ type: UpdateGlobalModuleDto })
  @ApiResponse({ status: 200, description: 'Module updated successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async updateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateGlobalModuleDto,
  ) {
    return this.tenantsService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  @RequirePermissions('tenants.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete module (soft delete)',
    description:
      'Soft deletes a module. Cannot delete if module is currently assigned to any tenant.',
  })
  @ApiParam({ name: 'id', description: 'Module ID', type: Number })
  @ApiResponse({ status: 204, description: 'Module deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 400, description: 'Module is in use by tenants' })
  async deleteModule(@Param('id', ParseIntPipe) id: number) {
    await this.tenantsService.deleteModule(id);
  }

  // ==================== PERMISSION TEMPLATES ====================

  @Get('modules/:moduleCode/permission-templates')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'List module permission templates',
    description: 'Returns all permission templates for a specific module.',
  })
  @ApiParam({ name: 'moduleCode', description: 'Module code', type: String, example: 'invoicing' })
  @ApiResponse({
    status: 200,
    description: 'Permission templates retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          moduleCode: { type: 'string' },
          permissionCode: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          action: { type: 'string' },
          resource: { type: 'string' },
          isDangerous: { type: 'boolean' },
          moduleName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findModulePermissionTemplates(@Param('moduleCode') moduleCode: string) {
    return this.tenantsService.findModulePermissionTemplates(moduleCode);
  }

  @Get('permission-templates')
  @RequirePermissions('tenants.view')
  @ApiOperation({
    summary: 'List all permission templates',
    description: 'Returns all permission templates from all modules in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission templates retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          moduleCode: { type: 'string' },
          permissionCode: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          action: { type: 'string' },
          resource: { type: 'string' },
          isDangerous: { type: 'boolean' },
          moduleName: { type: 'string' },
          moduleOrder: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAllPermissionTemplates() {
    return this.tenantsService.findAllPermissionTemplates();
  }

  @Post('permission-templates')
  @RequirePermissions('tenants.create')
  @ApiOperation({
    summary: 'Create permission template',
    description:
      'Creates a new permission template. These are copied to tenant databases when the module is assigned.',
  })
  @ApiBody({ type: CreatePermissionTemplateDto })
  @ApiResponse({ status: 201, description: 'Permission template created successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 409, description: 'Permission code already exists' })
  async createPermissionTemplate(@Body(ValidationPipe) dto: CreatePermissionTemplateDto) {
    return this.tenantsService.createPermissionTemplate(dto);
  }

  @Put('permission-templates/:id')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Update permission template',
    description: 'Updates a permission template. All fields are optional.',
  })
  @ApiParam({ name: 'id', description: 'Permission template ID', type: Number })
  @ApiBody({ type: UpdatePermissionTemplateDto })
  @ApiResponse({ status: 200, description: 'Permission template updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission template not found' })
  async updatePermissionTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePermissionTemplateDto,
  ) {
    return this.tenantsService.updatePermissionTemplate(id, dto);
  }

  @Delete('permission-templates/:id')
  @RequirePermissions('tenants.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete permission template',
    description: 'Soft deletes a permission template.',
  })
  @ApiParam({ name: 'id', description: 'Permission template ID', type: Number })
  @ApiResponse({ status: 204, description: 'Permission template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission template not found' })
  async deletePermissionTemplate(@Param('id', ParseIntPipe) id: number) {
    await this.tenantsService.deletePermissionTemplate(id);
  }

  // ==================== DEPLOY ====================

  @Post(':id/deploy/docker-build')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Execute Docker build',
    description: 'Executes the Docker build command configured for this tenant.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Build executed successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        output: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Build command not configured or execution failed' })
  async executeDockerbuild(@Param('id', ParseIntPipe) tenantId: number) {
    return this.tenantsService.executeDockerCommand(tenantId, 'build');
  }

  @Post(':id/deploy/docker-push')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Execute Docker push',
    description: 'Executes the Docker push command configured for this tenant.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Push executed successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        output: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Push command not configured or execution failed' })
  async executeDockerPush(@Param('id', ParseIntPipe) tenantId: number) {
    return this.tenantsService.executeDockerCommand(tenantId, 'push');
  }

  @Post(':id/deploy/caprover')
  @RequirePermissions('tenants.update')
  @ApiOperation({
    summary: 'Execute CapRover deploy',
    description: 'Executes the CapRover deploy command configured for this tenant.',
  })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Deploy executed successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        output: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Deploy command not configured or execution failed' })
  async executeCaproverDeploy(@Param('id', ParseIntPipe) tenantId: number) {
    return this.tenantsService.executeDockerCommand(tenantId, 'deploy');
  }
}
