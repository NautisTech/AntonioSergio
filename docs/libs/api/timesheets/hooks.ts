import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { timesheetsAPI } from './api'
import type {
    TimesheetEntry,
    CreateTimesheetEntryDto,
    UpdateTimesheetEntryDto,
    ApproveTimesheetDto,
    BulkApproveDto,
    TimesheetEntryListFilters,
} from './types'

// ==================== QUERY KEYS ====================
export const timesheetsKeys = {
    all: ['timesheets'] as const,

    // Entries
    entries: () => [...timesheetsKeys.all, 'entries'] as const,
    entriesList: (filters?: TimesheetEntryListFilters) => [...timesheetsKeys.entries(), 'list', filters] as const,
    entryDetail: (id: number) => [...timesheetsKeys.entries(), 'detail', id] as const,
}

// ==================== QUERIES ====================

export function useTimesheetEntries(
    filters?: TimesheetEntryListFilters,
    options?: Omit<UseQueryOptions<TimesheetEntry[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: timesheetsKeys.entriesList(filters),
        queryFn: () => timesheetsAPI.list(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useTimesheetEntry(
    id: number,
    options?: Omit<UseQueryOptions<TimesheetEntry>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: timesheetsKeys.entryDetail(id),
        queryFn: () => timesheetsAPI.getById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== MUTATIONS ====================

export function useCreateTimesheetEntry(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateTimesheetEntryDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTimesheetEntryDto) => timesheetsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
        },
        ...options,
    })
}

export function useUpdateTimesheetEntry(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateTimesheetEntryDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTimesheetEntryDto }) =>
            timesheetsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entryDetail(id) })
        },
        ...options,
    })
}

export function useDeleteTimesheetEntry(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => timesheetsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
        },
        ...options,
    })
}

export function useApproveTimesheetEntry(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: ApproveTimesheetDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ApproveTimesheetDto }) =>
            timesheetsAPI.approve(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entryDetail(id) })
        },
        ...options,
    })
}

export function useBulkApproveTimesheets(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string; count: number }, Error, BulkApproveDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BulkApproveDto) => timesheetsAPI.bulkApprove(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
        },
        ...options,
    })
}

export function useSubmitTimesheets(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string; count: number }, Error, number[]>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (entryIds: number[]) => timesheetsAPI.submit(entryIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
        },
        ...options,
    })
}

export function useClockIn(
    options?: Omit<
        UseMutationOptions<
            { id: number; success: boolean; message: string },
            Error,
            { employeeId: number; location?: string; notes?: string }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: { employeeId: number; location?: string; notes?: string }) =>
            timesheetsAPI.clockIn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
        },
        ...options,
    })
}

export function useClockOut(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data?: { notes?: string; breakDuration?: number } }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data?: { notes?: string; breakDuration?: number } }) =>
            timesheetsAPI.clockOut(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entries() })
            queryClient.invalidateQueries({ queryKey: timesheetsKeys.entryDetail(id) })
        },
        ...options,
    })
}
