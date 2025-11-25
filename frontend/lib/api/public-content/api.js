/**
 * Public Content API
 * API methods for accessing public content endpoints
 */

import { apiClient } from '../client';

class PublicContentAPI {
  constructor() {
    this.baseUrl = '/public/content';
  }

  /**
   * List public content with filters and pagination
   * @param {import('./types').ContentFilters} [filters] - Filter options
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   *
   * @example
   * // Get featured news
   * const news = await publicContentAPI.list({ type: 'news', featuredOnly: true, pageSize: 5 });
   *
   * @example
   * // Get events with pagination
   * const events = await publicContentAPI.list({ type: 'event', page: 1, pageSize: 10 });
   */
  async list(filters = {}) {
    const params = new URLSearchParams();

    // Add filters to query params
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', String(filters.categoryId));
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.search) params.append('search', filters.search);
    if (filters.featuredOnly !== undefined) params.append('featuredOnly', String(filters.featuredOnly));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.language) params.append('language', filters.language);

    const queryString = params.toString();
    const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  }

  /**
   * Get content by slug
   * @param {string} slug - Content slug
   * @returns {Promise<import('./types').Content>}
   *
   * @example
   * const content = await publicContentAPI.getBySlug('novo-sistema-treinamento-pt');
   */
  async getBySlug(slug) {
    return apiClient.get(`${this.baseUrl}/slug/${slug}`);
  }

  /**
   * Get content by ID
   * @param {number} id - Content ID
   * @returns {Promise<import('./types').Content>}
   *
   * @example
   * const content = await publicContentAPI.getById(7);
   */
  async getById(id) {
    return apiClient.get(`${this.baseUrl}/id/${id}`);
  }

  /**
   * Get featured content
   * @param {number} [limit=5] - Maximum number of items to return
   * @returns {Promise<import('./types').Content[]>}
   *
   * @example
   * const featured = await publicContentAPI.getFeatured(3);
   */
  async getFeatured(limit = 5) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const queryString = params.toString();
    const url = `${this.baseUrl}/featured${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  }

  /**
   * Get recent content
   * @param {number} [limit=10] - Maximum number of items to return
   * @returns {Promise<import('./types').Content[]>}
   *
   * @example
   * const recent = await publicContentAPI.getRecent(5);
   */
  async getRecent(limit = 10) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const queryString = params.toString();
    const url = `${this.baseUrl}/recent${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  }

  /**
   * Get popular content (most viewed)
   * @param {number} [limit=10] - Maximum number of items to return
   * @returns {Promise<import('./types').Content[]>}
   *
   * @example
   * const popular = await publicContentAPI.getPopular(5);
   */
  async getPopular(limit = 10) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const queryString = params.toString();
    const url = `${this.baseUrl}/popular${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  }

  /**
   * Get content by type with filters
   * Convenience method for filtering by specific content type
   * @param {import('./types').ContentType} type - Content type
   * @param {import('./types').ContentFilters} [filters={}] - Additional filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   *
   * @example
   * // Get all published news
   * const news = await publicContentAPI.getByType('news');
   *
   * @example
   * // Get featured events
   * const events = await publicContentAPI.getByType('event', { featuredOnly: true });
   */
  async getByType(type, filters = {}) {
    return this.list({ ...filters, type });
  }

  /**
   * Get content by category
   * @param {number} categoryId - Category ID
   * @param {import('./types').ContentFilters} [filters={}] - Additional filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   *
   * @example
   * const newsInCategory = await publicContentAPI.getByCategory(1, { page: 1, pageSize: 10 });
   */
  async getByCategory(categoryId, filters = {}) {
    return this.list({ ...filters, categoryId });
  }

  /**
   * Search content
   * @param {string} query - Search query
   * @param {import('./types').ContentFilters} [filters={}] - Additional filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   *
   * @example
   * const results = await publicContentAPI.search('tecnologia', { type: 'news' });
   */
  async search(query, filters = {}) {
    return this.list({ ...filters, search: query });
  }

  // ==================== CATEGORIES ====================

  /**
   * Get all public categories
   * @returns {Promise<import('./types').Category[]>}
   *
   * @example
   * const categories = await publicContentAPI.getCategories();
   */
  async getCategories() {
    return apiClient.get(`${this.baseUrl}/categories`);
  }

  /**
   * Get category tree (hierarchical structure)
   * @returns {Promise<import('./types').Category[]>}
   *
   * @example
   * const tree = await publicContentAPI.getCategoryTree();
   */
  async getCategoryTree() {
    return apiClient.get(`${this.baseUrl}/categories/tree`);
  }

  // ==================== TAGS ====================

  /**
   * Get all public tags
   * @returns {Promise<import('./types').Tag[]>}
   *
   * @example
   * const tags = await publicContentAPI.getTags();
   */
  async getTags() {
    return apiClient.get(`${this.baseUrl}/tags`);
  }

  /**
   * Get popular tags
   * @param {number} [limit=10] - Maximum number of tags to return
   * @returns {Promise<import('./types').Tag[]>}
   *
   * @example
   * const popularTags = await publicContentAPI.getPopularTags(5);
   */
  async getPopularTags(limit = 10) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const queryString = params.toString();
    const url = `${this.baseUrl}/tags/popular${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  }

  // ==================== COMMENTS ====================

  /**
   * Get comments for content
   * @param {number} contentId - Content ID
   * @returns {Promise<import('./types').Comment[]>}
   *
   * @example
   * const comments = await publicContentAPI.getComments(7);
   */
  async getComments(contentId) {
    return apiClient.get(`${this.baseUrl}/${contentId}/comments`);
  }

  /**
   * Post a comment (anonymous)
   * @param {import('./types').CreateCommentDto} data - Comment data
   * @returns {Promise<import('./types').Comment>}
   *
   * @example
   * const comment = await publicContentAPI.postComment({
   *   contentId: 7,
   *   text: 'Great article!',
   *   authorName: 'João Silva',
   *   authorEmail: 'joao@example.com'
   * });
   */
  async postComment(data) {
    return apiClient.post(`${this.baseUrl}/${data.contentId}/comments`, data);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get news articles
   * Convenience method for fetching news content
   * @param {import('./types').ContentFilters} [filters={}] - Filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   */
  async getNews(filters = {}) {
    return this.getByType('news', filters);
  }

  /**
   * Get events
   * Convenience method for fetching event content
   * @param {import('./types').ContentFilters} [filters={}] - Filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   */
  async getEvents(filters = {}) {
    return this.getByType('event', filters);
  }

  /**
   * Get projects
   * Convenience method for fetching project content
   * @param {import('./types').ContentFilters} [filters={}] - Filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   */
  async getProjects(filters = {}) {
    return this.getByType('project', filters);
  }

  /**
   * Get FAQs
   * Convenience method for fetching FAQ content
   * @param {import('./types').ContentFilters} [filters={}] - Filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   */
  async getFaqs(filters = {}) {
    return this.getByType('faq', filters);
  }

  /**
   * Get banners
   * Convenience method for fetching banner content
   * @param {import('./types').ContentFilters} [filters={}] - Filters
   * @returns {Promise<import('./types').PaginatedResponse<import('./types').Content>>}
   */
  async getBanners(filters = {}) {
    return this.getByType('banner', filters);
  }
}

// Export singleton instance
export const publicContentAPI = new PublicContentAPI();
export default publicContentAPI;
