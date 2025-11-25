import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { supportAPI } from './api'
import type {
    Ticket,
    CreateTicketDto,
    UpdateTicketDto,
    CloseTicketDto,
    ReopenTicketDto,
    AddTicketCommentDto,
    RateTicketDto,
    TicketListFilters,
    TicketListResponse,
    TicketDashboard,
    TicketActivity,
    ActivityStats,
    Intervention,
    CreateInterventionDto,
    UpdateInterventionDto,
    InterventionListFilters,
    InterventionListResponse,
    InterventionStats,
    TicketType,
    CreateTicketTypeDto,
    UpdateTicketTypeDto,
    TicketTypeStats,
} from './types'

// ==================== QUERY KEYS ====================
export const supportKeys = {
    all: ['support'] as const,

    // Tickets
    tickets: () => [...supportKeys.all, 'tickets'] as const,
    ticketsList: (filters?: TicketListFilters) => [...supportKeys.tickets(), 'list', filters] as const,
    ticketDetail: (id: number) => [...supportKeys.tickets(), 'detail', id] as const,
    ticketDashboard: () => [...supportKeys.tickets(), 'dashboard'] as const,

    // Ticket Activity
    activity: () => [...supportKeys.all, 'activity'] as const,
    ticketTimeline: (ticketId: number) => [...supportKeys.activity(), 'timeline', ticketId] as const,
    ticketComments: (ticketId: number, includeInternal?: boolean) =>
        [...supportKeys.activity(), 'comments', ticketId, includeInternal] as const,
    activityStats: (userId?: number) => [...supportKeys.activity(), 'stats', userId] as const,

    // Interventions
    interventions: () => [...supportKeys.all, 'interventions'] as const,
    interventionsList: (filters?: InterventionListFilters) => [...supportKeys.interventions(), 'list', filters] as const,
    interventionDetail: (id: number) => [...supportKeys.interventions(), 'detail', id] as const,
    interventionStats: (technicianId?: number) => [...supportKeys.interventions(), 'stats', technicianId] as const,

    // Ticket Types
    ticketTypes: () => [...supportKeys.all, 'ticket-types'] as const,
    ticketTypesList: (activeOnly?: boolean) => [...supportKeys.ticketTypes(), 'list', activeOnly] as const,
    ticketTypeDetail: (id: number) => [...supportKeys.ticketTypes(), 'detail', id] as const,
    ticketTypeStats: () => [...supportKeys.ticketTypes(), 'stats'] as const,
}

// ==================== TICKET QUERIES ====================

export function useTickets(
    filters?: TicketListFilters,
    options?: Omit<UseQueryOptions<TicketListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketsList(filters),
        queryFn: () => supportAPI.listTickets(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes (support needs fresher data)
        ...options,
    })
}

export function useTicketDashboard(
    options?: Omit<UseQueryOptions<TicketDashboard>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketDashboard(),
        queryFn: () => supportAPI.getTicketDashboard(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useTicket(
    id: number,
    options?: Omit<UseQueryOptions<Ticket>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketDetail(id),
        queryFn: () => supportAPI.getTicketById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== TICKET MUTATIONS ====================

export function useCreateTicket(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateTicketDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTicketDto) => supportAPI.createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supportKeys.tickets() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDashboard() })
        },
        ...options,
    })
}

export function useUpdateTicket(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateTicketDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTicketDto }) =>
            supportAPI.updateTicket(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.tickets() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(id) })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDashboard() })
        },
        ...options,
    })
}

export function useCloseTicket(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: CloseTicketDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CloseTicketDto }) =>
            supportAPI.closeTicket(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.tickets() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(id) })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDashboard() })
        },
        ...options,
    })
}

export function useReopenTicket(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: ReopenTicketDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ReopenTicketDto }) =>
            supportAPI.reopenTicket(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.tickets() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(id) })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDashboard() })
        },
        ...options,
    })
}

export function useAddTicketComment(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: AddTicketCommentDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AddTicketCommentDto }) =>
            supportAPI.addTicketComment(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(id) })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketTimeline(id) })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketComments(id) })
        },
        ...options,
    })
}

export function useRateTicket(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: RateTicketDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RateTicketDto }) =>
            supportAPI.rateTicket(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(id) })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDashboard() })
        },
        ...options,
    })
}

export function useDeleteTicket(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => supportAPI.deleteTicket(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supportKeys.tickets() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketDashboard() })
        },
        ...options,
    })
}

