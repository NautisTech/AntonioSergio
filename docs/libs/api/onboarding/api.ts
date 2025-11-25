import { apiClient, type RequestConfig } from '../client'
import type {
    OnboardingProcess,
    CreateOnboardingProcessDto,
    UpdateOnboardingProcessDto,
    OnboardingProcessListFilters,
    OnboardingTask,
    CreateOnboardingTaskDto,
    UpdateOnboardingTaskDto,
    OffboardingProcess,
    CreateOffboardingProcessDto,
    UpdateOffboardingProcessDto,
    OffboardingProcessListFilters,
    OffboardingTask,
    CreateOffboardingTaskDto,
    UpdateOffboardingTaskDto,
} from './types'

class OnboardingAPI {
    private baseUrl = '/onboarding'

    // ==================== ONBOARDING PROCESSES ====================

    /**
     * List onboarding processes
     */
    async listProcesses(filters?: OnboardingProcessListFilters, config?: RequestConfig): Promise<OnboardingProcess[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.assignedTo) params.append('assignedTo', String(filters.assignedTo))
        if (filters?.buddyId) params.append('buddyId', String(filters.buddyId))
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}/processes${queryString ? `?${queryString}` : ''}`

        return apiClient.get<OnboardingProcess[]>(url, config)
    }

    /**
     * Get onboarding process by ID
     */
    async getProcessById(id: number, config?: RequestConfig): Promise<OnboardingProcess> {
        return apiClient.get<OnboardingProcess>(`${this.baseUrl}/processes/${id}`, config)
    }

    /**
     * Create onboarding process
     */
    async createProcess(
        data: CreateOnboardingProcessDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/processes`,
            data,
            {
                ...config,
                successMessage: 'Onboarding process created successfully',
            }
        )
    }

    /**
     * Update onboarding process
     */
    async updateProcess(
        id: number,
        data: UpdateOnboardingProcessDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/processes/${id}`,
            data,
            {
                ...config,
                successMessage: 'Onboarding process updated successfully',
            }
        )
    }

    /**
     * Delete onboarding process
     */
    async deleteProcess(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/processes/${id}`,
            {
                ...config,
                successMessage: 'Onboarding process deleted successfully',
            }
        )
    }

    // ==================== ONBOARDING TASKS ====================

    /**
     * Get tasks for onboarding process
     */
    async getProcessTasks(processId: number, config?: RequestConfig): Promise<OnboardingTask[]> {
        return apiClient.get<OnboardingTask[]>(`${this.baseUrl}/processes/${processId}/tasks`, config)
    }

    /**
     * Add task to onboarding process
     */
    async addProcessTask(
        processId: number,
        data: CreateOnboardingTaskDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/processes/${processId}/tasks`,
            data,
            {
                ...config,
                successMessage: 'Onboarding task added successfully',
            }
        )
    }

    /**
     * Update onboarding task
     */
    async updateProcessTask(
        processId: number,
        taskId: number,
        data: UpdateOnboardingTaskDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/processes/${processId}/tasks/${taskId}`,
            data,
            {
                ...config,
                successMessage: 'Onboarding task updated successfully',
            }
        )
    }

    /**
     * Delete onboarding task
     */
    async deleteProcessTask(
        processId: number,
        taskId: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/processes/${processId}/tasks/${taskId}`,
            {
                ...config,
                successMessage: 'Onboarding task deleted successfully',
            }
        )
    }

    // ==================== OFFBOARDING PROCESSES ====================

    /**
     * List offboarding processes
     */
    async listOffboarding(filters?: OffboardingProcessListFilters, config?: RequestConfig): Promise<OffboardingProcess[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.terminationType) params.append('terminationType', filters.terminationType)
        if (filters?.initiatedBy) params.append('initiatedBy', String(filters.initiatedBy))
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}/offboarding${queryString ? `?${queryString}` : ''}`

        return apiClient.get<OffboardingProcess[]>(url, config)
    }

    /**
     * Get offboarding process by ID
     */
    async getOffboardingById(id: number, config?: RequestConfig): Promise<OffboardingProcess> {
        return apiClient.get<OffboardingProcess>(`${this.baseUrl}/offboarding/${id}`, config)
    }

    /**
     * Create offboarding process
     */
    async createOffboarding(
        data: CreateOffboardingProcessDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/offboarding`,
            data,
            {
                ...config,
                successMessage: 'Offboarding process created successfully',
            }
        )
    }

    /**
     * Update offboarding process
     */
    async updateOffboarding(
        id: number,
        data: UpdateOffboardingProcessDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/offboarding/${id}`,
            data,
            {
                ...config,
                successMessage: 'Offboarding process updated successfully',
            }
        )
    }

    /**
     * Delete offboarding process
     */
    async deleteOffboarding(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/offboarding/${id}`,
            {
                ...config,
                successMessage: 'Offboarding process deleted successfully',
            }
        )
    }

    // ==================== OFFBOARDING TASKS ====================

    /**
     * Get tasks for offboarding process
     */
    async getOffboardingTasks(processId: number, config?: RequestConfig): Promise<OffboardingTask[]> {
        return apiClient.get<OffboardingTask[]>(`${this.baseUrl}/offboarding/${processId}/tasks`, config)
    }

    /**
     * Add task to offboarding process
     */
    async addOffboardingTask(
        processId: number,
        data: CreateOffboardingTaskDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/offboarding/${processId}/tasks`,
            data,
            {
                ...config,
                successMessage: 'Offboarding task added successfully',
            }
        )
    }

    /**
     * Update offboarding task
     */
    async updateOffboardingTask(
        processId: number,
        taskId: number,
        data: UpdateOffboardingTaskDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/offboarding/${processId}/tasks/${taskId}`,
            data,
            {
                ...config,
                successMessage: 'Offboarding task updated successfully',
            }
        )
    }

    /**
     * Delete offboarding task
     */
    async deleteOffboardingTask(
        processId: number,
        taskId: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/offboarding/${processId}/tasks/${taskId}`,
            {
                ...config,
                successMessage: 'Offboarding task deleted successfully',
            }
        )
    }
}

export const onboardingAPI = new OnboardingAPI()
