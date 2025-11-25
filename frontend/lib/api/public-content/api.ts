/**
 * Public Content API
 * API methods for accessing public content endpoints
 */

import { apiClient, type RequestConfig } from '../client'
import type {
    Content,
    ContentFilters,
    PaginatedResponse,
    Category,
    Tag,
    Comment,
    CreateCommentDto,
    CONTENT_TYPES,
} from './types'

class PublicContentAPI {
    private baseUrl = '/public/content'

    // ==================== CONTENT METHODS ====================

    /**
     * List public content with filters and pagination
     */
    async list(filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        const params = new URLSearchParams()

        if (filters?.type) params.append('type', filters.type)
        if (filters?.content_type_id) params.append('content_type_id', String(filters.content_type_id))
        if (filters?.categoryId) params.append('categoryId', String(filters.categoryId))
        if (filters?.tags) params.append('tags', filters.tags)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.featuredOnly !== undefined) params.append('featuredOnly', String(filters.featuredOnly))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
        if (filters?.language) params.append('language', filters.language)

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<PaginatedResponse<Content>>(url, config)
    }

    /**
     * Get content by slug
     */
    async getBySlug(slug: string, config?: RequestConfig): Promise<Content> {
        return apiClient.get<Content>(`${this.baseUrl}/slug/${slug}`, config)
    }

    /**
     * Get content by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Content> {
        return apiClient.get<Content>(`${this.baseUrl}/id/${id}`, config)
    }

    /**
     * Get featured content
     */
    async getFeatured(limit: number = 5, config?: RequestConfig): Promise<Content[]> {
        const params = new URLSearchParams()
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/featured${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Content[]>(url, config)
    }

    /**
     * Get recent content
     */
    async getRecent(limit: number = 10, config?: RequestConfig): Promise<Content[]> {
        const params = new URLSearchParams()
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/recent${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Content[]>(url, config)
    }

    /**
     * Get popular content (most viewed)
     */
    async getPopular(limit: number = 10, config?: RequestConfig): Promise<Content[]> {
        const params = new URLSearchParams()
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/popular${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Content[]>(url, config)
    }

    /**
     * Get content by type with filters
     */
    async getByType(contentTypeId: number, filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.list({ ...filters, content_type_id: contentTypeId }, config)
    }

    /**
     * Get content by category
     */
    async getByCategory(categoryId: number, filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.list({ ...filters, categoryId }, config)
    }

    /**
     * Search content
     */
    async search(query: string, filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.list({ ...filters, search: query }, config)
    }

    // ==================== CONVENIENCE METHODS (CONTENT TYPES) ====================

    /**
     * Get news articles (content_type_id = 1)
     */
    async getNews(filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.getByType(1, filters, config)
    }

    /**
     * Get banners (content_type_id = 3)
     */
    async getBanners(filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.getByType(3, filters, config)
    }

    /**
     * Get events (content_type_id = 4)
     */
    async getEvents(filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.getByType(4, filters, config)
    }

    /**
     * Get projects (content_type_id = 5)
     */
    async getProjects(filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.getByType(5, filters, config)
    }

    /**
     * Get FAQs (content_type_id = 6)
     */
    async getFaqs(filters?: ContentFilters, config?: RequestConfig): Promise<PaginatedResponse<Content>> {
        return this.getByType(6, filters, config)
    }

    // ==================== CATEGORIES ====================

    /**
     * Get all public categories
     */
    async getCategories(config?: RequestConfig): Promise<Category[]> {
        return apiClient.get<Category[]>(`${this.baseUrl}/categories`, config)
    }

    /**
     * Get category tree (hierarchical structure)
     */
    async getCategoryTree(config?: RequestConfig): Promise<Category[]> {
        return apiClient.get<Category[]>(`${this.baseUrl}/categories/tree`, config)
    }

    // ==================== TAGS ====================

    /**
     * Get all public tags
     */
    async getTags(config?: RequestConfig): Promise<Tag[]> {
        return apiClient.get<Tag[]>(`${this.baseUrl}/tags`, config)
    }

    /**
     * Get popular tags
     */
    async getPopularTags(limit: number = 10, config?: RequestConfig): Promise<Tag[]> {
        const params = new URLSearchParams()
        if (limit) params.append('limit', String(limit))

        const queryString = params.toString()
        const url = `${this.baseUrl}/tags/popular${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Tag[]>(url, config)
    }

    // ==================== COMMENTS ====================

    /**
     * Get comments for content
     */
    async getComments(contentId: number, config?: RequestConfig): Promise<Comment[]> {
        return apiClient.get<Comment[]>(`${this.baseUrl}/${contentId}/comments`, config)
    }

    /**
     * Post a comment (anonymous)
     */
    async postComment(data: CreateCommentDto, config?: RequestConfig): Promise<Comment> {
        return apiClient.post<Comment>(`${this.baseUrl}/${data.contentId}/comments`, data, config)
    }
}

// Export singleton instance
export const publicContentAPI = new PublicContentAPI()
export default publicContentAPI
