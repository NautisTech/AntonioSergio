import { apiClient, type RequestConfig } from '../client'
import type {
    Lead,
    CreateLeadDto,
    UpdateLeadDto,
    ConvertLeadDto,
    LoseLeadDto,
    LeadListFilters,
    LeadListResponse,
    LeadStats,
} from './types'

class LeadsAPI {
    private baseUrl = '/leads'

    // ==================== LEADS CRUD ====================

    /**
     * List leads with filtering and pagination
     */
    async list(filters?: LeadListFilters, config?: RequestConfig): Promise<LeadListResponse> {
        const params = new URLSearchParams()

        if (filters?.status) params.append('status', filters.status)
        if (filters?.source) params.append('source', filters.source)
        if (filters?.assignedTo) params.append('assignedTo', String(filters.assignedTo))
        if (filters?.companyId) params.append('companyId', String(filters.companyId))
        if (filters?.searchText) params.append('searchText', filters.searchText)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<LeadListResponse>(url, config)
    }

    /**
     * Get lead statistics
     */
    async getStatistics(config?: RequestConfig): Promise<LeadStats> {
        return apiClient.get<LeadStats>(`${this.baseUrl}/statistics`, config)
    }

    /**
     * Get lead by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Lead> {
        return apiClient.get<Lead>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create lead
     */
    async create(
        data: CreateLeadDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Lead created successfully',
            }
        )
    }

    /**
     * Update lead
     */
    async update(
        id: number,
        data: UpdateLeadDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Lead updated successfully',
            }
        )
    }

    /**
     * Delete lead
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Lead deleted successfully',
            }
        )
    }

    /**
     * Convert lead to client
     */
    async convert(
        id: number,
        data: ConvertLeadDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.patch<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/convert`,
            data,
            {
                ...config,
                successMessage: 'Lead converted successfully',
            }
        )
    }

    /**
     * Mark lead as lost
     */
    async lose(
        id: number,
        data: LoseLeadDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.patch<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/lose`,
            data,
            {
                ...config,
                successMessage: 'Lead marked as lost',
            }
        )
    }
}

export const leadsAPI = new LeadsAPI()
