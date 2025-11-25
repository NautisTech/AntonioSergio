import { apiClient, type RequestConfig } from '../client'
import type {
    AbsenceRequest,
    CreateAbsenceRequestDto,
    UpdateAbsenceRequestDto,
    ApproveAbsenceDto,
    AbsenceRequestListFilters,
    AbsenceType,
    CreateAbsenceTypeDto,
    UpdateAbsenceTypeDto,
    AbsenceTypeListFilters,
} from './types'

class AbsencesAPI {
    private baseUrl = '/absences'

    // ==================== ABSENCE REQUESTS ====================

    /**
     * List absence requests
     */
    async listRequests(filters?: AbsenceRequestListFilters, config?: RequestConfig): Promise<AbsenceRequest[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.absenceTypeId) params.append('absenceTypeId', String(filters.absenceTypeId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.departmentId) params.append('departmentId', String(filters.departmentId))
        if (filters?.reviewedBy) params.append('reviewedBy', String(filters.reviewedBy))
        if (filters?.isPaid !== undefined) params.append('isPaid', String(filters.isPaid))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}/requests${queryString ? `?${queryString}` : ''}`

        return apiClient.get<AbsenceRequest[]>(url, config)
    }

    /**
     * Get absence request details by ID
     */
    async getRequestById(id: number, config?: RequestConfig): Promise<AbsenceRequest> {
        return apiClient.get<AbsenceRequest>(`${this.baseUrl}/requests/${id}`, config)
    }

    /**
     * Create absence request
     */
    async createRequest(
        data: CreateAbsenceRequestDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/requests`,
            data,
            {
                ...config,
                successMessage: 'Absence request created successfully',
            }
        )
    }

    /**
     * Update absence request
     */
    async updateRequest(
        id: number,
        data: UpdateAbsenceRequestDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/requests/${id}`,
            data,
            {
                ...config,
                successMessage: 'Absence request updated successfully',
            }
        )
    }

    /**
     * Delete absence request
     */
    async deleteRequest(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/requests/${id}`,
            {
                ...config,
                successMessage: 'Absence request deleted successfully',
            }
        )
    }

    /**
     * Approve or reject absence request
     */
    async approveRequest(
        id: number,
        data: ApproveAbsenceDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/requests/${id}/approve`,
            data,
            {
                ...config,
                successMessage: data.action === 'approved'
                    ? 'Absence request approved successfully'
                    : 'Absence request rejected',
            }
        )
    }

    // ==================== ABSENCE TYPES ====================

    /**
     * List absence types
     */
    async listTypes(filters?: AbsenceTypeListFilters, config?: RequestConfig): Promise<AbsenceType[]> {
        const params = new URLSearchParams()

        if (filters?.activeOnly !== undefined) params.append('activeOnly', String(filters.activeOnly))
        if (filters?.isPaid !== undefined) params.append('isPaid', String(filters.isPaid))
        if (filters?.requiresApproval !== undefined) params.append('requiresApproval', String(filters.requiresApproval))
        if (filters?.requiresDocument !== undefined) params.append('requiresDocument', String(filters.requiresDocument))
        if (filters?.search) params.append('search', filters.search)

        const queryString = params.toString()
        const url = `${this.baseUrl}/types${queryString ? `?${queryString}` : ''}`

        return apiClient.get<AbsenceType[]>(url, config)
    }

    /**
     * Create absence type
     */
    async createType(
        data: CreateAbsenceTypeDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/types`,
            data,
            {
                ...config,
                successMessage: 'Absence type created successfully',
            }
        )
    }

    /**
     * Get absence type by ID
     */
    async getTypeById(id: number, config?: RequestConfig): Promise<AbsenceType> {
        return apiClient.get<AbsenceType>(`${this.baseUrl}/types/${id}`, config)
    }

    /**
     * Update absence type
     */
    async updateType(
        id: number,
        data: UpdateAbsenceTypeDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/types/${id}`,
            data,
            {
                ...config,
                successMessage: 'Absence type updated successfully',
            }
        )
    }

    /**
     * Delete absence type
     */
    async deleteType(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/types/${id}`,
            {
                ...config,
                successMessage: 'Absence type deleted successfully',
            }
        )
    }
}

export const absencesAPI = new AbsencesAPI()
