import { apiClient, type RequestConfig } from '../client'
import type {
    ReviewTemplate,
    CreateReviewTemplateDto,
    UpdateReviewTemplateDto,
    TemplateListFilters,
    TemplateListResponse,
    TemplateStatistics,
    ReviewRequest,
    CreateReviewRequestDto,
    ReviewRequestFilters,
    ReviewRequestListResponse,
    ReviewResponse,
    SubmitReviewResponseDto,
    ReviewTrigger,
    CreateReviewTriggerDto,
    UpdateReviewTriggerDto,
    TriggerListFilters,
    TriggerListResponse,
    OverviewAnalytics,
    TypeStatistics,
    TopRatedSubject,
    ResponseTrend,
    QuestionAnalytics,
    CompletionRates,
    EmployeePerformanceSummary,
    ReviewAnalyticsFilters,
} from './types'

class ReviewsAPI {
    private baseUrl = '/reviews'

    // ==================== TEMPLATES ====================

    /**
     * List review templates
     */
    async listTemplates(filters?: TemplateListFilters, config?: RequestConfig): Promise<TemplateListResponse> {
        const params = new URLSearchParams()

        if (filters?.type) params.append('type', filters.type)
        if (filters?.active !== undefined) params.append('active', String(filters.active))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/templates${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TemplateListResponse>(url, config)
    }

    /**
     * Get template statistics
     */
    async getTemplateStatistics(config?: RequestConfig): Promise<TemplateStatistics> {
        return apiClient.get<TemplateStatistics>(`${this.baseUrl}/templates/statistics`, config)
    }

    /**
     * Get template by ID
     */
    async getTemplate(id: number, config?: RequestConfig): Promise<ReviewTemplate> {
        return apiClient.get<ReviewTemplate>(`${this.baseUrl}/templates/${id}`, config)
    }

    /**
     * Create review template
     */
    async createTemplate(
        data: CreateReviewTemplateDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/templates`,
            data,
            {
                ...config,
                successMessage: 'Template created successfully',
            }
        )
    }

    /**
     * Update review template
     */
    async updateTemplate(
        id: number,
        data: UpdateReviewTemplateDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/templates/${id}`,
            data,
            {
                ...config,
                successMessage: 'Template updated successfully',
            }
        )
    }

