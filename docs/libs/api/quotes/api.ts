import { apiClient, type RequestConfig } from '../client'
import type {
    Quote,
    CreateQuoteDto,
    UpdateQuoteDto,
    SendQuoteDto,
    AcceptQuoteDto,
    RejectQuoteDto,
    CloneQuoteDto,
    QuoteListFilters,
    QuoteListResponse,
    QuoteStats,
    ExpiringQuotesResponse,
} from './types'

class QuotesAPI {
    private baseUrl = '/quotes'

    // ==================== QUOTES CRUD ====================

    /**
     * List quotes with filtering and pagination
     */
    async list(filters?: QuoteListFilters, config?: RequestConfig): Promise<QuoteListResponse> {
        const params = new URLSearchParams()

        if (filters?.status) params.append('status', filters.status)
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.assignedTo) params.append('assignedTo', String(filters.assignedTo))
        if (filters?.companyId) params.append('companyId', String(filters.companyId))
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.minAmount) params.append('minAmount', String(filters.minAmount))
        if (filters?.maxAmount) params.append('maxAmount', String(filters.maxAmount))
        if (filters?.expired !== undefined) params.append('expired', String(filters.expired))
        if (filters?.expiringIn) params.append('expiringIn', String(filters.expiringIn))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<QuoteListResponse>(url, config)
    }

    /**
     * Get quote statistics
     */
    async getStatistics(
        filters?: {
            startDate?: string
            endDate?: string
            clientId?: number
            assignedTo?: number
        },
        config?: RequestConfig
    ): Promise<QuoteStats> {
        const params = new URLSearchParams()

        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.assignedTo) params.append('assignedTo', String(filters.assignedTo))

        const queryString = params.toString()
        const url = `${this.baseUrl}/stats${queryString ? `?${queryString}` : ''}`

        return apiClient.get<QuoteStats>(url, config)
    }

    /**
     * Get quotes expiring soon
     */
    async getExpiring(days?: number, config?: RequestConfig): Promise<ExpiringQuotesResponse> {
        const params = new URLSearchParams()
        if (days) params.append('days', String(days))

        const queryString = params.toString()
        const url = `${this.baseUrl}/expiring${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ExpiringQuotesResponse>(url, config)
    }

    /**
     * Get quote by quote number
     */
    async getByNumber(quoteNumber: string, config?: RequestConfig): Promise<Quote> {
        return apiClient.get<Quote>(`${this.baseUrl}/number/${quoteNumber}`, config)
    }

    /**
     * Get quote by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Quote> {
        return apiClient.get<Quote>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create quote
     */
    async create(
        data: CreateQuoteDto,
        config?: RequestConfig
    ): Promise<{ id: number; quoteNumber: string; success: boolean; message: string }> {
        return apiClient.post<{ id: number; quoteNumber: string; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Quote created successfully',
            }
        )
    }

    /**
     * Update quote
     */
    async update(
        id: number,
        data: UpdateQuoteDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Quote updated successfully',
            }
        )
    }

    /**
     * Delete quote
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Quote deleted successfully',
            }
        )
    }

    // ==================== WORKFLOW OPERATIONS ====================

    /**
     * Send quote to client
     */
    async send(
        id: number,
        data: SendQuoteDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/send`,
            data,
            {
                ...config,
                successMessage: 'Quote sent successfully',
            }
        )
    }

    /**
     * Accept quote
     */
    async accept(
        id: number,
        data: AcceptQuoteDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/accept`,
            data,
            {
                ...config,
                successMessage: 'Quote accepted successfully',
            }
        )
    }

    /**
     * Reject quote
     */
    async reject(
        id: number,
        data: RejectQuoteDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/reject`,
            data,
            {
                ...config,
                successMessage: 'Quote rejected',
            }
        )
    }

    /**
     * Clone quote
     */
    async clone(
        id: number,
        data: CloneQuoteDto,
        config?: RequestConfig
    ): Promise<{ id: number; quoteNumber: string; success: boolean; message: string }> {
        return apiClient.post<{ id: number; quoteNumber: string; success: boolean; message: string }>(
            `${this.baseUrl}/${id}/clone`,
            data,
            {
                ...config,
                successMessage: 'Quote cloned successfully',
            }
        )
    }

    // ==================== UTILITY OPERATIONS ====================

    /**
     * Mark expired quotes
     */
    async markExpired(config?: RequestConfig): Promise<{ success: boolean; message: string; count: number }> {
        return apiClient.post<{ success: boolean; message: string; count: number }>(
            `${this.baseUrl}/mark-expired`,
            {},
            {
                ...config,
                successMessage: 'Expired quotes marked',
            }
        )
    }
}

export const quotesAPI = new QuotesAPI()
