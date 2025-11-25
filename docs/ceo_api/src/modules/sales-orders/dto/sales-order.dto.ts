import {
  IsInt,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========================
// Enums
// ========================

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  PARTIALLY_DELIVERED = 'partially_delivered',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum OrderType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  CUSTOM = 'custom',
  WHOLESALE = 'wholesale',
  SAMPLE = 'sample',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  OVERDUE = 'overdue',
}

export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  PICKUP = 'pickup',
  FREIGHT = 'freight',
}

// ========================
// Order Item DTOs
// ========================

export class CreateOrderItemDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({ description: 'Line number', example: 1 })
  @IsInt()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ description: 'Item description', example: 'Premium Widget - Blue' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Quantity ordered', example: 10 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 25.50 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percentage', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Discount amount', example: 25.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percentage', example: 23 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 52.78 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ description: 'Line total', example: 282.28 })
  @IsNumber()
  @Min(0)
  lineTotal: number;

  @ApiPropertyOptional({ description: 'Item notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateOrderItemDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiPropertyOptional({ description: 'Line number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  lineNumber?: number;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Quantity ordered' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Line total' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lineTotal?: number;

  @ApiPropertyOptional({ description: 'Quantity shipped' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippedQuantity?: number;

  @ApiPropertyOptional({ description: 'Quantity delivered' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveredQuantity?: number;

  @ApiPropertyOptional({ description: 'Item notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

// ========================
// Sales Order DTOs
// ========================

export class CreateSalesOrderDto {
  @ApiPropertyOptional({ description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiProperty({ description: 'Client ID', example: 1 })
  @IsInt()
  clientId: number;

  @ApiPropertyOptional({ description: 'Quote ID (if converted from quote)' })
  @IsOptional()
  @IsInt()
  quoteId?: number;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @ApiPropertyOptional({ description: 'Salesperson ID' })
  @IsOptional()
  @IsInt()
  salespersonId?: number;

  @ApiProperty({ description: 'Order title', example: 'Wholesale Order - January 2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Order description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Order type', enum: OrderType, example: OrderType.STANDARD })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({ description: 'Priority', enum: OrderPriority, example: OrderPriority.NORMAL })
  @IsEnum(OrderPriority)
  priority: OrderPriority;

  @ApiProperty({ description: 'Order date', example: '2025-01-15' })
  @IsDateString()
  orderDate: string;

  @ApiPropertyOptional({ description: 'Expected delivery date', example: '2025-01-30' })
  @IsOptional()
  @IsDateString()
  expectedDelivery?: string;

  @ApiPropertyOptional({ description: 'Shipping method', enum: ShippingMethod })
  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({ description: 'Billing address' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiPropertyOptional({ description: 'Customer PO number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerPoNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Overall discount percentage', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Overall discount amount', example: 50.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Overall tax percentage', example: 23 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'Shipping cost', example: 15.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiProperty({ description: 'Order items', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateSalesOrderDto {
  @ApiPropertyOptional({ description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsInt()
  clientId?: number;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @ApiPropertyOptional({ description: 'Salesperson ID' })
  @IsOptional()
  @IsInt()
  salespersonId?: number;

  @ApiPropertyOptional({ description: 'Order title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Order description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Order type', enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @ApiPropertyOptional({ description: 'Priority', enum: OrderPriority })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @ApiPropertyOptional({ description: 'Order date' })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDelivery?: string;

  @ApiPropertyOptional({ description: 'Status', enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Shipping method', enum: ShippingMethod })
  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({ description: 'Billing address' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiPropertyOptional({ description: 'Customer PO number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerPoNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Overall discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Overall discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Overall tax percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ description: 'Shipping cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;
}

export class ConfirmOrderDto {
  @ApiPropertyOptional({ description: 'Confirmation notes' })
  @IsOptional()
  @IsString()
  confirmationNotes?: string;

  @ApiPropertyOptional({ description: 'Updated expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDelivery?: string;
}

export class ShipOrderDto {
  @ApiProperty({ description: 'Shipping date', example: '2025-01-20' })
  @IsDateString()
  shippingDate: string;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Carrier name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carrier?: string;

  @ApiPropertyOptional({ description: 'Shipping notes' })
  @IsOptional()
  @IsString()
  shippingNotes?: string;

  @ApiPropertyOptional({ description: 'Items being shipped (item_id: quantity)' })
  @IsOptional()
  itemQuantities?: Record<number, number>;
}

export class DeliverOrderDto {
  @ApiProperty({ description: 'Delivery date', example: '2025-01-22' })
  @IsDateString()
  deliveryDate: string;

  @ApiPropertyOptional({ description: 'Received by (name)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  receivedBy?: string;

  @ApiPropertyOptional({ description: 'Delivery notes' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({ description: 'Signature (base64 or URL)' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({ description: 'Items being delivered (item_id: quantity)' })
  @IsOptional()
  itemQuantities?: Record<number, number>;
}

export class CancelOrderDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CloneOrderDto {
  @ApiPropertyOptional({ description: 'Override order title for cloned order' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Override description for cloned order' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date for cloned order' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Notes for cloned order' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReturnDto {
  @ApiProperty({ description: 'Order ID to return' })
  @IsInt()
  orderId: number;

  @ApiProperty({ description: 'Return reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Items being returned (item_id: quantity)' })
  itemQuantities: Record<number, number>;

  @ApiPropertyOptional({ description: 'Refund amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @ApiPropertyOptional({ description: 'Return notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConvertQuoteToOrderDto {
  @ApiProperty({ description: 'Quote ID to convert' })
  @IsInt()
  quoteId: number;

  @ApiPropertyOptional({ description: 'Override order title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customTitle?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDelivery?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SalesOrderStatsDto {
  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ description: 'Total order value' })
  totalValue: number;

  @ApiProperty({ description: 'Total value of completed orders' })
  completedValue: number;

  @ApiProperty({ description: 'Total value of pending orders' })
  pendingValue: number;

  @ApiProperty({ description: 'Total value of cancelled orders' })
  cancelledValue: number;

  @ApiProperty({ description: 'Average order value' })
  averageOrderValue: number;

  @ApiProperty({ description: 'Average fulfillment time (in days)' })
  averageFulfillmentTime: number;

  @ApiProperty({ description: 'Number of overdue orders' })
  overdueCount: number;

  @ApiProperty({ description: 'Total shipped value' })
  shippedValue: number;

  @ApiProperty({ description: 'Breakdown by status' })
  byStatus: {
    draft: { count: number; total: number };
    pending: { count: number; total: number };
    confirmed: { count: number; total: number };
    processing: { count: number; total: number };
    partially_shipped: { count: number; total: number };
    shipped: { count: number; total: number };
    partially_delivered: { count: number; total: number };
    delivered: { count: number; total: number };
    completed: { count: number; total: number };
    cancelled: { count: number; total: number };
    returned: { count: number; total: number };
  };

  @ApiProperty({ description: 'Breakdown by priority' })
  byPriority: {
    low: { count: number; total: number };
    normal: { count: number; total: number };
    high: { count: number; total: number };
    urgent: { count: number; total: number };
  };

  @ApiProperty({ description: 'Breakdown by payment status' })
  byPaymentStatus: {
    unpaid: { count: number; total: number };
    partially_paid: { count: number; total: number };
    paid: { count: number; total: number };
    refunded: { count: number; total: number };
    overdue: { count: number; total: number };
  };

  @ApiProperty({ description: 'Top clients by order value' })
  topClients: Array<{
    clientId: number;
    clientName: string;
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
  }>;
}
