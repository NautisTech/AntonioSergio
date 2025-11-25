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
import { ReviewTemplateService } from './review-template.service';
import { ReviewRequestService } from './review-request.service';
import { ReviewAnalyticsService } from './review-analytics.service';
import { ReviewTriggerService } from './review-trigger.service';
import {
  CreateReviewTemplateDto,
  UpdateReviewTemplateDto,
  CreateReviewRequestDto,
  SubmitReviewResponseDto,
  CreateReviewTriggerDto,
  UpdateReviewTriggerDto,
  ReviewRequestFilterDto,
  ReviewAnalyticsFilterDto,
  ReviewType,
} from './dto';

/**
 * Review Controller
 * Comprehensive review/questionnaire system for feedback collection
 */
@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(
    private readonly templateService: ReviewTemplateService,
    private readonly requestService: ReviewRequestService,
    private readonly analyticsService: ReviewAnalyticsService,
    private readonly triggerService: ReviewTriggerService,
  ) {}

  // =====================
  // Templates
  // =====================

  @Get('templates')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'List review templates' })
  @ApiQuery({ name: 'type', required: false, enum: ReviewType })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listTemplates(
    @Request() req,
    @Query('type') type?: ReviewType,
    @Query('active') active?: boolean,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.templateService.list(req.user.tenantId, { type, active, page, pageSize });
  }

  @Get('templates/statistics')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get template statistics' })
  async getTemplateStatistics(@Request() req) {
    return this.templateService.getStatistics(req.user.tenantId);
  }

  @Get('templates/:id')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get template by ID with questions' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  async getTemplate(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.templateService.getById(id, req.user.tenantId);
  }

  @Post('templates')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Create review template' })
  async createTemplate(@Request() req, @Body() dto: CreateReviewTemplateDto) {
    return this.templateService.create(dto, req.user.tenantId);
  }

  @Put('templates/:id')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Update review template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  async updateTemplate(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewTemplateDto) {
    return this.templateService.update(id, dto, req.user.tenantId);
  }

  @Delete('templates/:id')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Delete review template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  async deleteTemplate(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.templateService.delete(id, req.user.tenantId);
  }

  // =====================
  // Requests
  // =====================

  @Get('requests')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'List review requests' })
  async listRequests(@Request() req, @Query() filters: ReviewRequestFilterDto) {
    return this.requestService.list(req.user.tenantId, filters);
  }

  @Get('requests/:id')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get review request by ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  async getRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.requestService.getById(id, req.user.tenantId);
  }

  @Post('requests')
  @RequirePermissions('reviews.create')
  @ApiOperation({ summary: 'Create review request' })
  async createRequest(@Request() req, @Body() dto: CreateReviewRequestDto) {
    return this.requestService.create(dto, req.user.tenantId, req.user.id);
  }

  @Post('requests/:id/cancel')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Cancel review request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  async cancelRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.requestService.cancel(id, req.user.tenantId);
  }

  // =====================
  // Responses
  // =====================

  @Post('responses/submit')
  @RequirePermissions('reviews.respond')
  @ApiOperation({ summary: 'Submit review response' })
  async submitResponse(@Request() req, @Body() dto: SubmitReviewResponseDto) {
    return this.requestService.submitResponse(dto, req.user.tenantId);
  }

  @Get('responses/:id')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get review response with answers' })
  @ApiParam({ name: 'id', description: 'Response ID' })
  async getResponse(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.requestService.getResponse(id, req.user.tenantId);
  }

  // =====================
  // Analytics
  // =====================

  @Get('analytics/overview')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get overview statistics' })
  async getOverviewAnalytics(@Request() req, @Query() filters: ReviewAnalyticsFilterDto) {
    return this.analyticsService.getOverviewStatistics(req.user.tenantId, filters);
  }

  @Get('analytics/by-type')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get statistics by review type' })
  async getStatisticsByType(@Request() req, @Query() filters: ReviewAnalyticsFilterDto) {
    return this.analyticsService.getStatisticsByType(req.user.tenantId, filters);
  }

  @Get('analytics/top-rated/:subjectType')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get top rated subjects (employees, suppliers, brands)' })
  @ApiParam({ name: 'subjectType', enum: ['employee', 'supplier', 'brand'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopRatedSubjects(
    @Request() req,
    @Param('subjectType') subjectType: 'employee' | 'supplier' | 'brand',
    @Query('limit') limit?: number,
    @Query() filters?: ReviewAnalyticsFilterDto,
  ) {
    return this.analyticsService.getTopRatedSubjects(req.user.tenantId, subjectType, limit || 10, filters);
  }

  @Get('analytics/trends')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get response trends over time' })
  async getResponseTrends(@Request() req, @Query() filters: ReviewAnalyticsFilterDto) {
    return this.analyticsService.getResponseTrends(req.user.tenantId, filters);
  }

  @Get('analytics/questions/:templateId')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get question-level analytics for a template' })
  @ApiParam({ name: 'templateId', description: 'Template ID' })
  async getQuestionAnalytics(@Request() req, @Param('templateId', ParseIntPipe) templateId: number) {
    return this.analyticsService.getQuestionAnalytics(templateId, req.user.tenantId);
  }

  @Get('analytics/completion-rates')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get completion rates by respondent type' })
  async getCompletionRates(@Request() req, @Query() filters: ReviewAnalyticsFilterDto) {
    return this.analyticsService.getCompletionRatesByRespondent(req.user.tenantId, filters);
  }

  @Get('analytics/employee/:employeeId')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Get employee performance review summary' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  async getEmployeePerformance(
    @Request() req,
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query() filters?: ReviewAnalyticsFilterDto,
  ) {
    return this.analyticsService.getEmployeePerformanceSummary(employeeId, req.user.tenantId, filters);
  }

  // =====================
  // Triggers
  // =====================

  @Get('triggers')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'List review triggers' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async listTriggers(@Request() req, @Query('activeOnly') activeOnly?: boolean) {
    return this.triggerService.list(req.user.tenantId, activeOnly);
  }

  @Get('triggers/:id')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Get trigger by ID' })
  @ApiParam({ name: 'id', description: 'Trigger ID' })
  async getTrigger(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.triggerService.getById(id, req.user.tenantId);
  }

  @Post('triggers')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Create review trigger' })
  async createTrigger(@Request() req, @Body() dto: CreateReviewTriggerDto) {
    return this.triggerService.create(dto, req.user.tenantId);
  }

  @Put('triggers/:id')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Update review trigger' })
  @ApiParam({ name: 'id', description: 'Trigger ID' })
  async updateTrigger(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewTriggerDto) {
    return this.triggerService.update(id, dto, req.user.tenantId);
  }

  @Delete('triggers/:id')
  @RequirePermissions('reviews.manage')
  @ApiOperation({ summary: 'Delete review trigger' })
  @ApiParam({ name: 'id', description: 'Trigger ID' })
  async deleteTrigger(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.triggerService.delete(id, req.user.tenantId);
  }
}
