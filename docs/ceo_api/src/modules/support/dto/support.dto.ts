import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// =====================
// Enums
// =====================

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  AWAITING_CUSTOMER = 'awaiting_customer',
  AWAITING_TECHNICIAN = 'awaiting_technician',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  REOPENED = 'reopened',
}

export enum InterventionType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  INSTALLATION = 'installation',
  CONFIGURATION = 'configuration',
  UPGRADE = 'upgrade',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  DIAGNOSIS = 'diagnosis',
  INSPECTION = 'inspection',
}

export enum InterventionStatus {
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum ActivityType {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
  ASSIGNED = 'assigned',
  REASSIGNED = 'reassigned',
  COMMENT_ADDED = 'comment_added',
  ATTACHMENT_ADDED = 'attachment_added',
  INTERVENTION_ADDED = 'intervention_added',
  CUSTOMER_RESPONSE = 'customer_response',
  TECHNICIAN_RESPONSE = 'technician_response',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  SLA_WARNING = 'sla_warning',
  SLA_BREACH = 'sla_breach',
}

export enum SLAStatus {
  OK = 'ok',
  WARNING = 'warning', // < 25% time remaining
  CRITICAL = 'critical', // < 10% time remaining
  BREACHED = 'breached', // overdue
}

// =====================
// Ticket DTOs
// =====================

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket type ID', example: 1 })
  @IsInt()
  ticketTypeId: number;

