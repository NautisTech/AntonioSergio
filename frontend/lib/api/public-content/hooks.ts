/**
 * Public Content React Hooks
 * Custom React hooks for fetching public content data with automatic language filtering
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useEntity } from '@/context/EntityContext'
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

// ==================== HELPER FUNCTIONS ====================

/**
 * Merge language from context into filters
 * Allows explicit override if language is already set in filters
 */
function mergeLanguageFilter(filters: ContentFilters | undefined, contextLanguage: string): ContentFilters {
    // If filters already has a language, use that (explicit override)
    // Otherwise, use the language from context
    return {
        ...filters,
        language: filters?.language || contextLanguage,
    }
}

/**
 * Filter content by entity
 * Checks if the selected entity value is in the content's entidades custom field (comma-separated)
 */
function filterContentByEntity(content: Content[], selectedEntity: any): Content[] {
    // If no entity is selected, return all content
    if (!selectedEntity) {
        return content
    }

    return content.filter(item => {
        // Check if the item has custom_fields.entidades
        const entidadesField = item.custom_fields?.entidades

        // If no entidades field, show the content (not entity-restricted)
        if (!entidadesField || !entidadesField.value) {
            return true
        }

        // Get the entidades value (comma-separated string)
        const entidadesValue = String(entidadesField.value)

        // Split by comma and trim whitespace
        const entityValues = entidadesValue.split(',').map(v => v.trim())

        // Check if the selected entity value is in the list
        return entityValues.includes(selectedEntity.value)
    })
}

/**
 * Filter paginated response by entity
 */
function filterPaginatedByEntity<T extends Content>(
    response: PaginatedResponse<T> | null,
    selectedEntity: any
): PaginatedResponse<T> | null {
    if (!response) {
        return null
    }

    const filteredData = filterContentByEntity(response.data as Content[], selectedEntity) as T[]

    return {
        data: filteredData,
        pagination: response.pagination ? {
            ...response.pagination,
            total: filteredData.length,
            totalPages: response.pagination.pageSize
                ? Math.ceil(filteredData.length / response.pagination.pageSize)
                : 1
        } : undefined
    }
}

// ==================== CONTENT HOOKS ====================

/**
 * Hook to list content with automatic language filtering and entity filtering
 * The current language from context is automatically applied unless explicitly overridden
 * Content is filtered by selected entity based on custom_fields.entidades
 */
export function useContentList(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    const { language } = useLanguage()
    const { selectedEntity } = useEntity()

    // Merge language from context into filters
    const filtersWithLanguage = useMemo(
        () => mergeLanguageFilter(filters, language),
        [filters, language]
    )

    const result = useFetch(
        () => publicContentAPI.list(filtersWithLanguage, config),
        [JSON.stringify(filtersWithLanguage), JSON.stringify(config)]
    )

    // Apply entity filtering to the data
    const filteredData = useMemo(
        () => filterPaginatedByEntity(result.data, selectedEntity),
        [result.data, selectedEntity]
    )

    return {
        ...result,
        data: filteredData
    }
}

/**
 * Hook to get content by slug
 * Note: Content is already language-specific by slug, but we keep consistency
 */
export function useContentBySlug(slug: string | null, config?: RequestConfig): FetchState<Content> {
    return useFetch(
        () => (slug ? publicContentAPI.getBySlug(slug, config) : Promise.resolve(null as any)),
        [slug, JSON.stringify(config)]
    )
}

/**
 * Hook to get content by ID
 */
export function useContentById(id: number | null, config?: RequestConfig): FetchState<Content> {
    return useFetch(
        () => (id ? publicContentAPI.getById(id, config) : Promise.resolve(null as any)),
        [id, JSON.stringify(config)]
    )
}

/**
 * Hook to get featured content with automatic language filtering and entity filtering
 */
export function useFeaturedContent(limit: number = 5, config?: RequestConfig): FetchState<Content[]> {
    const { language } = useLanguage()
    const { selectedEntity } = useEntity()

    const result = useFetch(
        () => publicContentAPI.getFeatured(limit, config),
        [limit, language, JSON.stringify(config)]
    )

    // Apply entity filtering to the data
    const filteredData = useMemo(
        () => result.data ? filterContentByEntity(result.data, selectedEntity) : null,
        [result.data, selectedEntity]
    )

    return {
        ...result,
        data: filteredData
    }
}

/**
 * Hook to get recent content with automatic language filtering and entity filtering
 */
export function useRecentContent(limit: number = 10, config?: RequestConfig): FetchState<Content[]> {
    const { language } = useLanguage()
    const { selectedEntity } = useEntity()

    const result = useFetch(
        () => publicContentAPI.getRecent(limit, config),
        [limit, language, JSON.stringify(config)]
    )

    // Apply entity filtering to the data
    const filteredData = useMemo(
        () => result.data ? filterContentByEntity(result.data, selectedEntity) : null,
        [result.data, selectedEntity]
    )

    return {
        ...result,
        data: filteredData
    }
}

/**
 * Hook to get popular content with automatic language filtering and entity filtering
 */
