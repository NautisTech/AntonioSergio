import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { calendarAPI } from './api'
import type {
    CalendarEvent,
    CreateCalendarEventDto,
    UpdateCalendarEventDto,
    RespondToEventDto,
    CalendarEventListFilters,
} from './types'

// ==================== QUERY KEYS ====================
export const calendarKeys = {
    all: ['calendar'] as const,

    // Events
    events: () => [...calendarKeys.all, 'events'] as const,
    eventsList: (filters?: CalendarEventListFilters) => [...calendarKeys.events(), 'list', filters] as const,
    eventDetail: (id: number) => [...calendarKeys.events(), 'detail', id] as const,
}

// ==================== QUERIES ====================

export function useCalendarEvents(
    filters?: CalendarEventListFilters,
    options?: Omit<UseQueryOptions<CalendarEvent[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: calendarKeys.eventsList(filters),
        queryFn: () => calendarAPI.list(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useCalendarEvent(
    id: number,
    options?: Omit<UseQueryOptions<CalendarEvent>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: calendarKeys.eventDetail(id),
        queryFn: () => calendarAPI.getById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== MUTATIONS ====================

export function useCreateCalendarEvent(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateCalendarEventDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCalendarEventDto) => calendarAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() })
        },
        ...options,
    })
}

export function useUpdateCalendarEvent(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateCalendarEventDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCalendarEventDto }) =>
            calendarAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() })
            queryClient.invalidateQueries({ queryKey: calendarKeys.eventDetail(id) })
        },
        ...options,
    })
}

export function useDeleteCalendarEvent(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => calendarAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() })
        },
        ...options,
    })
}

export function useRespondToEvent(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: RespondToEventDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RespondToEventDto }) =>
            calendarAPI.respondToEvent(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() })
            queryClient.invalidateQueries({ queryKey: calendarKeys.eventDetail(id) })
        },
        ...options,
    })
}
