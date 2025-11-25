import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { onboardingAPI } from './api'
import type {
    OnboardingProcess,
    CreateOnboardingProcessDto,
    UpdateOnboardingProcessDto,
    OnboardingProcessListFilters,
    OnboardingTask,
    CreateOnboardingTaskDto,
    UpdateOnboardingTaskDto,
    OffboardingProcess,
    CreateOffboardingProcessDto,
    UpdateOffboardingProcessDto,
    OffboardingProcessListFilters,
    OffboardingTask,
    CreateOffboardingTaskDto,
    UpdateOffboardingTaskDto,
} from './types'

// ==================== QUERY KEYS ====================
export const onboardingKeys = {
    all: ['onboarding'] as const,

    // Onboarding Processes
    processes: () => [...onboardingKeys.all, 'processes'] as const,
    processesList: (filters?: OnboardingProcessListFilters) => [...onboardingKeys.processes(), 'list', filters] as const,
    processDetail: (id: number) => [...onboardingKeys.processes(), 'detail', id] as const,
    processTasks: (processId: number) => [...onboardingKeys.processDetail(processId), 'tasks'] as const,

    // Offboarding Processes
    offboarding: () => [...onboardingKeys.all, 'offboarding'] as const,
    offboardingList: (filters?: OffboardingProcessListFilters) => [...onboardingKeys.offboarding(), 'list', filters] as const,
    offboardingDetail: (id: number) => [...onboardingKeys.offboarding(), 'detail', id] as const,
    offboardingTasks: (processId: number) => [...onboardingKeys.offboardingDetail(processId), 'tasks'] as const,
}

// ==================== ONBOARDING PROCESSES QUERIES ====================

export function useOnboardingProcesses(
    filters?: OnboardingProcessListFilters,
    options?: Omit<UseQueryOptions<OnboardingProcess[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: onboardingKeys.processesList(filters),
        queryFn: () => onboardingAPI.listProcesses(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useOnboardingProcess(
    id: number,
    options?: Omit<UseQueryOptions<OnboardingProcess>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: onboardingKeys.processDetail(id),
        queryFn: () => onboardingAPI.getProcessById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useOnboardingProcessTasks(
    processId: number,
    options?: Omit<UseQueryOptions<OnboardingTask[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: onboardingKeys.processTasks(processId),
        queryFn: () => onboardingAPI.getProcessTasks(processId),
        enabled: !!processId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== ONBOARDING PROCESSES MUTATIONS ====================

export function useCreateOnboardingProcess(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateOnboardingProcessDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOnboardingProcessDto) => onboardingAPI.createProcess(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processes() })
        },
        ...options,
    })
}

export function useUpdateOnboardingProcess(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateOnboardingProcessDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateOnboardingProcessDto }) =>
            onboardingAPI.updateProcess(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processes() })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processDetail(id) })
        },
        ...options,
    })
}

export function useDeleteOnboardingProcess(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => onboardingAPI.deleteProcess(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processes() })
        },
        ...options,
    })
}

// ==================== ONBOARDING TASKS MUTATIONS ====================

export function useAddOnboardingTask(
    options?: Omit<
        UseMutationOptions<
            { id: number; success: boolean; message: string },
            Error,
            { processId: number; data: CreateOnboardingTaskDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ processId, data }: { processId: number; data: CreateOnboardingTaskDto }) =>
            onboardingAPI.addProcessTask(processId, data),
        onSuccess: (_, { processId }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processTasks(processId) })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processDetail(processId) })
        },
        ...options,
    })
}

export function useUpdateOnboardingTask(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { processId: number; taskId: number; data: UpdateOnboardingTaskDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ processId, taskId, data }: { processId: number; taskId: number; data: UpdateOnboardingTaskDto }) =>
            onboardingAPI.updateProcessTask(processId, taskId, data),
        onSuccess: (_, { processId }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processTasks(processId) })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processDetail(processId) })
        },
        ...options,
    })
}

export function useDeleteOnboardingTask(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { processId: number; taskId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ processId, taskId }: { processId: number; taskId: number }) =>
            onboardingAPI.deleteProcessTask(processId, taskId),
        onSuccess: (_, { processId }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processTasks(processId) })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.processDetail(processId) })
        },
        ...options,
    })
}

// ==================== OFFBOARDING PROCESSES QUERIES ====================

export function useOffboardingProcesses(
    filters?: OffboardingProcessListFilters,
    options?: Omit<UseQueryOptions<OffboardingProcess[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: onboardingKeys.offboardingList(filters),
        queryFn: () => onboardingAPI.listOffboarding(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useOffboardingProcess(
    id: number,
    options?: Omit<UseQueryOptions<OffboardingProcess>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: onboardingKeys.offboardingDetail(id),
        queryFn: () => onboardingAPI.getOffboardingById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useOffboardingTasks(
    processId: number,
    options?: Omit<UseQueryOptions<OffboardingTask[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: onboardingKeys.offboardingTasks(processId),
        queryFn: () => onboardingAPI.getOffboardingTasks(processId),
        enabled: !!processId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== OFFBOARDING PROCESSES MUTATIONS ====================

export function useCreateOffboarding(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateOffboardingProcessDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOffboardingProcessDto) => onboardingAPI.createOffboarding(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboarding() })
        },
        ...options,
    })
}

export function useUpdateOffboarding(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateOffboardingProcessDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateOffboardingProcessDto }) =>
            onboardingAPI.updateOffboarding(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboarding() })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboardingDetail(id) })
        },
        ...options,
    })
}

export function useDeleteOffboarding(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => onboardingAPI.deleteOffboarding(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboarding() })
        },
        ...options,
    })
}

// ==================== OFFBOARDING TASKS MUTATIONS ====================

export function useAddOffboardingTask(
    options?: Omit<
        UseMutationOptions<
            { id: number; success: boolean; message: string },
            Error,
            { processId: number; data: CreateOffboardingTaskDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ processId, data }: { processId: number; data: CreateOffboardingTaskDto }) =>
            onboardingAPI.addOffboardingTask(processId, data),
        onSuccess: (_, { processId }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboardingTasks(processId) })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboardingDetail(processId) })
        },
        ...options,
    })
}

export function useUpdateOffboardingTask(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { processId: number; taskId: number; data: UpdateOffboardingTaskDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ processId, taskId, data }: { processId: number; taskId: number; data: UpdateOffboardingTaskDto }) =>
            onboardingAPI.updateOffboardingTask(processId, taskId, data),
        onSuccess: (_, { processId }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboardingTasks(processId) })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboardingDetail(processId) })
        },
        ...options,
    })
}

export function useDeleteOffboardingTask(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { processId: number; taskId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ processId, taskId }: { processId: number; taskId: number }) =>
            onboardingAPI.deleteOffboardingTask(processId, taskId),
        onSuccess: (_, { processId }) => {
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboardingTasks(processId) })
            queryClient.invalidateQueries({ queryKey: onboardingKeys.offboardingDetail(processId) })
        },
        ...options,
    })
}
