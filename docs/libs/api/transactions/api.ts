import { apiClient, type RequestConfig } from '../client'
import type {
    Transaction,
    CreateTransactionDto,
    UpdateTransactionDto,
    RecordPaymentDto,
    CreateInvoiceDto,
    CreateExpenseDto,
    ProcessRefundDto,
    TransactionListFilters,
    TransactionListResponse,
    TransactionStats,
    EntityBalance,
    OverdueInvoice,
    PendingExpense,
    TransactionItem,
    CreateTransactionItemDto,
    UpdateTransactionItemDto,
} from './types'

class TransactionsAPI {
    private baseUrl = '/transactions'

    // ==================== GENERAL CRUD OPERATIONS ====================

    /**
     * List transactions with advanced filtering
     */
    async list(filters?: TransactionListFilters, config?: RequestConfig): Promise<TransactionListResponse> {
        const params = new URLSearchParams()

        if (filters?.type) params.append('type', filters.type)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.entityType) params.append('entityType', filters.entityType)
        if (filters?.entityId) params.append('entityId', String(filters.entityId))
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.supplierId) params.append('supplierId', String(filters.supplierId))
        if (filters?.companyId) params.append('companyId', String(filters.companyId))
        if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod)
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.fromAmount) params.append('fromAmount', String(filters.fromAmount))
        if (filters?.toAmount) params.append('toAmount', String(filters.toAmount))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.tags) filters.tags.forEach((tag) => params.append('tags[]', tag))
        if (filters?.isOverdue !== undefined) params.append('isOverdue', String(filters.isOverdue))
        if (filters?.isPaid !== undefined) params.append('isPaid', String(filters.isPaid))
        if (filters?.isRecurring !== undefined) params.append('isRecurring', String(filters.isRecurring))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TransactionListResponse>(url, config)
    }

    /**
     * Get transaction statistics
     */
    async getStats(filters?: {
        fromDate?: string
        toDate?: string
        clientId?: number
        supplierId?: number
        type?: string
    }, config?: RequestConfig): Promise<TransactionStats> {
        const params = new URLSearchParams()

        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.supplierId) params.append('supplierId', String(filters.supplierId))
        if (filters?.type) params.append('type', filters.type)

        const queryString = params.toString()
        const url = `${this.baseUrl}/statistics${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TransactionStats>(url, config)
    }

    /**
     * Get transaction by transaction number
     */
    async getByNumber(transactionNumber: string, config?: RequestConfig): Promise<Transaction> {
        return apiClient.get<Transaction>(`${this.baseUrl}/number/${transactionNumber}`, config)
    }

    /**
     * Get entity balance (receivables/payables)
     */
    async getEntityBalance(
        entityType: string,
        entityId: number,
        config?: RequestConfig
    ): Promise<EntityBalance> {
        return apiClient.get<EntityBalance>(
            `${this.baseUrl}/entity/${entityType}/${entityId}/balance`,
            config
        )
    }

    /**
     * Get transaction by ID with items
     */
    async getById(id: number, config?: RequestConfig): Promise<Transaction> {
        return apiClient.get<Transaction>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create transaction
     */
    async create(
        data: CreateTransactionDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Transaction created successfully',
            }
        )
    }

    /**
     * Update transaction
     */
    async update(
        id: number,
        data: UpdateTransactionDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Transaction updated successfully',
            }
        )
    }

    /**
     * Delete transaction (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Transaction deleted successfully',
            }
        )
    }

    // ==================== INVOICE OPERATIONS ====================

    /**
     * Create invoice for client
     */
    async createInvoice(
        data: CreateInvoiceDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/invoices`,
            data,
            {
                ...config,
                successMessage: 'Invoice created successfully',
            }
        )
    }

    /**
     * Get overdue invoices
     */
    async getOverdueInvoices(
        filters?: { clientId?: number; daysOverdue?: number },
        config?: RequestConfig
    ): Promise<OverdueInvoice[]> {
        const params = new URLSearchParams()

        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.daysOverdue) params.append('daysOverdue', String(filters.daysOverdue))

        const queryString = params.toString()
        const url = `${this.baseUrl}/invoices/overdue${queryString ? `?${queryString}` : ''}`

        return apiClient.get<OverdueInvoice[]>(url, config)
    }

    // ==================== PAYMENT OPERATIONS ====================

    /**
     * Record payment for transaction
     */
    async recordPayment(
        id: number,
        data: RecordPaymentDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/payments`,
            data,
            {
                ...config,
                successMessage: 'Payment recorded successfully',
            }
        )
    }

    // ==================== EXPENSE OPERATIONS ====================

    /**
     * Create expense for supplier
     */
    async createExpense(
        data: CreateExpenseDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/expenses`,
            data,
            {
                ...config,
                successMessage: 'Expense created successfully',
            }
        )
    }

    /**
     * Get pending expenses
     */
    async getPendingExpenses(
        filters?: { supplierId?: number },
        config?: RequestConfig
    ): Promise<PendingExpense[]> {
        const params = new URLSearchParams()

        if (filters?.supplierId) params.append('supplierId', String(filters.supplierId))

        const queryString = params.toString()
        const url = `${this.baseUrl}/expenses/pending${queryString ? `?${queryString}` : ''}`

        return apiClient.get<PendingExpense[]>(url, config)
    }

    // ==================== REFUND OPERATIONS ====================

    /**
     * Process refund for transaction
     */
    async processRefund(
        data: ProcessRefundDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/refunds`,
            data,
            {
                ...config,
                successMessage: 'Refund processed successfully',
            }
        )
    }

    // ==================== UTILITY OPERATIONS ====================

    /**
     * Mark overdue transactions
     */
    async markOverdueTransactions(
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; count: number }> {
        return apiClient.post<{ success: boolean; message: string; count: number }>(
            `${this.baseUrl}/mark-overdue`,
            {},
            {
                ...config,
                successMessage: 'Overdue transactions marked successfully',
            }
        )
    }

    // ==================== TRANSACTION ITEMS ====================

    /**
     * Get items for a transaction
     */
    async getItems(transactionId: number, config?: RequestConfig): Promise<TransactionItem[]> {
        return apiClient.get<TransactionItem[]>(`${this.baseUrl}/${transactionId}/items`, config)
    }

    /**
     * Add item to transaction
     */
    async addItem(
        transactionId: number,
        data: CreateTransactionItemDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/${transactionId}/items`,
            data,
            {
                ...config,
                successMessage: 'Transaction item added successfully',
            }
        )
    }

    /**
     * Update transaction item
     */
    async updateItem(
        transactionId: number,
        itemId: number,
        data: UpdateTransactionItemDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${transactionId}/items/${itemId}`,
            data,
            {
                ...config,
                successMessage: 'Transaction item updated successfully',
            }
        )
    }

    /**
     * Delete transaction item
     */
    async deleteItem(
        transactionId: number,
        itemId: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${transactionId}/items/${itemId}`,
            {
                ...config,
                successMessage: 'Transaction item deleted successfully',
            }
        )
    }
}

export const transactionsAPI = new TransactionsAPI()
