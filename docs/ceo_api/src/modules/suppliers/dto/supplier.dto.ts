import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ==================== SUPPLIER DTOs ====================

export class CreateSupplierDto {
  @ApiProperty({ description: 'Unique supplier code', example: 'SUP001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Supplier name', example: 'Tech Supplies Ltd' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Tax ID / VAT Number', example: '987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Supplier type',
    enum: ['manufacturer', 'distributor', 'wholesaler', 'service_provider'],
    example: 'distributor',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplierType?: string;

  @ApiPropertyOptional({
    description: 'Payment terms',
    example: '30_days',
    enum: ['immediate', '15_days', '30_days', '60_days', '90_days', 'custom'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Supplier rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Supplier status',
    enum: ['active', 'inactive', 'blocked', 'pending'],
    default: 'active',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({ description: 'Notes about the supplier' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Associated company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}

// ==================== SUPPLIER STATS DTO ====================

export class SupplierStatsDto {
  @ApiProperty()
  totalSuppliers: number;

  @ApiProperty()
  activeSuppliers: number;

  @ApiProperty()
  blockedSuppliers: number;

  @ApiProperty()
  manufacturers: number;

  @ApiProperty()
  distributors: number;

  @ApiProperty()
  suppliersThisMonth: number;
}

// ==================== BLOCK SUPPLIER DTO ====================

export class BlockSupplierDto {
  @ApiProperty({ description: 'Reason for blocking the supplier', example: 'Quality issues' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