  @ApiPropertyOptional({
    description: 'Client ID (null for internal tickets)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  clientId?: number;

  @ApiPropertyOptional({
    description: 'Equipment ID (when equipment is registered)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @ApiPropertyOptional({
    description: 'Equipment serial number (when not registered)',
    example: 'NB-2024-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  equipmentSerialNumber?: string;

  @ApiPropertyOptional({
    description: 'Equipment description (when not registered)',
    example: 'Dell Inspiron 15 Laptop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  equipmentDescription?: string;

  @ApiProperty({ description: 'Ticket title', example: 'Printer not working' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Detailed description',
    example: 'The office printer is not responding',
  })
  @IsString()
  description: string;

  @ApiProperty({
    enum: TicketPriority,
    example: 'medium',
    description: 'Ticket priority',
  })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiPropertyOptional({
    enum: TicketStatus,
    example: 'open',
    description: 'Initial status',
    default: 'open',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiProperty({ description: 'Requester ID (employee)', example: 1 })
  @IsInt()
  requesterId: number;

  @ApiPropertyOptional({ description: 'Assigned technician ID', example: 2 })
  @IsOptional()
  @IsInt()
  assignedToId?: number;

  @ApiPropertyOptional({ description: 'Problem location', example: 'Room 101' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({
    description: 'Expected resolution date',
    example: '2025-12-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    type: [String],
    example: ['printer', 'hardware'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Attachment IDs',
    type: [Number],
    example: [1, 2],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  attachmentIds?: number[];
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ description: 'Ticket title' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TicketPriority, description: 'Ticket priority' })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketStatus, description: 'Ticket status' })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ description: 'Assigned technician ID' })
  @IsOptional()
  @IsInt()
  assignedToId?: number;

  @ApiPropertyOptional({ description: 'Problem location' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Expected resolution date' })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional({
    description: 'Equipment serial number (when not registered)',
    example: 'NB-2024-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  equipmentSerialNumber?: string;

  @ApiPropertyOptional({
    description: 'Equipment description (when not registered)',
    example: 'Dell Inspiron 15 Laptop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  equipmentDescription?: string;

  @ApiPropertyOptional({ description: 'Resolution description' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CloseTicketDto {
  @ApiProperty({
    description: 'Resolution description',
    example: 'Replaced toner cartridge',
  })
  @IsString()
  resolution: string;

  @ApiPropertyOptional({
    description: 'Resolution notes',
    example: 'Tested after replacement',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReopenTicketDto {
  @ApiProperty({
    description: 'Reason for reopening',
    example: 'Issue not fully resolved',
  })
  @IsString()
  reason: string;
}

export class AddTicketCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'Checked the printer, needs new toner',
  })
  @IsString()
  comment: string;

  @ApiPropertyOptional({
    description: 'Is internal note (not visible to customer)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ description: 'Attachment IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  attachmentIds?: number[];
}

export class RateTicketDto {
  @ApiProperty({
    description: 'Rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Feedback comment',
    example: 'Excellent service!',
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

// =====================
// Intervention DTOs
// =====================

export class CreateInterventionDto {
  @ApiPropertyOptional({ description: 'Related ticket ID', example: 1 })
  @IsOptional()
  @IsInt()
  ticketId?: number;

  @ApiPropertyOptional({
    description: 'Equipment ID (when registered)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @ApiPropertyOptional({
    description: 'Equipment serial number (when not registered)',
    example: 'NB-2024-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  equipmentSerialNumber?: string;

  @ApiPropertyOptional({
    description: 'Equipment description (when not registered)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  equipmentDescription?: string;

  @ApiProperty({
    enum: InterventionType,
    example: 'corrective',
    description: 'Intervention type',
  })
  @IsEnum(InterventionType)
  type: InterventionType;

  @ApiProperty({
    description: 'Intervention title',
    example: 'Toner replacement',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Intervention description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Problem diagnosis' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Solution applied' })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiProperty({ description: 'Technician ID', example: 1 })
  @IsInt()
  technicianId: number;

  @ApiPropertyOptional({
    description: 'Start date',
    example: '2025-11-16T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2025-11-16T11:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 90 })
  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Labor cost', example: 50.0 })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ description: 'Parts cost', example: 25.5 })
  @IsOptional()
  @IsNumber()
  partsCost?: number;

  @ApiPropertyOptional({ description: 'External vendor name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  externalVendor?: string;

  @ApiPropertyOptional({ description: 'Invoice number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  @ApiPropertyOptional({ description: 'Under warranty', default: false })
  @IsOptional()
  @IsBoolean()
  underWarranty?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: InterventionStatus,
    example: 'completed',
    description: 'Intervention status',
  })
  @IsOptional()
  @IsEnum(InterventionStatus)
  status?: InterventionStatus;

  @ApiPropertyOptional({
    description: 'Requires customer approval',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresCustomerApproval?: boolean;

  @ApiPropertyOptional({ description: 'Customer approved', default: false })
  @IsOptional()
  @IsBoolean()
  customerApproved?: boolean;

  @ApiPropertyOptional({ description: 'Approval date' })
  @IsOptional()
  @IsDateString()
  approvalDate?: string;

  @ApiPropertyOptional({ description: 'Attachment IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  attachmentIds?: number[];

  @ApiPropertyOptional({ description: 'Parts used', type: [Object] })
  @IsOptional()
  @IsArray()
  partsUsed?: Array<{
    partId?: number;
    partName: string;
    quantity: number;
    unitCost?: number;
  }>;
}

export class UpdateInterventionDto {
  @ApiPropertyOptional({ description: 'Intervention title' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Intervention description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Problem diagnosis' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Solution applied' })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Labor cost' })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ description: 'Parts cost' })
  @IsOptional()
  @IsNumber()
  partsCost?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: InterventionStatus,
    description: 'Intervention status',
  })
  @IsOptional()
  @IsEnum(InterventionStatus)
  status?: InterventionStatus;

  @ApiPropertyOptional({ description: 'Customer approved' })
  @IsOptional()
  @IsBoolean()
  customerApproved?: boolean;

  @ApiPropertyOptional({ description: 'Approval date' })
  @IsOptional()
  @IsDateString()
  approvalDate?: string;
}

// =====================
// Ticket Type DTOs
// =====================

export class CreateTicketTypeDto {
  @ApiProperty({ description: 'Ticket type name', example: 'Hardware Issue' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Type description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'SLA hours', example: 24, default: null })
  @IsOptional()
  @IsInt()
  slaHours?: number;

  @ApiPropertyOptional({ description: 'Icon/emoji for type', example: '🖥️' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({ description: 'Color code', example: '#3B82F6' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Requires equipment', default: false })
  @IsOptional()
  @IsBoolean()
  requiresEquipment?: boolean;

  @ApiPropertyOptional({ description: 'Auto-assign to department ID' })
  @IsOptional()
  @IsInt()
  autoAssignDepartmentId?: number;
}

export class UpdateTicketTypeDto extends CreateTicketTypeDto {}

// =====================
// Knowledge Base DTOs
// =====================

export class CreateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'How to replace printer toner',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Article content (markdown supported)' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Article summary/excerpt' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Tags',
    type: [String],
    example: ['printer', 'hardware', 'maintenance'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is published', default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: 'Related ticket type ID' })
  @IsOptional()
  @IsInt()
  ticketTypeId?: number;

  @ApiPropertyOptional({ description: 'Attachment IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  attachmentIds?: number[];
}

export class UpdateArticleDto extends CreateArticleDto {}

// =====================
// Filter DTOs
// =====================

export class TicketFilterDto {
  @ApiPropertyOptional({ description: 'Ticket type ID' })
  @IsOptional()
  @IsInt()
  ticketTypeId?: number;

  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsInt()
  clientId?: number;

  @ApiPropertyOptional({ enum: TicketStatus, description: 'Ticket status' })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketPriority, description: 'Ticket priority' })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: 'Assigned to (technician ID)' })
  @IsOptional()
  @IsInt()
  assignedToId?: number;

  @ApiPropertyOptional({ description: 'Requester ID' })
  @IsOptional()
  @IsInt()
  requesterId?: number;

  @ApiPropertyOptional({ description: 'Equipment ID' })
  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @ApiPropertyOptional({
    description: 'Search text (title, description, ticket number)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'SLA status', enum: SLAStatus })
  @IsOptional()
  @IsEnum(SLAStatus)
  slaStatus?: SLAStatus;

  @ApiPropertyOptional({
    description: 'Show only overdue tickets',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  overdueOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @IsInt()
  pageSize?: number;
}
