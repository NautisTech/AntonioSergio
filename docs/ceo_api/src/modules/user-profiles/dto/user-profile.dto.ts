import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateUserProfileDto {
  @ApiProperty({ example: 'Manager', description: 'User profile name' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'Profile for team managers with intermediate permissions',
    description: 'Profile description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is the default profile for new users',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    example: [1, 2, 5, 10],
    description: 'Array of permission IDs to assign to this profile',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'Senior Manager', description: 'User profile name' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Profile for senior managers with advanced permissions',
    description: 'Profile description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is the default profile',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class AssignUserProfilePermissionsDto {
  @ApiProperty({
    example: [1, 2, 5, 10],
    description: 'Array of permission IDs to assign',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'Permission IDs are required' })
  permissionIds: number[];
}

export class AssignUsersDto {
  @ApiProperty({
    example: [1, 2, 5],
    description: 'Array of user IDs to assign to this profile',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'User IDs are required' })
  userIds: number[];
}

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'Profile ID' })
  id: number;

  @ApiProperty({ example: 'Manager', description: 'Profile name' })
  name: string;

  @ApiPropertyOptional({
    example: 'Profile for team managers',
    description: 'Profile description',
  })
  description?: string;

  @ApiProperty({ example: false, description: 'Is default profile' })
  isDefault: boolean;

  @ApiProperty({ example: '2025-01-15T10:00:00Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({
    example: '2025-01-16T14:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt?: Date;

  @ApiPropertyOptional({ example: null, description: 'Soft delete timestamp' })
  deletedAt?: Date;

  @ApiPropertyOptional({
    example: 5,
    description: 'Number of users with this profile',
  })
  userCount?: number;

  @ApiPropertyOptional({
    example: 12,
    description: 'Number of permissions in this profile',
  })
  permissionCount?: number;
}

export class UserProfileDetailDto extends UserProfileDto {
  @ApiPropertyOptional({
    example: [
      { id: 1, slug: 'users.read', name: 'View Users' },
      { id: 2, slug: 'users.write', name: 'Edit Users' },
    ],
    description: 'List of permissions assigned to this profile',
  })
  permissions?: Array<{
    id: number;
    slug: string;
    name: string;
    category?: string;
  }>;

  @ApiPropertyOptional({
    example: [
      { id: 1, email: 'user@example.com', fullName: 'John Doe' },
      { id: 2, email: 'manager@example.com', fullName: 'Jane Smith' },
    ],
    description: 'List of users assigned to this profile',
  })
  users?: Array<{
    id: number;
    email: string;
    fullName: string;
  }>;
}
