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
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { QuotesService } from './quotes.service';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  AcceptQuoteDto,
  RejectQuoteDto,
  SendQuoteDto,
  CloneQuoteDto,
  QuoteStatus,
} from './dto/quote.dto';

@ApiTags('Quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // ========================
  // General CRUD Operations
  // ========================

  @Get()
  @RequirePermissions('quotes.view')
  @ApiOperation({ summary: 'List all quotes with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: QuoteStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'clientId', required: false, type: Number, description: 'Filter by client ID' })
  @ApiQuery({ name: 'assignedTo', required: false, type: Number, description: 'Filter by assigned user ID' })
  @ApiQuery({ name: 'companyId', required: false, type: Number, description: 'Filter by company ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum total amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum total amount' })
  @ApiQuery({ name: 'expired', required: false, type: Boolean, description: 'Show only expired quotes' })
  @ApiQuery({ name: 'expiringIn', required: false, type: Number, description: 'Show quotes expiring in X days' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size', example: 20 })
  @ApiResponse({ status: 200, description: 'List of quotes retrieved successfully' })
  async findAll(
    @Request() req,
    @Query('status') status?: QuoteStatus,
    @Query('clientId') clientId?: number,
    @Query('assignedTo') assignedTo?: number,
    @Query('companyId') companyId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('expired') expired?: boolean,
    @Query('expiringIn') expiringIn?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.quotesService.findAll(req.user.tenantId, {
      status,
      clientId,
      assignedTo,
      companyId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      expired,
      expiringIn,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @RequirePermissions('quotes.view')
  @ApiOperation({ summary: 'Get quote statistics with win rate and conversion analysis' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'clientId', required: false, type: Number, description: 'Filter by client ID' })
  @ApiQuery({ name: 'assignedTo', required: false, type: Number, description: 'Filter by assigned user' })
  @ApiResponse({ status: 200, description: 'Quote statistics retrieved successfully' })
  async getStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('clientId') clientId?: number,
    @Query('assignedTo') assignedTo?: number,
  ) {
    return this.quotesService.getStats(req.user.tenantId, {
      startDate,
      endDate,
      clientId,
      assignedTo,
    });
  }

  @Get('expiring')
  @RequirePermissions('quotes.view')
  @ApiOperation({ summary: 'Get quotes expiring soon (default: within 7 days)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days ahead to check', example: 7 })
  @ApiResponse({ status: 200, description: 'Expiring quotes retrieved successfully' })
  async getExpiringQuotes(
    @Request() req,
    @Query('days') days?: number,
  ) {
    return this.quotesService.getExpiringQuotes(req.user.tenantId, days);
  }

  @Get('number/:quoteNumber')
  @RequirePermissions('quotes.view')
  @ApiOperation({ summary: 'Get quote by quote number' })
  @ApiParam({ name: 'quoteNumber', description: 'Quote number', example: 'QUO-2025-000001' })
  @ApiResponse({ status: 200, description: 'Quote found' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async findByNumber(
    @Request() req,
    @Param('quoteNumber') quoteNumber: string,
  ) {
    return this.quotesService.findByNumber(req.user.tenantId, quoteNumber);
  }

  @Get(':id')
  @RequirePermissions('quotes.view')
  @ApiOperation({ summary: 'Get quote by ID with items' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote found' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async findById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotesService.findById(req.user.tenantId, id);
  }

  @Post()
  @RequirePermissions('quotes.create')
  @ApiOperation({ summary: 'Create new quote' })
  @ApiBody({ type: CreateQuoteDto })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Request() req,
    @Body(ValidationPipe) dto: CreateQuoteDto,
  ) {
    return this.quotesService.create(req.user.tenantId, dto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('quotes.update')
  @ApiOperation({ summary: 'Update quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiBody({ type: UpdateQuoteDto })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 400, description: 'Cannot edit quote in current status' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('quotes.delete')
  @ApiOperation({ summary: 'Delete quote (soft delete)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async delete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotesService.delete(req.user.tenantId, id);
  }

  // ========================
  // Quote Workflow Operations
  // ========================

  @Post(':id/send')
  @RequirePermissions('quotes.send')
  @ApiOperation({ summary: 'Send quote to client (updates status to sent, optionally sends email)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiBody({ type: SendQuoteDto })
  @ApiResponse({ status: 200, description: 'Quote sent successfully' })
  @ApiResponse({ status: 400, description: 'Cannot send quote in current status' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async sendQuote(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: SendQuoteDto,
  ) {
    return this.quotesService.sendQuote(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/accept')
  @RequirePermissions('quotes.accept')
  @ApiOperation({ summary: 'Accept quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiBody({ type: AcceptQuoteDto })
  @ApiResponse({ status: 200, description: 'Quote accepted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot accept quote (already accepted/rejected or expired)' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async acceptQuote(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AcceptQuoteDto,
  ) {
    return this.quotesService.acceptQuote(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/reject')
  @RequirePermissions('quotes.reject')
  @ApiOperation({ summary: 'Reject quote with reason' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiBody({ type: RejectQuoteDto })
  @ApiResponse({ status: 200, description: 'Quote rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject quote (already accepted/rejected)' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async rejectQuote(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: RejectQuoteDto,
  ) {
    return this.quotesService.rejectQuote(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/clone')
  @RequirePermissions('quotes.create')
  @ApiOperation({ summary: 'Clone existing quote (create copy with new number)' })
  @ApiParam({ name: 'id', description: 'Quote ID to clone' })
  @ApiBody({ type: CloneQuoteDto })
  @ApiResponse({ status: 201, description: 'Quote cloned successfully' })
  @ApiResponse({ status: 404, description: 'Original quote not found' })
  async cloneQuote(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: CloneQuoteDto,
  ) {
    return this.quotesService.cloneQuote(req.user.tenantId, id, dto, req.user.id);
  }

  // ========================
  // Utility Operations
  // ========================

  @Post('mark-expired')
  @RequirePermissions('quotes.manage')
  @ApiOperation({ summary: 'Mark expired quotes (updates status for quotes past valid_until date)' })
  @ApiResponse({ status: 200, description: 'Expired quotes marked successfully' })
  async markExpiredQuotes(@Request() req) {
    return this.quotesService.markExpiredQuotes(req.user.tenantId);
  }
}