export function usePopularContent(limit: number = 10, config?: RequestConfig): FetchState<Content[]> {
    const { language } = useLanguage()
    const { selectedEntity } = useEntity()

    const result = useFetch(
        () => publicContentAPI.getPopular(limit, config),
        [limit, language, JSON.stringify(config)]
    )

    // Apply entity filtering to the data
    const filteredData = useMemo(
        () => result.data ? filterContentByEntity(result.data, selectedEntity) : null,
        [result.data, selectedEntity]
    )

    return {
        ...result,
        data: filteredData
    }
}

/**
 * Hook to get content by type with automatic language filtering and entity filtering
 */
export function useContentByType(
    contentTypeId: number,
    filters?: ContentFilters,
    config?: RequestConfig
): FetchState<PaginatedResponse<Content>> {
    const { language } = useLanguage()
    const { selectedEntity } = useEntity()

    // Merge language from context into filters
    const filtersWithLanguage = useMemo(
        () => mergeLanguageFilter(filters, language),
        [filters, language]
    )

    const result = useFetch(
        () => publicContentAPI.getByType(contentTypeId, filtersWithLanguage, config),
        [contentTypeId, JSON.stringify(filtersWithLanguage), JSON.stringify(config)]
    )

    // Apply entity filtering to the data
    const filteredData = useMemo(
        () => filterPaginatedByEntity(result.data, selectedEntity),
        [result.data, selectedEntity]
    )

    return {
        ...result,
        data: filteredData
    }
}

// ==================== CONVENIENCE HOOKS (CONTENT TYPES) ====================

/**
 * Hook to get news with automatic language filtering
 * @example
 * const { data, loading, error } = useNews({ pageSize: 10, featuredOnly: true })
 * // Automatically filters by current language (pt or en)
 */
export function useNews(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(1, filters, config)
}

/**
 * Hook to get banners with automatic language filtering
 */
export function useBanners(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(3, filters, config)
}

/**
 * Hook to get events with automatic language filtering
 */
export function useEvents(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(4, filters, config)
}

/**
 * Hook to get projects with automatic language filtering
 */
export function useProjects(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(5, filters, config)
}

/**
 * Hook to get FAQs with automatic language filtering
 */
export function useFaqs(filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    return useContentByType(6, filters, config)
}

// ==================== CATEGORY HOOKS ====================

/**
 * Hook to get categories
 * Note: Categories might be language-independent or have translations
 */
export function useCategories(config?: RequestConfig): FetchState<Category[]> {
    return useFetch(
        () => publicContentAPI.getCategories(config),
        [JSON.stringify(config)]
    )
}

/**
 * Hook to get category tree
 */
export function useCategoryTree(config?: RequestConfig): FetchState<Category[]> {
    return useFetch(
        () => publicContentAPI.getCategoryTree(config),
        [JSON.stringify(config)]
    )
}

// ==================== TAG HOOKS ====================

/**
 * Hook to get tags
 * Note: Tags might be language-independent or have translations
 */
export function useTags(config?: RequestConfig): FetchState<Tag[]> {
    return useFetch(
        () => publicContentAPI.getTags(config),
        [JSON.stringify(config)]
    )
}

/**
 * Hook to get popular tags
 */
export function usePopularTags(limit: number = 10, config?: RequestConfig): FetchState<Tag[]> {
    return useFetch(
        () => publicContentAPI.getPopularTags(limit, config),
        [limit, JSON.stringify(config)]
    )
}

// ==================== COMMENT HOOKS ====================

/**
 * Hook to get comments
 * Comments are language-independent (user-generated)
 */
export function useComments(contentId: number | null, config?: RequestConfig): FetchState<Comment[]> {
    return useFetch(
        () => (contentId ? publicContentAPI.getComments(contentId, config) : Promise.resolve([] as Comment[])),
        [contentId, JSON.stringify(config)]
    )
}

// ==================== SEARCH HOOK ====================

/**
 * Hook to search content with automatic language filtering and entity filtering
 * @example
 * const { data, loading, error } = useSearch('tecnologia', { pageSize: 10 })
 * // Automatically searches only in current language content and filters by selected entity
 */
export function useSearch(query: string, filters?: ContentFilters, config?: RequestConfig): FetchState<PaginatedResponse<Content>> {
    const { language } = useLanguage()
    const { selectedEntity } = useEntity()

    // Merge language from context into filters
    const filtersWithLanguage = useMemo(
        () => mergeLanguageFilter(filters, language),
        [filters, language]
    )

    const result = useFetch(
        () => (query ? publicContentAPI.search(query, filtersWithLanguage, config) : Promise.resolve({ data: [], pagination: undefined } as PaginatedResponse<Content>)),
        [query, JSON.stringify(filtersWithLanguage), JSON.stringify(config)]
    )

    // Apply entity filtering to the data
    const filteredData = useMemo(
        () => filterPaginatedByEntity(result.data, selectedEntity),
        [result.data, selectedEntity]
    )

    return {
        ...result,
        data: filteredData
    }
}
