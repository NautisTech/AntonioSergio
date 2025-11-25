import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsBoolean,
  IsArray,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================
// Newsletter Subscription DTOs
// ========================

export class SubscribeNewsletterDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Language preference (pt, en, es, fr, de, it, ar)',
    example: 'pt',
    examples: {
      portuguese: { value: 'pt', description: 'Portuguese (converted to pt-PT)' },
      english: { value: 'en', description: 'English' },
      spanish: { value: 'es', description: 'Spanish' },
    },
  })
  @IsString()
  @IsNotEmpty()
  lang: string;

  @ApiProperty({
    description: 'Tenant ID for the newsletter subscription',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  tenantId: number;
}

export class UnsubscribeNewsletterDto {
  @ApiProperty({ description: 'Email address to unsubscribe' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsInt()
  @IsPositive()
  tenantId: number;
}

// ========================
// Newsletter Email Template DTOs
// ========================

export class NewsletterTemplateDto {
  @ApiProperty({ description: 'Template header', example: 'New Content Published' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  header: string;

  @ApiProperty({ description: 'Greeting text', example: 'Hello,' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  greeting: string;

  @ApiProperty({ description: 'Introduction text', example: 'We have new content available:' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  intro: string;

  @ApiProperty({ description: 'Call to action text', example: 'Click below to read:' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  cta_text: string;

  @ApiProperty({ description: 'Button text', example: 'Read Article' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  button_text: string;

  @ApiProperty({ description: 'Footer subscription info' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  footer_subscribed: string;

  @ApiProperty({ description: 'Footer unsubscribe info' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  footer_unsubscribe: string;

  @ApiProperty({ description: 'Subject prefix', example: 'New Content:' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subject_prefix: string;
}

export class SaveNewsletterTemplatesDto {
  @ApiProperty({
    description: 'Templates by language code',
    example: {
      'pt-PT': {
        header: 'Novo Conteúdo Publicado',
        greeting: 'Olá,',
        intro: 'Temos novo conteúdo disponível:',
        cta_text: 'Clique abaixo para ler:',
        button_text: 'Ler Artigo',
        footer_subscribed: 'Está a receber este email porque subscreveu a nossa newsletter.',
        footer_unsubscribe: 'Para cancelar, contacte-nos.',
        subject_prefix: 'Novo Conteúdo:',
      },
      en: {
        header: 'New Content Published',
        greeting: 'Hello,',
        intro: 'We have new content available:',
        cta_text: 'Click below to read:',
        button_text: 'Read Article',
        footer_subscribed: 'You are receiving this because you subscribed to our newsletter.',
        footer_unsubscribe: 'To unsubscribe, contact us.',
        subject_prefix: 'New Content:',
      },
    },
  })
  @IsObject()
  templates: Record<string, NewsletterTemplateDto>;
}

// ========================
// Send Newsletter DTOs
// ========================

export class SendNewsletterDto {
  @ApiProperty({ description: 'Newsletter title/subject' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: 'Content URL to link to' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Send to specific language subscribers only' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Custom HTML content (overrides template)' })
  @IsOptional()
  @IsString()
  customHtml?: string;
}

export class SendTestNewsletterDto {
  @ApiProperty({ description: 'Test email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Newsletter title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Content URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Language for template', example: 'pt-PT' })
  @IsString()
  @IsNotEmpty()
  language: string;
}

// ========================
// List Subscribers DTOs
// ========================

export class ListSubscribersDto {
  @ApiPropertyOptional({ description: 'Filter by language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Filter by active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Search by email' })
  @IsOptional()
  @IsString()
  search?: string;

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

// ========================
// Response DTOs
// ========================

export class NewsletterSubscriberDto {
  @ApiProperty({ description: 'Subscriber ID' })
  id: number;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Language preference' })
  language: string;

  @ApiProperty({ description: 'Is active' })
  active: boolean;

  @ApiProperty({ description: 'Subscription date' })
  createdAt: Date;
}

export class NewsletterStatsDto {
  @ApiProperty({ description: 'Total subscribers' })
  totalSubscribers: number;

  @ApiProperty({ description: 'Active subscribers' })
  activeSubscribers: number;

  @ApiProperty({ description: 'Inactive subscribers' })
  inactiveSubscribers: number;

  @ApiProperty({ description: 'Subscribers by language' })
  byLanguage: Record<string, number>;

  @ApiProperty({ description: 'New subscribers this month' })
  newThisMonth: number;
}

export class NewsletterSendResultDto {
  @ApiProperty({ description: 'Number of emails sent successfully' })
  sent: number;

  @ApiProperty({ description: 'Number of failed emails' })
  failed: number;

  @ApiProperty({ description: 'Total recipients' })
  total: number;

  @ApiProperty({ description: 'List of failed email addresses' })
  failedEmails: string[];
}
