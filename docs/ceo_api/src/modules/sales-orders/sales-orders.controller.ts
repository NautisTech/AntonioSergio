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
import { SalesOrdersService } from './sales-orders.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  ConfirmOrderDto,
  ShipOrderDto,
  DeliverOrderDto,
  CancelOrderDto,
  CloneOrderDto,
  CreateReturnDto,
  OrderStatus,
  OrderPriority,
  OrderType,
  PaymentStatus,
} from './dto/sales-order.dto';

@ApiTags('Sales Orders')
@Controller('sales-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  // ========================
  // General CRUD Operations
  // ========================

  @Get()
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'List all sales orders with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'clientId', required: false, type: Number, description: 'Filter by client ID' })
  @ApiQuery({ name: 'assignedTo', required: false, type: Number, description: 'Filter by assigned user ID' })
  @ApiQuery({ name: 'companyId', required: false, type: Number, description: 'Filter by company ID' })
  @ApiQuery({ name: 'orderType', required: false, enum: OrderType, description: 'Filter by order type' })
  @ApiQuery({ name: 'priority', required: false, enum: OrderPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus, description: 'Filter by payment status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum total amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum total amount' })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean, description: 'Show only overdue orders' })
  @ApiQuery({ name: 'dueIn', required: false, type: Number, description: 'Show orders due in X days' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size', example: 20 })
  @ApiResponse({ status: 200, description: 'List of sales orders retrieved successfully' })
  async findAll(
    @Request() req,
    @Query('status') status?: OrderStatus,
    @Query('clientId') clientId?: number,
    @Query('assignedTo') assignedTo?: number,
    @Query('companyId') companyId?: number,
    @Query('orderType') orderType?: OrderType,
    @Query('priority') priority?: OrderPriority,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('overdue') overdue?: boolean,
    @Query('dueIn') dueIn?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.salesOrdersService.findAll(req.user.tenantId, {
      status,
      clientId,
      assignedTo,
      companyId,
      orderType,
      priority,
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      overdue,
      dueIn,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'Get sales order statistics with fulfillment and payment analysis' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'clientId', required: false, type: Number, description: 'Filter by client ID' })
  @ApiQuery({ name: 'assignedTo', required: false, type: Number, description: 'Filter by assigned user' })
  @ApiResponse({ status: 200, description: 'Sales order statistics retrieved successfully' })
  async getStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('clientId') clientId?: number,
    @Query('assignedTo') assignedTo?: number,
  ) {
    return this.salesOrdersService.getStats(req.user.tenantId, {
      startDate,
      endDate,
      clientId,
      assignedTo,
    });
  }

  @Get('overdue')
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'Get overdue sales orders (past expected delivery date)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days overdue', example: 7 })
  @ApiResponse({ status: 200, description: 'Overdue orders retrieved successfully' })
  async getOverdueOrders(
    @Request() req,
    @Query('days') days?: number,
  ) {
    return this.salesOrdersService.getOverdueOrders(req.user.tenantId, days);
  }

  @Get('number/:orderNumber')
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'Get sales order by order number' })
  @ApiParam({ name: 'orderNumber', description: 'Order number', example: 'ORD-2025-000001' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findByNumber(
    @Request() req,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.salesOrdersService.findByNumber(req.user.tenantId, orderNumber);
  }

  @Get(':id')
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'Get sales order by ID with items' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.salesOrdersService.findById(req.user.tenantId, id);
  }

  @Post()
  @RequirePermissions('orders.create')
  @ApiOperation({ summary: 'Create new sales order' })
  @ApiBody({ type: CreateSalesOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Request() req,
    @Body(ValidationPipe) dto: CreateSalesOrderDto,
  ) {
    return this.salesOrdersService.create(req.user.tenantId, dto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('orders.update')
  @ApiOperation({ summary: 'Update sales order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: UpdateSalesOrderDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Cannot edit order in current status' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateSalesOrderDto,
  ) {
    return this.salesOrdersService.update(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('orders.delete')
  @ApiOperation({ summary: 'Delete sales order (soft delete)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async delete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.salesOrdersService.delete(req.user.tenantId, id);
  }

  // ========================
  // Order Workflow Operations
  // ========================

  @Post(':id/confirm')
  @RequirePermissions('orders.confirm')
  @ApiOperation({ summary: 'Confirm sales order (change status from draft/pending to confirmed)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: ConfirmOrderDto })
  @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot confirm order in current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async confirmOrder(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ConfirmOrderDto,
  ) {
    return this.salesOrdersService.confirmOrder(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/ship')
  @RequirePermissions('orders.ship')
  @ApiOperation({ summary: 'Ship sales order (updates status and adds tracking info)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: ShipOrderDto })
  @ApiResponse({ status: 200, description: 'Order shipped successfully' })
  @ApiResponse({ status: 400, description: 'Cannot ship order in current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async shipOrder(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ShipOrderDto,
  ) {
    return this.salesOrdersService.shipOrder(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/deliver')
  @RequirePermissions('orders.deliver')
  @ApiOperation({ summary: 'Mark sales order as delivered' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: DeliverOrderDto })
  @ApiResponse({ status: 200, description: 'Order delivered successfully' })
  @ApiResponse({ status: 400, description: 'Cannot deliver order in current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deliverOrder(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: DeliverOrderDto,
  ) {
    return this.salesOrdersService.deliverOrder(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/complete')
  @RequirePermissions('orders.complete')
  @ApiOperation({ summary: 'Complete sales order (final status)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order completed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot complete order in current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async completeOrder(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.salesOrdersService.completeOrder(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/cancel')
  @RequirePermissions('orders.cancel')
  @ApiOperation({ summary: 'Cancel sales order with reason' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: CancelOrderDto })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel order (already delivered/completed)' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: CancelOrderDto,
  ) {
    return this.salesOrdersService.cancelOrder(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/return')
  @RequirePermissions('orders.create_return')
  @ApiOperation({ summary: 'Create return for delivered order' })
  @ApiParam({ name: 'id', description: 'Original order ID' })
  @ApiBody({ type: CreateReturnDto })
  @ApiResponse({ status: 201, description: 'Return created successfully' })
  @ApiResponse({ status: 400, description: 'Cannot create return (order not delivered)' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createReturn(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: CreateReturnDto,
  ) {
    return this.salesOrdersService.createReturn(req.user.tenantId, id, dto, req.user.id);
  }

  @Post(':id/clone')
  @RequirePermissions('orders.create')
  @ApiOperation({ summary: 'Clone existing sales order (create copy with new number)' })
  @ApiParam({ name: 'id', description: 'Order ID to clone' })
  @ApiBody({ type: CloneOrderDto })
  @ApiResponse({ status: 201, description: 'Order cloned successfully' })
  @ApiResponse({ status: 404, description: 'Original order not found' })
  async cloneOrder(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: CloneOrderDto,
  ) {
    return this.salesOrdersService.cloneOrder(req.user.tenantId, id, dto, req.user.id);
  }

  // ========================
  // Payment Operations
  // ========================

  @Post(':id/payment')
  @RequirePermissions('orders.record_payment')
  @ApiOperation({ summary: 'Record payment for sales order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 250.00 },
        paymentMethod: { type: 'string', example: 'bank_transfer' },
        paymentDate: { type: 'string', format: 'date', example: '2025-01-15' },
        reference: { type: 'string', example: 'TXN-12345' },
        notes: { type: 'string', example: 'Partial payment received' },
      },
      required: ['amount', 'paymentMethod', 'paymentDate'],
    },
  })
  @ApiResponse({ status: 200, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment amount or order status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async recordPayment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: any,
  ) {
    return this.salesOrdersService.recordPayment(req.user.tenantId, id, dto, req.user.id);
  }
}
