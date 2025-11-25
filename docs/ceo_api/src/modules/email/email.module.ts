import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailSettingsService } from './email-settings.service';
import { EmailAccountsController } from './email-accounts.controller';
import { EmailAccountsService } from './email-accounts.service';
import { SmtpProvider } from './providers/smtp.provider';
import { SesProvider } from './providers/ses.provider';
import { GmailProvider } from './providers/gmail.provider';
import { MicrosoftGraphProvider } from './providers/microsoft-graph.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [EmailController, EmailAccountsController],
  providers: [
    EmailService,
    EmailSettingsService,
    EmailAccountsService,
    SmtpProvider,
    SesProvider,
    GmailProvider,
    MicrosoftGraphProvider,
  ],
  exports: [EmailService, EmailSettingsService, EmailAccountsService],
})
export class EmailModule {}
