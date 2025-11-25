import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quotesAPI } from './api'
import type {
    Quote,
    CreateQuoteDto,
    UpdateQuoteDto,
    SendQuoteDto,
    AcceptQuoteDto,
    RejectQuoteDto,
    CloneQuoteDto,
    QuoteListFilters,
    QuoteListResponse,
    QuoteStats,
    ExpiringQuotesResponse,
} from './types'
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const quotesKeys = {
    all: ['quotes'] as const,
    lists: () => [...quotesKeys.all, 'list'] as const,
    list: (filters?: QuoteListFilters) => [...quotesKeys.lists(), filters] as const,
    details: () => [...quotesKeys.all, 'detail'] as const,
    detail: (id: number) => [...quotesKeys.details(), id] as const,
    byNumber: (quoteNumber: string) => [...quotesKeys.all, 'number', quoteNumber] as const,
    statistics: (filters?: { startDate?: string; endDate?: string; clientId?: number; assignedTo?: number }) =>
        [...quotesKeys.all, 'statistics', filters] as const,
    expiring: (days?: number) => [...quotesKeys.all, 'expiring', days] as const,
}

// ==================== QUERIES ====================

/**
 * Hook to fetch quotes list with filtering and pagination
 */
export function useQuotes(filters?: QuoteListFilters, config?: RequestConfig) {
    return useQuery<QuoteListResponse>({
        queryKey: quotesKeys.list(filters),
        queryFn: () => quotesAPI.list(filters, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch quote by ID
 */
export function useQuote(id: number, config?: RequestConfig) {
    return useQuery<Quote>({
        queryKey: quotesKeys.detail(id),
        queryFn: () => quotesAPI.getById(id, config),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch quote by quote number
 */
export function useQuoteByNumber(quoteNumber: string, config?: RequestConfig) {
    return useQuery<Quote>({
        queryKey: quotesKeys.byNumber(quoteNumber),
        queryFn: () => quotesAPI.getByNumber(quoteNumber, config),
        enabled: !!quoteNumber,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch quote statistics
 */
export function useQuoteStatistics(
    filters?: {
        startDate?: string
        endDate?: string
        clientId?: number
        assignedTo?: number
    },
    config?: RequestConfig
) {
    return useQuery<QuoteStats>({
        queryKey: quotesKeys.statistics(filters),
        queryFn: () => quotesAPI.getStatistics(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch quotes expiring soon
 */
export function useExpiringQuotes(days?: number, config?: RequestConfig) {
    return useQuery<ExpiringQuotesResponse>({
        queryKey: quotesKeys.expiring(days),
        queryFn: () => quotesAPI.getExpiring(days, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== MUTATIONS ====================

/**
 * Hook to create a new quote
 */
export function useCreateQuote(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateQuoteDto) => quotesAPI.create(data, config),
        onSuccess: () => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
        },
    })
}

/**
 * Hook to update an existing quote
 */
export function useUpdateQuote(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateQuoteDto }) =>
            quotesAPI.update(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Invalidate the specific quote
            queryClient.invalidateQueries({ queryKey: quotesKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
        },
    })
}

/**
 * Hook to delete a quote
 */
export function useDeleteQuote(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => quotesAPI.delete(id, config),
        onSuccess: (_, id) => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Remove the specific quote from cache
            queryClient.removeQueries({ queryKey: quotesKeys.detail(id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
        },
    })
}

/**
 * Hook to send a quote to client
 */
export function useSendQuote(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: SendQuoteDto }) =>
            quotesAPI.send(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Invalidate the specific quote
            queryClient.invalidateQueries({ queryKey: quotesKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
        },
    })
}

/**
 * Hook to accept a quote
 */
export function useAcceptQuote(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AcceptQuoteDto }) =>
            quotesAPI.accept(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Invalidate the specific quote
            queryClient.invalidateQueries({ queryKey: quotesKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
            // Invalidate expiring quotes
            queryClient.invalidateQueries({ queryKey: ['quotes', 'expiring'] })
        },
    })
}

/**
 * Hook to reject a quote
 */
export function useRejectQuote(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RejectQuoteDto }) =>
            quotesAPI.reject(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Invalidate the specific quote
            queryClient.invalidateQueries({ queryKey: quotesKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
            // Invalidate expiring quotes
            queryClient.invalidateQueries({ queryKey: ['quotes', 'expiring'] })
        },
    })
}

/**
 * Hook to clone a quote
 */
export function useCloneQuote(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CloneQuoteDto }) =>
            quotesAPI.clone(id, data, config),
        onSuccess: () => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
        },
    })
}

/**
 * Hook to mark expired quotes
 */
export function useMarkExpiredQuotes(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => quotesAPI.markExpired(config),
        onSuccess: () => {
            // Invalidate all quote lists
            queryClient.invalidateQueries({ queryKey: quotesKeys.lists() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['quotes', 'statistics'] })
            // Invalidate expiring quotes
            queryClient.invalidateQueries({ queryKey: ['quotes', 'expiring'] })
        },
    })
}
