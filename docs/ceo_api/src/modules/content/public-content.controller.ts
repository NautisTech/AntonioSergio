import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  Ip,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ContentService } from './content.service';
import { CategoryService } from './category.service';
import { TagService } from './tag.service';
import { CommentService } from './comment.service';
import {
  ContentFilterDto,
  CreateCommentDto,
  ContentVisibility,
  ContentStatus,
} from './dto/content.dto';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Public Content Controller
 * Public-facing API for content consumption (blog, knowledge base, etc.)
 */
@ApiTags('Public Content')
@Controller('public/content')
export class PublicContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly commentService: CommentService,
  ) {}

  // =====================
  // Public Content Access
  // =====================

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public content' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'featuredOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listPublicContent(@Query() filters: ContentFilterDto) {
    // Override filters to only show published public content
    const publicFilters: ContentFilterDto = {
      ...filters,
      status: ContentStatus.PUBLISHED,
      visibility: ContentVisibility.PUBLIC,
      includeScheduled: true, // Allow future events/scheduled content to show
    };

    const result = await this.contentService.list(4, publicFilters); // Use default tenant

    // Remove sensitive fields from response
    result.data = result.data.map((content) => this.sanitizeContent(content));

    return result;
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get public content by slug' })
  @ApiParam({ name: 'slug', description: 'Content slug' })
  async getPublicContentBySlug(
    @Param('slug') slug: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('referer') referer?: string,
  ) {
    const content = await this.contentService.getBySlug(slug, 4, true); // Increment view

    // Check visibility
    if (content.visibility !== ContentVisibility.PUBLIC) {
      throw new UnauthorizedException(
        'This content is not publicly accessible',
      );
    }

    // Track view
    await this.contentService.trackView(
      content.id,
      null,
      ip,
      userAgent,
      referer || null,
      4,
    );

    return this.sanitizeContent(content);
  }

  @Public()
  @Get('id/:id')
  @ApiOperation({ summary: 'Get public content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async getPublicContentById(
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('referer') referer?: string,
  ) {
    const content = await this.contentService.getById(id, 4, true); // Increment view

    // Check visibility
    if (content.visibility !== ContentVisibility.PUBLIC) {
      throw new UnauthorizedException(
        'This content is not publicly accessible',
      );
    }

    // Track view
    await this.contentService.trackView(
      id,
      null,
      ip,
      userAgent,
      referer || null,
      1,
    );

    return this.sanitizeContent(content);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured public content' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeaturedContent(@Query('limit') limit?: number) {
    const filters: ContentFilterDto = {
      status: ContentStatus.PUBLISHED,
      visibility: ContentVisibility.PUBLIC,
      featuredOnly: true,
      includeScheduled: true,
      pageSize: limit || 5,
    };

    const result = await this.contentService.list(4, filters);
    result.data = result.data.map((content) => this.sanitizeContent(content));

    return result.data;
  }

  @Public()
  @Get('recent')
  @ApiOperation({ summary: 'Get recent public content' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentContent(@Query('limit') limit?: number) {
    const filters: ContentFilterDto = {
      status: ContentStatus.PUBLISHED,
      visibility: ContentVisibility.PUBLIC,
      includeScheduled: true,
      sortBy: 'published_at',
      sortOrder: 'desc',
      pageSize: limit || 10,
    };

    const result = await this.contentService.list(4, filters);
    result.data = result.data.map((content) => this.sanitizeContent(content));

    return result.data;
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular public content (most viewed)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularContent(@Query('limit') limit?: number) {
    const filters: ContentFilterDto = {
      status: ContentStatus.PUBLISHED,
      visibility: ContentVisibility.PUBLIC,
      includeScheduled: true,
      sortBy: 'view_count',
      sortOrder: 'desc',
      pageSize: limit || 10,
    };

    const result = await this.contentService.list(4, filters);
    result.data = result.data.map((content) => this.sanitizeContent(content));

    return result.data;
  }

  // =====================
  // Categories & Tags (Public)
  // =====================

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get public categories' })
  async getPublicCategories() {
    return this.categoryService.list(4, true); // Only visible categories
  }

  @Public()
  @Get('categories/tree')
  @ApiOperation({ summary: 'Get public category tree' })
  async getPublicCategoryTree() {
    return this.categoryService.getTree(4);
  }

  @Public()
  @Get('tags')
  @ApiOperation({ summary: 'Get public tags' })
  async getPublicTags() {
    return this.tagService.list(4);
  }

  @Public()
  @Get('tags/popular')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPublicPopularTags(@Query('limit') limit?: number) {
    return this.tagService.getPopular(4, limit || 10);
  }

  // =====================
  // Comments (Public)
  // =====================

  @Public()
  @Get(':contentId/comments')
  @ApiOperation({ summary: 'Get public comments for content' })
  @ApiParam({ name: 'contentId', description: 'Content ID' })
  async getPublicComments(@Param('contentId', ParseIntPipe) contentId: number) {
    return this.commentService.getThreaded(contentId, 4, true); // Only approved comments
  }

  @Public()
  @Post(':contentId/comments')
  @ApiOperation({ summary: 'Post comment (anonymous)' })
  @ApiParam({ name: 'contentId', description: 'Content ID' })
  async postAnonymousComment(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: CreateCommentDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Ensure content ID matches
    dto.contentId = contentId;

    // Create anonymous comment
    return this.commentService.create(dto, 4, null, ip, userAgent);
  }

  // =====================
  // Client Content (Authenticated)
  // =====================

  @Get('client/content')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List content for authenticated clients' })
  async listClientContent(@Request() req, @Query() filters: ContentFilterDto) {
    // Show public + client-specific content
    const clientFilters: ContentFilterDto = {
      ...filters,
      status: ContentStatus.PUBLISHED,
    };

    const result = await this.contentService.list(
      req.user.tenantId,
      clientFilters,
    );

    // Filter by visibility: public OR clients
    result.data = result.data.filter(
      (content) =>
        content.visibility === ContentVisibility.PUBLIC ||
        content.visibility === ContentVisibility.CLIENTS,
    );

    return result;
  }

  @Get('client/content/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  async getClientContent(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('referer') referer?: string,
  ) {
    const content = await this.contentService.getById(
      id,
      req.user.tenantId,
      true,
    );

    // Check visibility
    if (
      content.visibility !== ContentVisibility.PUBLIC &&
      content.visibility !== ContentVisibility.CLIENTS
    ) {
      throw new UnauthorizedException(
        'You do not have permission to view this content',
      );
    }

    // Track view
    await this.contentService.trackView(
      id,
      req.user.id,
      ip,
      userAgent,
      referer || null,
      req.user.tenantId,
    );

    return content;
  }

  @Post('client/content/:contentId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post comment as authenticated client' })
  @ApiParam({ name: 'contentId', description: 'Content ID' })
  async postClientComment(
    @Request() req,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: CreateCommentDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    dto.contentId = contentId;
    return this.commentService.create(
      dto,
      req.user.tenantId,
      req.user.id,
      ip,
      userAgent,
    );
  }

  // =====================
  // Helper Methods
  // =====================

  /**
   * Remove sensitive fields from public content
   */
  private sanitizeContent(content: any) {
    // Remove only internal fields that shouldn't be public
    // Keep custom_fields as they contain public data like event location
    const { permissions, ...sanitized } = content;

    return sanitized;
  }
}
