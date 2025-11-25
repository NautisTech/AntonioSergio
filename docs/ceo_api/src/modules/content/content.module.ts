import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ContentService } from './content.service';
import { CategoryService } from './category.service';
import { TagService } from './tag.service';
import { CommentService } from './comment.service';
import { MediaService } from './media.service';
import { ContentAnalyticsService } from './analytics.service';
import { ContentController } from './content.controller';
import { PublicContentController } from './public-content.controller';

/**
 * Content Module
 * Comprehensive CMS for internal and external content management
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ContentController, PublicContentController],
  providers: [
    ContentService,
    CategoryService,
    TagService,
    CommentService,
    MediaService,
    ContentAnalyticsService,
  ],
  exports: [
    ContentService,
    CategoryService,
    TagService,
    CommentService,
    MediaService,
    ContentAnalyticsService,
  ],
})
export class ContentModule {}
