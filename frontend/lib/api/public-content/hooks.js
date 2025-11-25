/**
 * Public Content React Hooks
 * Custom React hooks for fetching public content data
 *
 * Note: These hooks use basic useState/useEffect patterns.
 * For production, consider using React Query or SWR for better caching and revalidation.
 */

'use client';

import { useState, useEffect } from 'react';
import { publicContentAPI } from './api';

/**
 * Generic hook for fetching data
 * @template T
 * @param {() => Promise<T>} fetcher - Function that fetches the data
 * @param {any[]} dependencies - Dependencies that trigger refetch
 * @returns {{ data: T | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 */
function useFetch(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch content list with filters
 * @param {import('./types').ContentFilters} [filters] - Filter options
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data, loading, error } = useContentList({ type: 'news', pageSize: 10 });
 */
export function useContentList(filters = {}) {
  return useFetch(() => publicContentAPI.list(filters), [JSON.stringify(filters)]);
}

/**
 * Hook to fetch content by slug
 * @param {string | null} slug - Content slug
 * @returns {{ data: import('./types').Content | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: content, loading } = useContentBySlug('novo-sistema-treinamento-pt');
 */
export function useContentBySlug(slug) {
  return useFetch(() => (slug ? publicContentAPI.getBySlug(slug) : Promise.resolve(null)), [slug]);
}

/**
 * Hook to fetch content by ID
 * @param {number | null} id - Content ID
 * @returns {{ data: import('./types').Content | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: content, loading } = useContentById(7);
 */
export function useContentById(id) {
  return useFetch(() => (id ? publicContentAPI.getById(id) : Promise.resolve(null)), [id]);
}

/**
 * Hook to fetch featured content
 * @param {number} [limit=5] - Maximum number of items
 * @returns {{ data: import('./types').Content[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: featured, loading } = useFeaturedContent(3);
 */
export function useFeaturedContent(limit = 5) {
  return useFetch(() => publicContentAPI.getFeatured(limit), [limit]);
}

/**
 * Hook to fetch recent content
 * @param {number} [limit=10] - Maximum number of items
 * @returns {{ data: import('./types').Content[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: recent, loading } = useRecentContent(5);
 */
export function useRecentContent(limit = 10) {
  return useFetch(() => publicContentAPI.getRecent(limit), [limit]);
}

/**
 * Hook to fetch popular content
 * @param {number} [limit=10] - Maximum number of items
 * @returns {{ data: import('./types').Content[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: popular, loading } = usePopularContent(5);
 */
export function usePopularContent(limit = 10) {
  return useFetch(() => publicContentAPI.getPopular(limit), [limit]);
}

/**
 * Hook to fetch content by type
 * @param {import('./types').ContentType} type - Content type
 * @param {import('./types').ContentFilters} [filters={}] - Additional filters
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: news, loading } = useContentByType('news', { featuredOnly: true });
 */
export function useContentByType(type, filters = {}) {
  return useFetch(() => publicContentAPI.getByType(type, filters), [type, JSON.stringify(filters)]);
}

/**
 * Hook to fetch news
 * @param {import('./types').ContentFilters} [filters={}] - Filters
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: news, loading } = useNews({ pageSize: 10 });
 */
export function useNews(filters = {}) {
  return useContentByType('news', filters);
}

/**
 * Hook to fetch events
 * @param {import('./types').ContentFilters} [filters={}] - Filters
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: events, loading } = useEvents({ featuredOnly: true });
 */
export function useEvents(filters = {}) {
  return useContentByType('event', filters);
}

/**
 * Hook to fetch projects
 * @param {import('./types').ContentFilters} [filters={}] - Filters
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: projects, loading } = useProjects({ pageSize: 6 });
 */
export function useProjects(filters = {}) {
  return useContentByType('project', filters);
}

/**
 * Hook to fetch FAQs
 * @param {import('./types').ContentFilters} [filters={}] - Filters
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: faqs, loading } = useFaqs();
 */
export function useFaqs(filters = {}) {
  return useContentByType('faq', filters);
}

/**
 * Hook to fetch banners
 * @param {import('./types').ContentFilters} [filters={}] - Filters
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: banners, loading } = useBanners({ featuredOnly: true });
 */
export function useBanners(filters = {}) {
  return useContentByType('banner', filters);
}

/**
 * Hook to fetch categories
 * @returns {{ data: import('./types').Category[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: categories, loading } = useCategories();
 */
export function useCategories() {
  return useFetch(() => publicContentAPI.getCategories(), []);
}

/**
 * Hook to fetch category tree
 * @returns {{ data: import('./types').Category[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: categoryTree, loading } = useCategoryTree();
 */
export function useCategoryTree() {
  return useFetch(() => publicContentAPI.getCategoryTree(), []);
}

/**
 * Hook to fetch tags
 * @returns {{ data: import('./types').Tag[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: tags, loading } = useTags();
 */
export function useTags() {
  return useFetch(() => publicContentAPI.getTags(), []);
}

/**
 * Hook to fetch popular tags
 * @param {number} [limit=10] - Maximum number of tags
 * @returns {{ data: import('./types').Tag[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: popularTags, loading } = usePopularTags(5);
 */
export function usePopularTags(limit = 10) {
  return useFetch(() => publicContentAPI.getPopularTags(limit), [limit]);
}

/**
 * Hook to fetch comments
 * @param {number | null} contentId - Content ID
 * @returns {{ data: import('./types').Comment[] | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: comments, loading, refetch } = useComments(7);
 */
export function useComments(contentId) {
  return useFetch(() => (contentId ? publicContentAPI.getComments(contentId) : Promise.resolve(null)), [contentId]);
}

/**
 * Hook to search content
 * @param {string} query - Search query
 * @param {import('./types').ContentFilters} [filters={}] - Additional filters
 * @returns {{ data: import('./types').PaginatedResponse<import('./types').Content> | null, loading: boolean, error: Error | null, refetch: () => Promise<void> }}
 *
 * @example
 * const { data: results, loading } = useSearch('tecnologia', { type: 'news' });
 */
export function useSearch(query, filters = {}) {
  return useFetch(() => (query ? publicContentAPI.search(query, filters) : Promise.resolve(null)), [query, JSON.stringify(filters)]);
}
