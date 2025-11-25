import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsArray,
  IsInt,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email (unique)' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'User password (min 8 characters)' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'en', description: 'Preferred language (pt, en, es, etc.)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ example: 'Europe/Lisbon', description: 'User timezone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ example: 'light', description: 'UI theme preference (light, dark)' })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'], { message: 'Theme must be either light or dark' })
  theme?: string;

  @ApiPropertyOptional({ example: false, description: 'Is user an administrator' })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @ApiPropertyOptional({ example: [1, 2], description: 'Company IDs to assign' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  companyIds?: number[];

  @ApiPropertyOptional({ example: 1, description: 'Primary company ID' })
  @IsOptional()
  @IsInt()
  primaryCompanyId?: number;

  @ApiPropertyOptional({ example: [1, 3], description: 'User profile IDs to assign' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  userProfileIds?: number[];

  @ApiPropertyOptional({ example: [5, 10, 15], description: 'Direct permission IDs to assign' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'jane.doe@example.com', description: 'User email' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ example: 'Jane', description: 'User first name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith', description: 'User last name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-avatar.jpg', description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'pt', description: 'Preferred language' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ example: 'America/New_York', description: 'User timezone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ example: 'dark', description: 'UI theme preference' })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'])
  theme?: string;

  @ApiPropertyOptional({ example: true, description: 'Is user an administrator' })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'NewSecurePass456!', description: 'New password' })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}

export class AssignCompaniesDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Company IDs to assign', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'Company IDs are required' })
  companyIds: number[];

  @ApiPropertyOptional({ example: 1, description: 'ID of the primary company' })
  @IsOptional()
  @IsInt()
  primaryCompanyId?: number;
}

export class AssignProfilesDto {
  @ApiProperty({ example: [1, 2], description: 'User profile IDs to assign', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'User profile IDs are required' })
  userProfileIds: number[];
}

export class AssignUserPermissionsDto {
  @ApiProperty({ example: [5, 10, 15], description: 'Permission IDs to assign', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'Permission IDs are required' })
  permissionIds: number[];
}

export class UserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  lastName: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  fullName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'en', description: 'Language' })
  language?: string;

  @ApiPropertyOptional({ example: 'Europe/Lisbon', description: 'Timezone' })
  timezone?: string;

  @ApiPropertyOptional({ example: 'light', description: 'Theme' })
  theme?: string;

  @ApiProperty({ example: false, description: 'Is admin' })
  isAdmin: boolean;

  @ApiProperty({ example: true, description: 'Is email verified' })
  isVerified: boolean;

  @ApiPropertyOptional({ example: '2025-01-10T08:00:00Z', description: 'Email verified at' })
  emailVerifiedAt?: Date;

  @ApiProperty({ example: false, description: 'Has 2FA enabled' })
  twoFactorEnabled: boolean;

  @ApiPropertyOptional({ example: '2025-01-16T15:30:00Z', description: 'Last login timestamp' })
  lastLoginAt?: Date;

  @ApiProperty({ example: '2025-01-15T10:00:00Z', description: 'Created timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2025-01-16T14:00:00Z', description: 'Updated timestamp' })
  updatedAt?: Date;

  @ApiPropertyOptional({ example: null, description: 'Soft delete timestamp' })
  deletedAt?: Date;
}

export class UserDetailDto extends UserDto {
  @ApiPropertyOptional({
    example: [
      { id: 1, name: 'Acme Corp', isPrimary: true },
      { id: 2, name: 'Tech Inc', isPrimary: false },
    ],
    description: 'Companies assigned to user',
  })
  companies?: Array<{
    id: number;
    name: string;
    code: string;
    isPrimary: boolean;
  }>;

  @ApiPropertyOptional({
    example: [
      { id: 1, name: 'Manager', permissionCount: 15 },
      { id: 2, name: 'HR', permissionCount: 8 },
    ],
    description: 'User profiles assigned',
  })
  userProfiles?: Array<{
    id: number;
    name: string;
    description?: string;
    permissionCount: number;
  }>;

  @ApiPropertyOptional({
    example: [
      { id: 5, slug: 'users.delete', name: 'Delete Users', category: 'users' },
      { id: 10, slug: 'reports.export', name: 'Export Reports', category: 'reports' },
    ],
    description: 'Direct permissions (not from profiles)',
  })
  directPermissions?: Array<{
    id: number;
    slug: string;
    name: string;
    category?: string;
  }>;
}

export class UserListDto {
  @ApiProperty({ type: [UserDto], description: 'List of users' })
  data: UserDto[];

  @ApiProperty({ example: 150, description: 'Total number of users' })
  total: number;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Offset' })
  offset?: number;
}
