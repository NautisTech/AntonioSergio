import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mailerAPI } from './api'
import type {
    SubscribeNewsletterDto,
    UnsubscribeNewsletterDto,
    ListSubscribersFilters,
    SubscriberListResponse,
    NewsletterStats,
    SendNewsletterDto,
    SendTestNewsletterDto,
    NewsletterSendResult,
    NewsletterTemplates,
    SaveNewsletterTemplatesDto,
} from './types'
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const mailerKeys = {
    all: ['mailer'] as const,
    subscribers: () => [...mailerKeys.all, 'subscribers'] as const,
    subscribersList: (filters?: ListSubscribersFilters) =>
        [...mailerKeys.subscribers(), 'list', filters] as const,
    statistics: () => [...mailerKeys.all, 'statistics'] as const,
    templates: () => [...mailerKeys.all, 'templates'] as const,
}

// ==================== QUERIES ====================

/**
 * Hook to fetch newsletter subscribers list
 */
export function useNewsletterSubscribers(filters?: ListSubscribersFilters, config?: RequestConfig) {
    return useQuery<SubscriberListResponse>({
        queryKey: mailerKeys.subscribersList(filters),
        queryFn: () => mailerAPI.listSubscribers(filters, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch newsletter statistics
 */
export function useNewsletterStatistics(config?: RequestConfig) {
    return useQuery<NewsletterStats>({
        queryKey: mailerKeys.statistics(),
        queryFn: () => mailerAPI.getStatistics(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch newsletter templates
 */
export function useNewsletterTemplates(config?: RequestConfig) {
    return useQuery<NewsletterTemplates>({
        queryKey: mailerKeys.templates(),
        queryFn: () => mailerAPI.getTemplates(config),
        staleTime: 10 * 60 * 1000, // 10 minutes - templates change infrequently
    })
}

// ==================== MUTATIONS ====================

/**
 * Hook to subscribe to newsletter (public)
 */
export function useSubscribeNewsletter(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SubscribeNewsletterDto) => mailerAPI.subscribe(data, config),
        onSuccess: () => {
            // Invalidate subscribers list
            queryClient.invalidateQueries({ queryKey: mailerKeys.subscribers() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: mailerKeys.statistics() })
        },
    })
}

/**
 * Hook to unsubscribe from newsletter (public)
 */
export function useUnsubscribeNewsletter(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UnsubscribeNewsletterDto) => mailerAPI.unsubscribe(data, config),
        onSuccess: () => {
            // Invalidate subscribers list
            queryClient.invalidateQueries({ queryKey: mailerKeys.subscribers() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: mailerKeys.statistics() })
        },
    })
}

/**
 * Hook to send newsletter to all active subscribers
 */
export function useSendNewsletter(config?: RequestConfig) {
    return useMutation({
        mutationFn: (data: SendNewsletterDto) => mailerAPI.sendNewsletter(data, config),
    })
}

/**
 * Hook to send test newsletter
 */
export function useSendTestNewsletter(config?: RequestConfig) {
    return useMutation({
        mutationFn: (data: SendTestNewsletterDto) => mailerAPI.sendTestNewsletter(data, config),
    })
}

/**
 * Hook to save newsletter templates
 */
export function useSaveNewsletterTemplates(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SaveNewsletterTemplatesDto) => mailerAPI.saveTemplates(data, config),
        onSuccess: () => {
            // Invalidate templates cache
            queryClient.invalidateQueries({ queryKey: mailerKeys.templates() })
        },
    })
}

// ==================== HELPER HOOKS ====================

/**
 * Custom hook for newsletter subscription form
 * Provides form state management and submission logic
 */
export function useNewsletterSubscriptionForm(tenantId: number) {
    const subscribe = useSubscribeNewsletter()

    const handleSubscribe = async (email: string, language: string) => {
        return subscribe.mutateAsync({
            email,
            lang: language,
            tenantId,
        })
    }

    return {
        subscribe: handleSubscribe,
        isSubscribing: subscribe.isPending,
        isSuccess: subscribe.isSuccess,
        error: subscribe.error,
        reset: subscribe.reset,
    }
}

/**
 * Custom hook for newsletter unsubscribe form
 * Provides unsubscribe logic
 */
export function useNewsletterUnsubscribeForm(tenantId: number) {
    const unsubscribe = useUnsubscribeNewsletter()

    const handleUnsubscribe = async (email: string) => {
        return unsubscribe.mutateAsync({
            email,
            tenantId,
        })
    }

    return {
        unsubscribe: handleUnsubscribe,
        isUnsubscribing: unsubscribe.isPending,
        isSuccess: unsubscribe.isSuccess,
        error: unsubscribe.error,
        reset: unsubscribe.reset,
    }
}
