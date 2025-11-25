import { apiClient, type RequestConfig } from '../client'
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

class CommunityAPI {
    private baseUrl = '/community'

    // ==================== CATEGORIES ====================

    /**
     * List forum categories
     */
    async listCategories(visibleOnly?: boolean, config?: RequestConfig): Promise<CommunityCategory[]> {
        const params = new URLSearchParams()
        if (visibleOnly !== undefined) params.append('visibleOnly', String(visibleOnly))

        const queryString = params.toString()
        const url = `${this.baseUrl}/categories${queryString ? `?${queryString}` : ''}`

        return apiClient.get<CommunityCategory[]>(url, config)
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: number, config?: RequestConfig): Promise<CommunityCategory> {
        return apiClient.get<CommunityCategory>(`${this.baseUrl}/categories/${id}`, config)
    }

    /**
     * Create category
     */
    async createCategory(
        data: CreateCommunityCategoryDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/categories`,
            data,
            {
                ...config,
                successMessage: 'Category created successfully',
            }
        )
    }

    // ==================== TOPICS ====================

    /**
     * List forum topics
     */
    async listTopics(filters?: TopicFilters, config?: RequestConfig): Promise<TopicListResponse> {
        const params = new URLSearchParams()

        if (filters?.categoryId) params.append('categoryId', String(filters.categoryId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.authorId) params.append('authorId', String(filters.authorId))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.tags) params.append('tags', filters.tags)
        if (filters?.pinnedOnly !== undefined) params.append('pinnedOnly', String(filters.pinnedOnly))
        if (filters?.featuredOnly !== undefined) params.append('featuredOnly', String(filters.featuredOnly))
        if (filters?.unansweredOnly !== undefined) params.append('unansweredOnly', String(filters.unansweredOnly))
        if (filters?.myTopicsOnly !== undefined) params.append('myTopicsOnly', String(filters.myTopicsOnly))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}/topics${queryString ? `?${queryString}` : ''}`

        return apiClient.get<TopicListResponse>(url, config)
    }

    /**
     * Get topic by ID
     */
    async getTopicById(id: number, config?: RequestConfig): Promise<Topic> {
        return apiClient.get<Topic>(`${this.baseUrl}/topics/${id}`, config)
    }

    /**
     * Create topic
     */
    async createTopic(
        data: CreateTopicDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/topics`,
            data,
            {
                ...config,
                successMessage: 'Topic created successfully',
            }
        )
    }

    /**
     * Update topic
     */
    async updateTopic(
        id: number,
        data: UpdateTopicDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/topics/${id}`,
            data,
            {
                ...config,
                successMessage: 'Topic updated successfully',
            }
        )
    }

    // ==================== REPLIES ====================

    /**
     * Get topic replies
     */
    async listReplies(topicId: number, config?: RequestConfig): Promise<Reply[]> {
        return apiClient.get<Reply[]>(`${this.baseUrl}/topics/${topicId}/replies`, config)
    }

    /**
     * Create reply
     */
    async createReply(
        data: CreateReplyDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/replies`,
            data,
            {
                ...config,
                successMessage: 'Reply posted successfully',
            }
        )
    }

    /**
     * Mark reply as best answer
     */
    async markAsBestAnswer(
        id: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/replies/${id}/best-answer`,
            {},
            {
                ...config,
                successMessage: 'Marked as best answer',
            }
        )
    }

    // ==================== REACTIONS ====================

    /**
     * Add reaction
     */
    async addReaction(
        data: AddReactionDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/reactions`,
            data,
            {
                ...config,
                successMessage: 'Reaction added',
            }
        )
    }

    /**
     * Remove reaction
     */
    async removeReaction(
        data: AddReactionDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/reactions`,
            {
                ...config,
                data,
                successMessage: 'Reaction removed',
            }
        )
    }

    // ==================== SUBSCRIPTIONS ====================

    /**
     * Subscribe to topic
     */
    async subscribeToTopic(
        topicId: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/subscribe/topic/${topicId}`,
            {},
            {
                ...config,
                successMessage: 'Subscribed to topic',
            }
        )
    }

    /**
     * Subscribe to category
     */
    async subscribeToCategory(
        categoryId: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/subscribe/category/${categoryId}`,
            {},
            {
                ...config,
                successMessage: 'Subscribed to category',
            }
        )
    }
}

export const communityAPI = new CommunityAPI()
