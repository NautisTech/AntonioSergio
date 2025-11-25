import { apiClient, type RequestConfig } from '../client'
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

class ContentAPI {
    private baseUrl = '/content'

    // ==================== CONTENT MANAGEMENT ====================

    /**
     * List content with filters
     */
    async list(filters?: ContentFilters, config?: RequestConfig): Promise<ContentListResponse> {
        const params = new URLSearchParams()

        if (filters?.type) params.append('type', filters.type)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.visibility) params.append('visibility', filters.visibility)
        if (filters?.categoryId) params.append('categoryId', String(filters.categoryId))
        if (filters?.authorId) params.append('authorId', String(filters.authorId))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.tags) params.append('tags', filters.tags)
        if (filters?.language) params.append('language', filters.language)
        if (filters?.featuredOnly !== undefined) params.append('featuredOnly', String(filters.featuredOnly))
        if (filters?.includeScheduled !== undefined) params.append('includeScheduled', String(filters.includeScheduled))
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ContentListResponse>(url, config)
    }

    /**
     * Get content by slug
     */
    async getBySlug(slug: string, config?: RequestConfig): Promise<Content> {
        return apiClient.get<Content>(`${this.baseUrl}/by-slug/${slug}`, config)
    }

    /**
     * Get content by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Content> {
        return apiClient.get<Content>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create content
     */
    async create(data: CreateContentDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(this.baseUrl, data, {
            ...config,
            successMessage: 'Content created successfully',
        })
    }

    /**
     * Update content
     */
    async update(id: number, data: UpdateContentDto, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`, data, {
            ...config,
            successMessage: 'Content updated successfully',
        })
    }

    /**
     * Delete content
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`, {
            ...config,
            successMessage: 'Content deleted successfully',
        })
    }

    /**
     * Publish content
     */
    async publish(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${id}/publish`, {}, {
            ...config,
            successMessage: 'Content published successfully',
        })
    }

    /**
     * Unpublish content
     */
    async unpublish(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${id}/unpublish`, {}, {
            ...config,
            successMessage: 'Content unpublished',
        })
    }

    /**
     * Get content versions
     */
    async getVersions(id: number, config?: RequestConfig): Promise<ContentVersion[]> {
        return apiClient.get<ContentVersion[]>(`${this.baseUrl}/${id}/versions`, config)
    }

    // ==================== CATEGORIES ====================

    /**
     * Get category tree (hierarchical)
     */
    async getCategoryTree(config?: RequestConfig): Promise<ContentCategory[]> {
        return apiClient.get<ContentCategory[]>(`${this.baseUrl}/categories/tree`, config)
    }

    /**
     * List categories
     */
    async listCategories(visibleOnly?: boolean, config?: RequestConfig): Promise<ContentCategory[]> {
        const params = new URLSearchParams()
        if (visibleOnly !== undefined) params.append('visibleOnly', String(visibleOnly))

        const queryString = params.toString()
        const url = `${this.baseUrl}/categories/list${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ContentCategory[]>(url, config)
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: number, config?: RequestConfig): Promise<ContentCategory> {
        return apiClient.get<ContentCategory>(`${this.baseUrl}/categories/${id}`, config)
    }

    /**
     * Create category
     */
    async createCategory(data: CreateContentCategoryDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(`${this.baseUrl}/categories`, data, {
            ...config,
            successMessage: 'Category created successfully',
        })
    }

    /**
     * Update category
     */
    async updateCategory(id: number, data: UpdateContentCategoryDto, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(`${this.baseUrl}/categories/${id}`, data, {
            ...config,
            successMessage: 'Category updated successfully',
        })
    }

    /**
     * Delete category
     */
    async deleteCategory(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/categories/${id}`, {
            ...config,
            successMessage: 'Category deleted successfully',
        })
    }

    // ==================== TAGS ====================

    /**
     * List tags
     */
    async listTags(config?: RequestConfig): Promise<Tag[]> {
        return apiClient.get<Tag[]>(`${this.baseUrl}/tags/list`, config)
    }

    /**
     * Get popular tags
     */
    async getPopularTags(limit?: number, config?: RequestConfig): Promise<Tag[]> {
        const params = new URLSearchParams()
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/tags/popular${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Tag[]>(url, config)
    }

    /**
     * Get tag by ID
     */
    async getTagById(id: number, config?: RequestConfig): Promise<Tag> {
        return apiClient.get<Tag>(`${this.baseUrl}/tags/${id}`, config)
    }

    /**
     * Create tag
     */
    async createTag(data: CreateTagDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(`${this.baseUrl}/tags`, data, {
            ...config,
            successMessage: 'Tag created successfully',
        })
    }

    /**
     * Update tag
     */
    async updateTag(id: number, data: CreateTagDto, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(`${this.baseUrl}/tags/${id}`, data, {
            ...config,
            successMessage: 'Tag updated successfully',
        })
    }

    /**
     * Delete tag
     */
    async deleteTag(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/tags/${id}`, {
            ...config,
            successMessage: 'Tag deleted successfully',
        })
    }

    // ==================== COMMENTS ====================

    /**
     * Get pending comments for moderation
     */
    async getPendingComments(page?: number, pageSize?: number, config?: RequestConfig): Promise<CommentListResponse> {
        const params = new URLSearchParams()
        if (page) params.append('page', String(page))
        if (pageSize) params.append('pageSize', String(pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/comments/pending${queryString ? `?${queryString}` : ''}`

        return apiClient.get<CommentListResponse>(url, config)
    }

    /**
     * List comments for content
     */
    async listComments(contentId: number, approvedOnly?: boolean, config?: RequestConfig): Promise<Comment[]> {
        const params = new URLSearchParams()
        if (approvedOnly !== undefined) params.append('approvedOnly', String(approvedOnly))

        const queryString = params.toString()
        const url = `${this.baseUrl}/comments/content/${contentId}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Comment[]>(url, config)
    }

    /**
     * Get threaded comments for content
     */
    async getThreadedComments(contentId: number, approvedOnly?: boolean, config?: RequestConfig): Promise<Comment[]> {
        const params = new URLSearchParams()
        if (approvedOnly !== undefined) params.append('approvedOnly', String(approvedOnly))

        const queryString = params.toString()
        const url = `${this.baseUrl}/comments/content/${contentId}/threaded${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Comment[]>(url, config)
    }

    /**
     * Get comment by ID
     */
    async getCommentById(id: number, config?: RequestConfig): Promise<Comment> {
        return apiClient.get<Comment>(`${this.baseUrl}/comments/${id}`, config)
    }

    /**
     * Create comment
     */
    async createComment(data: CreateCommentDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(`${this.baseUrl}/comments`, data, {
            ...config,
            successMessage: 'Comment posted successfully',
        })
    }

    /**
     * Update comment
     */
    async updateComment(id: number, data: UpdateCommentDto, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(`${this.baseUrl}/comments/${id}`, data, {
            ...config,
            successMessage: 'Comment updated successfully',
        })
    }

    /**
     * Moderate comment
     */
    async moderateComment(id: number, data: ModerateCommentDto, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/comments/${id}/moderate`, data, {
            ...config,
            successMessage: 'Comment moderated successfully',
        })
    }

    /**
     * Delete comment
     */
    async deleteComment(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/comments/${id}`, {
            ...config,
            successMessage: 'Comment deleted successfully',
        })
    }

    // ==================== MEDIA LIBRARY ====================

    /**
     * List media
     */
    async listMedia(filters?: MediaListFilters, config?: RequestConfig): Promise<MediaListResponse> {
        const params = new URLSearchParams()

        if (filters?.type) params.append('type', filters.type)
        if (filters?.tag) params.append('tag', filters.tag)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/media/list${queryString ? `?${queryString}` : ''}`

        return apiClient.get<MediaListResponse>(url, config)
    }

    /**
     * Get media library statistics
     */
    async getMediaStatistics(config?: RequestConfig): Promise<MediaStatistics> {
        return apiClient.get<MediaStatistics>(`${this.baseUrl}/media/statistics`, config)
    }

    /**
     * Get media by ID
     */
    async getMediaById(id: number, config?: RequestConfig): Promise<Media> {
        return apiClient.get<Media>(`${this.baseUrl}/media/${id}`, config)
    }

    /**
     * Create media
     */
    async createMedia(data: CreateMediaDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(`${this.baseUrl}/media`, data, {
            ...config,
            successMessage: 'Media created successfully',
        })
    }

    /**
     * Update media
     */
    async updateMedia(id: number, data: UpdateMediaDto, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(`${this.baseUrl}/media/${id}`, data, {
            ...config,
            successMessage: 'Media updated successfully',
        })
    }

    /**
     * Delete media
     */
    async deleteMedia(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/media/${id}`, {
            ...config,
            successMessage: 'Media deleted successfully',
        })
    }

    // ==================== ANALYTICS ====================

    /**
     * Get content overview statistics
     */
    async getOverviewAnalytics(config?: RequestConfig): Promise<OverviewAnalytics> {
        return apiClient.get<OverviewAnalytics>(`${this.baseUrl}/analytics/overview`, config)
    }

    /**
     * Get statistics by content type
     */
    async getAnalyticsByType(config?: RequestConfig): Promise<TypeStatistics[]> {
        return apiClient.get<TypeStatistics[]>(`${this.baseUrl}/analytics/by-type`, config)
    }

    /**
     * Get top performing content
     */
    async getTopPerforming(metric?: 'views' | 'likes' | 'comments' | 'shares', limit?: number, config?: RequestConfig): Promise<TopPerformingContent[]> {
        const params = new URLSearchParams()
        if (metric) params.append('metric', metric)
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/top-performing${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TopPerformingContent[]>(url, config)
    }

    /**
     * Get content performance trends
     */
    async getPerformanceTrends(days?: number, config?: RequestConfig): Promise<PerformanceTrend[]> {
        const params = new URLSearchParams()
        if (days) params.append('days', String(days))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/performance-trends${queryString ? `?${queryString}` : ''}`

        return apiClient.get<PerformanceTrend[]>(url, config)
    }

    /**
     * Get publishing trends
     */
    async getPublishingTrends(months?: number, config?: RequestConfig): Promise<PublishingTrend[]> {
        const params = new URLSearchParams()
        if (months) params.append('months', String(months))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/publishing-trends${queryString ? `?${queryString}` : ''}`

        return apiClient.get<PublishingTrend[]>(url, config)
    }

    /**
     * Get author statistics
     */
    async getAuthorAnalytics(limit?: number, config?: RequestConfig): Promise<AuthorStatistics[]> {
        const params = new URLSearchParams()
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/authors${queryString ? `?${queryString}` : ''}`

        return apiClient.get<AuthorStatistics[]>(url, config)
    }

    /**
     * Get category statistics
     */
    async getCategoryAnalytics(config?: RequestConfig): Promise<CategoryStatistics[]> {
        return apiClient.get<CategoryStatistics[]>(`${this.baseUrl}/analytics/categories`, config)
    }

    /**
     * Get tag statistics
     */
    async getTagAnalytics(limit?: number, config?: RequestConfig): Promise<TagStatistics[]> {
        const params = new URLSearchParams()
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/tags${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TagStatistics[]>(url, config)
    }

    /**
     * Get engagement statistics
     */
    async getEngagementAnalytics(contentId?: number, config?: RequestConfig): Promise<EngagementStatistics> {
        const params = new URLSearchParams()
        if (contentId) params.append('contentId', String(contentId))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/engagement${queryString ? `?${queryString}` : ''}`

        return apiClient.get<EngagementStatistics>(url, config)
    }

    /**
     * Get visitor statistics
     */
    async getVisitorAnalytics(days?: number, config?: RequestConfig): Promise<VisitorStatistics[]> {
        const params = new URLSearchParams()
        if (days) params.append('days', String(days))

        const queryString = params.toString()
        const url = `${this.baseUrl}/analytics/visitors${queryString ? `?${queryString}` : ''}`

        return apiClient.get<VisitorStatistics[]>(url, config)
    }

    /**
     * Get performance by visibility
     */
    async getAnalyticsByVisibility(config?: RequestConfig): Promise<VisibilityPerformance[]> {
        return apiClient.get<VisibilityPerformance[]>(`${this.baseUrl}/analytics/by-visibility`, config)
    }

    /**
     * Get scheduled content
     */
    async getScheduledContent(config?: RequestConfig): Promise<Content[]> {
        return apiClient.get<Content[]>(`${this.baseUrl}/analytics/scheduled`, config)
    }

    /**
     * Get content needing review
     */
    async getContentNeedingReview(config?: RequestConfig): Promise<Content[]> {
        return apiClient.get<Content[]>(`${this.baseUrl}/analytics/pending-review`, config)
    }
}

export const contentAPI = new ContentAPI()
