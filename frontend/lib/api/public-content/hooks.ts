/**
 * Public Content React Hooks
 * Custom React hooks for fetching public content data
 */

'use client'

import { useState, useEffect } from 'react'
import { publicContentAPI } from './api'
import type {
    Content,
    ContentFilters,
    PaginatedResponse,
    Category,
    Tag,
    Comment,
    CONTENT_TYPES,
} from './types'
import type { RequestConfig } from '../client'

// ==================== GENERIC HOOK ====================

interface FetchState<T> {
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => Promise<void>
}

/**
 * Generic hook for fetching data
 */
function useFetch<T>(
    fetcher: () => Promise<T>,
    dependencies: any[] = []
): FetchState<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await fetcher()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)

    return { data, loading, error, refetch: fetchData }
}

// ==================== CONTENT HOOKS ====================

export function useContentList(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useFetch(
        () => publicContentAPI.list(filters, config),
        [JSON.stringify(filters), JSON.stringify(config)]
    )
}

export function useContentBySlug(slug: string | null, config?: RequestConfig): FetchState<Content> {
    return useFetch(
        () => (slug ? publicContentAPI.getBySlug(slug, config) : Promise.resolve(null as any)),
        [slug, JSON.stringify(config)]
    )
}

export function useContentById(id: number | null, config?: RequestConfig): FetchState<Content> {
    return useFetch(
        () => (id ? publicContentAPI.getById(id, config) : Promise.resolve(null as any)),
        [id, JSON.stringify(config)]
    )
}

export function useFeaturedContent(limit: number = 5, config?: RequestConfig): FetchState<Content[]> {
    return useFetch(
        () => publicContentAPI.getFeatured(limit, config),
        [limit, JSON.stringify(config)]
    )
}

export function useRecentContent(limit: number = 10, config?: RequestConfig): FetchState<Content[]> {
    return useFetch(
        () => publicContentAPI.getRecent(limit, config),
        [limit, JSON.stringify(config)]
    )
}

export function usePopularContent(limit: number = 10, config?: RequestConfig): FetchState<Content[]> {
    return useFetch(
        () => publicContentAPI.getPopular(limit, config),
        [limit, JSON.stringify(config)]
    )
}

export function useContentByType(
    contentTypeId: number,
    filters?: ContentFilters,
    config?: RequestConfig
): FetchState<PaginatedResponse<Content>> {
    return useFetch(
        () => publicContentAPI.getByType(contentTypeId, filters, config),
        [contentTypeId, JSON.stringify(filters), JSON.stringify(config)]
    )
}

// ==================== CONVENIENCE HOOKS (CONTENT TYPES) ====================

export function useNews(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(1, filters, config)
}

export function useBanners(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(3, filters, config)
}

export function useEvents(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(4, filters, config)
}

export function useProjects(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(5, filters, config)
}

export function useFaqs(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(6, filters, config)
}

// ==================== CATEGORY HOOKS ====================

export function useCategories(config?: RequestConfig): FetchState<Category[]> {
    return useFetch(
        () => publicContentAPI.getCategories(config),
        [JSON.stringify(config)]
    )
}

export function useCategoryTree(config?: RequestConfig): FetchState<Category[]> {
    return useFetch(
        () => publicContentAPI.getCategoryTree(config),
        [JSON.stringify(config)]
    )
}

// ==================== TAG HOOKS ====================

export function useTags(config?: RequestConfig): FetchState<Tag[]> {
    return useFetch(
        () => publicContentAPI.getTags(config),
        [JSON.stringify(config)]
    )
}

export function usePopularTags(limit: number = 10, config?: RequestConfig): FetchState<Tag[]> {
    return useFetch(
        () => publicContentAPI.getPopularTags(limit, config),
        [limit, JSON.stringify(config)]
    )
}

// ==================== COMMENT HOOKS ====================

export function useComments(contentId: number | null, config?: RequestConfig): FetchState<Comment[]> {
    return useFetch(
        () => (contentId ? publicContentAPI.getComments(contentId, config) : Promise.resolve([] as Comment[])),
        [contentId, JSON.stringify(config)]
    )
}

// ==================== SEARCH HOOK ====================

export function useSearch(query: string, filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useFetch(
        () => (query ? publicContentAPI.search(query, filters, config) : Promise.resolve({ data: [], pagination: undefined } as PaginatedResponse<Content>)),
        [query, JSON.stringify(filters), JSON.stringify(config)]
    )
}
