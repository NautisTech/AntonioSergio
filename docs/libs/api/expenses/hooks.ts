import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { expensesAPI } from './api'
import type {
    ExpenseClaim,
    CreateExpenseClaimDto,
    UpdateExpenseClaimDto,
    ApproveClaimDto,
    RejectClaimDto,
    ExpenseClaimListFilters,
    ExpenseStats,
    ExpenseCategory,
    CreateCategoryDto,
    UpdateCategoryDto,
    ExpenseItem,
    CreateExpenseItemDto,
    UpdateExpenseItemDto,
} from './types'

// ==================== QUERY KEYS ====================
export const expensesKeys = {
    all: ['expenses'] as const,

    // Claims
    claims: () => [...expensesKeys.all, 'claims'] as const,
    claimsList: (filters?: ExpenseClaimListFilters) => [...expensesKeys.claims(), 'list', filters] as const,
    claimDetail: (id: number) => [...expensesKeys.claims(), 'detail', id] as const,
    claimItems: (claimId: number) => [...expensesKeys.claimDetail(claimId), 'items'] as const,
    claimsStats: (filters?: { employeeId?: number; fromDate?: string; toDate?: string }) =>
        [...expensesKeys.claims(), 'stats', filters] as const,

    // Categories
    categories: () => [...expensesKeys.all, 'categories'] as const,
    categoriesList: (activeOnly?: boolean) => [...expensesKeys.categories(), 'list', activeOnly] as const,
    categoryDetail: (id: number) => [...expensesKeys.categories(), 'detail', id] as const,
}

// ==================== CLAIMS QUERIES ====================

export function useExpenseClaims(
    filters?: ExpenseClaimListFilters,
    options?: Omit<UseQueryOptions<ExpenseClaim[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: expensesKeys.claimsList(filters),
        queryFn: () => expensesAPI.listClaims(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useExpenseClaim(
    id: number,
    options?: Omit<UseQueryOptions<ExpenseClaim>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: expensesKeys.claimDetail(id),
        queryFn: () => expensesAPI.getClaimById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useExpenseStats(
    filters?: { employeeId?: number; fromDate?: string; toDate?: string },
    options?: Omit<UseQueryOptions<ExpenseStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: expensesKeys.claimsStats(filters),
        queryFn: () => expensesAPI.getStatistics(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useClaimItems(
    claimId: number,
    options?: Omit<UseQueryOptions<ExpenseItem[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: expensesKeys.claimItems(claimId),
        queryFn: () => expensesAPI.getClaimItems(claimId),
        enabled: !!claimId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== CLAIMS MUTATIONS ====================

export function useCreateExpenseClaim(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateExpenseClaimDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateExpenseClaimDto) => expensesAPI.createClaim(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claims() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimsStats() })
        },
        ...options,
    })
}

export function useUpdateExpenseClaim(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateExpenseClaimDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateExpenseClaimDto }) =>
            expensesAPI.updateClaim(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claims() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(id) })
        },
        ...options,
    })
}

export function useDeleteExpenseClaim(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => expensesAPI.deleteClaim(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claims() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimsStats() })
        },
        ...options,
    })
}

export function useSubmitExpenseClaim(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => expensesAPI.submitClaim(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claims() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(id) })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimsStats() })
        },
        ...options,
    })
}

export function useApproveExpenseClaim(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data?: ApproveClaimDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data?: ApproveClaimDto }) =>
            expensesAPI.approveClaim(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claims() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(id) })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimsStats() })
        },
        ...options,
    })
}

export function useRejectExpenseClaim(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: RejectClaimDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RejectClaimDto }) =>
            expensesAPI.rejectClaim(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claims() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(id) })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimsStats() })
        },
        ...options,
    })
}

export function useMarkExpenseAsPaid(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; paymentReference?: string }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, paymentReference }: { id: number; paymentReference?: string }) =>
            expensesAPI.markAsPaid(id, paymentReference),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claims() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(id) })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimsStats() })
        },
        ...options,
    })
}

// ==================== ITEMS MUTATIONS ====================

export function useAddClaimItem(
    options?: Omit<
        UseMutationOptions<
            { id: number; success: boolean; message: string },
            Error,
            { claimId: number; data: CreateExpenseItemDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ claimId, data }: { claimId: number; data: CreateExpenseItemDto }) =>
            expensesAPI.addClaimItem(claimId, data),
        onSuccess: (_, { claimId }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimItems(claimId) })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(claimId) })
        },
        ...options,
    })
}

export function useUpdateClaimItem(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { claimId: number; itemId: number; data: UpdateExpenseItemDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ claimId, itemId, data }: { claimId: number; itemId: number; data: UpdateExpenseItemDto }) =>
            expensesAPI.updateClaimItem(claimId, itemId, data),
        onSuccess: (_, { claimId }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimItems(claimId) })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(claimId) })
        },
        ...options,
    })
}

export function useDeleteClaimItem(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { claimId: number; itemId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ claimId, itemId }: { claimId: number; itemId: number }) =>
            expensesAPI.deleteClaimItem(claimId, itemId),
        onSuccess: (_, { claimId }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimItems(claimId) })
            queryClient.invalidateQueries({ queryKey: expensesKeys.claimDetail(claimId) })
        },
        ...options,
    })
}

// ==================== CATEGORIES QUERIES ====================

export function useExpenseCategories(
    activeOnly?: boolean,
    options?: Omit<UseQueryOptions<ExpenseCategory[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: expensesKeys.categoriesList(activeOnly),
        queryFn: () => expensesAPI.listCategories(activeOnly),
        staleTime: 30 * 60 * 1000, // 30 minutes (reference data)
        ...options,
    })
}

export function useExpenseCategory(
    id: number,
    options?: Omit<UseQueryOptions<ExpenseCategory>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: expensesKeys.categoryDetail(id),
        queryFn: () => expensesAPI.getCategoryById(id),
        enabled: !!id,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    })
}

// ==================== CATEGORIES MUTATIONS ====================

export function useCreateExpenseCategory(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateCategoryDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCategoryDto) => expensesAPI.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.categories() })
        },
        ...options,
    })
}

export function useUpdateExpenseCategory(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateCategoryDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
            expensesAPI.updateCategory(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.categories() })
            queryClient.invalidateQueries({ queryKey: expensesKeys.categoryDetail(id) })
        },
        ...options,
    })
}

export function useDeleteExpenseCategory(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => expensesAPI.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expensesKeys.categories() })
        },
        ...options,
    })
}
