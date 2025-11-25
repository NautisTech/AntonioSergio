import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentAPI } from './api'
import type {
    Content,
    CreateContentDto,
    UpdateContentDto,
    ContentFilters,
    ContentListResponse,
    ContentVersion,
    ContentCategory,
    CreateContentCategoryDto,
    UpdateContentCategoryDto,
    Tag,
    CreateTagDto,
    Comment,
    CreateCommentDto,
    UpdateCommentDto,
    ModerateCommentDto,
    CommentListFilters,
    CommentListResponse,
    Media,
    CreateMediaDto,
    UpdateMediaDto,
    MediaListFilters,
    MediaListResponse,
    MediaStatistics,
    OverviewAnalytics,
    TypeStatistics,
    TopPerformingContent,
    PerformanceTrend,
    PublishingTrend,
    AuthorStatistics,
    CategoryStatistics,
    TagStatistics,
    EngagementStatistics,
    VisitorStatistics,
    VisibilityPerformance,
} from './types'
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const contentKeys = {
    all: ['content'] as const,

    // Content
    contents: () => [...contentKeys.all, 'contents'] as const,
    contentsList: (filters?: ContentFilters) => [...contentKeys.contents(), 'list', filters] as const,
    content: (id: number) => [...contentKeys.contents(), 'detail', id] as const,
    contentBySlug: (slug: string) => [...contentKeys.contents(), 'slug', slug] as const,
    contentVersions: (id: number) => [...contentKeys.contents(), 'versions', id] as const,

    // Categories
    categories: () => [...contentKeys.all, 'categories'] as const,
    categoriesList: (visibleOnly?: boolean) => [...contentKeys.categories(), 'list', visibleOnly] as const,
    categoryTree: () => [...contentKeys.categories(), 'tree'] as const,
    category: (id: number) => [...contentKeys.categories(), 'detail', id] as const,

    // Tags
    tags: () => [...contentKeys.all, 'tags'] as const,
    tagsList: () => [...contentKeys.tags(), 'list'] as const,
    popularTags: (limit?: number) => [...contentKeys.tags(), 'popular', limit] as const,
    tag: (id: number) => [...contentKeys.tags(), 'detail', id] as const,

    // Comments
    comments: () => [...contentKeys.all, 'comments'] as const,
    pendingComments: (page?: number, pageSize?: number) => [...contentKeys.comments(), 'pending', page, pageSize] as const,
    contentComments: (contentId: number, approvedOnly?: boolean) => [...contentKeys.comments(), 'content', contentId, approvedOnly] as const,
    threadedComments: (contentId: number, approvedOnly?: boolean) => [...contentKeys.comments(), 'threaded', contentId, approvedOnly] as const,
    comment: (id: number) => [...contentKeys.comments(), 'detail', id] as const,

    // Media
    media: () => [...contentKeys.all, 'media'] as const,
    mediaList: (filters?: MediaListFilters) => [...contentKeys.media(), 'list', filters] as const,
    mediaItem: (id: number) => [...contentKeys.media(), 'detail', id] as const,
    mediaStatistics: () => [...contentKeys.media(), 'statistics'] as const,

    // Analytics
    analytics: () => [...contentKeys.all, 'analytics'] as const,
    overview: () => [...contentKeys.analytics(), 'overview'] as const,
    byType: () => [...contentKeys.analytics(), 'by-type'] as const,
    topPerforming: (metric?: string, limit?: number) => [...contentKeys.analytics(), 'top-performing', metric, limit] as const,
    performanceTrends: (days?: number) => [...contentKeys.analytics(), 'performance-trends', days] as const,
    publishingTrends: (months?: number) => [...contentKeys.analytics(), 'publishing-trends', months] as const,
    authorAnalytics: (limit?: number) => [...contentKeys.analytics(), 'authors', limit] as const,
    categoryAnalytics: () => [...contentKeys.analytics(), 'categories'] as const,
    tagAnalytics: (limit?: number) => [...contentKeys.analytics(), 'tags', limit] as const,
    engagement: (contentId?: number) => [...contentKeys.analytics(), 'engagement', contentId] as const,
    visitors: (days?: number) => [...contentKeys.analytics(), 'visitors', days] as const,
    byVisibility: () => [...contentKeys.analytics(), 'by-visibility'] as const,
    scheduled: () => [...contentKeys.analytics(), 'scheduled'] as const,
    needingReview: () => [...contentKeys.analytics(), 'needing-review'] as const,
}

