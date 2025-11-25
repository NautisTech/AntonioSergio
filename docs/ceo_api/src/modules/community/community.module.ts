import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';

/**
 * Community Module
 * Forum/Community system with categories, topics, replies, and reactions
 */
@Module({
  imports: [DatabaseModule],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