// ==================== ACTIVITY QUERIES ====================

export function useTicketTimeline(
    ticketId: number,
    options?: Omit<UseQueryOptions<TicketActivity[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketTimeline(ticketId),
        queryFn: () => supportAPI.getTicketTimeline(ticketId),
        enabled: !!ticketId,
        staleTime: 1 * 60 * 1000, // 1 minute (activity should be fresh)
        ...options,
    })
}

export function useTicketComments(
    ticketId: number,
    includeInternal?: boolean,
    options?: Omit<UseQueryOptions<TicketActivity[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketComments(ticketId, includeInternal),
        queryFn: () => supportAPI.getTicketComments(ticketId, includeInternal),
        enabled: !!ticketId,
        staleTime: 1 * 60 * 1000, // 1 minute
        ...options,
    })
}

export function useActivityStats(
    userId?: number,
    options?: Omit<UseQueryOptions<ActivityStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.activityStats(userId),
        queryFn: () => supportAPI.getActivityStatistics(userId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== INTERVENTION QUERIES ====================

export function useInterventions(
    filters?: InterventionListFilters,
    options?: Omit<UseQueryOptions<InterventionListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.interventionsList(filters),
        queryFn: () => supportAPI.listInterventions(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useInterventionStats(
    technicianId?: number,
    options?: Omit<UseQueryOptions<InterventionStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.interventionStats(technicianId),
        queryFn: () => supportAPI.getInterventionStatistics(technicianId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useIntervention(
    id: number,
    options?: Omit<UseQueryOptions<Intervention>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.interventionDetail(id),
        queryFn: () => supportAPI.getInterventionById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== INTERVENTION MUTATIONS ====================

export function useCreateIntervention(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateInterventionDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateInterventionDto) => supportAPI.createIntervention(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.interventions() })
            queryClient.invalidateQueries({ queryKey: supportKeys.interventionStats() })
            if (data.ticketId) {
                queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(data.ticketId) })
            }
        },
        ...options,
    })
}

export function useUpdateIntervention(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; ticketId?: number; data: UpdateInterventionDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; ticketId?: number; data: UpdateInterventionDto }) =>
            supportAPI.updateIntervention(id, data),
        onSuccess: (_, { id, ticketId }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.interventions() })
            queryClient.invalidateQueries({ queryKey: supportKeys.interventionDetail(id) })
            queryClient.invalidateQueries({ queryKey: supportKeys.interventionStats() })
            if (ticketId) {
                queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(ticketId) })
            }
        },
        ...options,
    })
}

export function useDeleteIntervention(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; ticketId?: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; ticketId?: number }) => supportAPI.deleteIntervention(id),
        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.interventions() })
            queryClient.invalidateQueries({ queryKey: supportKeys.interventionStats() })
            if (ticketId) {
                queryClient.invalidateQueries({ queryKey: supportKeys.ticketDetail(ticketId) })
            }
        },
        ...options,
    })
}

// ==================== TICKET TYPES QUERIES ====================

export function useTicketTypes(
    activeOnly?: boolean,
    options?: Omit<UseQueryOptions<TicketType[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketTypesList(activeOnly),
        queryFn: () => supportAPI.listTicketTypes(activeOnly),
        staleTime: 30 * 60 * 1000, // 30 minutes (reference data)
        ...options,
    })
}

export function useTicketTypeStats(
    options?: Omit<UseQueryOptions<TicketTypeStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketTypeStats(),
        queryFn: () => supportAPI.getTicketTypeStatistics(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

export function useTicketType(
    id: number,
    options?: Omit<UseQueryOptions<TicketType>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: supportKeys.ticketTypeDetail(id),
        queryFn: () => supportAPI.getTicketTypeById(id),
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    })
}

// ==================== TICKET TYPES MUTATIONS ====================

export function useCreateTicketType(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateTicketTypeDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTicketTypeDto) => supportAPI.createTicketType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketTypes() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketTypeStats() })
        },
        ...options,
    })
}

export function useUpdateTicketType(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateTicketTypeDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTicketTypeDto }) =>
            supportAPI.updateTicketType(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketTypes() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketTypeDetail(id) })
        },
        ...options,
    })
}

export function useDeleteTicketType(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => supportAPI.deleteTicketType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketTypes() })
            queryClient.invalidateQueries({ queryKey: supportKeys.ticketTypeStats() })
        },
        ...options,
    })
}
