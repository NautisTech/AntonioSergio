import {
  IsInt,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========================
// Enums
// ========================

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

export enum QuoteType {
  STANDARD = 'standard',
  CUSTOM = 'custom',
  RECURRING = 'recurring',
}

// ========================
// Quote Item DTOs
// ========================

export class CreateQuoteItemDto {
  @ApiPropertyOptional({ description: 'Product ID (NULL for custom items)' })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({ description: 'Line number', example: 1 })
  @IsInt()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ description: 'Item description', example: 'Web Development - 40 hours' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Quantity', example: 40 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 75.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percentage', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Discount amount', example: 300.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percentage', example: 23 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 529.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ description: 'Line total', example: 2829.50 })
  @IsNumber()
  @Min(0)
  lineTotal: number;

  @ApiPropertyOptional({ description: 'Item notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateQuoteItemDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiPropertyOptional({ description: 'Line number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  lineNumber?: number;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Line total' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lineTotal?: number;

  @ApiPropertyOptional({ description: 'Item notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

// ========================
// Quote DTOs
// ========================

export class CreateQuoteDto {
  @ApiPropertyOptional({ description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiProperty({ description: 'Client ID', example: 1 })
  @IsInt()
  clientId: number;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @ApiProperty({ description: 'Quote title', example: 'Website Redesign Project' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quote date', example: '2025-01-15' })
  @IsDateString()
  quoteDate: string;

  @ApiProperty({ description: 'Valid until date', example: '2025-02-15' })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Overall discount percentage', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Overall discount amount', example: 150.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Overall tax percentage', example: 23 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiProperty({ description: 'Quote items', type: [CreateQuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}

export class UpdateQuoteDto {
  @ApiPropertyOptional({ description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsInt()
  clientId?: number;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @ApiPropertyOptional({ description: 'Quote title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Quote date' })
  @IsOptional()
  @IsDateString()
  quoteDate?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Status', enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Overall discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Overall discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Overall tax percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;
}

export class AcceptQuoteDto {
  @ApiPropertyOptional({ description: 'Acceptance notes from client' })
  @IsOptional()
  @IsString()
  acceptanceNotes?: string;

  @ApiPropertyOptional({ description: 'Client signature (base64 or URL)' })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class RejectQuoteDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SendQuoteDto {
  @ApiPropertyOptional({ description: 'Send quote email to client', default: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiPropertyOptional({ description: 'Custom email message' })
  @IsOptional()
  @IsString()
  emailMessage?: string;

  @ApiPropertyOptional({ description: 'CC email addresses' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ccEmails?: string[];
}

export class ConvertQuoteToOrderDto {
  @ApiPropertyOptional({ description: 'Order notes' })
  @IsOptional()
  @IsString()
  orderNotes?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDelivery?: string;

  @ApiPropertyOptional({ description: 'Assign order to specific user' })
  @IsOptional()
  @IsInt()
  assignedTo?: number;
}

export class CloneQuoteDto {
  @ApiPropertyOptional({ description: 'New quote title (defaults to original + Copy)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  newTitle?: string;

  @ApiPropertyOptional({ description: 'New client ID (defaults to original client)' })
  @IsOptional()
  @IsInt()
  newClientId?: number;

  @ApiPropertyOptional({ description: 'New valid until date (defaults to 30 days from now)' })
  @IsOptional()
  @IsDateString()
  newValidUntil?: string;

  @ApiPropertyOptional({ description: 'Clone as draft', default: true })
  @IsOptional()
  @IsBoolean()
  asDraft?: boolean;
}

export class QuoteStatsDto {
  @ApiProperty({ description: 'Total number of quotes' })
  totalQuotes: number;

  @ApiProperty({ description: 'Total quote value' })
  totalValue: number;

  @ApiProperty({ description: 'Total value of accepted quotes' })
  acceptedValue: number;

  @ApiProperty({ description: 'Total value of rejected quotes' })
  rejectedValue: number;

  @ApiProperty({ description: 'Total value of pending quotes' })
  pendingValue: number;

  @ApiProperty({ description: 'Total value of expired quotes' })
  expiredValue: number;

  @ApiProperty({ description: 'Win rate percentage' })
  winRate: number;

  @ApiProperty({ description: 'Average quote value' })
  averageValue: number;

  @ApiProperty({ description: 'Average time to close (in days)' })
  averageTimeToClose: number;

  @ApiProperty({ description: 'Number of expired quotes' })
  expiredCount: number;

  @ApiProperty({ description: 'Breakdown by status' })
  byStatus: {
    draft: { count: number; total: number };
    sent: { count: number; total: number };
    viewed: { count: number; total: number };
    accepted: { count: number; total: number };
    rejected: { count: number; total: number };
    expired: { count: number; total: number };
    converted: { count: number; total: number };
  };

  @ApiProperty({ description: 'Top clients by quote value' })
  topClients: Array<{
    clientId: number;
    clientName: string;
    totalQuotes: number;
    totalValue: number;
    acceptedCount: number;
    winRate: number;
  }>;
}

export class QuoteWinLossDto {
  @ApiProperty({ description: 'Quote ID' })
  quoteId: number;

  @ApiProperty({ description: 'Status (accepted or rejected)' })
  status: 'accepted' | 'rejected';

  @ApiPropertyOptional({ description: 'Primary reason for win/loss' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Competitor name (for losses)' })
  @IsOptional()
  @IsString()
  competitorName?: string;

  @ApiPropertyOptional({ description: 'Competitor price (for losses)' })
  @IsOptional()
  @IsNumber()
  competitorPrice?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateQuoteTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Standard Web Development Quote' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Template description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Template title', example: 'Web Development Services' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Default terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Default tax percentage', example: 23 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTaxPercentage?: number;

  @ApiPropertyOptional({ description: 'Default validity period in days', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultValidityDays?: number;

  @ApiProperty({ description: 'Template items', type: [CreateQuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}

export class UseQuoteTemplateDto {
  @ApiProperty({ description: 'Template ID to use' })
  @IsInt()
  templateId: number;

  @ApiProperty({ description: 'Client ID for the new quote' })
  @IsInt()
  clientId: number;

  @ApiPropertyOptional({ description: 'Override template title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customTitle?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QuoteComparisonDto {
  @ApiProperty({ description: 'Quote IDs to compare' })
  @IsArray()
  @IsInt({ each: true })
  quoteIds: number[];
}

export class QuoteFollowUpDto {
  @ApiProperty({ description: 'Quote ID' })
  @IsInt()
  quoteId: number;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Follow-up notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Send reminder email', default: true })
  @IsOptional()
  @IsBoolean()
  sendReminder?: boolean;
}
