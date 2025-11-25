import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ==================== TENANT DTOs ====================

export class CreateTenantDto {
  @ApiProperty({ description: 'Tenant name', example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Unique tenant slug/code', example: 'acme' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ description: 'Custom domain for this tenant', example: 'acme.nautis.pt' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @ApiProperty({ description: 'Database name for this tenant', example: 'ceo_tenant_acme' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  databaseName: string;

  // Note: Deploy commands removed in new schema v2.0 - use external CI/CD
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  // Note: 'active' field removed - use soft delete (DELETE /tenants/:id) instead
}

export class TenantDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  domain?: string;

  @ApiProperty()
  databaseName: string;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  faviconUrl?: string;

  @ApiPropertyOptional()
  primaryColor?: string;

  @ApiPropertyOptional()
  secondaryColor?: string;

  @ApiPropertyOptional()
  subscriptionPlanId?: number;

  @ApiPropertyOptional()
  subscriptionStatus?: string;

  @ApiPropertyOptional()
  subscriptionStartsAt?: Date;

  @ApiPropertyOptional()
  subscriptionExpiresAt?: Date;

  @ApiPropertyOptional()
  trialEndsAt?: Date;

  @ApiPropertyOptional()
  maxUsers?: number;

  @ApiPropertyOptional()
  maxStorageGb?: number;

  @ApiPropertyOptional()
  currentUsersCount?: number;

  @ApiPropertyOptional()
  currentStorageGb?: number;

  @ApiPropertyOptional()
  lastActivityAt?: Date;

  @ApiPropertyOptional()
  billingEmail?: string;

  @ApiPropertyOptional()
  billingName?: string;

  @ApiPropertyOptional()
  taxId?: string;

  @ApiPropertyOptional()
  timezone?: string;

  @ApiPropertyOptional()
  locale?: string;

  @ApiPropertyOptional()
  databaseVersion?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;

  @ApiPropertyOptional()
  createdBy?: number;

  @ApiPropertyOptional()
  updatedBy?: number;
}

export class TenantStatsDto {
  @ApiProperty()
  totalTenants: number;

  @ApiProperty()
  activeTenants: number;

  @ApiProperty()
  inactiveTenants: number;

  @ApiPropertyOptional()
  trialTenants?: number;

  @ApiPropertyOptional()
  activeSubscriptions?: number;

  @ApiPropertyOptional()
  firstTenantDate?: Date;

  @ApiPropertyOptional()
  lastTenantDate?: Date;
}

export class TenantDatabaseStatsDto {
  @ApiProperty()
  tenant: {
    id: number;
    name: string;
    slug: string;
  };

  @ApiProperty()
  stats: {
    totalUsers?: number;
    totalCompanies?: number;
    totalClients?: number;
    totalProducts?: number;
    totalEquipment?: number;
    totalContent?: number;
    totalOrders?: number;
    totalQuotes?: number;
  };

  @ApiPropertyOptional()
  error?: string;
}

export class ConnectionTestDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  database: string;
}

// ==================== TENANT SETTINGS DTOs ====================

export enum SettingValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export class CreateSettingDto {
  @ApiProperty({ description: 'Setting key (unique)', example: 'TENANT_NAME' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @ApiProperty({ description: 'Setting value', example: 'My Company' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ description: 'Value type', enum: SettingValueType, example: SettingValueType.STRING })
  @IsEnum(SettingValueType)
  valueType: SettingValueType;

  @ApiPropertyOptional({ description: 'Setting category', example: 'general' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Setting description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether setting is public', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Whether value should be encrypted', default: false })
  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;
}

export class UpdateSettingDto extends PartialType(CreateSettingDto) {}

export class SettingDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  @ApiProperty({ enum: SettingValueType })
  valueType: string;

  @ApiPropertyOptional()
  category?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  isEncrypted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({
    description: 'Array of settings to update',
    type: [Object],
    example: [
      { key: 'TENANT_NAME', value: 'My Company' },
      { key: 'CLIENT_PORTAL', value: 'true' },
    ],
  })
  @IsNotEmpty()
  settings: Array<{ key: string; value: string }>;
}

export class PublicSettingsDto {
  @ApiProperty()
  tenantName: string;

  @ApiProperty()
  clientPortal: boolean;

  @ApiProperty()
  supplierPortal: boolean;

  @ApiProperty()
  ticketPortal: boolean;

