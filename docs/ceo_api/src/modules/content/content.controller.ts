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
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ContentService } from './content.service';
import { CategoryService } from './category.service';
import { TagService } from './tag.service';
import { CommentService } from './comment.service';
import { MediaService } from './media.service';
import { ContentAnalyticsService } from './analytics.service';
import {
  CreateContentDto,
  UpdateContentDto,
  ContentFilterDto,
  CreateContentCategoryDto,
  UpdateContentCategoryDto,
  CreateTagDto,
  CreateCommentDto,
  UpdateCommentDto,
  ModerateCommentDto,
  CreateMediaDto,
  UpdateMediaDto,
  MediaType,
} from './dto/content.dto';

/**
 * Content Controller
 * Manages content, categories, tags, comments, media, and analytics
 */
@ApiTags('Content Management')
@Controller('content')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly commentService: CommentService,
    private readonly mediaService: MediaService,
    private readonly analyticsService: ContentAnalyticsService,
  ) {}

  // =====================
  // Content Management
  // =====================

  @Get()
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'List content with filters' })
  async listContent(@Request() req, @Query() filters: ContentFilterDto) {
    return this.contentService.list(req.user.tenantId, filters);
  }

  @Get('by-slug/:slug')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get content by slug' })
  @ApiParam({ name: 'slug', description: 'Content slug' })
  async getContentBySlug(@Request() req, @Param('slug') slug: string) {
    return this.contentService.getBySlug(slug, req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async getContent(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.contentService.getById(id, req.user.tenantId);
  }

  @Post()
  @RequirePermissions('content.create')
  @ApiOperation({ summary: 'Create content' })
  async createContent(@Request() req, @Body() dto: CreateContentDto) {
    return this.contentService.create(dto, req.user.tenantId, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('content.update')
  @ApiOperation({ summary: 'Update content' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async updateContent(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContentDto) {
    return this.contentService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('content.delete')
  @ApiOperation({ summary: 'Delete content' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async deleteContent(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.contentService.delete(id, req.user.tenantId);
  }

  @Post(':id/publish')
  @RequirePermissions('content.publish')
  @ApiOperation({ summary: 'Publish content' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async publishContent(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.contentService.publish(id, req.user.tenantId);
  }

  @Post(':id/unpublish')
  @RequirePermissions('content.publish')
  @ApiOperation({ summary: 'Unpublish content' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async unpublishContent(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.contentService.unpublish(id, req.user.tenantId);
  }

  @Get(':id/versions')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get content versions' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async getContentVersions(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.contentService.getVersions(id, req.user.tenantId);
  }

  // =====================
  // Categories
  // =====================

  @Get('categories/tree')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get category tree (hierarchical)' })
  async getCategoryTree(@Request() req) {
    return this.categoryService.getTree(req.user.tenantId);
  }

  @Get('categories/list')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'List categories' })
  @ApiQuery({ name: 'visibleOnly', required: false, type: Boolean })
  async listCategories(@Request() req, @Query('visibleOnly') visibleOnly?: boolean) {
    return this.categoryService.list(req.user.tenantId, visibleOnly);
  }

  @Get('categories/:id')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategory(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getById(id, req.user.tenantId);
  }

  @Post('categories')
  @RequirePermissions('content.manage')
  @ApiOperation({ summary: 'Create category' })
  async createCategory(@Request() req, @Body() dto: CreateContentCategoryDto) {
    return this.categoryService.create(dto, req.user.tenantId);
  }

  @Put('categories/:id')
  @RequirePermissions('content.manage')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async updateCategory(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContentCategoryDto) {
    return this.categoryService.update(id, dto, req.user.tenantId);
  }

  @Delete('categories/:id')
  @RequirePermissions('content.manage')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async deleteCategory(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id, req.user.tenantId);
  }

  // =====================
  // Tags
  // =====================

  @Get('tags/list')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'List tags' })
  async listTags(@Request() req) {
    return this.tagService.list(req.user.tenantId);
  }

  @Get('tags/popular')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularTags(@Request() req, @Query('limit') limit?: number) {
    return this.tagService.getPopular(req.user.tenantId, limit || 10);
  }

  @Get('tags/:id')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  async getTag(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.tagService.getById(id, req.user.tenantId);
  }

  @Post('tags')
  @RequirePermissions('content.manage')
  @ApiOperation({ summary: 'Create tag' })
  async createTag(@Request() req, @Body() dto: CreateTagDto) {
    return this.tagService.create(dto, req.user.tenantId);
  }

  @Put('tags/:id')
  @RequirePermissions('content.manage')
  @ApiOperation({ summary: 'Update tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  async updateTag(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: CreateTagDto) {
    return this.tagService.update(id, dto, req.user.tenantId);
  }

  @Delete('tags/:id')
  @RequirePermissions('content.manage')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  async deleteTag(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.tagService.delete(id, req.user.tenantId);
  }

  // =====================
  // Comments
  // =====================

  @Get('comments/pending')
  @RequirePermissions('content.moderate')
  @ApiOperation({ summary: 'Get pending comments for moderation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getPendingComments(@Request() req, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.commentService.getPendingComments(req.user.tenantId, page, pageSize);
  }

  @Get('comments/content/:contentId')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'List comments for content' })
  @ApiParam({ name: 'contentId', description: 'Content ID' })
  @ApiQuery({ name: 'approvedOnly', required: false, type: Boolean })
  async listComments(@Request() req, @Param('contentId', ParseIntPipe) contentId: number, @Query('approvedOnly') approvedOnly?: boolean) {
    return this.commentService.listByContent(contentId, req.user.tenantId, approvedOnly !== false);
  }

  @Get('comments/content/:contentId/threaded')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get threaded comments for content' })
  @ApiParam({ name: 'contentId', description: 'Content ID' })
  @ApiQuery({ name: 'approvedOnly', required: false, type: Boolean })
  async getThreadedComments(@Request() req, @Param('contentId', ParseIntPipe) contentId: number, @Query('approvedOnly') approvedOnly?: boolean) {
    return this.commentService.getThreaded(contentId, req.user.tenantId, approvedOnly !== false);
  }

  @Get('comments/:id')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async getComment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commentService.getById(id, req.user.tenantId);
  }

  @Post('comments')
  @RequirePermissions('content.comment')
  @ApiOperation({ summary: 'Create comment' })
  async createComment(@Request() req, @Body() dto: CreateCommentDto, @Ip() ip: string, @Headers('user-agent') userAgent: string) {
    return this.commentService.create(dto, req.user.tenantId, req.user.id, ip, userAgent);
  }

  @Put('comments/:id')
  @RequirePermissions('content.comment')
  @ApiOperation({ summary: 'Update comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async updateComment(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommentDto) {
    return this.commentService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Post('comments/:id/moderate')
  @RequirePermissions('content.moderate')
  @ApiOperation({ summary: 'Moderate comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async moderateComment(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: ModerateCommentDto) {
    return this.commentService.moderate(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete('comments/:id')
  @RequirePermissions('content.moderate')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async deleteComment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commentService.delete(id, req.user.tenantId, req.user.id, true);
  }

  // =====================
  // Media Library
  // =====================

  @Get('media/list')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'List media' })
  @ApiQuery({ name: 'type', required: false, enum: MediaType })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listMedia(
    @Request() req,
    @Query('type') type?: MediaType,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.mediaService.list(req.user.tenantId, type, tag, search, page, pageSize);
  }

  @Get('media/statistics')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get media library statistics' })
  async getMediaStatistics(@Request() req) {
    return this.mediaService.getStatistics(req.user.tenantId);
  }

  @Get('media/:id')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  async getMedia(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.mediaService.getById(id, req.user.tenantId);
  }

  @Post('media')
  @RequirePermissions('content.create')
  @ApiOperation({ summary: 'Create media' })
  async createMedia(@Request() req, @Body() dto: CreateMediaDto) {
    return this.mediaService.create(dto, req.user.tenantId, req.user.id);
  }

  @Put('media/:id')
  @RequirePermissions('content.update')
  @ApiOperation({ summary: 'Update media' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  async updateMedia(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMediaDto) {
    return this.mediaService.update(id, dto, req.user.tenantId);
  }

  @Delete('media/:id')
  @RequirePermissions('content.delete')
  @ApiOperation({ summary: 'Delete media' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  async deleteMedia(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.mediaService.delete(id, req.user.tenantId);
  }

  // =====================
  // Analytics
  // =====================

  @Get('analytics/overview')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get content overview statistics' })
  async getOverviewAnalytics(@Request() req) {
    return this.analyticsService.getOverviewStatistics(req.user.tenantId);
  }

  @Get('analytics/by-type')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get statistics by content type' })
  async getAnalyticsByType(@Request() req) {
    return this.analyticsService.getStatisticsByType(req.user.tenantId);
  }

  @Get('analytics/top-performing')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get top performing content' })
  @ApiQuery({ name: 'metric', required: false, enum: ['views', 'likes', 'comments', 'shares'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopPerforming(@Request() req, @Query('metric') metric?: 'views' | 'likes' | 'comments' | 'shares', @Query('limit') limit?: number) {
    return this.analyticsService.getTopPerforming(req.user.tenantId, metric || 'views', limit || 10);
  }

  @Get('analytics/performance-trends')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get content performance trends' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getPerformanceTrends(@Request() req, @Query('days') days?: number) {
    return this.analyticsService.getPerformanceTrends(req.user.tenantId, days || 30);
  }

  @Get('analytics/publishing-trends')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get publishing trends' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getPublishingTrends(@Request() req, @Query('months') months?: number) {
    return this.analyticsService.getPublishingTrends(req.user.tenantId, months || 6);
  }

  @Get('analytics/authors')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get author statistics' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuthorAnalytics(@Request() req, @Query('limit') limit?: number) {
    return this.analyticsService.getAuthorStatistics(req.user.tenantId, limit || 10);
  }

  @Get('analytics/categories')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get category statistics' })
  async getCategoryAnalytics(@Request() req) {
    return this.analyticsService.getCategoryStatistics(req.user.tenantId);
  }

  @Get('analytics/tags')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get tag statistics' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTagAnalytics(@Request() req, @Query('limit') limit?: number) {
    return this.analyticsService.getTagStatistics(req.user.tenantId, limit || 20);
  }

  @Get('analytics/engagement')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get engagement statistics' })
  @ApiQuery({ name: 'contentId', required: false, type: Number })
  async getEngagementAnalytics(@Request() req, @Query('contentId') contentId?: number) {
    return this.analyticsService.getEngagementStatistics(req.user.tenantId, contentId);
  }

  @Get('analytics/visitors')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get visitor statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getVisitorAnalytics(@Request() req, @Query('days') days?: number) {
    return this.analyticsService.getVisitorStatistics(req.user.tenantId, days || 30);
  }

  @Get('analytics/by-visibility')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get performance by visibility' })
  async getAnalyticsByVisibility(@Request() req) {
    return this.analyticsService.getPerformanceByVisibility(req.user.tenantId);
  }

  @Get('analytics/scheduled')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get scheduled content' })
  async getScheduledContent(@Request() req) {
    return this.analyticsService.getScheduledContent(req.user.tenantId);
  }

  @Get('analytics/pending-review')
  @RequirePermissions('content.view')
  @ApiOperation({ summary: 'Get content needing review' })
  async getContentNeedingReview(@Request() req) {
    return this.analyticsService.getContentNeedingReview(req.user.tenantId);
  }
}
