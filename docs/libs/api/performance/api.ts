import { apiClient, type RequestConfig } from '../client'
import type {
    PerformanceReview,
    CreatePerformanceReviewDto,
    UpdatePerformanceReviewDto,
    PerformanceReviewListFilters,
    PerformanceGoal,
    CreatePerformanceGoalDto,
    UpdatePerformanceGoalDto,
    PerformanceGoalListFilters,
} from './types'

class PerformanceAPI {
    private baseUrl = '/performance'

    // ==================== PERFORMANCE REVIEWS ====================

    /**
     * List performance reviews
     */
    async listReviews(filters?: PerformanceReviewListFilters, config?: RequestConfig): Promise<PerformanceReview[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.reviewerId) params.append('reviewerId', String(filters.reviewerId))
        if (filters?.reviewType) params.append('reviewType', filters.reviewType)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}/reviews${queryString ? `?${queryString}` : ''}`

        return apiClient.get<PerformanceReview[]>(url, config)
    }

    /**
     * Get performance review by ID
     */
    async getReviewById(id: number, config?: RequestConfig): Promise<PerformanceReview> {
        return apiClient.get<PerformanceReview>(`${this.baseUrl}/reviews/${id}`, config)
    }

    /**
     * Create performance review
     */
    async createReview(
        data: CreatePerformanceReviewDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/reviews`,
            data,
            {
                ...config,
                successMessage: 'Performance review created successfully',
            }
        )
    }

    /**
     * Update performance review
     */
    async updateReview(
        id: number,
        data: UpdatePerformanceReviewDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/reviews/${id}`,
            data,
            {
                ...config,
                successMessage: 'Performance review updated successfully',
            }
        )
    }

    /**
     * Delete performance review
     */
    async deleteReview(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/reviews/${id}`,
            {
                ...config,
                successMessage: 'Performance review deleted successfully',
            }
        )
    }

    /**
     * Complete performance review
     */
    async completeReview(
        id: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/reviews/${id}/complete`,
            {},
            {
                ...config,
                successMessage: 'Performance review completed successfully',
            }
        )
    }

    // ==================== PERFORMANCE GOALS ====================

    /**
     * List performance goals
     */
    async listGoals(filters?: PerformanceGoalListFilters, config?: RequestConfig): Promise<PerformanceGoal[]> {
        const params = new URLSearchParams()

        if (filters?.employeeId) params.append('employeeId', String(filters.employeeId))
        if (filters?.setBy) params.append('setBy', String(filters.setBy))
        if (filters?.goalType) params.append('goalType', filters.goalType)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.priority) params.append('priority', filters.priority)
        if (filters?.fromDate) params.append('fromDate', filters.fromDate)
        if (filters?.toDate) params.append('toDate', filters.toDate)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}/goals${queryString ? `?${queryString}` : ''}`

        return apiClient.get<PerformanceGoal[]>(url, config)
    }

    /**
     * Get performance goal by ID
     */
    async getGoalById(id: number, config?: RequestConfig): Promise<PerformanceGoal> {
        return apiClient.get<PerformanceGoal>(`${this.baseUrl}/goals/${id}`, config)
    }

    /**
     * Create performance goal
     */
    async createGoal(
        data: CreatePerformanceGoalDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/goals`,
            data,
            {
                ...config,
                successMessage: 'Performance goal created successfully',
            }
        )
    }

    /**
     * Update performance goal
     */
    async updateGoal(
        id: number,
        data: UpdatePerformanceGoalDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/goals/${id}`,
            data,
            {
                ...config,
                successMessage: 'Performance goal updated successfully',
            }
        )
    }

    /**
     * Delete performance goal
     */
    async deleteGoal(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/goals/${id}`,
            {
                ...config,
                successMessage: 'Performance goal deleted successfully',
            }
        )
    }

    /**
     * Complete performance goal
     */
    async completeGoal(
        id: number,
        data?: { actualOutcome?: string; notes?: string },
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/goals/${id}/complete`,
            data || {},
            {
                ...config,
                successMessage: 'Performance goal completed successfully',
            }
        )
    }

    /**
     * Update goal progress
     */
    async updateGoalProgress(
        id: number,
        progress: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/goals/${id}/progress`,
            { progress },
            {
                ...config,
                successMessage: 'Goal progress updated successfully',
            }
        )
    }
}

export const performanceAPI = new PerformanceAPI()
