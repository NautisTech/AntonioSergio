import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Controllers
import { ReviewController } from './review.controller';

// Services
import { ReviewTemplateService } from './review-template.service';
import { ReviewRequestService } from './review-request.service';
import { ReviewAnalyticsService } from './review-analytics.service';
import { ReviewTriggerService } from './review-trigger.service';

/**
 * Reviews Module
 * Comprehensive review/questionnaire system for:
 * - Customer satisfaction surveys
 * - Employee performance reviews
 * - Peer reviews and self-assessments
 * - Supplier/brand evaluations
 * - Custom feedback collection
 *
 * Features:
 * - Flexible question types (rating, scale, multiple choice, text, NPS, CSAT, CES)
 * - Automatic triggers based on events (e.g., every N interventions)
 * - Advanced analytics and reporting
 * - Deadline management and reminders
 * - Anonymous responses support
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ReviewController],
  providers: [
    ReviewTemplateService,
    ReviewRequestService,
    ReviewAnalyticsService,
    ReviewTriggerService,
  ],
  exports: [
    ReviewTemplateService,
    ReviewRequestService,
    ReviewAnalyticsService,
    ReviewTriggerService,
  ],
})
export class ReviewsModule {}
