import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsDate, IsNumber, IsUrl, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========================
// Equipment Brand DTOs
// ========================

export class CreateBrandDto {
  @ApiProperty({ description: 'Brand name', example: 'Dell' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Brand logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Brand website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Reading code for asset tagging' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readingCode?: string;

  @ApiPropertyOptional({ description: 'Reading type (barcode, qrcode, rfid, nfc)', example: 'qrcode' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readingType?: string;

  @ApiPropertyOptional({ description: 'Support email' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supportEmail?: string;

  @ApiPropertyOptional({ description: 'Support phone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supportPhone?: string;

  @ApiPropertyOptional({ description: 'Support link/URL' })
  @IsOptional()
  @IsUrl()
  supportLink?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateBrandDto extends CreateBrandDto {}

// ========================
// Equipment Category DTOs
// ========================

export class CreateEquipmentCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Computers' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Category icon (FontAwesome class)', example: 'fa-laptop' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: 'Category color (hex)', example: '#3498db' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Default expected lifespan in months', example: 36 })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultLifespanMonths?: number;

  @ApiPropertyOptional({ description: 'Default depreciation rate (percentage per year)', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultDepreciationRate?: number;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateEquipmentCategoryDto extends CreateEquipmentCategoryDto {}

// ========================
// Equipment Model DTOs
// ========================

export class CreateModelDto {
  @ApiProperty({ description: 'Model name', example: 'Latitude 7420' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Model code/SKU', example: 'LAT-7420' })
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Brand ID' })
  @IsInt()
  brandId: number;

  @ApiProperty({ description: 'Category ID' })
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({ description: 'Model description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Technical specifications (JSON)' })
  @IsOptional()
  specifications?: object;

  @ApiPropertyOptional({ description: 'Model image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Expected lifespan in months', example: 36 })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedLifespanMonths?: number;

  @ApiPropertyOptional({ description: 'Default warranty period in months', example: 12 })
  @IsOptional()
  @IsInt()
  @Min(0)
  defaultWarrantyMonths?: number;

  @ApiPropertyOptional({ description: 'Recommended maintenance interval in days', example: 180 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maintenanceIntervalDays?: number;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateModelDto extends CreateModelDto {}

// ========================
// Equipment DTOs
// ========================

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  BROKEN = 'broken',
  INACTIVE = 'inactive',
  RETIRED = 'retired',
  IN_REPAIR = 'in_repair',
}

export enum EquipmentCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export class CreateEquipmentDto {
  @ApiProperty({ description: 'Model ID' })
  @IsInt()
  modelId: number;

  @ApiProperty({ description: 'Serial number', example: 'SN123456789' })
  @IsString()
  @MaxLength(100)
  serialNumber: string;

  @ApiProperty({ description: 'Internal asset number', example: 'IT-001' })
  @IsString()
  @MaxLength(100)
  internalNumber: string;

  @ApiPropertyOptional({ description: 'Equipment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Current location', example: 'Office Floor 2, Room 205' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Responsible person ID (employee)' })
  @IsOptional()
  @IsInt()
  responsibleId?: number;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: 'Acquisition date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  acquisitionDate?: Date;

  @ApiPropertyOptional({ description: 'Acquisition value', example: 1200.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  acquisitionValue?: number;

  @ApiPropertyOptional({ description: 'Supplier name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;

  @ApiPropertyOptional({ description: 'Warranty expiration date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  warrantyExpirationDate?: Date;

  @ApiPropertyOptional({ description: 'Next maintenance date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextMaintenanceDate?: Date;

  @ApiPropertyOptional({ description: 'Equipment status', enum: EquipmentStatus, default: EquipmentStatus.OPERATIONAL })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiPropertyOptional({ description: 'Equipment condition', enum: EquipmentCondition, default: EquipmentCondition.NEW })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;

  @ApiPropertyOptional({ description: 'Purchase order number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  purchaseOrderNumber?: string;

  @ApiPropertyOptional({ description: 'Invoice number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes/observations' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateEquipmentDto extends CreateEquipmentDto {}

// ========================
// Equipment Maintenance DTOs
// ========================

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  UPGRADE = 'upgrade',
  CLEANING = 'cleaning',
  INSPECTION = 'inspection',
  CALIBRATION = 'calibration',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateMaintenanceDto {
  @ApiProperty({ description: 'Equipment ID' })
  @IsInt()
  equipmentId: number;

  @ApiProperty({ description: 'Maintenance type', enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ description: 'Scheduled date' })
  @Type(() => Date)
  @IsDate()
  scheduledDate: Date;

  @ApiPropertyOptional({ description: 'Description of maintenance work' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Performed by (employee ID)' })
  @IsOptional()
  @IsInt()
  performedBy?: number;

  @ApiPropertyOptional({ description: 'Estimated cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Actual cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @ApiPropertyOptional({ description: 'Completion date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completionDate?: Date;

  @ApiPropertyOptional({ description: 'Maintenance status', enum: MaintenanceStatus, default: MaintenanceStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ description: 'Service provider/technician' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  serviceProvider?: string;

  @ApiPropertyOptional({ description: 'Parts replaced (JSON array)' })
  @IsOptional()
  partsReplaced?: object;

  @ApiPropertyOptional({ description: 'Notes about the maintenance' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMaintenanceDto extends CreateMaintenanceDto {}

// ========================
// Equipment Assignment DTOs
// ========================

export enum AssignmentType {
  EMPLOYEE_ASSIGNMENT = 'employee_assignment',
  LOCATION_CHANGE = 'location_change',
  DEPARTMENT_TRANSFER = 'department_transfer',
  LOAN = 'loan',
  RETURN = 'return',
}

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Equipment ID' })
  @IsInt()
  equipmentId: number;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType })
  @IsEnum(AssignmentType)
  type: AssignmentType;

  @ApiPropertyOptional({ description: 'Assigned to employee ID' })
  @IsOptional()
  @IsInt()
  assignedToEmployeeId?: number;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsInt()
  assignedToUserId?: number;

  @ApiPropertyOptional({ description: 'New location', example: 'Office Floor 3, Room 301' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Department/area' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ description: 'Assignment start date' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({ description: 'Expected return date (for loans)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expectedReturnDate?: Date;

  @ApiPropertyOptional({ description: 'Actual return date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  actualReturnDate?: Date;

  @ApiPropertyOptional({ description: 'Assignment notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Assigned by (user ID)' })
  @IsOptional()
  @IsInt()
  assignedBy?: number;
}

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ description: 'Actual return date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  actualReturnDate?: Date;

  @ApiPropertyOptional({ description: 'Assignment notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ========================
// Query/Filter DTOs
// ========================

export class EquipmentFilterDto {
  @ApiPropertyOptional({ description: 'Model ID filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  modelId?: number;

  @ApiPropertyOptional({ description: 'Brand ID filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Responsible employee ID filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  responsibleId?: number;

  @ApiPropertyOptional({ description: 'Assigned user ID filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: 'Equipment status filter', enum: EquipmentStatus })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiPropertyOptional({ description: 'Equipment condition filter', enum: EquipmentCondition })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;

  @ApiPropertyOptional({ description: 'Location filter' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Search query (searches serial number, internal number, description)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Show only active equipment', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activeOnly?: boolean;
}
