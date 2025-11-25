import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
  IsNotEmpty,
  MaxLength,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ==================== COMPANY DTOs ====================

export class CreateCompanyDto {
  @ApiProperty({ description: 'Unique company code', example: 'COMP001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Trade name', example: 'Acme' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @ApiPropertyOptional({ description: 'Legal name', example: 'Acme Corporation, LDA' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @ApiPropertyOptional({ description: 'Tax ID / VAT Number', example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Brand color (hex)', example: '#FF5733' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({
    description: 'Company type',
    enum: ['client', 'supplier', 'partner', 'internal'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyType?: string;

  @ApiPropertyOptional({
    description: 'Legal nature',
    example: 'LDA',
    enum: ['LDA', 'SA', 'Unipessoal', 'ENI', 'SGPS'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  legalNature?: string;

  @ApiPropertyOptional({ description: 'Share capital', example: 50000.0 })
  @IsOptional()
  @IsDecimal()
  shareCapital?: number;

  @ApiPropertyOptional({ description: 'Registration number', example: '1234/567890' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  registrationNumber?: string;

  @ApiPropertyOptional({ description: 'Incorporation date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  incorporationDate?: Date;

  @ApiPropertyOptional({ description: 'Business segment', example: 'Technology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  segment?: string;

  @ApiPropertyOptional({ description: 'Industry sector', example: 'Retail' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industrySector?: string;

  @ApiPropertyOptional({ description: 'CAE code (economic activity)', example: '47190' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  caeCode?: string;

  @ApiPropertyOptional({ description: 'Client number', example: 'CLI001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientNumber?: string;

  @ApiPropertyOptional({ description: 'Supplier number', example: 'SUP001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplierNumber?: string;

  @ApiPropertyOptional({
    description: 'Payment terms',
    example: '30 days',
    enum: ['immediate', '15_days', '30_days', '60_days', '90_days'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentTerms?: string;

  @ApiPropertyOptional({
    description: 'Preferred payment method',
    example: 'bank_transfer',
    enum: ['bank_transfer', 'cash', 'check', 'credit_card', 'mb_way'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredPaymentMethod?: string;

  @ApiPropertyOptional({ description: 'Credit limit', example: 10000.0 })
  @IsOptional()
  @IsDecimal()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Commercial discount (%)', example: 5.5 })
  @IsOptional()
  @IsDecimal()
  commercialDiscount?: number;

  @ApiPropertyOptional({ description: 'Company rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Company status',
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'External reference', example: 'EXT123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  externalRef?: string;

  @ApiPropertyOptional({ description: 'PHC ID for integration' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phcId?: string;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

// ==================== COMPANY STATS DTO ====================

export class CompanyStatsDto {
  @ApiProperty()
  totalCompanies: number;

  @ApiProperty()
  activeCompanies: number;

  @ApiProperty()
  clients: number;

  @ApiProperty()
  suppliers: number;

  @ApiProperty()
  partners: number;

  @ApiProperty()
  companiesThisMonth: number;
}
