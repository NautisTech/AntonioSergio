import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CommunityService } from './community.service';
import {
  CreateCommunityCategoryDto,
  UpdateCommunityCategoryDto,
  CreateTopicDto,
  UpdateTopicDto,
  TopicFilterDto,
  CreateReplyDto,
  UpdateReplyDto,
  AddReactionDto,
  ReportContentDto,
} from './dto/community.dto';

/**
 * Community Controller
 * Forum/Community management
 */
@ApiTags('Community / Forum')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // =====================
  // Categories
  // =====================

  @Get('categories')
  @ApiOperation({ summary: 'List forum categories' })
  @ApiQuery({ name: 'visibleOnly', required: false, type: Boolean })
  async listCategories(@Request() req, @Query('visibleOnly') visibleOnly?: boolean) {
    return this.communityService.listCategories(req.user.tenantId, visibleOnly);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategory(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.communityService.getCategoryById(id, req.user.tenantId);
  }

  @Post('categories')
  @RequirePermissions('community.manage')
  @ApiOperation({ summary: 'Create category' })
  async createCategory(@Request() req, @Body() dto: CreateCommunityCategoryDto) {
    return this.communityService.createCategory(dto, req.user.tenantId);
  }

  // =====================
  // Topics
  // =====================

  @Get('topics')
  @ApiOperation({ summary: 'List forum topics' })
  async listTopics(@Request() req, @Query() filters: TopicFilterDto) {
    return this.communityService.listTopics(req.user.tenantId, filters, req.user.id);
  }

  @Get('topics/:id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  async getTopic(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.communityService.getTopicById(id, req.user.tenantId, true);
  }

  @Post('topics')
  @RequirePermissions('community.post')
  @ApiOperation({ summary: 'Create topic' })
  async createTopic(@Request() req, @Body() dto: CreateTopicDto) {
    return this.communityService.createTopic(dto, req.user.tenantId, req.user.id);
  }

  @Put('topics/:id')
  @RequirePermissions('community.post')
  @ApiOperation({ summary: 'Update topic' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  async updateTopic(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTopicDto) {
    // In production, verify ownership
    return { message: 'Topic update not implemented in this example' };
  }

  // =====================
  // Replies
  // =====================

  @Get('topics/:topicId/replies')
  @ApiOperation({ summary: 'Get topic replies' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  async listReplies(@Request() req, @Param('topicId', ParseIntPipe) topicId: number) {
    return this.communityService.listReplies(topicId, req.user.tenantId);
  }

  @Post('replies')
  @RequirePermissions('community.post')
  @ApiOperation({ summary: 'Create reply' })
  async createReply(@Request() req, @Body() dto: CreateReplyDto) {
    return this.communityService.createReply(dto, req.user.tenantId, req.user.id);
  }

  @Post('replies/:id/best-answer')
  @RequirePermissions('community.post')
  @ApiOperation({ summary: 'Mark reply as best answer' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  async markAsBestAnswer(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.communityService.markAsBestAnswer(id, req.user.tenantId, req.user.id);
  }

  // =====================
  // Reactions
  // =====================

  @Post('reactions')
  @RequirePermissions('community.react')
  @ApiOperation({ summary: 'Add reaction' })
  async addReaction(@Request() req, @Body() dto: AddReactionDto) {
    return this.communityService.addReaction(dto, req.user.tenantId, req.user.id);
  }

  @Delete('reactions')
  @RequirePermissions('community.react')
  @ApiOperation({ summary: 'Remove reaction' })
  async removeReaction(@Request() req, @Body() dto: AddReactionDto) {
    return this.communityService.removeReaction(dto, req.user.tenantId, req.user.id);
  }

  // =====================
  // Subscriptions
  // =====================

  @Post('subscribe/topic/:topicId')
  @ApiOperation({ summary: 'Subscribe to topic' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  async subscribeToTopic(@Request() req, @Param('topicId', ParseIntPipe) topicId: number) {
    return this.communityService.subscribe(topicId, null, req.user.tenantId, req.user.id);
  }

  @Post('subscribe/category/:categoryId')
  @ApiOperation({ summary: 'Subscribe to category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  async subscribeToCategory(@Request() req, @Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.communityService.subscribe(null, categoryId, req.user.tenantId, req.user.id);
  }
}