    /**
     * Delete review template
     */
    async deleteTemplate(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/templates/${id}`,
            {
                ...config,
                successMessage: 'Template deleted successfully',
            }
        )
    }

    // ==================== REQUESTS ====================

    /**
     * List review requests
     */
    async listRequests(
        filters?: ReviewRequestFilters,
        config?: RequestConfig
    ): Promise<ReviewRequestListResponse> {
        const params = new URLSearchParams()

        if (filters?.templateId) params.append('templateId', String(filters.templateId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.respondentUserId) params.append('respondentUserId', String(filters.respondentUserId))
        if (filters?.respondentEmployeeId)
            params.append('respondentEmployeeId', String(filters.respondentEmployeeId))
        if (filters?.subjectUserId) params.append('subjectUserId', String(filters.subjectUserId))
        if (filters?.overdueOnly !== undefined) params.append('overdueOnly', String(filters.overdueOnly))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/requests${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ReviewRequestListResponse>(url, config)
    }

    /**
     * Get review request by ID
     */
    async getRequest(id: number, config?: RequestConfig): Promise<ReviewRequest> {
        return apiClient.get<ReviewRequest>(`${this.baseUrl}/requests/${id}`, config)
    }

    /**
     * Create review request
     */
    async createRequest(
        data: CreateReviewRequestDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/requests`,
            data,
            {
                ...config,
                successMessage: 'Review request created successfully',
            }
        )
    }

    /**
     * Cancel review request
     */
    async cancelRequest(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/requests/${id}/cancel`,
            {},
            {
                ...config,
                successMessage: 'Review request cancelled',
            }
        )
    }

    // ==================== RESPONSES ====================

    /**
     * Submit review response
     */
    async submitResponse(
        data: SubmitReviewResponseDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/responses/submit`,
            data,
            {
                ...config,
                successMessage: 'Review submitted successfully',
            }
        )
    }

    /**
     * Get review response by ID
     */
    async getResponse(id: number, config?: RequestConfig): Promise<ReviewResponse> {
        return apiClient.get<ReviewResponse>(`${this.baseUrl}/responses/${id}`, config)
    }

    // ==================== ANALYTICS ====================

    /**
     * Get overview analytics
     */
    async getOverviewAnalytics(
        filters?: ReviewAnalyticsFilters,
        config?: RequestConfig
    ): Promise<OverviewAnalytics> {
        const params = new URLSearchParams()

        if (filters?.templateId) params.append('templateId', String(filters.templateId))
        if (filters?.type) params.append('type', filters.type)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.subjectUserId) params.append('subjectUserId', String(filters.subjectUserId))
        if (filters?.departmentId) params.append('departmentId', String(filters.departmentId))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/overview${queryString ? `?${queryString}` : ''}`

        return apiClient.get<OverviewAnalytics>(url, config)
    }

    /**
     * Get statistics by type
     */
    async getStatisticsByType(
        filters?: ReviewAnalyticsFilters,
        config?: RequestConfig
    ): Promise<TypeStatistics[]> {
        const params = new URLSearchParams()

        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.departmentId) params.append('departmentId', String(filters.departmentId))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/by-type${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TypeStatistics[]>(url, config)
    }

    /**
     * Get top rated subjects
     */
    async getTopRatedSubjects(
        subjectType: 'employee' | 'supplier' | 'brand',
        limit?: number,
        filters?: ReviewAnalyticsFilters,
        config?: RequestConfig
    ): Promise<TopRatedSubject[]> {
        const params = new URLSearchParams()

        if (limit) params.append('limit', String(limit))
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/top-rated/${subjectType}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TopRatedSubject[]>(url, config)
    }

    /**
     * Get response trends
     */
    async getResponseTrends(
        filters?: ReviewAnalyticsFilters,
        config?: RequestConfig
    ): Promise<ResponseTrend[]> {
        const params = new URLSearchParams()

        if (filters?.templateId) params.append('templateId', String(filters.templateId))
        if (filters?.type) params.append('type', filters.type)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/trends${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ResponseTrend[]>(url, config)
    }

    /**
     * Get question analytics for a template
     */
    async getQuestionAnalytics(templateId: number, config?: RequestConfig): Promise<QuestionAnalytics[]> {
        return apiClient.get<QuestionAnalytics[]>(
            `${this.baseUrl}/analytics/questions/${templateId}`,
            config
        )
    }

    /**
     * Get completion rates
     */
    async getCompletionRates(
        filters?: ReviewAnalyticsFilters,
        config?: RequestConfig
    ): Promise<CompletionRates> {
        const params = new URLSearchParams()

        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.departmentId) params.append('departmentId', String(filters.departmentId))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/completion-rates${queryString ? `?${queryString}` : ''}`

        return apiClient.get<CompletionRates>(url, config)
    }

    /**
     * Get employee performance summary
     */
    async getEmployeePerformance(
        employeeId: number,
        filters?: ReviewAnalyticsFilters,
        config?: RequestConfig
    ): Promise<EmployeePerformanceSummary> {
        const params = new URLSearchParams()

        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/employee/${employeeId}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<EmployeePerformanceSummary>(url, config)
    }

    // ==================== TRIGGERS ====================

    /**
     * List review triggers
     */
    async listTriggers(filters?: TriggerListFilters, config?: RequestConfig): Promise<TriggerListResponse> {
        const params = new URLSearchParams()

        if (filters?.activeOnly !== undefined) params.append('activeOnly', String(filters.activeOnly))

        const queryString = params.toString()
        const url = `${this.baseUrl}/triggers${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TriggerListResponse>(url, config)
    }

    /**
     * Get trigger by ID
     */
    async getTrigger(id: number, config?: RequestConfig): Promise<ReviewTrigger> {
        return apiClient.get<ReviewTrigger>(`${this.baseUrl}/triggers/${id}`, config)
    }

    /**
     * Create review trigger
     */
    async createTrigger(
        data: CreateReviewTriggerDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/triggers`,
            data,
            {
                ...config,
                successMessage: 'Trigger created successfully',
            }
        )
    }

    /**
     * Update review trigger
     */
    async updateTrigger(
        id: number,
        data: UpdateReviewTriggerDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/triggers/${id}`,
            data,
            {
                ...config,
                successMessage: 'Trigger updated successfully',
            }
        )
    }

    /**
     * Delete review trigger
     */
    async deleteTrigger(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/triggers/${id}`,
            {
                ...config,
                successMessage: 'Trigger deleted successfully',
            }
        )
    }
}

export const reviewsAPI = new ReviewsAPI()