  @ApiProperty()
  useTenantLogo: boolean;

  @ApiPropertyOptional()
  tenantLogoPath?: string;

  @ApiPropertyOptional()
  tenantLogoPathDark?: string;
}

// ==================== TENANT MODULE DTOs ====================

export class AssignModuleDto {
  @ApiProperty({ description: 'Module ID to assign' })
  @IsInt()
  @Min(1)
  moduleId: number;

  @ApiPropertyOptional({ description: 'Whether module is active', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Module activation date' })
  @IsOptional()
  activationDate?: Date;

  @ApiPropertyOptional({ description: 'Module expiration date' })
  @IsOptional()
  expirationDate?: Date;
}

export class UpdateTenantModuleDto {
  @ApiPropertyOptional({ description: 'Whether module is active' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Module activation date' })
  @IsOptional()
  activationDate?: Date;

  @ApiPropertyOptional({ description: 'Module expiration date' })
  @IsOptional()
  expirationDate?: Date;
}

export class TenantModuleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tenantId: number;

  @ApiProperty()
  moduleId: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiPropertyOptional()
  route?: string;

  @ApiPropertyOptional()
  version?: string;

  @ApiProperty()
  active: boolean;

  @ApiPropertyOptional()
  activationDate?: Date;

  @ApiPropertyOptional()
  expirationDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

// ==================== TENANT MAIN CONFIG DTOs (main DB) ====================

export class CreateTenantConfigDto {
  @ApiProperty({ description: 'Configuration code', example: 'API_KEY' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Configuration description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Configuration value' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({ description: 'Whether to encrypt the value', default: false })
  @IsOptional()
  @IsBoolean()
  encrypt?: boolean;
}

export class UpdateTenantConfigDto extends PartialType(CreateTenantConfigDto) {}

// ==================== MODULE MANAGEMENT DTOs ====================

export class CreateTenantModuleDto {
  @ApiProperty({ description: 'Module code (unique identifier)', example: 'invoicing' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Module name', example: 'Invoicing' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Module description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Icon name/class', example: 'fa-file-invoice' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: 'Route path', example: '/invoicing' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  route?: string;

  @ApiPropertyOptional({ description: 'Module category', example: 'financial' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiProperty({ description: 'Display order', example: 10 })
  @IsInt()
  @Min(0)
  displayOrder: number;

  @ApiPropertyOptional({ description: 'Minimum plan level required', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minPlanLevel?: number;

  @ApiPropertyOptional({ description: 'Is this a core module?', default: false })
  @IsOptional()
  @IsBoolean()
  isCore?: boolean;

  @ApiPropertyOptional({ description: 'Is module active?', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Module version', example: '1.0.0' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string;
}

export class UpdateGlobalModuleDto {
  @ApiPropertyOptional({ description: 'Module name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Module description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Icon name/class' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: 'Route path' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  route?: string;

  @ApiPropertyOptional({ description: 'Module category' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Minimum plan level required' })
  @IsOptional()
  @IsInt()
  @Min(1)
  minPlanLevel?: number;

  @ApiPropertyOptional({ description: 'Is this a core module?' })
  @IsOptional()
  @IsBoolean()
  isCore?: boolean;

  @ApiPropertyOptional({ description: 'Is module active?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Module version' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string;
}

// ==================== PERMISSION TEMPLATE DTOs ====================

export class CreatePermissionTemplateDto {
  @ApiProperty({ description: 'Module code this permission belongs to', example: 'invoicing' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  moduleCode: string;

  @ApiProperty({ description: 'Permission code (unique identifier)', example: 'invoicing.create' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  permissionCode: string;

  @ApiProperty({ description: 'Permission name', example: 'Create Invoice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Permission description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Action type', example: 'create' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  action?: string;

  @ApiPropertyOptional({ description: 'Resource name', example: 'invoice' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  resource?: string;

  @ApiPropertyOptional({ description: 'Is this a dangerous permission?', default: false })
  @IsOptional()
  @IsBoolean()
  isDangerous?: boolean;
}

export class UpdatePermissionTemplateDto {
  @ApiPropertyOptional({ description: 'Permission name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Permission description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Action type' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  action?: string;

  @ApiPropertyOptional({ description: 'Resource name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  resource?: string;

  @ApiPropertyOptional({ description: 'Is this a dangerous permission?' })
  @IsOptional()
  @IsBoolean()
  isDangerous?: boolean;
}
