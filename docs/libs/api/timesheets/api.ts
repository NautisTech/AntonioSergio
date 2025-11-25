import { apiClient, type RequestConfig } from '../client'
import type {
    TimesheetEntry,
    CreateTimesheetEntryDto,
    UpdateTimesheetEntryDto,
    ApproveTimesheetDto,
    BulkApproveDto,
    TimesheetEntryListFilters,
} from './types'

class TimesheetsAPI {
    private baseUrl = '/timesheets'

    // ==================== TIMESHEET ENTRIES ====================

    /**
     * List timesheet entries
     */
    async list(filters?: TimesheetEntryListFilters, config?: RequestConfig): Promise<TimesheetEntry[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.projectId) params.append('projectId', String(filters.projectId))
        if (filters?.taskId) params.append('taskId', String(filters.taskId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.entryType) params.append('entryType', filters.entryType)
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.date) params.append('date', filters.date)
        if (filters?.week) params.append('week', String(filters.week))
        if (filters?.month) params.append('month', String(filters.month))
        if (filters?.year) params.append('year', String(filters.year))
        if (filters?.approvedBy) params.append('approvedBy', String(filters.approvedBy))
        if (filters?.departmentId) params.append('departmentId', String(filters.departmentId))
        if (filters?.billable !== undefined) params.append('billable', String(filters.billable))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TimesheetEntry[]>(url, config)
    }

    /**
     * Get timesheet entry by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<TimesheetEntry> {
        return apiClient.get<TimesheetEntry>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create timesheet entry
     */
    async create(
        data: CreateTimesheetEntryDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Timesheet entry created successfully',
            }
        )
    }

    /**
     * Update timesheet entry
     */
    async update(
        id: number,
        data: UpdateTimesheetEntryDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Timesheet entry updated successfully',
            }
        )
    }

    /**
     * Delete timesheet entry
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Timesheet entry deleted successfully',
            }
        )
    }

    /**
     * Approve or reject timesheet entry
     */
    async approve(
        id: number,
        data: ApproveTimesheetDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/approve`,
            data,
            {
                ...config,
                successMessage: data.action === 'approved'
                    ? 'Timesheet entry approved successfully'
                    : 'Timesheet entry rejected',
            }
        )
    }

    /**
     * Bulk approve or reject timesheet entries
     */
    async bulkApprove(
        data: BulkApproveDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; count: number }> {
        return apiClient.post<{ success: boolean; message: string; count: number }>(
            `${this.baseUrl}/bulk-approve`,
            data,
            {
                ...config,
                successMessage: data.action === 'approved'
                    ? 'Timesheet entries approved successfully'
                    : 'Timesheet entries rejected',
            }
        )
    }

    /**
     * Submit timesheet entries for approval
     */
    async submit(
        entryIds: number[],
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; count: number }> {
        return apiClient.post<{ success: boolean; message: string; count: number }>(
            `${this.baseUrl}/submit`,
            { entryIds },
            {
                ...config,
                successMessage: 'Timesheet entries submitted for approval',
            }
        )
    }

    /**
     * Clock in (create entry with current time)
     */
    async clockIn(
        data: { employeeId: number; location?: string; notes?: string },
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/clock-in`,
            data,
            {
                ...config,
                successMessage: 'Clocked in successfully',
            }
        )
    }

    /**
     * Clock out (update entry with current time)
     */
    async clockOut(
        id: number,
        data?: { notes?: string; breakDuration?: number },
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/clock-out`,
            data || {},
            {
                ...config,
                successMessage: 'Clocked out successfully',
            }
        )
    }
}

export const timesheetsAPI = new TimesheetsAPI()
