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
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateTransactionItemDto,
  UpdateTransactionItemDto,
  RecordPaymentDto,
  CreateInvoiceDto,
  CreateExpenseDto,
  ProcessRefundDto,
  TransactionType,
  TransactionStatus,
  EntityType,
  PaymentMethod,
} from './dto/transaction.dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ========================
  // General CRUD Operations
  // ========================

  @Get()
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'List all transactions with filtering and pagination' })
  @ApiQuery({ name: 'transactionType', required: false, enum: TransactionType, description: 'Filter by transaction type' })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'entityType', required: false, enum: EntityType, description: 'Filter by entity type' })
  @ApiQuery({ name: 'entityId', required: false, type: Number, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'companyId', required: false, type: Number, description: 'Filter by company ID' })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: PaymentMethod, description: 'Filter by payment method' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum amount' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency code' })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean, description: 'Show only overdue transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size', example: 20 })
  @ApiResponse({ status: 200, description: 'List of transactions retrieved successfully' })
  async findAll(
    @Request() req,
    @Query('transactionType') transactionType?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('entityType') entityType?: EntityType,
    @Query('entityId') entityId?: number,
    @Query('companyId') companyId?: number,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('currency') currency?: string,
    @Query('overdue') overdue?: boolean,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.transactionsService.findAll(req.user.tenantId, {
      transactionType,
      status,
      entityType,
      entityId,
      companyId,
      paymentMethod,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      currency,
      overdue,
      page,
      pageSize,
    });
  }

  @Get('statistics')
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'entityType', required: false, enum: EntityType, description: 'Filter by entity type' })
  @ApiQuery({ name: 'entityId', required: false, type: Number, description: 'Filter by entity ID' })
  @ApiResponse({ status: 200, description: 'Transaction statistics retrieved successfully' })
  async getStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('entityType') entityType?: EntityType,
    @Query('entityId') entityId?: number,
  ) {
    return this.transactionsService.getStats(req.user.tenantId, {
      startDate,
      endDate,
      entityType,
      entityId,
    });
  }

  @Get('number/:transactionNumber')
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'Get transaction by transaction number' })
  @ApiParam({ name: 'transactionNumber', description: 'Transaction number', example: 'INV-2025-000001' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findByNumber(
    @Request() req,
    @Param('transactionNumber') transactionNumber: string,
  ) {
    return this.transactionsService.findByNumber(req.user.tenantId, transactionNumber);
  }

  @Get('entity/:entityType/:entityId/balance')
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'Get entity balance (receivables/payables)' })
  @ApiParam({ name: 'entityType', enum: EntityType, description: 'Entity type' })
  @ApiParam({ name: 'entityId', type: Number, description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity balance retrieved successfully' })
  async getEntityBalance(
    @Request() req,
    @Param('entityType') entityType: EntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.transactionsService.getEntityBalance(req.user.tenantId, entityType, entityId);
  }

  @Get(':id')
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'Get transaction by ID with items' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionsService.findById(req.user.tenantId, id);
  }

  @Post()
  @RequirePermissions('transactions.create')
  @ApiOperation({ summary: 'Create new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Request() req,
    @Body(ValidationPipe) dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(req.user.tenantId, dto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('transactions.update')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('transactions.delete')
  @ApiOperation({ summary: 'Delete transaction (soft delete)' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async delete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionsService.delete(req.user.tenantId, id);
  }

  // ========================
  // Invoice Operations
  // ========================

  @Post('invoices')
  @RequirePermissions('transactions.create_invoice')
  @ApiOperation({ summary: 'Create invoice for client' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createInvoice(
    @Request() req,
    @Body(ValidationPipe) dto: CreateInvoiceDto,
  ) {
    return this.transactionsService.createInvoice(req.user.tenantId, dto, req.user.id);
  }

  @Get('invoices/overdue')
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'Get all overdue invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Overdue invoices retrieved successfully' })
  async getOverdueInvoices(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.transactionsService.findAll(req.user.tenantId, {
      transactionType: TransactionType.INVOICE,
      overdue: true,
      page,
      pageSize,
    });
  }

  // ========================
  // Payment Operations
  // ========================

  @Post(':id/payments')
  @RequirePermissions('transactions.record_payment')
  @ApiOperation({ summary: 'Record payment for a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID to record payment for' })
  @ApiBody({ type: RecordPaymentDto })
  @ApiResponse({ status: 200, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data or transaction already paid' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async recordPayment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: RecordPaymentDto,
  ) {
    return this.transactionsService.recordPayment(req.user.tenantId, id, dto, req.user.id);
  }

  // ========================
  // Expense Operations
  // ========================

  @Post('expenses')
  @RequirePermissions('transactions.create_expense')
  @ApiOperation({ summary: 'Create expense for supplier' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createExpense(
    @Request() req,
    @Body(ValidationPipe) dto: CreateExpenseDto,
  ) {
    return this.transactionsService.createExpense(req.user.tenantId, dto, req.user.id);
  }

  @Get('expenses/pending')
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'Get all pending expenses' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Pending expenses retrieved successfully' })
  async getPendingExpenses(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.transactionsService.findAll(req.user.tenantId, {
      transactionType: TransactionType.EXPENSE,
      status: TransactionStatus.PENDING,
      page,
      pageSize,
    });
  }

  // ========================
  // Refund Operations
  // ========================

  @Post('refunds')
  @RequirePermissions('transactions.create_refund')
  @ApiOperation({ summary: 'Process refund for a transaction' })
  @ApiBody({ type: ProcessRefundDto })
  @ApiResponse({ status: 201, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund data' })
  @ApiResponse({ status: 404, description: 'Original transaction not found' })
  async processRefund(
    @Request() req,
    @Body(ValidationPipe) dto: ProcessRefundDto,
  ) {
    return this.transactionsService.processRefund(req.user.tenantId, dto, req.user.id);
  }

  // ========================
  // Utility Operations
  // ========================

  @Post('mark-overdue')
  @RequirePermissions('transactions.manage')
  @ApiOperation({ summary: 'Mark overdue transactions (updates status for transactions past due date)' })
  @ApiResponse({ status: 200, description: 'Overdue transactions marked successfully' })
  async markOverdueTransactions(@Request() req) {
    return this.transactionsService.markOverdueTransactions(req.user.tenantId);
  }

  // ========================
  // Transaction Items Operations
  // ========================

  @Get(':transactionId/items')
  @RequirePermissions('transactions.view')
  @ApiOperation({ summary: 'Get items for a transaction' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction items retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionItems(
    @Request() req,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    return this.transactionsService.getTransactionItems(req.user.tenantId, transactionId);
  }

  @Post(':transactionId/items')
  @RequirePermissions('transactions.update')
  @ApiOperation({ summary: 'Add item to transaction' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiBody({ type: CreateTransactionItemDto })
  @ApiResponse({ status: 201, description: 'Transaction item added successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Invalid item data' })
  async addTransactionItem(
    @Request() req,
    @Param('transactionId', ParseIntPipe) transactionId: number,
    @Body(ValidationPipe) dto: CreateTransactionItemDto,
  ) {
    return this.transactionsService.addTransactionItem(
      req.user.tenantId,
      transactionId,
      dto,
      req.user.id,
    );
  }

  @Put(':transactionId/items/:itemId')
  @RequirePermissions('transactions.update')
  @ApiOperation({ summary: 'Update transaction item' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiBody({ type: UpdateTransactionItemDto })
  @ApiResponse({ status: 200, description: 'Transaction item updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction or item not found' })
  async updateTransactionItem(
    @Request() req,
    @Param('transactionId', ParseIntPipe) transactionId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body(ValidationPipe) dto: UpdateTransactionItemDto,
  ) {
    return this.transactionsService.updateTransactionItem(
      req.user.tenantId,
      transactionId,
      itemId,
      dto,
      req.user.id,
    );
  }

  @Delete(':transactionId/items/:itemId')
  @RequirePermissions('transactions.delete')
  @ApiOperation({ summary: 'Delete transaction item' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Transaction item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction or item not found' })
  async deleteTransactionItem(
    @Request() req,
    @Param('transactionId', ParseIntPipe) transactionId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.transactionsService.deleteTransactionItem(req.user.tenantId, transactionId, itemId);
  }
}
