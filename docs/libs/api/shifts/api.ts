import { apiClient, type RequestConfig } from '../client'
import type {
    EmployeeShift,
    CreateEmployeeShiftDto,
    UpdateEmployeeShiftDto,
    CheckInDto,
    CheckOutDto,
    EmployeeShiftListFilters,
    ShiftTemplate,
    CreateShiftTemplateDto,
    UpdateShiftTemplateDto,
    ShiftTemplateListFilters,
} from './types'

class ShiftsAPI {
    private baseUrl = '/shifts'

    // ==================== EMPLOYEE SHIFTS ====================

    /**
     * List employee shifts
     */
    async list(filters?: EmployeeShiftListFilters, config?: RequestConfig): Promise<EmployeeShift[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.shiftTemplateId) params.append('shiftTemplateId', String(filters.shiftTemplateId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.shiftType) params.append('shiftType', filters.shiftType)
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.date) params.append('date', filters.date)
        if (filters?.week) params.append('week', String(filters.week))
        if (filters?.month) params.append('month', String(filters.month))
        if (filters?.year) params.append('year', String(filters.year))
        if (filters?.assignedBy) params.append('assignedBy', String(filters.assignedBy))
        if (filters?.departmentId) params.append('departmentId', String(filters.departmentId))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<EmployeeShift[]>(url, config)
    }

    /**
     * Get employee shift by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<EmployeeShift> {
        return apiClient.get<EmployeeShift>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create employee shift
     */
    async create(
        data: CreateEmployeeShiftDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Shift created successfully',
            }
        )
    }

    /**
     * Update employee shift
     */
    async update(
        id: number,
        data: UpdateEmployeeShiftDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Shift updated successfully',
            }
        )
    }

    /**
     * Delete employee shift
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Shift deleted successfully',
            }
        )
    }

    /**
     * Check in to shift
     */
    async checkIn(
        id: number,
        data: CheckInDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/check-in`,
            data,
            {
                ...config,
                successMessage: 'Checked in successfully',
            }
        )
    }

    /**
     * Check out from shift
     */
    async checkOut(
        id: number,
        data: CheckOutDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/check-out`,
            data,
            {
                ...config,
                successMessage: 'Checked out successfully',
            }
        )
    }

    // ==================== SHIFT TEMPLATES ====================

    /**
     * List shift templates
     */
    async listTemplates(filters?: ShiftTemplateListFilters, config?: RequestConfig): Promise<ShiftTemplate[]> {
        const params = new URLSearchParams()

        if (filters?.shiftType) params.append('shiftType', filters.shiftType)
        if (filters?.activeOnly !== undefined) params.append('activeOnly', String(filters.activeOnly))
        if (filters?.search) params.append('search', filters.search)

        const queryString = params.toString()
        const url = `${this.baseUrl}/templates${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ShiftTemplate[]>(url, config)
    }

    /**
     * Get shift template by ID
     */
    async getTemplateById(id: number, config?: RequestConfig): Promise<ShiftTemplate> {
        return apiClient.get<ShiftTemplate>(`${this.baseUrl}/templates/${id}`, config)
    }

    /**
     * Create shift template
     */
    async createTemplate(
        data: CreateShiftTemplateDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/templates`,
            data,
            {
                ...config,
                successMessage: 'Shift template created successfully',
            }
        )
    }

    /**
     * Update shift template
     */
    async updateTemplate(
        id: number,
        data: UpdateShiftTemplateDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/templates/${id}`,
            data,
            {
                ...config,
                successMessage: 'Shift template updated successfully',
            }
        )
    }

    /**
     * Delete shift template
     */
    async deleteTemplate(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/templates/${id}`,
            {
                ...config,
                successMessage: 'Shift template deleted successfully',
            }
        )
    }
}

export const shiftsAPI = new ShiftsAPI()
