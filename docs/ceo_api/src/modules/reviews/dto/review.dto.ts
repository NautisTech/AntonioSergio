import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// =====================
// Enums
// =====================

export enum ReviewType {
  // Customer reviews
  CUSTOMER_SATISFACTION = 'customer_satisfaction',
  SUPPORT_QUALITY = 'support_quality',
  INTERVENTION_QUALITY = 'intervention_quality',

  // Employee reviews
  EMPLOYEE_PEER_REVIEW = 'employee_peer_review',
  EMPLOYEE_SELF_REVIEW = 'employee_self_review',
  EMPLOYEE_TO_MANAGER = 'employee_to_manager',
  MANAGER_TO_EMPLOYEE = 'manager_to_employee',
  EMPLOYEE_SATISFACTION = 'employee_satisfaction',
  EMPLOYEE_PERFORMANCE = 'employee_performance',

  // Supplier & Brand reviews
  SUPPLIER_QUALITY = 'supplier_quality',
  BRAND_QUALITY = 'brand_quality',

  // Equipment & Product reviews
  EQUIPMENT_QUALITY = 'equipment_quality',
  PRODUCT_QUALITY = 'product_quality',

  // General
  CUSTOM = 'custom',
}

export enum QuestionType {
  RATING = 'rating', // 1-5 scale
  SCALE = 'scale', // Custom scale (e.g., 1-10)
  MULTIPLE_CHOICE = 'multiple_choice',
  SINGLE_CHOICE = 'single_choice',
  YES_NO = 'yes_no',
  TEXT = 'text', // Short text
  TEXTAREA = 'textarea', // Long text
  NPS = 'nps', // Net Promoter Score (0-10)
  CSAT = 'csat', // Customer Satisfaction (1-5)
  CES = 'ces', // Customer Effort Score (1-7)
}

export enum ReviewRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum TriggerType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SCHEDULED = 'scheduled',
  EVENT_BASED = 'event_based',
}

export enum TriggerEvent {
  TICKET_CLOSED = 'ticket_closed',
  INTERVENTION_COMPLETED = 'intervention_completed',
  EVERY_N_INTERVENTIONS = 'every_n_interventions',
  EVERY_N_TICKETS = 'every_n_tickets',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  EMPLOYEE_ANNIVERSARY = 'employee_anniversary',
  PROBATION_END = 'probation_end',
}

// =====================
// Review Template DTOs
// =====================

