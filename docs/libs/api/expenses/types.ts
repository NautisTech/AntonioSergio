// ==================== ENUMS ====================

export type ExpenseClaimStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'cancelled'

// ==================== EXPENSE CATEGORIES ====================

export interface ExpenseCategory {
    id: number
    name: string
    description?: string
    icon?: string
    color?: string
    requiresReceipt: boolean
    maxAmount?: number
    isActive: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateCategoryDto {
    name: string
    description?: string
    icon?: string
    color?: string
    requiresReceipt?: boolean
    maxAmount?: number
    isActive?: boolean
}

export interface UpdateCategoryDto {
    name?: string
    description?: string
    icon?: string
    color?: string
    requiresReceipt?: boolean
    maxAmount?: number
    isActive?: boolean
}

// ==================== EXPENSE CLAIMS ====================

export interface ExpenseClaim {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    title: string
    description?: string
    expenseDate: string
    totalAmount: number
    status: ExpenseClaimStatus
    submittedAt?: string
    approvedBy?: number
    approver_name?: string
    approvedAt?: string
    rejectedBy?: number
    rejector_name?: string
    rejectedAt?: string
    rejectionReason?: string
    paidAt?: string
    paymentReference?: string
    notes?: string
    attachments?: string[]
    items?: ExpenseItem[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface ExpenseItem {
    id: number
    expenseClaimId: number
    categoryId: number
    category_name?: string
    description: string
    amount: number
    expenseDate: string
    receiptUrl?: string
    hasReceipt: boolean
    notes?: string
    createdAt: string
    updatedAt?: string
}

export interface CreateExpenseClaimDto {
    employeeId: number
    title: string
    description?: string
    expenseDate: string
    totalAmount: number
    status?: ExpenseClaimStatus
    notes?: string
    attachments?: string[]
    items?: CreateExpenseItemDto[]
}

export interface UpdateExpenseClaimDto {
    title?: string
    description?: string
    expenseDate?: string
    totalAmount?: number
    status?: ExpenseClaimStatus
    notes?: string
    attachments?: string[]
}

export interface CreateExpenseItemDto {
    categoryId: number
    description: string
    amount: number
    expenseDate: string
    receiptUrl?: string
    hasReceipt?: boolean
    notes?: string
}

export interface UpdateExpenseItemDto {
    categoryId?: number
    description?: string
    amount?: number
    expenseDate?: string
    receiptUrl?: string
    hasReceipt?: boolean
    notes?: string
}

export interface ApproveClaimDto {
    approvalNotes?: string
}

export interface RejectClaimDto {
    rejectionReason: string
}

export interface ExpenseClaimListFilters {
    employeeId?: number
    status?: ExpenseClaimStatus
    categoryId?: number
    fromDate?: string
    toDate?: string
    minAmount?: number
    maxAmount?: number
    search?: string
    page?: number
    pageSize?: number
}

export interface ExpenseClaimListResponse {
    data: ExpenseClaim[]
    total: number
    page: number
    pageSize: number
}

// ==================== STATISTICS ====================

export interface ExpenseStats {
    totalClaims: number
    totalAmount: number
    pendingClaims: number
    pendingAmount: number
    approvedClaims: number
    approvedAmount: number
    rejectedClaims: number
    rejectedAmount: number
    paidClaims: number
    paidAmount: number
    averageClaimAmount: number
    byCategory: Array<{
        categoryId: number
        categoryName: string
        count: number
        totalAmount: number
    }>
    byEmployee: Array<{
        employeeId: number
        employeeName: string
        count: number
        totalAmount: number
    }>
    byStatus: Array<{
        status: string
        count: number
        totalAmount: number
    }>
    byMonth: Array<{
        month: string
        count: number
        totalAmount: number
    }>
}
