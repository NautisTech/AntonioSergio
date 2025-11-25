import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewsAPI } from './api'
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
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const reviewsKeys = {
    all: ['reviews'] as const,

    // Templates
    templates: () => [...reviewsKeys.all, 'templates'] as const,
    templatesList: (filters?: TemplateListFilters) => [...reviewsKeys.templates(), 'list', filters] as const,
    template: (id: number) => [...reviewsKeys.templates(), 'detail', id] as const,
    templateStats: () => [...reviewsKeys.templates(), 'statistics'] as const,

    // Requests
    requests: () => [...reviewsKeys.all, 'requests'] as const,
    requestsList: (filters?: ReviewRequestFilters) => [...reviewsKeys.requests(), 'list', filters] as const,
    request: (id: number) => [...reviewsKeys.requests(), 'detail', id] as const,

    // Responses
    responses: () => [...reviewsKeys.all, 'responses'] as const,
    response: (id: number) => [...reviewsKeys.responses(), 'detail', id] as const,

    // Analytics
    analytics: () => [...reviewsKeys.all, 'analytics'] as const,
    overviewAnalytics: (filters?: ReviewAnalyticsFilters) =>
        [...reviewsKeys.analytics(), 'overview', filters] as const,
    typeStatistics: (filters?: ReviewAnalyticsFilters) =>
        [...reviewsKeys.analytics(), 'by-type', filters] as const,
    topRated: (subjectType: string, limit?: number, filters?: ReviewAnalyticsFilters) =>
        [...reviewsKeys.analytics(), 'top-rated', subjectType, limit, filters] as const,
    trends: (filters?: ReviewAnalyticsFilters) => [...reviewsKeys.analytics(), 'trends', filters] as const,
    questionAnalytics: (templateId: number) =>
        [...reviewsKeys.analytics(), 'questions', templateId] as const,
    completionRates: (filters?: ReviewAnalyticsFilters) =>
        [...reviewsKeys.analytics(), 'completion-rates', filters] as const,
    employeePerformance: (employeeId: number, filters?: ReviewAnalyticsFilters) =>
        [...reviewsKeys.analytics(), 'employee', employeeId, filters] as const,

    // Triggers
    triggers: () => [...reviewsKeys.all, 'triggers'] as const,
    triggersList: (filters?: TriggerListFilters) => [...reviewsKeys.triggers(), 'list', filters] as const,
    trigger: (id: number) => [...reviewsKeys.triggers(), 'detail', id] as const,
}

// ==================== TEMPLATES QUERIES ====================

/**
 * Hook to fetch review templates list
 */
export function useReviewTemplates(filters?: TemplateListFilters, config?: RequestConfig) {
    return useQuery<TemplateListResponse>({
        queryKey: reviewsKeys.templatesList(filters),
        queryFn: () => reviewsAPI.listTemplates(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch template statistics
 */
export function useTemplateStatistics(config?: RequestConfig) {
    return useQuery<TemplateStatistics>({
        queryKey: reviewsKeys.templateStats(),
        queryFn: () => reviewsAPI.getTemplateStatistics(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch review template by ID
 */
export function useReviewTemplate(id: number, config?: RequestConfig) {
    return useQuery<ReviewTemplate>({
        queryKey: reviewsKeys.template(id),
        queryFn: () => reviewsAPI.getTemplate(id, config),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== TEMPLATES MUTATIONS ====================

/**
 * Hook to create a review template
 */
export function useCreateReviewTemplate(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateReviewTemplateDto) => reviewsAPI.createTemplate(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.templates() })
        },
    })
}

/**
 * Hook to update a review template
 */
export function useUpdateReviewTemplate(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateReviewTemplateDto }) =>
            reviewsAPI.updateTemplate(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.templates() })
            queryClient.invalidateQueries({ queryKey: reviewsKeys.template(variables.id) })
        },
    })
}

/**
 * Hook to delete a review template
 */
export function useDeleteReviewTemplate(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => reviewsAPI.deleteTemplate(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.templates() })
            queryClient.removeQueries({ queryKey: reviewsKeys.template(id) })
        },
    })
}

// ==================== REQUESTS QUERIES ====================

/**
 * Hook to fetch review requests list
 */
export function useReviewRequests(filters?: ReviewRequestFilters, config?: RequestConfig) {
    return useQuery<ReviewRequestListResponse>({
        queryKey: reviewsKeys.requestsList(filters),
        queryFn: () => reviewsAPI.listRequests(filters, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch review request by ID
 */
export function useReviewRequest(id: number, config?: RequestConfig) {
    return useQuery<ReviewRequest>({
        queryKey: reviewsKeys.request(id),
        queryFn: () => reviewsAPI.getRequest(id, config),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// ==================== REQUESTS MUTATIONS ====================

/**
 * Hook to create a review request
 */
export function useCreateReviewRequest(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateReviewRequestDto) => reviewsAPI.createRequest(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.requests() })
            queryClient.invalidateQueries({ queryKey: reviewsKeys.analytics() })
        },
    })
}

/**
 * Hook to cancel a review request
 */
export function useCancelReviewRequest(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => reviewsAPI.cancelRequest(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.requests() })
            queryClient.invalidateQueries({ queryKey: reviewsKeys.request(id) })
            queryClient.invalidateQueries({ queryKey: reviewsKeys.analytics() })
        },
    })
}

