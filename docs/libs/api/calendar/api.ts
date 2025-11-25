import { apiClient, type RequestConfig } from '../client'
import type {
    CalendarEvent,
    CreateCalendarEventDto,
    UpdateCalendarEventDto,
    RespondToEventDto,
    CalendarEventListFilters,
    CalendarEventListResponse,
} from './types'

class CalendarAPI {
    private baseUrl = '/calendar'

    // ==================== CALENDAR EVENTS ====================

    /**
     * List calendar events
     */
    async list(filters?: CalendarEventListFilters, config?: RequestConfig): Promise<CalendarEvent[]> {
        const params = new URLSearchParams()

        if (filters?.eventType) params.append('eventType', filters.eventType)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.visibility) params.append('visibility', filters.visibility)
        if (filters?.organizerId) params.append('organizerId', String(filters.organizerId))
        if (filters?.participantId) params.append('participantId', String(filters.participantId))
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.isRecurring !== undefined) params.append('isRecurring', String(filters.isRecurring))
        if (filters?.isAllDay !== undefined) params.append('isAllDay', String(filters.isAllDay))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<CalendarEvent[]>(url, config)
    }

    /**
     * Get event details by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<CalendarEvent> {
        return apiClient.get<CalendarEvent>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create calendar event
     */
    async create(
        data: CreateCalendarEventDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Calendar event created successfully',
            }
        )
    }

    /**
     * Update calendar event
     */
    async update(
        id: number,
        data: UpdateCalendarEventDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Calendar event updated successfully',
            }
        )
    }

    /**
     * Delete calendar event
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Calendar event deleted successfully',
            }
        )
    }

    /**
     * Respond to event invitation
     */
    async respondToEvent(
        id: number,
        data: RespondToEventDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/respond`,
            data,
            {
                ...config,
                successMessage: 'Response recorded successfully',
            }
        )
    }
}

export const calendarAPI = new CalendarAPI()
