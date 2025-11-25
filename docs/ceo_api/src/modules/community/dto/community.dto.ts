import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsArray, MaxLength, Min, Max, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// =====================
// Enums
// =====================

export enum TopicStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  LOCKED = 'locked',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum ReactionType {
  LIKE = 'like',
  HELPFUL = 'helpful',
  LOVE = 'love',
  INSIGHTFUL = 'insightful',
  CELEBRATE = 'celebrate',
}

export enum ReportReason {
  SPAM = 'spam',
  OFFENSIVE = 'offensive',
  HARASSMENT = 'harassment',
  OFF_TOPIC = 'off_topic',
  DUPLICATE = 'duplicate',
  MISINFORMATION = 'misinformation',
  OTHER = 'other',
}

export enum BadgeType {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

// =====================
// Category DTOs
// =====================

export class CreateCommunityCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'General Discussion' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Category slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @ApiPropertyOptional({ description: 'Parent category ID for subcategories' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Category icon (emoji or icon class)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: 'Category color (hex)' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Visible to public', default: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @ApiPropertyOptional({ description: 'Require approval for new topics', default: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;
}

export class UpdateCommunityCategoryDto extends PartialType(CreateCommunityCategoryDto) {}

// =====================
// Topic DTOs
// =====================

export class CreateTopicDto {
  @ApiProperty({ description: 'Category ID' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: 'Topic title', example: 'How to get started?' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Topic content (HTML/Markdown)' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String], example: ['help', 'beginner'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Pin topic to top', default: false })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({ description: 'Mark as featured', default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Lock topic (no new replies)', default: false })
  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @ApiPropertyOptional({ description: 'Allow anonymous replies', default: true })
  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;
}

export class UpdateTopicDto extends PartialType(CreateTopicDto) {}

export class TopicFilterDto {
  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Filter by status', enum: TopicStatus })
  @IsOptional()
  @IsEnum(TopicStatus)
  status?: TopicStatus;

  @ApiPropertyOptional({ description: 'Filter by author ID' })
  @IsOptional()
  @IsInt()
  authorId?: number;

  @ApiPropertyOptional({ description: 'Search in title and content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tags (comma-separated)' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Show only pinned topics', type: Boolean })
  @IsOptional()
  @IsBoolean()
  pinnedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only featured topics', type: Boolean })
  @IsOptional()
  @IsBoolean()
  featuredOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only unanswered topics', type: Boolean })
  @IsOptional()
  @IsBoolean()
  unansweredOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only my topics', type: Boolean })
  @IsOptional()
  @IsBoolean()
  myTopicsOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['created_at', 'updated_at', 'reply_count', 'view_count', 'reaction_count'] })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

// =====================
// Reply DTOs
// =====================

export class CreateReplyDto {
  @ApiProperty({ description: 'Topic ID' })
  @IsInt()
  topicId: number;

  @ApiProperty({ description: 'Reply content (HTML/Markdown)' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Parent reply ID (for threaded replies)' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Mentioned user IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  mentionedUsers?: number[];
}

export class UpdateReplyDto {
  @ApiProperty({ description: 'Reply content (HTML/Markdown)' })
  @IsString()
  content: string;
}

// =====================
// Reaction DTOs
// =====================

export class AddReactionDto {
  @ApiProperty({ enum: ReactionType, example: 'like', description: 'Reaction type' })
  @IsEnum(ReactionType)
  type: ReactionType;

  @ApiPropertyOptional({ description: 'Topic ID (if reacting to topic)' })
  @IsOptional()
  @IsInt()
  topicId?: number;

  @ApiPropertyOptional({ description: 'Reply ID (if reacting to reply)' })
  @IsOptional()
  @IsInt()
  replyId?: number;
}

// =====================
// Report DTOs
// =====================

export class ReportContentDto {
  @ApiProperty({ enum: ReportReason, example: 'spam', description: 'Report reason' })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({ description: 'Additional details' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;

  @ApiPropertyOptional({ description: 'Topic ID (if reporting topic)' })
  @IsOptional()
  @IsInt()
  topicId?: number;

  @ApiPropertyOptional({ description: 'Reply ID (if reporting reply)' })
  @IsOptional()
  @IsInt()
  replyId?: number;
}

export class ModerateReportDto {
  @ApiProperty({ description: 'Report ID' })
  @IsInt()
  reportId: number;

  @ApiProperty({ description: 'Action taken', enum: ['dismiss', 'warn', 'remove', 'ban'] })
  @IsString()
  action: 'dismiss' | 'warn' | 'remove' | 'ban';

  @ApiPropertyOptional({ description: 'Moderator notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// =====================
// Badge DTOs
// =====================

export class CreateBadgeDto {
  @ApiProperty({ description: 'Badge name', example: 'Helper' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Badge description' })
  @IsString()
  @MaxLength(200)
  description: string;

  @ApiProperty({ enum: BadgeType, example: 'bronze', description: 'Badge type/tier' })
  @IsEnum(BadgeType)
  type: BadgeType;

  @ApiPropertyOptional({ description: 'Badge icon (emoji or URL)' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Points value', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Criteria for earning badge (JSON)' })
  @IsOptional()
  criteria?: {
    topicsCreated?: number;
    repliesPosted?: number;
    reactionReceived?: number;
    bestAnswers?: number;
  };
}

export class UpdateBadgeDto extends PartialType(CreateBadgeDto) {}

export class AwardBadgeDto {
  @ApiProperty({ description: 'Badge ID' })
  @IsInt()
  badgeId: number;

  @ApiProperty({ description: 'User ID' })
  @IsInt()
  userId: number;

  @ApiPropertyOptional({ description: 'Reason for awarding' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// =====================
// Subscription DTOs
// =====================

export class SubscribeDto {
  @ApiPropertyOptional({ description: 'Topic ID to subscribe to' })
  @IsOptional()
  @IsInt()
  topicId?: number;

  @ApiPropertyOptional({ description: 'Category ID to subscribe to' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'User ID to follow' })
  @IsOptional()
  @IsInt()
  userId?: number;
}

// =====================
// Search DTOs
// =====================

export class AdvancedSearchDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Category IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Author username' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Has replies', type: Boolean })
  @IsOptional()
  @IsBoolean()
  hasReplies?: boolean;

  @ApiPropertyOptional({ description: 'Has accepted answer', type: Boolean })
  @IsOptional()
  @IsBoolean()
  hasAcceptedAnswer?: boolean;

  @ApiPropertyOptional({ description: 'Created after date' })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Created before date' })
  @IsOptional()
  @IsString()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Minimum reactions' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minReactions?: number;

  @ApiPropertyOptional({ description: 'Sort by', enum: ['relevance', 'date', 'reactions', 'replies'] })
  @IsOptional()
  @IsString()
  sortBy?: string;

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

// =====================
// Statistics DTOs
// =====================

export class UserStatsDto {
  topicsCreated: number;
  repliesPosted: number;
  reactionsReceived: number;
  bestAnswers: number;
  reputation: number;
  badges: any[];
  joinedAt: Date;
  lastActive: Date;
}
