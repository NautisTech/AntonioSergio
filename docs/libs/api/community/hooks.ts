import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { communityAPI } from './api'
import type {
    CommunityCategory,
    CreateCommunityCategoryDto,
    UpdateCommunityCategoryDto,
    Topic,
    CreateTopicDto,
    UpdateTopicDto,
    TopicFilters,
    TopicListResponse,
    Reply,
    CreateReplyDto,
    UpdateReplyDto,
    AddReactionDto,
    ReportContentDto,
} from './types'
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const communityKeys = {
    all: ['community'] as const,

    categories: () => [...communityKeys.all, 'categories'] as const,
    categoriesList: (visibleOnly?: boolean) => [...communityKeys.categories(), 'list', { visibleOnly }] as const,
    category: (id: number) => [...communityKeys.categories(), id] as const,

    topics: () => [...communityKeys.all, 'topics'] as const,
    topicsList: (filters?: TopicFilters) => [...communityKeys.topics(), 'list', filters] as const,
    topic: (id: number) => [...communityKeys.topics(), id] as const,

    replies: () => [...communityKeys.all, 'replies'] as const,
    repliesList: (topicId: number) => [...communityKeys.replies(), 'list', topicId] as const,
}

// ==================== CATEGORIES QUERIES ====================

/**
 * List forum categories
 */
export function useCategories(
    visibleOnly?: boolean,
    config?: RequestConfig,
    options?: Omit<UseQueryOptions<CommunityCategory[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: communityKeys.categoriesList(visibleOnly),
        queryFn: () => communityAPI.listCategories(visibleOnly, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get category by ID
 */
export function useCategory(
    id: number,
    config?: RequestConfig,
    options?: Omit<UseQueryOptions<CommunityCategory>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: communityKeys.category(id),
        queryFn: () => communityAPI.getCategoryById(id, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: id > 0,
        ...options,
    })
}

// ==================== TOPICS QUERIES ====================

/**
 * List forum topics
 */
export function useTopics(
    filters?: TopicFilters,
    config?: RequestConfig,
    options?: Omit<UseQueryOptions<TopicListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: communityKeys.topicsList(filters),
        queryFn: () => communityAPI.listTopics(filters, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

/**
 * Get topic by ID
 */
export function useTopic(
    id: number,
    config?: RequestConfig,
    options?: Omit<UseQueryOptions<Topic>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: communityKeys.topic(id),
        queryFn: () => communityAPI.getTopicById(id, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: id > 0,
        ...options,
    })
}

// ==================== REPLIES QUERIES ====================

/**
 * Get topic replies
 */
export function useReplies(
    topicId: number,
    config?: RequestConfig,
    options?: Omit<UseQueryOptions<Reply[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: communityKeys.repliesList(topicId),
        queryFn: () => communityAPI.listReplies(topicId, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: topicId > 0,
        ...options,
    })
}

// ==================== CATEGORIES MUTATIONS ====================

/**
 * Create category
 */
export function useCreateCategory(
    options?: UseMutationOptions<
        { id: number; success: boolean; message: string },
        Error,
        { data: CreateCommunityCategoryDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ data, config }) => communityAPI.createCategory(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.categories() })
        },
        ...options,
    })
}

/**
 * Update category
 */
export function useUpdateCategory(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; data: UpdateCommunityCategoryDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data, config }) => communityAPI.updateCategory(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.categories() })
            queryClient.invalidateQueries({ queryKey: communityKeys.category(variables.id) })
        },
        ...options,
    })
}

/**
 * Delete category
 */
export function useDeleteCategory(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, config }) => communityAPI.deleteCategory(id, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.categories() })
            queryClient.removeQueries({ queryKey: communityKeys.category(variables.id) })
        },
        ...options,
    })
}

// ==================== TOPICS MUTATIONS ====================

/**
 * Create topic
 */
export function useCreateTopic(
    options?: UseMutationOptions<
        { id: number; success: boolean; message: string },
        Error,
        { data: CreateTopicDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ data, config }) => communityAPI.createTopic(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
            queryClient.invalidateQueries({ queryKey: communityKeys.categories() })
        },
        ...options,
    })
}

/**
 * Update topic
 */
