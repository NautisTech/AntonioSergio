import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum TransactionType {
  PAYMENT = 'payment',
  INVOICE = 'invoice',
  EXPENSE = 'expense',
  REFUND = 'refund',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum EntityType {
  ORDER = 'order',
  INVOICE = 'invoice',
  EXPENSE = 'expense',
  CLIENT = 'client',
  SUPPLIER = 'supplier',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  OTHER = 'other',
}

// Transaction Item DTO
export class CreateTransactionItemDto {
  @ApiPropertyOptional({ example: 1, description: 'Product ID (if applicable)' })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({ example: 1, description: 'Line number' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ example: 'Product description', description: 'Item description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 5, description: 'Quantity' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 99.99, description: 'Unit price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 23, description: 'Tax percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ example: 114.99, description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ example: 499.95, description: 'Line total amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  lineTotal: number;
}

// Update Transaction Item DTO
export class UpdateTransactionItemDto {
  @ApiPropertyOptional({ example: 1, description: 'Product ID (if applicable)' })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Line number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  lineNumber?: number;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Item description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 10, description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 89.99, description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: 23, description: 'Tax percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ example: 206.97, description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ example: 899.90, description: 'Line total amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lineTotal?: number;
}

// Create Transaction DTO
export class CreateTransactionDto {
  @ApiPropertyOptional({ example: 1, description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiProperty({ example: 'client', description: 'Entity type' })
  @IsNotEmpty()
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ example: 1, description: 'Entity ID (client, supplier, etc.)' })
  @IsNotEmpty()
  @IsInt()
  entityId: number;

  @ApiProperty({ example: 'invoice', description: 'Transaction type' })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ example: '2025-01-15', description: 'Transaction date' })
  @IsNotEmpty()
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional({ example: '2025-02-15', description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: '2025-01-20', description: 'Payment date' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'bank_transfer', description: 'Payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'pending', description: 'Transaction status' })
  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ example: 1000, description: 'Subtotal amount (before tax)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: 230, description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ example: 1230, description: 'Total amount (including tax)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 500, description: 'Amount already paid' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({ example: 730, description: 'Remaining balance' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @ApiPropertyOptional({ example: 'EUR', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Payment for services', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'EXT-12345', description: 'External reference' })
  @IsOptional()
  @IsString()
  externalRef?: string;

  @ApiPropertyOptional({ type: [CreateTransactionItemDto], description: 'Transaction items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items?: CreateTransactionItemDto[];
}

// Update Transaction DTO
export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 1, description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({ example: 'client', description: 'Entity type' })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ example: 1, description: 'Entity ID' })
  @IsOptional()
  @IsInt()
  entityId?: number;

  @ApiPropertyOptional({ example: 'invoice', description: 'Transaction type' })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiPropertyOptional({ example: '2025-01-15', description: 'Transaction date' })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({ example: '2025-02-15', description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: '2025-01-20', description: 'Payment date' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'bank_transfer', description: 'Payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'pending', description: 'Transaction status' })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ example: 1000, description: 'Subtotal amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @ApiPropertyOptional({ example: 230, description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ example: 1230, description: 'Total amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ example: 500, description: 'Amount paid' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({ example: 730, description: 'Remaining balance' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @ApiPropertyOptional({ example: 'EUR', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Updated notes', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'EXT-12345', description: 'External reference' })
  @IsOptional()
  @IsString()
  externalRef?: string;
}

// Record Payment DTO
export class RecordPaymentDto {
  @ApiProperty({ example: 500, description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'bank_transfer', description: 'Payment method' })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: '2025-01-20', description: 'Payment date' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'Payment received', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'PAY-12345', description: 'External reference' })
  @IsOptional()
  @IsString()
  externalRef?: string;
}

// Create Invoice DTO
export class CreateInvoiceDto {
  @ApiPropertyOptional({ example: 1, description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiProperty({ example: 1, description: 'Client ID' })
  @IsNotEmpty()
  @IsInt()
  clientId: number;

  @ApiProperty({ example: '2025-01-15', description: 'Invoice date' })
  @IsNotEmpty()
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ example: '2025-02-15', description: 'Due date' })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'EUR', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Invoice for services', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateTransactionItemDto], description: 'Invoice items' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items: CreateTransactionItemDto[];
}

// Create Expense DTO
export class CreateExpenseDto {
  @ApiPropertyOptional({ example: 1, description: 'Company ID' })
  @IsOptional()
  @IsInt()
  companyId?: number;

  @ApiProperty({ example: 1, description: 'Supplier ID' })
  @IsNotEmpty()
  @IsInt()
  supplierId: number;

  @ApiProperty({ example: '2025-01-15', description: 'Expense date' })
  @IsNotEmpty()
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional({ example: '2025-02-15', description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'bank_transfer', description: 'Payment method (if already paid)' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'EUR', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Office supplies', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'EXP-12345', description: 'External reference' })
  @IsOptional()
  @IsString()
  externalRef?: string;

  @ApiProperty({ type: [CreateTransactionItemDto], description: 'Expense items' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items: CreateTransactionItemDto[];
}

// Process Refund DTO
export class ProcessRefundDto {
  @ApiProperty({ example: 1, description: 'Original transaction ID to refund' })
  @IsNotEmpty()
  @IsInt()
  originalTransactionId: number;

  @ApiProperty({ example: 500, description: 'Refund amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2025-01-20', description: 'Refund date' })
  @IsNotEmpty()
  @IsDateString()
  refundDate: string;

  @ApiPropertyOptional({ example: 'bank_transfer', description: 'Refund method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'Product return', description: 'Refund reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'REF-12345', description: 'External reference' })
  @IsOptional()
  @IsString()
  externalRef?: string;
}

// Transaction Stats DTO
export class TransactionStatsDto {
  @ApiProperty({ example: 150, description: 'Total number of transactions' })
  totalTransactions: number;

  @ApiProperty({ example: 50000, description: 'Total amount of all transactions' })
  totalAmount: number;

  @ApiProperty({ example: 30000, description: 'Total amount paid' })
  totalPaid: number;

  @ApiProperty({ example: 15000, description: 'Total pending amount' })
  totalPending: number;

  @ApiProperty({ example: 5000, description: 'Total overdue amount' })
  totalOverdue: number;

  @ApiProperty({ example: 10, description: 'Number of overdue transactions' })
  overdueCount: number;

  @ApiProperty({ example: 333.33, description: 'Average transaction value' })
  averageValue: number;

  @ApiProperty({
    example: {
      invoice: { count: 50, total: 25000 },
      payment: { count: 40, total: 15000 },
      expense: { count: 30, total: 8000 },
      refund: { count: 5, total: 2000 },
    },
    description: 'Statistics by transaction type',
  })
  byType: {
    invoice: { count: number; total: number };
    payment: { count: number; total: number };
    expense: { count: number; total: number };
    refund: { count: number; total: number };
  };

  @ApiProperty({
    example: {
      draft: { count: 5, total: 2000 },
      pending: { count: 30, total: 15000 },
      paid: { count: 100, total: 30000 },
      overdue: { count: 10, total: 5000 },
      cancelled: { count: 5, total: 3000 },
      partially_paid: { count: 10, total: 7000 },
    },
    description: 'Statistics by transaction status',
  })
  byStatus: {
    draft: { count: number; total: number };
    pending: { count: number; total: number };
    paid: { count: number; total: number };
    overdue: { count: number; total: number };
    cancelled: { count: number; total: number };
    partially_paid: { count: number; total: number };
  };
}
