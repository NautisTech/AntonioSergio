import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { absencesAPI } from './api'
import type {
    AbsenceRequest,
    CreateAbsenceRequestDto,
    UpdateAbsenceRequestDto,
    ApproveAbsenceDto,
    AbsenceRequestListFilters,
    AbsenceType,
    CreateAbsenceTypeDto,
    UpdateAbsenceTypeDto,
    AbsenceTypeListFilters,
} from './types'

// ==================== QUERY KEYS ====================
export const absencesKeys = {
    all: ['absences'] as const,

    // Requests
    requests: () => [...absencesKeys.all, 'requests'] as const,
    requestsList: (filters?: AbsenceRequestListFilters) => [...absencesKeys.requests(), 'list', filters] as const,
    requestDetail: (id: number) => [...absencesKeys.requests(), 'detail', id] as const,

    // Types
    types: () => [...absencesKeys.all, 'types'] as const,
    typesList: (filters?: AbsenceTypeListFilters) => [...absencesKeys.types(), 'list', filters] as const,
    typeDetail: (id: number) => [...absencesKeys.types(), 'detail', id] as const,
}

// ==================== REQUESTS QUERIES ====================

export function useAbsenceRequests(
    filters?: AbsenceRequestListFilters,
    options?: Omit<UseQueryOptions<AbsenceRequest[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: absencesKeys.requestsList(filters),
        queryFn: () => absencesAPI.listRequests(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useAbsenceRequest(
    id: number,
    options?: Omit<UseQueryOptions<AbsenceRequest>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: absencesKeys.requestDetail(id),
        queryFn: () => absencesAPI.getRequestById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== REQUESTS MUTATIONS ====================

export function useCreateAbsenceRequest(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateAbsenceRequestDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAbsenceRequestDto) => absencesAPI.createRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: absencesKeys.requests() })
        },
        ...options,
    })
}

export function useUpdateAbsenceRequest(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateAbsenceRequestDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateAbsenceRequestDto }) =>
            absencesAPI.updateRequest(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: absencesKeys.requests() })
            queryClient.invalidateQueries({ queryKey: absencesKeys.requestDetail(id) })
        },
        ...options,
    })
}

export function useDeleteAbsenceRequest(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => absencesAPI.deleteRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: absencesKeys.requests() })
        },
        ...options,
    })
}

export function useApproveAbsenceRequest(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: ApproveAbsenceDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ApproveAbsenceDto }) =>
            absencesAPI.approveRequest(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: absencesKeys.requests() })
            queryClient.invalidateQueries({ queryKey: absencesKeys.requestDetail(id) })
        },
        ...options,
    })
}

// ==================== TYPES QUERIES ====================

export function useAbsenceTypes(
    filters?: AbsenceTypeListFilters,
    options?: Omit<UseQueryOptions<AbsenceType[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: absencesKeys.typesList(filters),
        queryFn: () => absencesAPI.listTypes(filters),
        staleTime: 30 * 60 * 1000, // 30 minutes (reference data)
        ...options,
    })
}

export function useAbsenceType(
    id: number,
    options?: Omit<UseQueryOptions<AbsenceType>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: absencesKeys.typeDetail(id),
        queryFn: () => absencesAPI.getTypeById(id),
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    })
}

// ==================== TYPES MUTATIONS ====================

export function useCreateAbsenceType(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateAbsenceTypeDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAbsenceTypeDto) => absencesAPI.createType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: absencesKeys.types() })
        },
        ...options,
    })
}

export function useUpdateAbsenceType(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateAbsenceTypeDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateAbsenceTypeDto }) =>
            absencesAPI.updateType(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: absencesKeys.types() })
            queryClient.invalidateQueries({ queryKey: absencesKeys.typeDetail(id) })
        },
        ...options,
    })
}

export function useDeleteAbsenceType(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => absencesAPI.deleteType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: absencesKeys.types() })
        },
        ...options,
    })
}
