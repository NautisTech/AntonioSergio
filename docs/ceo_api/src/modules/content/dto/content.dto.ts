import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  MaxLength,
  IsUrl,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// =====================
// Enums
// =====================

export enum ContentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
}

export enum ContentVisibility {
  PUBLIC = 'public', // Anyone can see
  INTERNAL = 'internal', // Only employees
  CLIENTS = 'clients', // Only clients
  PRIVATE = 'private', // Only specific users/groups
}

export enum ContentType {
  ARTICLE = 'article',
  NEWS = 'news',
  BANNER = 'banner',
  TUTORIAL = 'tutorial',
  DOCUMENTATION = 'documentation',
  FAQ = 'faq',
  ANNOUNCEMENT = 'announcement',
  POLICY = 'policy',
  GUIDE = 'guide',
  CHANGELOG = 'changelog',
  CUSTOM = 'custom',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other',
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam',
}

// =====================
// SEO & Metadata DTOs
// =====================

export class SeoMetadataDto {
  @ApiPropertyOptional({ description: 'Meta title (SEO)' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description (SEO)' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Meta keywords (SEO)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL' })
  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'OG title (Open Graph)' })
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiPropertyOptional({ description: 'OG description (Open Graph)' })
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiPropertyOptional({ description: 'OG image URL (Open Graph)' })
  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @ApiPropertyOptional({ description: 'Twitter card type' })
  @IsOptional()
  @IsString()
  twitterCard?: string;

  @ApiPropertyOptional({ description: 'Robots meta (index,follow)' })
  @IsOptional()
  @IsString()
  robots?: string;
}

// =====================
// Content DTOs
// =====================

export class CreateContentDto {
  @ApiProperty({
    description: 'Content title',
    example: 'How to use our new feature',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Content slug (URL-friendly)',
    example: 'how-to-use-new-feature',
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  slug?: string;

  @ApiPropertyOptional({ description: 'Content excerpt/summary' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ description: 'Content body (HTML/Markdown)' })
  @IsString()
  content: string;

  @ApiProperty({
    enum: ContentType,
    example: 'article',
    description: 'Content type',
  })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiPropertyOptional({ description: 'Content type ID (for custom types)' })
  @IsOptional()
  @IsInt()
  contentTypeId?: number;

  @ApiProperty({
    enum: ContentStatus,
    example: 'draft',
    description: 'Content status',
    default: 'draft',
  })
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @ApiProperty({
    enum: ContentVisibility,
    example: 'public',
    description: 'Visibility',
    default: 'public',
  })
  @IsEnum(ContentVisibility)
  visibility: ContentVisibility;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsOptional()
  @IsUrl()
  featuredImage?: string;

  @ApiPropertyOptional({ description: 'Author user ID' })
  @IsOptional()
  @IsInt()
  authorId?: number;

  @ApiPropertyOptional({ description: 'Category IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ description: 'Tag IDs or names', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'SEO metadata', type: SeoMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;

  @ApiPropertyOptional({
    description: 'Scheduled publish date',
    example: '2025-12-31T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ description: 'Allow comments', default: true })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @ApiPropertyOptional({ description: 'Is featured content', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Language code',
    example: 'pt',
    default: 'pt',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  language?: string;

  @ApiPropertyOptional({
    description: 'Parent content ID (for translations/versions)',
  })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Related content IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  relatedContentIds?: number[];

  @ApiPropertyOptional({ description: 'Custom fields (JSON)', type: Object })
  @IsOptional()
  @IsObject()
  customFields?: any;

  @ApiPropertyOptional({
    description: 'Permissions (user/role IDs who can view)',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  permissions?: {
    userIds?: number[];
    roleIds?: number[];
    departmentIds?: number[];
  };
}

export class UpdateContentDto extends CreateContentDto {}

// =====================
// Content Category DTOs
// =====================

export class CreateContentCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Tutorials' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Category slug', example: 'tutorials' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category ID (for hierarchy)' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Icon/emoji', example: '📚' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({ description: 'Color code', example: '#3B82F6' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Is visible', default: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}

export class UpdateContentCategoryDto extends CreateContentCategoryDto {}

// =====================
// Tag DTOs
// =====================

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name', example: 'javascript' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'Tag slug', example: 'javascript' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  slug?: string;

  @ApiPropertyOptional({ description: 'Tag color', example: '#F59E0B' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

// =====================
// Comment DTOs
// =====================

export class CreateCommentDto {
  @ApiProperty({ description: 'Content ID', example: 1 })
  @IsInt()
  contentId: number;

  @ApiProperty({ description: 'Comment text' })
  @IsString()
  @MaxLength(2000)
  text: string;

  @ApiPropertyOptional({ description: 'Parent comment ID (for replies)' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Author name (for anonymous comments)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  authorName?: string;

  @ApiPropertyOptional({ description: 'Author email (for anonymous comments)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  authorEmail?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'Comment text' })
  @IsString()
  @MaxLength(2000)
  text: string;
}

export class ModerateCommentDto {
  @ApiProperty({ enum: CommentStatus, description: 'Comment status' })
  @IsEnum(CommentStatus)
  status: CommentStatus;

  @ApiPropertyOptional({ description: 'Moderation reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// =====================
// Media Library DTOs
// =====================

export class CreateMediaDto {
  @ApiProperty({ description: 'Media title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Media description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'File URL' })
  @IsUrl()
  fileUrl: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File size (bytes)', example: 1024000 })
  @IsInt()
  fileSize: number;

  @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
  @IsString()
  mimeType: string;

  @ApiProperty({ enum: MediaType, example: 'image', description: 'Media type' })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ description: 'Alt text (for images)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Metadata (dimensions, duration, etc.)',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateMediaDto extends CreateMediaDto {}

// =====================
// Content Template DTOs
// =====================

export class CreateContentTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Tutorial Template' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ContentType, description: 'Content type' })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ description: 'Template content (HTML/Markdown)' })
  @IsString()
  template: string;

  @ApiPropertyOptional({
    description: 'Template fields/variables',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  fields?: any;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// =====================
// Filter DTOs
// =====================

export class ContentFilterDto {
  @ApiPropertyOptional({ enum: ContentType, description: 'Content type' })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @ApiPropertyOptional({ enum: ContentStatus, description: 'Content status' })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ enum: ContentVisibility, description: 'Visibility' })
  @IsOptional()
  @IsEnum(ContentVisibility)
  visibility?: ContentVisibility;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Author ID' })
  @IsOptional()
  @IsInt()
  authorId?: number;

  @ApiPropertyOptional({ description: 'Search text (title, excerpt, content)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Tags (comma-separated)' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Language code' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Show featured only', default: false })
  @IsOptional()
  @IsBoolean()
  featuredOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Show scheduled content',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeScheduled?: boolean;

  @ApiPropertyOptional({ description: 'Start date (published_at)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (published_at)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @IsInt()
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'published_at',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
