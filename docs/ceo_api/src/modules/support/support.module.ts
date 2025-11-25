import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Controllers
import { SupportController } from './support.controller';
import { PublicSupportController } from './public-support.controller';

// Services
import { TicketService } from './ticket.service';
import { TicketActivityService } from './ticket-activity.service';
import { InterventionService } from './intervention.service';
import { TicketTypeService } from './ticket-type.service';

/**
 * Support Module
 * Comprehensive support ticket system with SLA tracking,
 * interventions, activity timeline, and analytics
 */
@Module({
  imports: [DatabaseModule],
  controllers: [SupportController, PublicSupportController],
  providers: [
    // Core services
    TicketService,
    TicketActivityService,
    InterventionService,
    TicketTypeService,
  ],
  exports: [
    TicketService,
    TicketActivityService,
    InterventionService,
    TicketTypeService,
  ],
})
export class SupportModule { }