// ==================== CONTENT QUERIES ====================

export function useContents(filters?: ContentFilters, config?: RequestConfig) {
    return useQuery<ContentListResponse>({
        queryKey: contentKeys.contentsList(filters),
        queryFn: () => contentAPI.list(filters, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export function useContent(id: number, config?: RequestConfig) {
    return useQuery<Content>({
        queryKey: contentKeys.content(id),
        queryFn: () => contentAPI.getById(id, config),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export function useContentBySlug(slug: string, config?: RequestConfig) {
    return useQuery<Content>({
        queryKey: contentKeys.contentBySlug(slug),
        queryFn: () => contentAPI.getBySlug(slug, config),
        enabled: !!slug,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export function useContentVersions(id: number, config?: RequestConfig) {
    return useQuery<ContentVersion[]>({
        queryKey: contentKeys.contentVersions(id),
        queryFn: () => contentAPI.getVersions(id, config),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== CONTENT MUTATIONS ====================

export function useCreateContent(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateContentDto) => contentAPI.create(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.contents() })
            queryClient.invalidateQueries({ queryKey: contentKeys.analytics() })
        },
    })
}

export function useUpdateContent(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateContentDto }) =>
            contentAPI.update(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.contents() })
            queryClient.invalidateQueries({ queryKey: contentKeys.content(variables.id) })
            queryClient.invalidateQueries({ queryKey: contentKeys.analytics() })
        },
    })
}

export function useDeleteContent(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => contentAPI.delete(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.contents() })
            queryClient.removeQueries({ queryKey: contentKeys.content(id) })
            queryClient.invalidateQueries({ queryKey: contentKeys.analytics() })
        },
    })
}

export function usePublishContent(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => contentAPI.publish(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.contents() })
            queryClient.invalidateQueries({ queryKey: contentKeys.content(id) })
            queryClient.invalidateQueries({ queryKey: contentKeys.analytics() })
        },
    })
}

export function useUnpublishContent(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => contentAPI.unpublish(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.contents() })
            queryClient.invalidateQueries({ queryKey: contentKeys.content(id) })
            queryClient.invalidateQueries({ queryKey: contentKeys.analytics() })
        },
    })
}

// ==================== CATEGORY QUERIES ====================

export function useCategories(visibleOnly?: boolean, config?: RequestConfig) {
    return useQuery<ContentCategory[]>({
        queryKey: contentKeys.categoriesList(visibleOnly),
        queryFn: () => contentAPI.listCategories(visibleOnly, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useCategoryTree(config?: RequestConfig) {
    return useQuery<ContentCategory[]>({
        queryKey: contentKeys.categoryTree(),
        queryFn: () => contentAPI.getCategoryTree(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useCategory(id: number, config?: RequestConfig) {
    return useQuery<ContentCategory>({
        queryKey: contentKeys.category(id),
        queryFn: () => contentAPI.getCategoryById(id, config),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== CATEGORY MUTATIONS ====================

export function useCreateCategory(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateContentCategoryDto) => contentAPI.createCategory(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.categories() })
        },
    })
}

export function useUpdateCategory(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateContentCategoryDto }) =>
            contentAPI.updateCategory(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.categories() })
            queryClient.invalidateQueries({ queryKey: contentKeys.category(variables.id) })
        },
    })
}

export function useDeleteCategory(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => contentAPI.deleteCategory(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.categories() })
            queryClient.removeQueries({ queryKey: contentKeys.category(id) })
        },
    })
}

