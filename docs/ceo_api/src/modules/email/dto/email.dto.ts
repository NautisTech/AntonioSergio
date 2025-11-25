import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsArray,
  IsEmail,
  ValidateNested,
  MaxLength,
  IsNotEmpty,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========================
// Enums
// ========================

export enum EmailProvider {
  SMTP = 'smtp',
  AWS_SES = 'aws_ses',
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  QUEUED = 'queued',
}

export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

// ========================
// Email Configuration DTOs
// ========================

export class SmtpConfigDto {
  @ApiProperty({ description: 'SMTP Host', example: 'smtp.gmail.com' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ description: 'SMTP Port', example: 587 })
  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ description: 'Use TLS/SSL', default: true })
  @IsBoolean()
  secure: boolean;

  @ApiProperty({ description: 'SMTP Username/Email' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'SMTP Password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'From name', example: 'Nautis CEO' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({ description: 'From email', example: 'noreply@nautis.com' })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;
}

export class AwsSesConfigDto {
  @ApiProperty({ description: 'AWS Access Key ID' })
  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @ApiProperty({ description: 'AWS Secret Access Key' })
  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  @ApiProperty({ description: 'AWS Region', example: 'eu-west-1' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({ description: 'From name', example: 'Nautis CEO' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({ description: 'From email (must be verified in SES)', example: 'noreply@nautis.com' })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @ApiPropertyOptional({ description: 'Configuration Set Name' })
  @IsOptional()
  @IsString()
  configurationSetName?: string;
}

export class EmailConfigDto {
  @ApiProperty({ description: 'Email provider', enum: EmailProvider })
  @IsEnum(EmailProvider)
  provider: EmailProvider;

  @ApiPropertyOptional({ description: 'Enable email sending', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'SMTP Configuration (required if provider is SMTP)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SmtpConfigDto)
  smtp?: SmtpConfigDto;

  @ApiPropertyOptional({ description: 'AWS SES Configuration (required if provider is AWS_SES)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AwsSesConfigDto)
  awsSes?: AwsSesConfigDto;
}

// ========================
// Send Email DTOs
// ========================

export class EmailAttachmentDto {
  @ApiProperty({ description: 'Attachment filename', example: 'invoice.pdf' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'Attachment content (base64 encoded)' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Content type', example: 'application/pdf' })
  @IsOptional()
  @IsString()
  contentType?: string;
}

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiPropertyOptional({ description: 'Recipient name' })
  @IsOptional()
  @IsString()
  toName?: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  subject: string;

  @ApiPropertyOptional({ description: 'Plain text body' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'HTML body' })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ description: 'CC recipients', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiPropertyOptional({ description: 'BCC recipients', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiPropertyOptional({ description: 'Reply-To email' })
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @ApiPropertyOptional({ description: 'Attachments', type: [EmailAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachmentDto[];

  @ApiPropertyOptional({ description: 'Email priority', enum: EmailPriority, default: EmailPriority.NORMAL })
  @IsOptional()
  @IsEnum(EmailPriority)
  priority?: EmailPriority;

  @ApiPropertyOptional({ description: 'Template variables (for template emails)' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Entity type (for tracking)', example: 'order' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID (for tracking)' })
  @IsOptional()
  @IsInt()
  entityId?: number;
}

export class SendBulkEmailDto {
  @ApiProperty({ description: 'Recipients', type: [String] })
  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  subject: string;

  @ApiPropertyOptional({ description: 'Plain text body' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'HTML body' })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ description: 'Send one email per recipient', default: false })
  @IsOptional()
  @IsBoolean()
  individual?: boolean;
}

export class SendTemplateEmailDto {
  @ApiProperty({ description: 'Template name/ID' })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiPropertyOptional({ description: 'Recipient name' })
  @IsOptional()
  @IsString()
  toName?: string;

  @ApiProperty({ description: 'Template variables' })
  @IsObject()
  variables: Record<string, any>;

  @ApiPropertyOptional({ description: 'Email subject (override template subject)' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Entity type (for tracking)', example: 'order' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID (for tracking)' })
  @IsOptional()
  @IsInt()
  entityId?: number;
}

// ========================
// Response DTOs
// ========================

export class EmailSentDto {
  @ApiProperty({ description: 'Email log ID' })
  id: number;

  @ApiProperty({ description: 'Message ID from provider' })
  messageId: string;

  @ApiProperty({ description: 'Email status', enum: EmailStatus })
  status: EmailStatus;

  @ApiProperty({ description: 'Recipient email' })
  to: string;

  @ApiProperty({ description: 'Email subject' })
  subject: string;

  @ApiPropertyOptional({ description: 'Entity type' })
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  entityId?: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;
}

export class EmailStatsDto {
  @ApiProperty({ description: 'Total emails sent' })
  totalSent: number;

  @ApiProperty({ description: 'Total emails failed' })
  totalFailed: number;

  @ApiProperty({ description: 'Total emails pending' })
  totalPending: number;

  @ApiProperty({ description: 'Emails sent today' })
  sentToday: number;

  @ApiProperty({ description: 'Emails sent this week' })
  sentThisWeek: number;

  @ApiProperty({ description: 'Emails sent this month' })
  sentThisMonth: number;

  @ApiProperty({ description: 'Recent emails (last 30 days)' })
  recentEmails: number;
}

// ========================
// Filter DTOs
// ========================

export class ListEmailsDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: EmailStatus })
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @ApiPropertyOptional({ description: 'Filter by recipient email' })
  @IsOptional()
  @IsEmail()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type', example: 'order' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsInt()
  entityId?: number;

  @ApiPropertyOptional({ description: 'Filter by send date (start)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by send date (end)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search by subject' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
