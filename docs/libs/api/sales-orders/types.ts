// ==================== ENUMS ====================

export type OrderStatus =
    | 'draft'
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'partially_shipped'
    | 'shipped'
    | 'partially_delivered'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'returned'

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent'

export type OrderType = 'standard' | 'express' | 'custom' | 'wholesale' | 'sample'

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'overdue'

export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup' | 'freight'

// ==================== ORDER ITEMS ====================

export interface OrderItem {
    id: number
    orderId: number
    productId?: number
    product_name?: string
    lineNumber: number
    description: string
    quantity: number
    shippedQuantity?: number
    deliveredQuantity?: number
    unitPrice: number
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
    taxAmount?: number
    lineTotal: number
    notes?: string
    createdAt: string
    updatedAt?: string
}

export interface CreateOrderItemDto {
    productId?: number
    lineNumber: number
    description: string
    quantity: number
    unitPrice: number
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
    taxAmount?: number
    lineTotal: number
    notes?: string
}

export interface UpdateOrderItemDto extends Partial<CreateOrderItemDto> {
    shippedQuantity?: number
    deliveredQuantity?: number
}

// ==================== SALES ORDERS ====================

export interface SalesOrder {
    id: number
    orderNumber: string
    companyId?: number
    company_name_ref?: string
    clientId: number
    client_name?: string
    client_email?: string
    quoteId?: number
    quote_number?: string
    assignedTo?: number
    assigned_to_name?: string
    salespersonId?: number
    salesperson_name?: string
    title: string
    description?: string
    status: OrderStatus
    orderType: OrderType
    priority: OrderPriority
    paymentStatus: PaymentStatus
    orderDate: string
    expectedDelivery?: string
    shippingMethod?: ShippingMethod
    shippingAddress?: string
    billingAddress?: string
    shippingDate?: string
    deliveryDate?: string
    completionDate?: string
    cancellationDate?: string
    cancellationReason?: string
    trackingNumber?: string
    carrier?: string
    customerPoNumber?: string
    receivedBy?: string
    signature?: string
    notes?: string
    termsAndConditions?: string
    subtotal: number
    discountPercentage?: number
    discountAmount?: number
    discountTotal: number
    taxPercentage?: number
    taxTotal: number
    shippingCost: number
    total: number
    paidAmount: number
    balanceDue: number
    items?: OrderItem[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateSalesOrderDto {
    companyId?: number
    clientId: number
    quoteId?: number
    assignedTo?: number
    salespersonId?: number
    title: string
    description?: string
    orderType: OrderType
    priority: OrderPriority
    orderDate: string
    expectedDelivery?: string
    shippingMethod?: ShippingMethod
    shippingAddress?: string
    billingAddress?: string
    customerPoNumber?: string
    notes?: string
    termsAndConditions?: string
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
    shippingCost?: number
    items: CreateOrderItemDto[]
}

export interface UpdateSalesOrderDto {
    companyId?: number
    clientId?: number
    assignedTo?: number
    salespersonId?: number
    title?: string
    description?: string
    orderType?: OrderType
    priority?: OrderPriority
    orderDate?: string
    expectedDelivery?: string
    status?: OrderStatus
    shippingMethod?: ShippingMethod
    shippingAddress?: string
    billingAddress?: string
    customerPoNumber?: string
    notes?: string
    termsAndConditions?: string
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
    shippingCost?: number
}

// ==================== WORKFLOW DTOs ====================

export interface ConfirmOrderDto {
    confirmationNotes?: string
    expectedDelivery?: string
}

export interface ShipOrderDto {
    shippingDate: string
    trackingNumber?: string
    carrier?: string
    shippingNotes?: string
    itemQuantities?: Record<number, number>
}

export interface DeliverOrderDto {
    deliveryDate: string
    receivedBy?: string
    deliveryNotes?: string
    signature?: string
    itemQuantities?: Record<number, number>
}

export interface CancelOrderDto {
    reason: string
    notes?: string
}

export interface CloneOrderDto {
    title?: string
    description?: string
    expectedDeliveryDate?: string
    notes?: string
}

export interface CreateReturnDto {
    orderId: number
    reason: string
    itemQuantities: Record<number, number>
    refundAmount?: number
    notes?: string
}

export interface RecordPaymentDto {
    amount: number
    paymentMethod: string
    paymentDate: string
    reference?: string
    notes?: string
}

// ==================== FILTERS & RESPONSES ====================

export interface SalesOrderListFilters {
    status?: OrderStatus
    clientId?: number
    assignedTo?: number
    companyId?: number
    orderType?: OrderType
    priority?: OrderPriority
    paymentStatus?: PaymentStatus
    startDate?: string
    endDate?: string
    minAmount?: number
    maxAmount?: number
    overdue?: boolean
    dueIn?: number
    page?: number
    pageSize?: number
}

export interface SalesOrderListResponse {
    data: SalesOrder[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

// ==================== STATISTICS ====================

export interface SalesOrderStats {
    totalOrders: number
    totalValue: number
    completedValue: number
    pendingValue: number
    cancelledValue: number
    averageOrderValue: number
    averageFulfillmentTime: number
    overdueCount: number
    shippedValue: number
    byStatus: {
        draft: { count: number; total: number }
        pending: { count: number; total: number }
        confirmed: { count: number; total: number }
        processing: { count: number; total: number }
        partially_shipped: { count: number; total: number }
        shipped: { count: number; total: number }
        partially_delivered: { count: number; total: number }
        delivered: { count: number; total: number }
        completed: { count: number; total: number }
        cancelled: { count: number; total: number }
        returned: { count: number; total: number }
    }
    byPriority: {
        low: { count: number; total: number }
        normal: { count: number; total: number }
        high: { count: number; total: number }
        urgent: { count: number; total: number }
    }
    byPaymentStatus: {
        unpaid: { count: number; total: number }
        partially_paid: { count: number; total: number }
        paid: { count: number; total: number }
        refunded: { count: number; total: number }
        overdue: { count: number; total: number }
    }
    topClients: Array<{
        clientId: number
        clientName: string
        totalOrders: number
        totalValue: number
        averageOrderValue: number
    }>
}

export interface OverdueOrdersResponse {
    data: SalesOrder[]
    daysOverdue?: number
}