// ==================== TAG QUERIES ====================

export function useTags(config?: RequestConfig) {
    return useQuery<Tag[]>({
        queryKey: contentKeys.tagsList(),
        queryFn: () => contentAPI.listTags(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function usePopularTags(limit?: number, config?: RequestConfig) {
    return useQuery<Tag[]>({
        queryKey: contentKeys.popularTags(limit),
        queryFn: () => contentAPI.getPopularTags(limit, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useTag(id: number, config?: RequestConfig) {
    return useQuery<Tag>({
        queryKey: contentKeys.tag(id),
        queryFn: () => contentAPI.getTagById(id, config),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== TAG MUTATIONS ====================

export function useCreateTag(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTagDto) => contentAPI.createTag(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.tags() })
        },
    })
}

export function useUpdateTag(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateTagDto }) =>
            contentAPI.updateTag(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.tags() })
            queryClient.invalidateQueries({ queryKey: contentKeys.tag(variables.id) })
        },
    })
}

export function useDeleteTag(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => contentAPI.deleteTag(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.tags() })
            queryClient.removeQueries({ queryKey: contentKeys.tag(id) })
        },
    })
}

// ==================== COMMENT QUERIES ====================

export function usePendingComments(page?: number, pageSize?: number, config?: RequestConfig) {
    return useQuery<CommentListResponse>({
        queryKey: contentKeys.pendingComments(page, pageSize),
        queryFn: () => contentAPI.getPendingComments(page, pageSize, config),
        staleTime: 1 * 60 * 1000, // 1 minute
    })
}

export function useContentComments(contentId: number, approvedOnly?: boolean, config?: RequestConfig) {
    return useQuery<Comment[]>({
        queryKey: contentKeys.contentComments(contentId, approvedOnly),
        queryFn: () => contentAPI.listComments(contentId, approvedOnly, config),
        enabled: !!contentId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export function useThreadedComments(contentId: number, approvedOnly?: boolean, config?: RequestConfig) {
    return useQuery<Comment[]>({
        queryKey: contentKeys.threadedComments(contentId, approvedOnly),
        queryFn: () => contentAPI.getThreadedComments(contentId, approvedOnly, config),
        enabled: !!contentId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export function useComment(id: number, config?: RequestConfig) {
    return useQuery<Comment>({
        queryKey: contentKeys.comment(id),
        queryFn: () => contentAPI.getCommentById(id, config),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// ==================== COMMENT MUTATIONS ====================

export function useCreateComment(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCommentDto) => contentAPI.createComment(data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...contentKeys.comments(), 'content', variables.contentId] })
            queryClient.invalidateQueries({ queryKey: contentKeys.content(variables.contentId) })
        },
    })
}

export function useUpdateComment(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCommentDto }) =>
            contentAPI.updateComment(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.comments() })
            queryClient.invalidateQueries({ queryKey: contentKeys.comment(variables.id) })
        },
    })
}

export function useModerateComment(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ModerateCommentDto }) =>
            contentAPI.moderateComment(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.comments() })
            queryClient.invalidateQueries({ queryKey: contentKeys.comment(variables.id) })
        },
    })
}

export function useDeleteComment(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => contentAPI.deleteComment(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.comments() })
            queryClient.removeQueries({ queryKey: contentKeys.comment(id) })
        },
    })
}

// ==================== MEDIA QUERIES ====================

