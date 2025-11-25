import { Module } from '@nestjs/common';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import { NewsletterService } from './newsletter.service';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule, // Import EmailModule for email sending
  ],
  controllers: [MailerController],
  providers: [MailerService, NewsletterService],
  exports: [MailerService, NewsletterService],
})
export class MailerModule {}
