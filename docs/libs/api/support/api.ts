import { apiClient, type RequestConfig } from '../client'
import type {
    Ticket,
    CreateTicketDto,
    UpdateTicketDto,
    CloseTicketDto,
    ReopenTicketDto,
    AddTicketCommentDto,
    RateTicketDto,
    TicketListFilters,
    TicketListResponse,
    TicketDashboard,
    TicketActivity,
    ActivityStats,
    Intervention,
    CreateInterventionDto,
    UpdateInterventionDto,
    InterventionListFilters,
    InterventionListResponse,
    InterventionStats,
    TicketType,
    CreateTicketTypeDto,
    UpdateTicketTypeDto,
    TicketTypeStats,
} from './types'

class SupportAPI {
    private baseUrl = '/support'

    // ==================== TICKETS ====================

    /**
     * List tickets with filters
     */
    async listTickets(filters?: TicketListFilters, config?: RequestConfig): Promise<TicketListResponse> {
        const params = new URLSearchParams()

        if (filters?.ticketTypeId) params.append('ticketTypeId', String(filters.ticketTypeId))
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.priority) params.append('priority', filters.priority)
        if (filters?.assignedToId) params.append('assignedToId', String(filters.assignedToId))
        if (filters?.requesterId) params.append('requesterId', String(filters.requesterId))
        if (filters?.equipmentId) params.append('equipmentId', String(filters.equipmentId))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.overdueOnly !== undefined) params.append('overdueOnly', String(filters.overdueOnly))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/tickets${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TicketListResponse>(url, config)
    }

    /**
     * Get ticket dashboard statistics
     */
    async getTicketDashboard(config?: RequestConfig): Promise<TicketDashboard> {
        return apiClient.get<TicketDashboard>(`${this.baseUrl}/tickets/dashboard`, config)
    }

    /**
     * Get ticket by ID
     */
    async getTicketById(id: number, config?: RequestConfig): Promise<Ticket> {
        return apiClient.get<Ticket>(`${this.baseUrl}/tickets/${id}`, config)
    }

    /**
     * Create ticket
     */
    async createTicket(data: CreateTicketDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/tickets`,
            data,
            {
                ...config,
                successMessage: 'Ticket created successfully',
            }
        )
    }

    /**
     * Update ticket
     */
    async updateTicket(
        id: number,
        data: UpdateTicketDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/tickets/${id}`,
            data,
            {
                ...config,
                successMessage: 'Ticket updated successfully',
            }
        )
    }

    /**
     * Close ticket
     */
    async closeTicket(
        id: number,
        data: CloseTicketDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/tickets/${id}/close`,
            data,
            {
                ...config,
                successMessage: 'Ticket closed successfully',
            }
        )
    }

    /**
     * Reopen ticket
     */
    async reopenTicket(
        id: number,
        data: ReopenTicketDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/tickets/${id}/reopen`,
            data,
            {
                ...config,
                successMessage: 'Ticket reopened successfully',
            }
        )
    }

    /**
     * Add comment to ticket
     */
    async addTicketComment(
        id: number,
        data: AddTicketCommentDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/tickets/${id}/comments`,
            data,
            {
                ...config,
                successMessage: 'Comment added successfully',
            }
        )
    }

    /**
     * Rate ticket
     */
    async rateTicket(
        id: number,
        data: RateTicketDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/tickets/${id}/rate`,
            data,
            {
                ...config,
                successMessage: 'Rating submitted successfully',
            }
        )
    }

    /**
     * Delete ticket
     */
    async deleteTicket(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/tickets/${id}`,
            {
                ...config,
                successMessage: 'Ticket deleted successfully',
            }
        )
    }

    // ==================== TICKET ACTIVITY ====================

    /**
     * Get ticket activity timeline
     */
    async getTicketTimeline(ticketId: number, config?: RequestConfig): Promise<TicketActivity[]> {
        return apiClient.get<TicketActivity[]>(`${this.baseUrl}/tickets/${ticketId}/timeline`, config)
    }

    /**
     * Get ticket comments
     */
    async getTicketComments(
        ticketId: number,
        includeInternal?: boolean,
        config?: RequestConfig
    ): Promise<TicketActivity[]> {
        const params = new URLSearchParams()
        if (includeInternal !== undefined) params.append('includeInternal', String(includeInternal))

        const queryString = params.toString()
        const url = `${this.baseUrl}/tickets/${ticketId}/comments${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TicketActivity[]>(url, config)
    }

    /**
     * Get activity statistics
     */
    async getActivityStatistics(userId?: number, config?: RequestConfig): Promise<ActivityStats> {
        const params = new URLSearchParams()
        if (userId) params.append('userId', String(userId))

        const queryString = params.toString()
        const url = `${this.baseUrl}/activities/statistics${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ActivityStats>(url, config)
    }

    // ==================== INTERVENTIONS ====================

    /**
     * List interventions
     */
    async listInterventions(filters?: InterventionListFilters, config?: RequestConfig): Promise<InterventionListResponse> {
        const params = new URLSearchParams()

        if (filters?.ticketId) params.append('ticketId', String(filters.ticketId))
        if (filters?.equipmentId) params.append('equipmentId', String(filters.equipmentId))
        if (filters?.technicianId) params.append('technicianId', String(filters.technicianId))
        if (filters?.type) params.append('type', filters.type)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.clientId) params.append('clientId', String(filters.clientId))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/interventions${queryString ? `?${queryString}` : ''}`

        return apiClient.get<InterventionListResponse>(url, config)
    }

    /**
     * Get intervention statistics
     */
    async getInterventionStatistics(technicianId?: number, config?: RequestConfig): Promise<InterventionStats> {
        const params = new URLSearchParams()
        if (technicianId) params.append('technicianId', String(technicianId))

        const queryString = params.toString()
        const url = `${this.baseUrl}/interventions/statistics${queryString ? `?${queryString}` : ''}`

        return apiClient.get<InterventionStats>(url, config)
    }

    /**
     * Get intervention by ID
     */
    async getInterventionById(id: number, config?: RequestConfig): Promise<Intervention> {
        return apiClient.get<Intervention>(`${this.baseUrl}/interventions/${id}`, config)
    }

    /**
     * Create intervention
     */
    async createIntervention(data: CreateInterventionDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/interventions`,
            data,
            {
                ...config,
                successMessage: 'Intervention created successfully',
            }
        )
    }

    /**
     * Update intervention
     */
    async updateIntervention(
        id: number,
        data: UpdateInterventionDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/interventions/${id}`,
            data,
            {
                ...config,
                successMessage: 'Intervention updated successfully',
            }
        )
    }

    /**
     * Delete intervention
     */
    async deleteIntervention(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/interventions/${id}`,
            {
                ...config,
                successMessage: 'Intervention deleted successfully',
            }
        )
    }

    // ==================== TICKET TYPES ====================

    /**
     * List ticket types
     */
    async listTicketTypes(activeOnly?: boolean, config?: RequestConfig): Promise<TicketType[]> {
        const params = new URLSearchParams()
        if (activeOnly !== undefined) params.append('activeOnly', String(activeOnly))

        const queryString = params.toString()
        const url = `${this.baseUrl}/ticket-types${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TicketType[]>(url, config)
    }

    /**
     * Get ticket type statistics
     */
    async getTicketTypeStatistics(config?: RequestConfig): Promise<TicketTypeStats> {
        return apiClient.get<TicketTypeStats>(`${this.baseUrl}/ticket-types/statistics`, config)
    }

    /**
     * Get ticket type by ID
     */
    async getTicketTypeById(id: number, config?: RequestConfig): Promise<TicketType> {
        return apiClient.get<TicketType>(`${this.baseUrl}/ticket-types/${id}`, config)
    }

    /**
     * Create ticket type
     */
    async createTicketType(data: CreateTicketTypeDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/ticket-types`,
            data,
            {
                ...config,
                successMessage: 'Ticket type created successfully',
            }
        )
    }

    /**
     * Update ticket type
     */
    async updateTicketType(
        id: number,
        data: UpdateTicketTypeDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/ticket-types/${id}`,
            data,
            {
                ...config,
                successMessage: 'Ticket type updated successfully',
            }
        )
    }

    /**
     * Delete ticket type
     */
    async deleteTicketType(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/ticket-types/${id}`,
            {
                ...config,
                successMessage: 'Ticket type deleted successfully',
            }
        )
    }
}

export const supportAPI = new SupportAPI()
