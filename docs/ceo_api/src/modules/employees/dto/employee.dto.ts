import {
  IsString,
  IsDate,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ==================== EMPLOYEE DTOs ====================

export class CreateEmployeeDto {
  @ApiPropertyOptional({ description: 'Employee number', example: 1001 })
  @IsOptional()
  @IsInt()
  number?: number;

  @ApiPropertyOptional({ description: 'Employee type ID' })
  @IsOptional()
  @IsInt()
  employeeTypeId?: number;

  @ApiPropertyOptional({ description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: 'Manager ID (another employee)' })
  @IsOptional()
  @IsInt()
  managerId?: number;

  @ApiProperty({ description: 'Full name', example: 'João Silva Santos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ description: 'Short name', example: 'João Silva' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortName?: string;

  @ApiPropertyOptional({ description: 'Job title', example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitle?: string;

  @ApiProperty({ description: 'Gender', enum: ['male', 'female', 'other'] })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  gender: string;

  @ApiProperty({ description: 'Birth date' })
  @IsDate()
  @Type(() => Date)
  birthDate: Date;

  @ApiPropertyOptional({ description: 'Birthplace', example: 'Lisbon, Portugal' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  birthplace?: string;

  @ApiPropertyOptional({ description: 'Nationality', example: 'Portuguese' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ description: 'Marital status', example: 'married' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  maritalStatus?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Hire date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  hireDate?: Date;

  @ApiPropertyOptional({
    description: 'Employment status',
    enum: ['active', 'on_leave', 'terminated'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employmentStatus?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({ description: 'Termination date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  terminationDate?: Date;
}

// ==================== CONTACT DTOs ====================

export class CreateContactDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsInt()
  employeeId: number;

  @ApiProperty({
    description: 'Contact type',
    enum: ['email', 'phone', 'mobile', 'fax', 'website', 'social'],
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contactType: string;

  @ApiProperty({ description: 'Contact value', example: 'joao.silva@company.com' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contactValue: string;

  @ApiPropertyOptional({ description: 'Is primary contact', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Label', example: 'work', enum: ['work', 'personal', 'home'] })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}

// ==================== ADDRESS DTOs ====================

export class CreateAddressDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsInt()
  employeeId: number;

  @ApiProperty({
    description: 'Address type',
    enum: ['billing', 'shipping', 'mailing', 'tax', 'office'],
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  addressType: string;

  @ApiPropertyOptional({ description: 'Is primary address', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Label', example: 'Home Address' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiProperty({ description: 'Street line 1', example: 'Rua das Flores, 123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  streetLine1: string;

  @ApiPropertyOptional({ description: 'Street line 2', example: '2º Andar' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  streetLine2?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '1000-100' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Lisbon' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'District', example: 'Lisboa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ description: 'Country', example: 'Portugal', default: 'Portugal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}

// ==================== BENEFIT DTOs ====================

export class CreateBenefitDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsInt()
  employeeId: number;

  @ApiProperty({
    description: 'Benefit type',
    example: 'health_insurance',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  benefitType: string;

  @ApiPropertyOptional({ description: 'Provider name', example: 'Médis' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider?: string;

  @ApiPropertyOptional({ description: 'Policy number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  policyNumber?: string;

  @ApiProperty({ description: 'Start date' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Monthly cost' })
  @IsOptional()
  @IsDecimal()
  monthlyCost?: number;

  @ApiPropertyOptional({ description: 'Employee contribution' })
  @IsOptional()
  @IsDecimal()
  employeeContribution?: number;

  @ApiPropertyOptional({ description: 'Company contribution' })
  @IsOptional()
  @IsDecimal()
  companyContribution?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateBenefitDto extends PartialType(CreateBenefitDto) {}

// ==================== DOCUMENT DTOs ====================

export class CreateDocumentDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsInt()
  employeeId: number;

  @ApiProperty({
    description: 'Document type',
    example: 'contract',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  documentType: string;

  @ApiPropertyOptional({ description: 'Document number', example: 'CT-2024-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @ApiProperty({ description: 'Document title', example: 'Employment Contract' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'File path/URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  filePath: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type', example: 'application/pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Issue date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @ApiPropertyOptional({ description: 'Is confidential', default: false })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