// ==================== RESPONSES QUERIES ====================

/**
 * Hook to fetch review response by ID
 */
export function useReviewResponse(id: number, config?: RequestConfig) {
    return useQuery<ReviewResponse>({
        queryKey: reviewsKeys.response(id),
        queryFn: () => reviewsAPI.getResponse(id, config),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== RESPONSES MUTATIONS ====================

/**
 * Hook to submit a review response
 */
export function useSubmitReviewResponse(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SubmitReviewResponseDto) => reviewsAPI.submitResponse(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.requests() })
            queryClient.invalidateQueries({ queryKey: reviewsKeys.responses() })
            queryClient.invalidateQueries({ queryKey: reviewsKeys.analytics() })
        },
    })
}

// ==================== ANALYTICS QUERIES ====================

/**
 * Hook to fetch overview analytics
 */
export function useOverviewAnalytics(filters?: ReviewAnalyticsFilters, config?: RequestConfig) {
    return useQuery<OverviewAnalytics>({
        queryKey: reviewsKeys.overviewAnalytics(filters),
        queryFn: () => reviewsAPI.getOverviewAnalytics(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch statistics by type
 */
export function useStatisticsByType(filters?: ReviewAnalyticsFilters, config?: RequestConfig) {
    return useQuery<TypeStatistics[]>({
        queryKey: reviewsKeys.typeStatistics(filters),
        queryFn: () => reviewsAPI.getStatisticsByType(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch top rated subjects
 */
export function useTopRatedSubjects(
    subjectType: 'employee' | 'supplier' | 'brand',
    limit?: number,
    filters?: ReviewAnalyticsFilters,
    config?: RequestConfig
) {
    return useQuery<TopRatedSubject[]>({
        queryKey: reviewsKeys.topRated(subjectType, limit, filters),
        queryFn: () => reviewsAPI.getTopRatedSubjects(subjectType, limit, filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch response trends
 */
export function useResponseTrends(filters?: ReviewAnalyticsFilters, config?: RequestConfig) {
    return useQuery<ResponseTrend[]>({
        queryKey: reviewsKeys.trends(filters),
        queryFn: () => reviewsAPI.getResponseTrends(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch question analytics
 */
export function useQuestionAnalytics(templateId: number, config?: RequestConfig) {
    return useQuery<QuestionAnalytics[]>({
        queryKey: reviewsKeys.questionAnalytics(templateId),
        queryFn: () => reviewsAPI.getQuestionAnalytics(templateId, config),
        enabled: !!templateId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch completion rates
 */
export function useCompletionRates(filters?: ReviewAnalyticsFilters, config?: RequestConfig) {
    return useQuery<CompletionRates>({
        queryKey: reviewsKeys.completionRates(filters),
        queryFn: () => reviewsAPI.getCompletionRates(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch employee performance summary
 */
export function useEmployeePerformance(
    employeeId: number,
    filters?: ReviewAnalyticsFilters,
    config?: RequestConfig
) {
    return useQuery<EmployeePerformanceSummary>({
        queryKey: reviewsKeys.employeePerformance(employeeId, filters),
        queryFn: () => reviewsAPI.getEmployeePerformance(employeeId, filters, config),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== TRIGGERS QUERIES ====================

/**
 * Hook to fetch review triggers list
 */
export function useReviewTriggers(filters?: TriggerListFilters, config?: RequestConfig) {
    return useQuery<TriggerListResponse>({
        queryKey: reviewsKeys.triggersList(filters),
        queryFn: () => reviewsAPI.listTriggers(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch review trigger by ID
 */
export function useReviewTrigger(id: number, config?: RequestConfig) {
    return useQuery<ReviewTrigger>({
        queryKey: reviewsKeys.trigger(id),
        queryFn: () => reviewsAPI.getTrigger(id, config),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== TRIGGERS MUTATIONS ====================

/**
 * Hook to create a review trigger
 */
export function useCreateReviewTrigger(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateReviewTriggerDto) => reviewsAPI.createTrigger(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.triggers() })
        },
    })
}

/**
 * Hook to update a review trigger
 */
export function useUpdateReviewTrigger(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateReviewTriggerDto }) =>
            reviewsAPI.updateTrigger(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.triggers() })
            queryClient.invalidateQueries({ queryKey: reviewsKeys.trigger(variables.id) })
        },
    })
}

/**
 * Hook to delete a review trigger
 */
export function useDeleteReviewTrigger(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => reviewsAPI.deleteTrigger(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: reviewsKeys.triggers() })
            queryClient.removeQueries({ queryKey: reviewsKeys.trigger(id) })
        },
    })
}
