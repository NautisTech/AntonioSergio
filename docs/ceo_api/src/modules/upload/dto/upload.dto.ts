import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  MaxLength,
  IsNotEmpty,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========================
// Enums
// ========================

export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  AVATAR = 'avatar',
  ATTACHMENT = 'attachment',
}

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
}

export enum ImageSize {
  ORIGINAL = 'original',
  LARGE = 'large',
  MEDIUM = 'medium',
  SMALL = 'small',
  THUMBNAIL = 'thumbnail',
}

// ========================
// S3 Configuration DTOs
// ========================

export class S3ConfigDto {
  @ApiProperty({ description: 'AWS Access Key ID', example: 'AKIAIOSFODNN7EXAMPLE' })
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

  @ApiProperty({ description: 'S3 Bucket name', example: 'my-company-uploads' })
  @IsString()
  @IsNotEmpty()
  bucket: string;

  @ApiPropertyOptional({ description: 'S3 enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'CloudFront distribution URL' })
  @IsOptional()
  @IsUrl()
  cloudFrontUrl?: string;

  @ApiPropertyOptional({ description: 'ACL for uploaded files', example: 'private' })
  @IsOptional()
  @IsString()
  acl?: string;
}

export class UpdateS3ConfigDto {
  @ApiPropertyOptional({ description: 'AWS Access Key ID' })
  @IsOptional()
  @IsString()
  accessKeyId?: string;

  @ApiPropertyOptional({ description: 'AWS Secret Access Key' })
  @IsOptional()
  @IsString()
  secretAccessKey?: string;

  @ApiPropertyOptional({ description: 'AWS Region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'S3 Bucket name' })
  @IsOptional()
  @IsString()
  bucket?: string;

  @ApiPropertyOptional({ description: 'Enable or disable S3' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'CloudFront distribution URL' })
  @IsOptional()
  @IsUrl()
  cloudFrontUrl?: string;

  @ApiPropertyOptional({ description: 'ACL for uploaded files' })
  @IsOptional()
  @IsString()
  acl?: string;
}

// ========================
// Upload DTOs
// ========================

export class UploadFileDto {
  @ApiPropertyOptional({ description: 'Entity type for polymorphic relationship', example: 'product' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID for polymorphic relationship' })
  @IsOptional()
  @IsInt()
  entityId?: number;

  @ApiPropertyOptional({ description: 'File category', enum: FileCategory })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @ApiPropertyOptional({ description: 'Custom folder/prefix', example: 'products/logos' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customFolder?: string;

  @ApiPropertyOptional({ description: 'Make file public', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Generate image variants', default: true })
  @IsOptional()
  @IsBoolean()
  generateVariants?: boolean;

  @ApiPropertyOptional({ description: 'Tags for file organization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Description or alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Display order for sorting' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class RegisterExternalFileDto {
  @ApiProperty({ description: 'External file URL' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'File type/category', enum: FileCategory })
  @IsEnum(FileCategory)
  category: FileCategory;

  @ApiPropertyOptional({ description: 'Entity type for polymorphic relationship', example: 'product' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID for polymorphic relationship' })
  @IsOptional()
  @IsInt()
  entityId?: number;

  @ApiPropertyOptional({ description: 'File title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'File description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Tags for file organization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Display order for sorting' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class GeneratePresignedUrlDto {
  @ApiProperty({ description: 'File key/path in S3' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiPropertyOptional({ description: 'Expiration time in seconds', default: 3600 })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(604800) // Max 7 days
  expiresIn?: number;

  @ApiPropertyOptional({ description: 'Content disposition', example: 'inline' })
  @IsOptional()
  @IsString()
  contentDisposition?: string;
}

// ========================
// Response DTOs
// ========================

export class ImageVariantDto {
  @ApiProperty({ description: 'Variant size', enum: ImageSize })
  size: ImageSize;

  @ApiProperty({ description: 'Variant URL or S3 key' })
  url: string;

  @ApiProperty({ description: 'Width in pixels' })
  width: number;

  @ApiProperty({ description: 'Height in pixels' })
  height: number;

  @ApiProperty({ description: 'File size in bytes' })
  sizeBytes: number;
}

export class UploadedFileDto {
  @ApiProperty({ description: 'File ID in database' })
  id: number;

  @ApiPropertyOptional({ description: 'Entity type for polymorphic relationship' })
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID for polymorphic relationship' })
  entityId?: number;

  @ApiProperty({ description: 'File name' })
  fileName: string;

  @ApiProperty({ description: 'Original file name' })
  originalName: string;

  @ApiProperty({ description: 'File URL or S3 key' })
  url: string;

  @ApiProperty({ description: 'File category', enum: FileCategory })
  category: FileCategory;

  @ApiProperty({ description: 'Storage provider', enum: StorageProvider })
  storageProvider: StorageProvider;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'File extension' })
  extension: string;

  @ApiProperty({ description: 'File size in bytes' })
  sizeBytes: number;

  @ApiPropertyOptional({ description: 'Image variants (if image)' })
  variants?: ImageVariantDto[];

  @ApiPropertyOptional({ description: 'Tags' })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Is public' })
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Download count' })
  downloadCount?: number;

  @ApiPropertyOptional({ description: 'Display order' })
  displayOrder?: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Uploaded by user ID' })
  uploadedBy: number;
}

export class PresignedUrlDto {
  @ApiProperty({ description: 'Presigned URL for direct access' })
  url: string;

  @ApiProperty({ description: 'URL expiration timestamp' })
  expiresAt: Date;

  @ApiProperty({ description: 'File key in S3' })
  fileKey: string;
}

export class StorageStatsDto {
  @ApiProperty({ description: 'Total files count' })
  totalFiles: number;

  @ApiProperty({ description: 'Total storage used in bytes' })
  totalSizeBytes: number;

  @ApiProperty({ description: 'Total storage used in MB' })
  totalSizeMB: number;

  @ApiProperty({ description: 'Total storage used in GB' })
  totalSizeGB: number;

  @ApiProperty({ description: 'Files by category' })
  byCategory: {
    [key in FileCategory]?: {
      count: number;
      sizeBytes: number;
    };
  };

  @ApiProperty({ description: 'Files by storage provider' })
  byProvider: {
    [key in StorageProvider]?: {
      count: number;
      sizeBytes: number;
    };
  };

  @ApiProperty({ description: 'Recent uploads (last 30 days)' })
  recentUploads: number;
}

// ========================
// Filter DTOs
// ========================

export class ListFilesDto {
  @ApiPropertyOptional({ description: 'Filter by entity type', example: 'product' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsInt()
  entityId?: number;

  @ApiPropertyOptional({ description: 'Filter by category', enum: FileCategory })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @ApiPropertyOptional({ description: 'Filter by file type (image, document, video, audio, other)' })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiPropertyOptional({ description: 'Filter by storage provider', enum: StorageProvider })
  @IsOptional()
  @IsEnum(StorageProvider)
  storageProvider?: StorageProvider;

  @ApiPropertyOptional({ description: 'Search by filename' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Filter by upload date (start)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by upload date (end)' })
  @IsOptional()
  @IsString()
  endDate?: string;

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