export function useMedia(filters?: MediaListFilters, config?: RequestConfig) {
    return useQuery<MediaListResponse>({
        queryKey: contentKeys.mediaList(filters),
        queryFn: () => contentAPI.listMedia(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useMediaItem(id: number, config?: RequestConfig) {
    return useQuery<Media>({
        queryKey: contentKeys.mediaItem(id),
        queryFn: () => contentAPI.getMediaById(id, config),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useMediaStatistics(config?: RequestConfig) {
    return useQuery<MediaStatistics>({
        queryKey: contentKeys.mediaStatistics(),
        queryFn: () => contentAPI.getMediaStatistics(config),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

// ==================== MEDIA MUTATIONS ====================

export function useCreateMedia(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateMediaDto) => contentAPI.createMedia(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.media() })
        },
    })
}

export function useUpdateMedia(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateMediaDto }) =>
            contentAPI.updateMedia(id, data, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.media() })
            queryClient.invalidateQueries({ queryKey: contentKeys.mediaItem(variables.id) })
        },
    })
}

export function useDeleteMedia(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => contentAPI.deleteMedia(id, config),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contentKeys.media() })
            queryClient.removeQueries({ queryKey: contentKeys.mediaItem(id) })
        },
    })
}

// ==================== ANALYTICS QUERIES ====================

export function useOverviewAnalytics(config?: RequestConfig) {
    return useQuery<OverviewAnalytics>({
        queryKey: contentKeys.overview(),
        queryFn: () => contentAPI.getOverviewAnalytics(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAnalyticsByType(config?: RequestConfig) {
    return useQuery<TypeStatistics[]>({
        queryKey: contentKeys.byType(),
        queryFn: () => contentAPI.getAnalyticsByType(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useTopPerforming(metric?: 'views' | 'likes' | 'comments' | 'shares', limit?: number, config?: RequestConfig) {
    return useQuery<TopPerformingContent[]>({
        queryKey: contentKeys.topPerforming(metric, limit),
        queryFn: () => contentAPI.getTopPerforming(metric, limit, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function usePerformanceTrends(days?: number, config?: RequestConfig) {
    return useQuery<PerformanceTrend[]>({
        queryKey: contentKeys.performanceTrends(days),
        queryFn: () => contentAPI.getPerformanceTrends(days, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function usePublishingTrends(months?: number, config?: RequestConfig) {
    return useQuery<PublishingTrend[]>({
        queryKey: contentKeys.publishingTrends(months),
        queryFn: () => contentAPI.getPublishingTrends(months, config),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export function useAuthorAnalytics(limit?: number, config?: RequestConfig) {
    return useQuery<AuthorStatistics[]>({
        queryKey: contentKeys.authorAnalytics(limit),
        queryFn: () => contentAPI.getAuthorAnalytics(limit, config),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export function useCategoryAnalytics(config?: RequestConfig) {
    return useQuery<CategoryStatistics[]>({
        queryKey: contentKeys.categoryAnalytics(),
        queryFn: () => contentAPI.getCategoryAnalytics(config),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export function useTagAnalytics(limit?: number, config?: RequestConfig) {
    return useQuery<TagStatistics[]>({
        queryKey: contentKeys.tagAnalytics(limit),
        queryFn: () => contentAPI.getTagAnalytics(limit, config),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export function useEngagementAnalytics(contentId?: number, config?: RequestConfig) {
    return useQuery<EngagementStatistics>({
        queryKey: contentKeys.engagement(contentId),
        queryFn: () => contentAPI.getEngagementAnalytics(contentId, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useVisitorAnalytics(days?: number, config?: RequestConfig) {
    return useQuery<VisitorStatistics[]>({
        queryKey: contentKeys.visitors(days),
        queryFn: () => contentAPI.getVisitorAnalytics(days, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAnalyticsByVisibility(config?: RequestConfig) {
    return useQuery<VisibilityPerformance[]>({
        queryKey: contentKeys.byVisibility(),
        queryFn: () => contentAPI.getAnalyticsByVisibility(config),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export function useScheduledContent(config?: RequestConfig) {
    return useQuery<Content[]>({
        queryKey: contentKeys.scheduled(),
        queryFn: () => contentAPI.getScheduledContent(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useContentNeedingReview(config?: RequestConfig) {
    return useQuery<Content[]>({
        queryKey: contentKeys.needingReview(),
        queryFn: () => contentAPI.getContentNeedingReview(config),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}
