import { apiClient, type RequestConfig } from '../client'
import type {
    Holiday,
    CreateHolidayDto,
    UpdateHolidayDto,
    HolidayListFilters,
} from './types'

class HolidaysAPI {
    private baseUrl = '/holidays'

    // ==================== HOLIDAYS ====================

    /**
     * List holidays
     */
    async list(filters?: HolidayListFilters, config?: RequestConfig): Promise<Holiday[]> {
        const params = new URLSearchParams()

        if (filters?.holidayType) params.append('holidayType', filters.holidayType)
        if (filters?.year) params.append('year', String(filters.year))
        if (filters?.month) params.append('month', String(filters.month))
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.isRecurring !== undefined) params.append('isRecurring', String(filters.isRecurring))
        if (filters?.country) params.append('country', filters.country)
        if (filters?.region) params.append('region', filters.region)
        if (filters?.affectsWorkingDays !== undefined) params.append('affectsWorkingDays', String(filters.affectsWorkingDays))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Holiday[]>(url, config)
    }

    /**
     * Get holiday by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Holiday> {
        return apiClient.get<Holiday>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create holiday
     */
    async create(
        data: CreateHolidayDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Holiday created successfully',
            }
        )
    }

    /**
     * Update holiday
     */
    async update(
        id: number,
        data: UpdateHolidayDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Holiday updated successfully',
            }
        )
    }

    /**
     * Delete holiday
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Holiday deleted successfully',
            }
        )
    }
}

export const holidaysAPI = new HolidaysAPI()
