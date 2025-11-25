import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { performanceAPI } from './api'
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

// ==================== QUERY KEYS ====================
export const performanceKeys = {
    all: ['performance'] as const,

    // Reviews
    reviews: () => [...performanceKeys.all, 'reviews'] as const,
    reviewsList: (filters?: PerformanceReviewListFilters) => [...performanceKeys.reviews(), 'list', filters] as const,
    reviewDetail: (id: number) => [...performanceKeys.reviews(), 'detail', id] as const,

    // Goals
    goals: () => [...performanceKeys.all, 'goals'] as const,
    goalsList: (filters?: PerformanceGoalListFilters) => [...performanceKeys.goals(), 'list', filters] as const,
    goalDetail: (id: number) => [...performanceKeys.goals(), 'detail', id] as const,
}

// ==================== PERFORMANCE REVIEWS QUERIES ====================

export function usePerformanceReviews(
    filters?: PerformanceReviewListFilters,
    options?: Omit<UseQueryOptions<PerformanceReview[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: performanceKeys.reviewsList(filters),
        queryFn: () => performanceAPI.listReviews(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function usePerformanceReview(
    id: number,
    options?: Omit<UseQueryOptions<PerformanceReview>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: performanceKeys.reviewDetail(id),
        queryFn: () => performanceAPI.getReviewById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== PERFORMANCE REVIEWS MUTATIONS ====================

export function useCreatePerformanceReview(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreatePerformanceReviewDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePerformanceReviewDto) => performanceAPI.createReview(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
        },
        ...options,
    })
}

export function useUpdatePerformanceReview(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdatePerformanceReviewDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePerformanceReviewDto }) =>
            performanceAPI.updateReview(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
            queryClient.invalidateQueries({ queryKey: performanceKeys.reviewDetail(id) })
        },
        ...options,
    })
}

export function useDeletePerformanceReview(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => performanceAPI.deleteReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
        },
        ...options,
    })
}

export function useCompletePerformanceReview(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => performanceAPI.completeReview(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
            queryClient.invalidateQueries({ queryKey: performanceKeys.reviewDetail(id) })
        },
        ...options,
    })
}

// ==================== PERFORMANCE GOALS QUERIES ====================

export function usePerformanceGoals(
    filters?: PerformanceGoalListFilters,
    options?: Omit<UseQueryOptions<PerformanceGoal[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: performanceKeys.goalsList(filters),
        queryFn: () => performanceAPI.listGoals(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function usePerformanceGoal(
    id: number,
    options?: Omit<UseQueryOptions<PerformanceGoal>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: performanceKeys.goalDetail(id),
        queryFn: () => performanceAPI.getGoalById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== PERFORMANCE GOALS MUTATIONS ====================

export function useCreatePerformanceGoal(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreatePerformanceGoalDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePerformanceGoalDto) => performanceAPI.createGoal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
        },
        ...options,
    })
}

export function useUpdatePerformanceGoal(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdatePerformanceGoalDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePerformanceGoalDto }) =>
            performanceAPI.updateGoal(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
            queryClient.invalidateQueries({ queryKey: performanceKeys.goalDetail(id) })
        },
        ...options,
    })
}

export function useDeletePerformanceGoal(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => performanceAPI.deleteGoal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
        },
        ...options,
    })
}

export function useCompletePerformanceGoal(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data?: { actualOutcome?: string; notes?: string } }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data?: { actualOutcome?: string; notes?: string } }) =>
            performanceAPI.completeGoal(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
            queryClient.invalidateQueries({ queryKey: performanceKeys.goalDetail(id) })
        },
        ...options,
    })
}

export function useUpdateGoalProgress(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; progress: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, progress }: { id: number; progress: number }) =>
            performanceAPI.updateGoalProgress(id, progress),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
            queryClient.invalidateQueries({ queryKey: performanceKeys.goalDetail(id) })
        },
        ...options,
    })
}
