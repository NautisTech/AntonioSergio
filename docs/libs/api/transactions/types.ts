// ==================== ENUMS ====================

export type TransactionType = 'payment' | 'invoice' | 'expense' | 'refund' | 'transfer'

export type TransactionStatus =
    | 'draft'
    | 'pending'
    | 'paid'
    | 'partially_paid'
    | 'overdue'
    | 'failed'
    | 'cancelled'

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'other'

export type EntityType = 'order' | 'invoice' | 'expense' | 'client' | 'supplier'

// ==================== TRANSACTION ====================

export interface Transaction {
    id: number
    transactionNumber: string
    type: TransactionType
    status: TransactionStatus
    entityType?: EntityType
    entityId?: number
    entityName?: string
    clientId?: number
    client_name?: string
    supplierId?: number
    supplier_name?: string
    companyId?: number
    company_name?: string
    amount: number
    paidAmount?: number
    remainingAmount?: number
    taxAmount?: number
    discountAmount?: number
    totalAmount: number
    currency?: string
    paymentMethod?: PaymentMethod
    paymentDate?: string
    dueDate?: string
    transactionDate: string
    description?: string
    notes?: string
    reference?: string
    attachments?: string[]
    items?: TransactionItem[]
    payments?: Payment[]
    isRecurring?: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    recurringEndDate?: string
    tags?: string[]
    metadata?: Record<string, any>
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
    deletedBy?: number
}

export interface TransactionItem {
    id: number
    transactionId: number
    productId?: number
    product_name?: string
    serviceId?: number
    service_name?: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    taxRate?: number
    taxAmount?: number
    discountRate?: number
    discountAmount?: number
    finalAmount: number
    notes?: string
    metadata?: Record<string, any>
    createdAt: string
    updatedAt?: string
}

export interface Payment {
    id: number
    transactionId: number
    amount: number
    paymentMethod: PaymentMethod
    paymentDate: string
    reference?: string
    notes?: string
    createdAt: string
    createdBy?: number
    creator_name?: string
}

// ==================== CREATE/UPDATE DTOS ====================

export interface CreateTransactionDto {
    type: TransactionType
    status?: TransactionStatus
    entityType?: EntityType
    entityId?: number
    clientId?: number
    supplierId?: number
    companyId?: number
    amount: number
    taxAmount?: number
    discountAmount?: number
    totalAmount?: number
    currency?: string
    paymentMethod?: PaymentMethod
    paymentDate?: string
    dueDate?: string
    transactionDate: string
    description?: string
    notes?: string
    reference?: string
    attachments?: string[]
    items?: CreateTransactionItemDto[]
    isRecurring?: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    recurringEndDate?: string
    tags?: string[]
    metadata?: Record<string, any>
}

export interface UpdateTransactionDto {
    status?: TransactionStatus
    entityType?: EntityType
    entityId?: number
    clientId?: number
    supplierId?: number
    companyId?: number
    amount?: number
    taxAmount?: number
    discountAmount?: number
    totalAmount?: number
    currency?: string
    paymentMethod?: PaymentMethod
    paymentDate?: string
    dueDate?: string
    transactionDate?: string
    description?: string
    notes?: string
    reference?: string
    attachments?: string[]
    isRecurring?: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    recurringEndDate?: string
    tags?: string[]
    metadata?: Record<string, any>
}

export interface CreateTransactionItemDto {
    productId?: number
    serviceId?: number
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
    discountRate?: number
    notes?: string
    metadata?: Record<string, any>
}

export interface UpdateTransactionItemDto {
    productId?: number
    serviceId?: number
    description?: string
    quantity?: number
    unitPrice?: number
    taxRate?: number
    discountRate?: number
    notes?: string
    metadata?: Record<string, any>
}

// ==================== SPECIFIC OPERATION DTOS ====================

export interface RecordPaymentDto {
    amount: number
    paymentMethod: PaymentMethod
    paymentDate: string
    reference?: string
    notes?: string
}

export interface CreateInvoiceDto {
    clientId: number
    companyId?: number
    amount: number
    taxAmount?: number
    discountAmount?: number
    totalAmount?: number
    currency?: string
    dueDate?: string
    transactionDate: string
    description?: string
    notes?: string
    reference?: string
    attachments?: string[]
    items?: CreateTransactionItemDto[]
    paymentMethod?: PaymentMethod
    tags?: string[]
    metadata?: Record<string, any>
}

export interface CreateExpenseDto {
    supplierId: number
    companyId?: number
    amount: number
    taxAmount?: number
    totalAmount?: number
    currency?: string
    dueDate?: string
    transactionDate: string
    description?: string
    notes?: string
    reference?: string
    attachments?: string[]
    items?: CreateTransactionItemDto[]
    paymentMethod?: PaymentMethod
    tags?: string[]
    metadata?: Record<string, any>
}

export interface ProcessRefundDto {
    transactionId: number
    amount: number
    paymentMethod: PaymentMethod
    refundDate: string
    reason?: string
    notes?: string
}

// ==================== FILTERS & LISTS ====================

export interface TransactionListFilters {
    type?: TransactionType
    status?: TransactionStatus
    entityType?: EntityType
    entityId?: number
    clientId?: number
    supplierId?: number
    companyId?: number
    paymentMethod?: PaymentMethod
    fromDate?: string
    toDate?: string
    fromAmount?: number
    toAmount?: number
    search?: string
    tags?: string[]
    isOverdue?: boolean
    isPaid?: boolean
    isRecurring?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface TransactionListResponse {
    data: Transaction[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ==================== STATISTICS ====================

export interface TransactionStats {
    totalTransactions: number
    totalAmount: number
    totalPaid: number
    totalPending: number
    totalOverdue: number
    byType: Array<{
        type: TransactionType
        count: number
        totalAmount: number
    }>
    byStatus: Array<{
        status: TransactionStatus
        count: number
        totalAmount: number
    }>
    byPaymentMethod: Array<{
        method: PaymentMethod
        count: number
        totalAmount: number
    }>
    byMonth: Array<{
        month: string
        count: number
        totalAmount: number
        paidAmount: number
        pendingAmount: number
    }>
    revenueVsExpenses: {
        revenue: number
        expenses: number
        profit: number
    }
    topClients: Array<{
        clientId: number
        clientName: string
        totalAmount: number
        transactionCount: number
    }>
    topSuppliers: Array<{
        supplierId: number
        supplierName: string
        totalAmount: number
        transactionCount: number
    }>
}

export interface EntityBalance {
    entityId: number
    entityName: string
    entityType: EntityType
    totalReceivables?: number
    totalPayables?: number
    overdueReceivables?: number
    overduePayables?: number
    paidAmount: number
    pendingAmount: number
    transactions: Transaction[]
}

// ==================== OVERDUE ====================

export interface OverdueInvoice {
    id: number
    transactionNumber: string
    clientId: number
    client_name: string
    amount: number
    paidAmount: number
    remainingAmount: number
    dueDate: string
    daysOverdue: number
    status: TransactionStatus
}

export interface PendingExpense {
    id: number
    transactionNumber: string
    supplierId: number
    supplier_name: string
    amount: number
    paidAmount: number
    remainingAmount: number
    dueDate?: string
    status: TransactionStatus
}
