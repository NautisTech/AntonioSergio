import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { PublicClientsController } from './public-clients.controller';
import { ClientsService } from './clients.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ClientsController, PublicClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
