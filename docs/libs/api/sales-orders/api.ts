import { apiClient, type RequestConfig } from '../client'
import type {
    SalesOrder,
    CreateSalesOrderDto,
    UpdateSalesOrderDto,
    ConfirmOrderDto,
    ShipOrderDto,
    DeliverOrderDto,
    CancelOrderDto,
    CloneOrderDto,
    CreateReturnDto,
    RecordPaymentDto,
    SalesOrderListFilters,
    SalesOrderListResponse,
    SalesOrderStats,
    OverdueOrdersResponse,
} from './types'

class SalesOrdersAPI {
    private baseUrl = '/sales-orders'

    // ==================== SALES ORDERS CRUD ====================

    /**
     * List sales orders with filtering and pagination
     */
    async list(filters?: SalesOrderListFilters, config?: RequestConfig): Promise<SalesOrderListResponse> {
        const params = new URLSearchParams()

        if (filters?.status) params.append('status', filters.status)
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.assignedTo) params.append('assignedTo', String(filters.assignedTo))
        if (filters?.companyId) params.append('companyId', String(filters.companyId))
        if (filters?.orderType) params.append('orderType', filters.orderType)
        if (filters?.priority) params.append('priority', filters.priority)
        if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.minAmount) params.append('minAmount', String(filters.minAmount))
        if (filters?.maxAmount) params.append('maxAmount', String(filters.maxAmount))
        if (filters?.overdue !== undefined) params.append('overdue', String(filters.overdue))
        if (filters?.dueIn) params.append('dueIn', String(filters.dueIn))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<SalesOrderListResponse>(url, config)
    }

    /**
     * Get sales order statistics
     */
    async getStatistics(
        filters?: {
            startDate?: string
            endDate?: string
            clientId?: number
            assignedTo?: number
        },
        config?: RequestConfig
    ): Promise<SalesOrderStats> {
        const params = new URLSearchParams()

        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.assignedTo) params.append('assignedTo', String(filters.assignedTo))

        const queryString = params.toString()
        const url = `${this.baseUrl}/stats${queryString ? `?${queryString}` : ''}`

        return apiClient.get<SalesOrderStats>(url, config)
    }

    /**
     * Get overdue sales orders
     */
    async getOverdue(days?: number, config?: RequestConfig): Promise<OverdueOrdersResponse> {
        const params = new URLSearchParams()
        if (days) params.append('days', String(days))

        const queryString = params.toString()
        const url = `${this.baseUrl}/overdue${queryString ? `?${queryString}` : ''}`

        return apiClient.get<OverdueOrdersResponse>(url, config)
    }

    /**
     * Get sales order by order number
     */
    async getByNumber(orderNumber: string, config?: RequestConfig): Promise<SalesOrder> {
        return apiClient.get<SalesOrder>(`${this.baseUrl}/number/${orderNumber}`, config)
    }

    /**
     * Get sales order by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<SalesOrder> {
        return apiClient.get<SalesOrder>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create sales order
     */
    async create(
        data: CreateSalesOrderDto,
        config?: RequestConfig
    ): Promise<{ id: number; orderNumber: string; success: boolean; message: string }> {
        return apiClient.post<{ id: number; orderNumber: string; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Sales order created successfully',
            }
        )
    }

    /**
     * Update sales order
     */
    async update(
        id: number,
        data: UpdateSalesOrderDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Sales order updated successfully',
            }
        )
    }

    /**
     * Delete sales order
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Sales order deleted successfully',
            }
        )
    }

    // ==================== WORKFLOW OPERATIONS ====================

    /**
     * Confirm sales order
     */
    async confirm(
        id: number,
        data: ConfirmOrderDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/confirm`,
            data,
            {
                ...config,
                successMessage: 'Order confirmed successfully',
            }
        )
    }

    /**
     * Ship sales order
     */
    async ship(
        id: number,
        data: ShipOrderDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/ship`,
            data,
            {
                ...config,
                successMessage: 'Order shipped successfully',
            }
        )
    }

    /**
     * Deliver sales order
     */
    async deliver(
        id: number,
        data: DeliverOrderDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/deliver`,
            data,
            {
                ...config,
                successMessage: 'Order delivered successfully',
            }
        )
    }

    /**
     * Complete sales order
     */
    async complete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/complete`,
            {},
            {
                ...config,
                successMessage: 'Order completed successfully',
            }
        )
    }

    /**
     * Cancel sales order
     */
    async cancel(
        id: number,
        data: CancelOrderDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/cancel`,
            data,
            {
                ...config,
                successMessage: 'Order cancelled',
            }
        )
    }

    /**
     * Create return for sales order
     */
    async createReturn(
        id: number,
        data: CreateReturnDto,
        config?: RequestConfig
    ): Promise<{ id: number; orderNumber: string; success: boolean; message: string }> {
        return apiClient.post<{ id: number; orderNumber: string; success: boolean; message: string }>(
            `${this.baseUrl}/${id}/return`,
            data,
            {
                ...config,
                successMessage: 'Return created successfully',
            }
        )
    }

    /**
     * Clone sales order
     */
    async clone(
        id: number,
        data: CloneOrderDto,
        config?: RequestConfig
    ): Promise<{ id: number; orderNumber: string; success: boolean; message: string }> {
        return apiClient.post<{ id: number; orderNumber: string; success: boolean; message: string }>(
            `${this.baseUrl}/${id}/clone`,
            data,
            {
                ...config,
                successMessage: 'Order cloned successfully',
            }
        )
    }

    // ==================== PAYMENT OPERATIONS ====================

    /**
     * Record payment for sales order
     */
    async recordPayment(
        id: number,
        data: RecordPaymentDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; paymentStatus: string }> {
        return apiClient.post<{ success: boolean; message: string; paymentStatus: string }>(
            `${this.baseUrl}/${id}/payment`,
            data,
            {
                ...config,
                successMessage: 'Payment recorded successfully',
            }
        )
    }
}

export const salesOrdersAPI = new SalesOrdersAPI()
