import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { shiftsAPI } from './api'
import type {
    EmployeeShift,
    CreateEmployeeShiftDto,
    UpdateEmployeeShiftDto,
    CheckInDto,
    CheckOutDto,
    EmployeeShiftListFilters,
    ShiftTemplate,
    CreateShiftTemplateDto,
    UpdateShiftTemplateDto,
    ShiftTemplateListFilters,
} from './types'

// ==================== QUERY KEYS ====================
export const shiftsKeys = {
    all: ['shifts'] as const,

    // Employee Shifts
    shifts: () => [...shiftsKeys.all, 'list'] as const,
    shiftsList: (filters?: EmployeeShiftListFilters) => [...shiftsKeys.shifts(), filters] as const,
    shiftDetail: (id: number) => [...shiftsKeys.all, 'detail', id] as const,

    // Templates
    templates: () => [...shiftsKeys.all, 'templates'] as const,
    templatesList: (filters?: ShiftTemplateListFilters) => [...shiftsKeys.templates(), 'list', filters] as const,
    templateDetail: (id: number) => [...shiftsKeys.templates(), 'detail', id] as const,
}

// ==================== EMPLOYEE SHIFTS QUERIES ====================

export function useEmployeeShifts(
    filters?: EmployeeShiftListFilters,
    options?: Omit<UseQueryOptions<EmployeeShift[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: shiftsKeys.shiftsList(filters),
        queryFn: () => shiftsAPI.list(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useEmployeeShift(
    id: number,
    options?: Omit<UseQueryOptions<EmployeeShift>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: shiftsKeys.shiftDetail(id),
        queryFn: () => shiftsAPI.getById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== EMPLOYEE SHIFTS MUTATIONS ====================

export function useCreateEmployeeShift(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateEmployeeShiftDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEmployeeShiftDto) => shiftsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shifts() })
        },
        ...options,
    })
}

export function useUpdateEmployeeShift(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateEmployeeShiftDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeShiftDto }) =>
            shiftsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shifts() })
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shiftDetail(id) })
        },
        ...options,
    })
}

export function useDeleteEmployeeShift(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => shiftsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shifts() })
        },
        ...options,
    })
}

export function useCheckInShift(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: CheckInDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CheckInDto }) =>
            shiftsAPI.checkIn(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shifts() })
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shiftDetail(id) })
        },
        ...options,
    })
}

export function useCheckOutShift(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: CheckOutDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CheckOutDto }) =>
            shiftsAPI.checkOut(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shifts() })
            queryClient.invalidateQueries({ queryKey: shiftsKeys.shiftDetail(id) })
        },
        ...options,
    })
}

// ==================== SHIFT TEMPLATES QUERIES ====================

export function useShiftTemplates(
    filters?: ShiftTemplateListFilters,
    options?: Omit<UseQueryOptions<ShiftTemplate[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: shiftsKeys.templatesList(filters),
        queryFn: () => shiftsAPI.listTemplates(filters),
        staleTime: 30 * 60 * 1000, // 30 minutes (reference data)
        ...options,
    })
}

export function useShiftTemplate(
    id: number,
    options?: Omit<UseQueryOptions<ShiftTemplate>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: shiftsKeys.templateDetail(id),
        queryFn: () => shiftsAPI.getTemplateById(id),
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    })
}

// ==================== SHIFT TEMPLATES MUTATIONS ====================

export function useCreateShiftTemplate(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateShiftTemplateDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateShiftTemplateDto) => shiftsAPI.createTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.templates() })
        },
        ...options,
    })
}

export function useUpdateShiftTemplate(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateShiftTemplateDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateShiftTemplateDto }) =>
            shiftsAPI.updateTemplate(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.templates() })
            queryClient.invalidateQueries({ queryKey: shiftsKeys.templateDetail(id) })
        },
        ...options,
    })
}

export function useDeleteShiftTemplate(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => shiftsAPI.deleteTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftsKeys.templates() })
        },
        ...options,
    })
}
