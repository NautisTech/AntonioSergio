import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsNotEmpty,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ==================== CLIENT DTOs ====================

export class CreateClientDto {
  @ApiProperty({ description: 'Unique client code', example: 'CLI001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Client name', example: 'Acme Corp Client' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Tax ID / VAT Number', example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Client type',
    enum: ['individual', 'corporate', 'government', 'reseller'],
    example: 'corporate',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientType?: string;

  @ApiPropertyOptional({ description: 'Business segment', example: 'Retail' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  segment?: string;

  @ApiPropertyOptional({
    description: 'Client status',
    enum: ['active', 'inactive', 'blocked', 'pending'],
    default: 'active',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({ description: 'Client rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Credit limit', example: 10000.0 })
  @IsOptional()
  @IsDecimal()
  creditLimit?: number;

  @ApiPropertyOptional({
    description: 'Payment terms',
    example: '30_days',
    enum: ['immediate', '15_days', '30_days', '60_days', '90_days', 'custom'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Notes about the client' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Associated company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}

// ==================== CLIENT STATS DTO ====================

export class ClientStatsDto {
  @ApiProperty()
  totalClients: number;

  @ApiProperty()
  activeClients: number;

  @ApiProperty()
  blockedClients: number;

  @ApiProperty()
  individualClients: number;

  @ApiProperty()
  corporateClients: number;

  @ApiProperty()
  clientsThisMonth: number;
}

// ==================== BLOCK CLIENT DTO ====================

export class BlockClientDto {
  @ApiProperty({ description: 'Reason for blocking the client', example: 'Payment overdue' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
