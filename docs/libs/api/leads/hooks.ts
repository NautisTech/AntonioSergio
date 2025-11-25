import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leadsAPI } from './api'
import type {
    Lead,
    CreateLeadDto,
    UpdateLeadDto,
    ConvertLeadDto,
    LoseLeadDto,
    LeadListFilters,
    LeadListResponse,
    LeadStats,
} from './types'
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const leadsKeys = {
    all: ['leads'] as const,
    lists: () => [...leadsKeys.all, 'list'] as const,
    list: (filters?: LeadListFilters) => [...leadsKeys.lists(), filters] as const,
    details: () => [...leadsKeys.all, 'detail'] as const,
    detail: (id: number) => [...leadsKeys.details(), id] as const,
    statistics: () => [...leadsKeys.all, 'statistics'] as const,
}

// ==================== QUERIES ====================

/**
 * Hook to fetch leads list with filtering and pagination
 */
export function useLeads(filters?: LeadListFilters, config?: RequestConfig) {
    return useQuery<LeadListResponse>({
        queryKey: leadsKeys.list(filters),
        queryFn: () => leadsAPI.list(filters, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch lead by ID
 */
export function useLead(id: number, config?: RequestConfig) {
    return useQuery<Lead>({
        queryKey: leadsKeys.detail(id),
        queryFn: () => leadsAPI.getById(id, config),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch lead statistics
 */
export function useLeadStatistics(config?: RequestConfig) {
    return useQuery<LeadStats>({
        queryKey: leadsKeys.statistics(),
        queryFn: () => leadsAPI.getStatistics(config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== MUTATIONS ====================

/**
 * Hook to create a new lead
 */
export function useCreateLead(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateLeadDto) => leadsAPI.create(data, config),
        onSuccess: () => {
            // Invalidate all lead lists
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: leadsKeys.statistics() })
        },
    })
}

/**
 * Hook to update an existing lead
 */
export function useUpdateLead(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateLeadDto }) =>
            leadsAPI.update(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all lead lists
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() })
            // Invalidate the specific lead
            queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: leadsKeys.statistics() })
        },
    })
}

/**
 * Hook to delete a lead
 */
export function useDeleteLead(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => leadsAPI.delete(id, config),
        onSuccess: (_, id) => {
            // Invalidate all lead lists
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() })
            // Remove the specific lead from cache
            queryClient.removeQueries({ queryKey: leadsKeys.detail(id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: leadsKeys.statistics() })
        },
    })
}

/**
 * Hook to convert a lead to a client
 */
export function useConvertLead(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ConvertLeadDto }) =>
            leadsAPI.convert(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all lead lists
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() })
            // Invalidate the specific lead
            queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: leadsKeys.statistics() })
            // Invalidate clients list as well since we created a new client
            queryClient.invalidateQueries({ queryKey: ['clients', 'list'] })
        },
    })
}

/**
 * Hook to mark a lead as lost
 */
export function useLoseLead(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: LoseLeadDto }) =>
            leadsAPI.lose(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all lead lists
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() })
            // Invalidate the specific lead
            queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: leadsKeys.statistics() })
        },
    })
}
