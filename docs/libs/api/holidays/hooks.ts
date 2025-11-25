import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { holidaysAPI } from './api'
import type {
    Holiday,
    CreateHolidayDto,
    UpdateHolidayDto,
    HolidayListFilters,
} from './types'

// ==================== QUERY KEYS ====================
export const holidaysKeys = {
    all: ['holidays'] as const,

    // Holidays
    holidays: () => [...holidaysKeys.all, 'list'] as const,
    holidaysList: (filters?: HolidayListFilters) => [...holidaysKeys.holidays(), filters] as const,
    holidayDetail: (id: number) => [...holidaysKeys.all, 'detail', id] as const,
}

// ==================== QUERIES ====================

export function useHolidays(
    filters?: HolidayListFilters,
    options?: Omit<UseQueryOptions<Holiday[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: holidaysKeys.holidaysList(filters),
        queryFn: () => holidaysAPI.list(filters),
        staleTime: 30 * 60 * 1000, // 30 minutes (holidays don't change frequently)
        ...options,
    })
}

export function useHoliday(
    id: number,
    options?: Omit<UseQueryOptions<Holiday>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: holidaysKeys.holidayDetail(id),
        queryFn: () => holidaysAPI.getById(id),
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    })
}

// ==================== MUTATIONS ====================

export function useCreateHoliday(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateHolidayDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateHolidayDto) => holidaysAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: holidaysKeys.holidays() })
        },
        ...options,
    })
}

export function useUpdateHoliday(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateHolidayDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateHolidayDto }) =>
            holidaysAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: holidaysKeys.holidays() })
            queryClient.invalidateQueries({ queryKey: holidaysKeys.holidayDetail(id) })
        },
        ...options,
    })
}

export function useDeleteHoliday(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => holidaysAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: holidaysKeys.holidays() })
        },
        ...options,
    })
}
