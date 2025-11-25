import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean, IsInt, IsEnum, IsNumber } from 'class-validator';

export enum AbsenceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class CreateAbsenceRequestDto {
  @ApiProperty()
  @IsInt()
  employee_id: number;

  @ApiProperty()
  @IsInt()
  absence_type_id: number;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  end_date: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  is_start_half_day?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  is_end_half_day?: boolean;

  @ApiPropertyOptional({ enum: ['morning', 'afternoon'] })
  @IsString()
  @IsOptional()
  start_half_day_period?: string;

  @ApiPropertyOptional({ enum: ['morning', 'afternoon'] })
  @IsString()
  @IsOptional()
  end_half_day_period?: string;

  @ApiProperty()
  @IsNumber()
  total_days: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateAbsenceRequestDto extends PartialType(CreateAbsenceRequestDto) {}

export class ApproveAbsenceDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  action: 'approved' | 'rejected';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  review_notes?: string;
}

export class CreateAbsenceTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  is_paid?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  requires_approval?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  requires_document?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  max_days_per_year?: number;
}

export class UpdateAbsenceTypeDto extends PartialType(CreateAbsenceTypeDto) {}
