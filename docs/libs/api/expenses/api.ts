import { apiClient, type RequestConfig } from '../client'
import type {
    ExpenseClaim,
    CreateExpenseClaimDto,
    UpdateExpenseClaimDto,
    ApproveClaimDto,
    RejectClaimDto,
    ExpenseClaimListFilters,
    ExpenseClaimListResponse,
    ExpenseStats,
    ExpenseCategory,
    CreateCategoryDto,
    UpdateCategoryDto,
    ExpenseItem,
    CreateExpenseItemDto,
    UpdateExpenseItemDto,
} from './types'

class ExpensesAPI {
    private baseUrl = '/expenses'

    // ==================== EXPENSE CLAIMS ====================

    /**
     * List expense claims
     */
    async listClaims(filters?: ExpenseClaimListFilters, config?: RequestConfig): Promise<ExpenseClaim[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.categoryId) params.append('categoryId', String(filters.categoryId))
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.minAmount) params.append('minAmount', String(filters.minAmount))
        if (filters?.maxAmount) params.append('maxAmount', String(filters.maxAmount))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/claims${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ExpenseClaim[]>(url, config)
    }

    /**
     * Get expense claim by ID
     */
    async getClaimById(id: number, config?: RequestConfig): Promise<ExpenseClaim> {
        return apiClient.get<ExpenseClaim>(`${this.baseUrl}/claims/${id}`, config)
    }

    /**
     * Create expense claim
     */
    async createClaim(data: CreateExpenseClaimDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/claims`,
            data,
            {
                ...config,
                successMessage: 'Expense claim created successfully',
            }
        )
    }

    /**
     * Update expense claim
     */
    async updateClaim(
        id: number,
        data: UpdateExpenseClaimDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${id}`,
            data,
            {
                ...config,
                successMessage: 'Expense claim updated successfully',
            }
        )
    }

    /**
     * Delete expense claim
     */
    async deleteClaim(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${id}`,
            {
                ...config,
                successMessage: 'Expense claim deleted successfully',
            }
        )
    }

    /**
     * Submit expense claim for approval
     */
    async submitClaim(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${id}/submit`,
            {},
            {
                ...config,
                successMessage: 'Expense claim submitted for approval',
            }
        )
    }

    /**
     * Approve expense claim
     */
    async approveClaim(
        id: number,
        data?: ApproveClaimDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${id}/approve`,
            data || {},
            {
                ...config,
                successMessage: 'Expense claim approved successfully',
            }
        )
    }

    /**
     * Reject expense claim
     */
    async rejectClaim(
        id: number,
        data: RejectClaimDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${id}/reject`,
            data,
            {
                ...config,
                successMessage: 'Expense claim rejected',
            }
        )
    }

    /**
     * Mark expense claim as paid
     */
    async markAsPaid(
        id: number,
        paymentReference?: string,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${id}/paid`,
            { paymentReference },
            {
                ...config,
                successMessage: 'Expense claim marked as paid',
            }
        )
    }

    /**
     * Get expense statistics
     */
    async getStatistics(filters?: { employeeId?: number; fromDate?: string; toDate?: string }, config?: RequestConfig): Promise<ExpenseStats> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)

        const queryString = params.toString()
        const url = `${this.baseUrl}/claims/statistics${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ExpenseStats>(url, config)
    }

    // ==================== EXPENSE ITEMS ====================

    /**
     * Get expense items for a claim
     */
    async getClaimItems(claimId: number, config?: RequestConfig): Promise<ExpenseItem[]> {
        return apiClient.get<ExpenseItem[]>(`${this.baseUrl}/claims/${claimId}/items`, config)
    }

    /**
     * Add item to expense claim
     */
    async addClaimItem(
        claimId: number,
        data: CreateExpenseItemDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/claims/${claimId}/items`,
            data,
            {
                ...config,
                successMessage: 'Expense item added successfully',
            }
        )
    }

    /**
     * Update expense item
     */
    async updateClaimItem(
        claimId: number,
        itemId: number,
        data: UpdateExpenseItemDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${claimId}/items/${itemId}`,
            data,
            {
                ...config,
                successMessage: 'Expense item updated successfully',
            }
        )
    }

    /**
     * Delete expense item
     */
    async deleteClaimItem(
        claimId: number,
        itemId: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/claims/${claimId}/items/${itemId}`,
            {
                ...config,
                successMessage: 'Expense item deleted successfully',
            }
        )
    }

    // ==================== EXPENSE CATEGORIES ====================

    /**
     * List expense categories
     */
    async listCategories(activeOnly?: boolean, config?: RequestConfig): Promise<ExpenseCategory[]> {
        const params = new URLSearchParams()
        if (activeOnly !== undefined) params.append('activeOnly', String(activeOnly))

        const queryString = params.toString()
        const url = `${this.baseUrl}/categories${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ExpenseCategory[]>(url, config)
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: number, config?: RequestConfig): Promise<ExpenseCategory> {
        return apiClient.get<ExpenseCategory>(`${this.baseUrl}/categories/${id}`, config)
    }

    /**
     * Create expense category
     */
    async createCategory(data: CreateCategoryDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/categories`,
            data,
            {
                ...config,
                successMessage: 'Expense category created successfully',
            }
        )
    }

    /**
     * Update expense category
     */
    async updateCategory(
        id: number,
        data: UpdateCategoryDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/categories/${id}`,
            data,
            {
                ...config,
                successMessage: 'Expense category updated successfully',
            }
        )
    }

    /**
     * Delete expense category
     */
    async deleteCategory(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/categories/${id}`,
            {
                ...config,
                successMessage: 'Expense category deleted successfully',
            }
        )
    }
}

export const expensesAPI = new ExpensesAPI()
