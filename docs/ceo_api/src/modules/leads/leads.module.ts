import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { PublicLeadsController } from './public-leads.controller';
import { LeadsService } from './leads.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LeadsController, PublicLeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