export function useUpdateTopic(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; data: UpdateTopicDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data, config }) => communityAPI.updateTopic(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
            queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.id) })
            queryClient.invalidateQueries({ queryKey: communityKeys.categories() })
        },
        ...options,
    })
}

/**
 * Delete topic
 */
export function useDeleteTopic(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, config }) => communityAPI.deleteTopic(id, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
            queryClient.removeQueries({ queryKey: communityKeys.topic(variables.id) })
            queryClient.invalidateQueries({ queryKey: communityKeys.categories() })
        },
        ...options,
    })
}

/**
 * Pin topic
 */
export function usePinTopic(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, config }) => communityAPI.pinTopic(id, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
            queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.id) })
        },
        ...options,
    })
}

/**
 * Lock topic
 */
export function useLockTopic(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, config }) => communityAPI.lockTopic(id, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
            queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.id) })
        },
        ...options,
    })
}

// ==================== REPLIES MUTATIONS ====================

/**
 * Create reply
 */
export function useCreateReply(
    options?: UseMutationOptions<
        { id: number; success: boolean; message: string },
        Error,
        { data: CreateReplyDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ data, config }) => communityAPI.createReply(data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.replies() })
            queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.data.topicId) })
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
        },
        ...options,
    })
}

/**
 * Update reply
 */
export function useUpdateReply(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; data: UpdateReplyDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data, config }) => communityAPI.updateReply(id, data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.replies() })
        },
        ...options,
    })
}

/**
 * Delete reply
 */
export function useDeleteReply(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, config }) => communityAPI.deleteReply(id, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.replies() })
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
        },
        ...options,
    })
}

/**
 * Mark reply as best answer
 */
export function useMarkBestAnswer(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { id: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, config }) => communityAPI.markAsBestAnswer(id, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.replies() })
            queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
        },
        ...options,
    })
}

// ==================== REACTIONS MUTATIONS ====================

/**
 * Add reaction
 */
export function useAddReaction(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { data: AddReactionDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ data, config }) => communityAPI.addReaction(data, config),
        onSuccess: (_, variables) => {
            if (variables.data.targetType === 'topic') {
                queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.data.targetId) })
                queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
            } else if (variables.data.targetType === 'reply') {
                queryClient.invalidateQueries({ queryKey: communityKeys.replies() })
            }
        },
        ...options,
    })
}

/**
 * Remove reaction
 */
export function useRemoveReaction(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { data: AddReactionDto; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ data, config }) => communityAPI.removeReaction(data, config),
        onSuccess: (_, variables) => {
            if (variables.data.targetType === 'topic') {
                queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.data.targetId) })
                queryClient.invalidateQueries({ queryKey: communityKeys.topics() })
            } else if (variables.data.targetType === 'reply') {
                queryClient.invalidateQueries({ queryKey: communityKeys.replies() })
            }
        },
        ...options,
    })
}

// ==================== SUBSCRIPTIONS MUTATIONS ====================

/**
 * Subscribe to topic
 */
export function useSubscribeToTopic(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { topicId: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ topicId, config }) => communityAPI.subscribeToTopic(topicId, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.topicId) })
        },
        ...options,
    })
}

/**
 * Unsubscribe from topic
 */
export function useUnsubscribeFromTopic(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { topicId: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ topicId, config }) => communityAPI.unsubscribeFromTopic(topicId, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.topic(variables.topicId) })
        },
        ...options,
    })
}

/**
 * Subscribe to category
 */
export function useSubscribeToCategory(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { categoryId: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ categoryId, config }) => communityAPI.subscribeToCategory(categoryId, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.category(variables.categoryId) })
        },
        ...options,
    })
}

/**
 * Unsubscribe from category
 */
export function useUnsubscribeFromCategory(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { categoryId: number; config?: RequestConfig }
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ categoryId, config }) => communityAPI.unsubscribeFromCategory(categoryId, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: communityKeys.category(variables.categoryId) })
        },
        ...options,
    })
}

// ==================== REPORT MUTATIONS ====================

/**
 * Report content
 */
export function useReportContent(
    options?: UseMutationOptions<
        { success: boolean; message: string },
        Error,
        { data: ReportContentDto; config?: RequestConfig }
    >
) {
    return useMutation({
        mutationFn: ({ data, config }) => communityAPI.reportContent(data, config),
        ...options,
    })
}