export class QuestionOptionDto {
  @ApiProperty({ description: 'Option value', example: 'excellent' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Option label', example: 'Excelente' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ description: 'Score/weight for this option', example: 5 })
  @IsOptional()
  @IsNumber()
  score?: number;
}

export class CreateReviewQuestionDto {
  @ApiProperty({ description: 'Question text', example: 'Como avalia o atendimento?' })
  @IsString()
  @MaxLength(500)
  question: string;

  @ApiPropertyOptional({ description: 'Question description/help text' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: QuestionType, example: 'rating', description: 'Question type' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({ description: 'Question is required', default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Options for multiple/single choice', type: [QuestionOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Min value for scale/rating', example: 1 })
  @IsOptional()
  @IsInt()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Max value for scale/rating', example: 10 })
  @IsOptional()
  @IsInt()
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Label for min value', example: 'Muito Insatisfeito' })
  @IsOptional()
  @IsString()
  minLabel?: string;

  @ApiPropertyOptional({ description: 'Label for max value', example: 'Muito Satisfeito' })
  @IsOptional()
  @IsString()
  maxLabel?: string;
}

export class CreateReviewTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Avaliação de Satisfação do Cliente' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ReviewType, example: 'customer_satisfaction', description: 'Review type' })
  @IsEnum(ReviewType)
  type: ReviewType;

  @ApiProperty({ description: 'Questions for this template', type: [CreateReviewQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReviewQuestionDto)
  questions: CreateReviewQuestionDto[];

  @ApiPropertyOptional({ description: 'Intro message shown to respondent' })
  @IsOptional()
  @IsString()
  introMessage?: string;

  @ApiPropertyOptional({ description: 'Thank you message after submission' })
  @IsOptional()
  @IsString()
  thankYouMessage?: string;

  @ApiPropertyOptional({ description: 'Requires approval before being published', default: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Allow anonymous responses', default: false })
  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Icon/emoji for template', example: '⭐' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({ description: 'Color code', example: '#3B82F6' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

export class UpdateReviewTemplateDto extends CreateReviewTemplateDto {}

// =====================
// Review Request DTOs
// =====================

export class CreateReviewRequestDto {
  @ApiProperty({ description: 'Review template ID', example: 1 })
  @IsInt()
  templateId: number;

  @ApiPropertyOptional({ description: 'Respondent user ID (employee)' })
  @IsOptional()
  @IsInt()
  respondentUserId?: number;

  @ApiPropertyOptional({ description: 'Respondent employee ID' })
  @IsOptional()
  @IsInt()
  respondentEmployeeId?: number;

  @ApiPropertyOptional({ description: 'Respondent client ID' })
  @IsOptional()
  @IsInt()
  respondentClientId?: number;

  @ApiPropertyOptional({ description: 'Respondent email (for external/anonymous)' })
  @IsOptional()
  @IsString()
  respondentEmail?: string;

  @ApiPropertyOptional({ description: 'Subject being reviewed (user ID)' })
  @IsOptional()
  @IsInt()
  subjectUserId?: number;

  @ApiPropertyOptional({ description: 'Subject being reviewed (employee ID)' })
  @IsOptional()
  @IsInt()
  subjectEmployeeId?: number;

  @ApiPropertyOptional({ description: 'Related ticket ID' })
  @IsOptional()
  @IsInt()
  ticketId?: number;

  @ApiPropertyOptional({ description: 'Related intervention ID' })
  @IsOptional()
  @IsInt()
  interventionId?: number;

  @ApiPropertyOptional({ description: 'Related supplier ID' })
  @IsOptional()
  @IsInt()
  supplierId?: number;

  @ApiPropertyOptional({ description: 'Related brand ID' })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({ description: 'Related equipment ID' })
  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @ApiPropertyOptional({ description: 'Deadline for response', example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ description: 'Send email notification', default: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiPropertyOptional({ description: 'Custom message to respondent' })
  @IsOptional()
  @IsString()
  customMessage?: string;

  @ApiPropertyOptional({ description: 'Metadata (JSON)', type: Object })
  @IsOptional()
  metadata?: any;
}

export class SubmitReviewResponseDto {
  @ApiProperty({ description: 'Review request ID', example: 1 })
  @IsInt()
  requestId: number;

  @ApiProperty({ description: 'Answers to questions', type: [Object] })
  @IsArray()
  answers: Array<{
    questionId: number;
    answer: any; // Can be number, string, array, etc.
    comment?: string;
  }>;

  @ApiPropertyOptional({ description: 'Overall comment' })
  @IsOptional()
  @IsString()
  overallComment?: string;
}

// =====================
// Review Trigger DTOs
// =====================

export class CreateReviewTriggerDto {
  @ApiProperty({ description: 'Trigger name', example: 'Review a cada 10 intervenções' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Trigger description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Review template ID', example: 1 })
  @IsInt()
  templateId: number;

  @ApiProperty({ enum: TriggerType, example: 'event_based', description: 'Trigger type' })
  @IsEnum(TriggerType)
  triggerType: TriggerType;

  @ApiPropertyOptional({ enum: TriggerEvent, description: 'Event that triggers the review' })
  @IsOptional()
  @IsEnum(TriggerEvent)
  event?: TriggerEvent;

  @ApiPropertyOptional({ description: 'Count for event (e.g., every N interventions)', example: 10 })
  @IsOptional()
  @IsInt()
  eventCount?: number;

  @ApiPropertyOptional({ description: 'Target role (who should respond)' })
  @IsOptional()
  @IsString()
  targetRole?: string;

  @ApiPropertyOptional({ description: 'Target department ID' })
  @IsOptional()
  @IsInt()
  targetDepartmentId?: number;

  @ApiPropertyOptional({ description: 'Days until deadline', example: 7 })
  @IsOptional()
  @IsInt()
  daysUntilDeadline?: number;

  @ApiPropertyOptional({ description: 'Send reminder before deadline (days)', example: 2 })
  @IsOptional()
  @IsInt()
  reminderDays?: number;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Trigger conditions (JSON)', type: Object })
  @IsOptional()
  conditions?: any;
}

export class UpdateReviewTriggerDto extends CreateReviewTriggerDto {}

// =====================
// Filter DTOs
// =====================

export class ReviewRequestFilterDto {
  @ApiPropertyOptional({ description: 'Template ID' })
  @IsOptional()
  @IsInt()
  templateId?: number;

  @ApiPropertyOptional({ enum: ReviewRequestStatus, description: 'Request status' })
  @IsOptional()
  @IsEnum(ReviewRequestStatus)
  status?: ReviewRequestStatus;

  @ApiPropertyOptional({ description: 'Respondent user ID' })
  @IsOptional()
  @IsInt()
  respondentUserId?: number;

  @ApiPropertyOptional({ description: 'Respondent employee ID' })
  @IsOptional()
  @IsInt()
  respondentEmployeeId?: number;

  @ApiPropertyOptional({ description: 'Subject user ID' })
  @IsOptional()
  @IsInt()
  subjectUserId?: number;

  @ApiPropertyOptional({ description: 'Show only overdue', default: false })
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

export class ReviewAnalyticsFilterDto {
  @ApiPropertyOptional({ description: 'Template ID' })
  @IsOptional()
  @IsInt()
  templateId?: number;

  @ApiPropertyOptional({ enum: ReviewType, description: 'Review type' })
  @IsOptional()
  @IsEnum(ReviewType)
  type?: ReviewType;

  @ApiPropertyOptional({ description: 'Start date', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Subject user ID (for employee reviews)' })
  @IsOptional()
  @IsInt()
  subjectUserId?: number;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsInt()
  departmentId?: number;
}
