import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ==================== LEAD DTOs ====================

export class CreateLeadDto {
  @ApiProperty({ description: 'Lead title/description', example: 'Potential ERP Implementation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Full name of the contact person', example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'joao.silva@company.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+351 21 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Company name', example: 'Tech Solutions Ltd' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional({ description: 'Job title', example: 'CTO' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'Lead source',
    example: 'website',
    enum: ['website', 'referral', 'campaign', 'cold_call', 'social_media', 'event', 'other'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({
    description: 'Lead status',
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({ description: 'Estimated deal value', example: 25000.0 })
  @IsOptional()
  @IsDecimal()
  estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Probability of conversion (0-100)', example: 60, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional({ description: 'Expected close date', example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Notes about the lead' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Associated company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({ description: 'Assigned to user ID (sales rep)' })
  @IsOptional()
  @IsInt()
  assignedTo?: number;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}

// ==================== CONVERT LEAD DTO ====================

export class ConvertLeadDto {
  @ApiProperty({ description: 'Client ID to convert this lead to' })
  @IsInt()
  @IsNotEmpty()
  convertedToClientId: number;
}

// ==================== LOSE LEAD DTO ====================

export class LoseLeadDto {
  @ApiProperty({ description: 'Reason for losing the lead', example: 'Budget constraints' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  lostReason: string;
}

// ==================== LEAD STATS DTO ====================

export class LeadStatsDto {
  @ApiProperty()
  totalLeads: number;

  @ApiProperty()
  newLeads: number;

  @ApiProperty()
  contactedLeads: number;

  @ApiProperty()
  qualifiedLeads: number;

  @ApiProperty()
  convertedLeads: number;

  @ApiProperty()
  lostLeads: number;

  @ApiProperty()
  conversionRate: number;

  @ApiProperty()
  leadsThisMonth: number;

  @ApiProperty()
  totalEstimatedValue: number;
}
