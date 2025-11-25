import { IsEmail, IsString, IsOptional, IsBoolean, IsArray, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================
// Email Account Connection DTOs
// ========================

export class ConnectEmailAccountDto {
  @ApiProperty({ description: 'Email provider', enum: ['google', 'microsoft'] })
  @IsEnum(['google', 'microsoft'])
  provider: 'google' | 'microsoft';

  @ApiProperty({ description: 'Access token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;

  @ApiProperty({ description: 'Token expiration date' })
  expiresAt: Date;
}

// ========================
// Email Operations DTOs
// ========================

export class AccountListEmailsDto {
  @ApiPropertyOptional({ description: 'Page size (default: 50)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Page token for pagination' })
  @IsOptional()
  @IsString()
  pageToken?: string;

  @ApiPropertyOptional({ description: 'Search query (Gmail: search query, Outlook: folder query like "in:inbox")' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Label IDs to filter (Gmail only)' })
  @IsOptional()
  @IsArray()
  labelIds?: string[];

  @ApiPropertyOptional({ description: 'Labels metadata (Gmail only)' })
  @IsOptional()
  labels?: Array<{ id: string; name: string; type?: string }>;
}

export class AccountSendEmailDto {
  @ApiProperty({ description: 'Recipient email address(es)', example: 'user@example.com' })
  @IsString()
  to: string;

  @ApiPropertyOptional({ description: 'CC recipient(s)' })
  @IsOptional()
  @IsString()
  cc?: string;

  @ApiPropertyOptional({ description: 'BCC recipient(s)' })
  @IsOptional()
  @IsString()
  bcc?: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Email body' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Is HTML email', default: false })
  @IsOptional()
  @IsBoolean()
  isHtml?: boolean;

  @ApiPropertyOptional({ description: 'Save as draft instead of sending', default: false })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({ description: 'Email attachments' })
  @IsOptional()
  @IsArray()
  attachments?: Array<{ filename: string; content: string; contentType: string }>;
}

export class ModifyEmailDto {
  @ApiPropertyOptional({ description: 'Mark as read/unread' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Mark as starred/unstarred' })
  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;

  @ApiPropertyOptional({ description: 'Add labels (Gmail only)' })
  @IsOptional()
  @IsArray()
  addLabels?: string[];

  @ApiPropertyOptional({ description: 'Remove labels (Gmail only)' })
  @IsOptional()
  @IsArray()
  removeLabels?: string[];
}

export class ReplyToEmailDto {
  @ApiProperty({ description: 'Reply message/comment' })
  @IsString()
  comment: string;

  @ApiPropertyOptional({ description: 'Reply to all recipients', default: false })
  @IsOptional()
  @IsBoolean()
  replyAll?: boolean;
}

export class ForwardEmailDto {
  @ApiProperty({ description: 'Recipient email address(es)' })
  @IsString()
  to: string;

  @ApiPropertyOptional({ description: 'Forward message/comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}
