import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { transactionsAPI } from './api'
import type {
    Transaction,
    CreateTransactionDto,
    UpdateTransactionDto,
    RecordPaymentDto,
    CreateInvoiceDto,
    CreateExpenseDto,
    ProcessRefundDto,
    TransactionListFilters,
    TransactionListResponse,
    TransactionStats,
    EntityBalance,
    OverdueInvoice,
    PendingExpense,
    TransactionItem,
    CreateTransactionItemDto,
    UpdateTransactionItemDto,
} from './types'

// ==================== QUERY KEYS ====================
export const transactionsKeys = {
    all: ['transactions'] as const,

    // Transactions
    transactions: () => [...transactionsKeys.all, 'list'] as const,
    transactionsList: (filters?: TransactionListFilters) => [...transactionsKeys.transactions(), filters] as const,
    transactionDetail: (id: number) => [...transactionsKeys.all, 'detail', id] as const,
    transactionByNumber: (number: string) => [...transactionsKeys.all, 'number', number] as const,
    transactionItems: (transactionId: number) => [...transactionsKeys.transactionDetail(transactionId), 'items'] as const,

    // Statistics
    stats: (filters?: { fromDate?: string; toDate?: string; clientId?: number; supplierId?: number; type?: string }) =>
        [...transactionsKeys.all, 'stats', filters] as const,

    // Entity Balance
    entityBalance: (entityType: string, entityId: number) =>
        [...transactionsKeys.all, 'entity-balance', entityType, entityId] as const,

    // Invoices
    invoices: () => [...transactionsKeys.all, 'invoices'] as const,
    overdueInvoices: (filters?: { clientId?: number; daysOverdue?: number }) =>
        [...transactionsKeys.invoices(), 'overdue', filters] as const,

    // Expenses
    expenses: () => [...transactionsKeys.all, 'expenses'] as const,
    pendingExpenses: (filters?: { supplierId?: number }) =>
        [...transactionsKeys.expenses(), 'pending', filters] as const,
}

// ==================== GENERAL QUERIES ====================

export function useTransactions(
    filters?: TransactionListFilters,
    options?: Omit<UseQueryOptions<TransactionListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.transactionsList(filters),
        queryFn: () => transactionsAPI.list(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useTransaction(
    id: number,
    options?: Omit<UseQueryOptions<Transaction>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.transactionDetail(id),
        queryFn: () => transactionsAPI.getById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useTransactionByNumber(
    transactionNumber: string,
    options?: Omit<UseQueryOptions<Transaction>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.transactionByNumber(transactionNumber),
        queryFn: () => transactionsAPI.getByNumber(transactionNumber),
        enabled: !!transactionNumber,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useTransactionStats(
    filters?: { fromDate?: string; toDate?: string; clientId?: number; supplierId?: number; type?: string },
    options?: Omit<UseQueryOptions<TransactionStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.stats(filters),
        queryFn: () => transactionsAPI.getStats(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useEntityBalance(
    entityType: string,
    entityId: number,
    options?: Omit<UseQueryOptions<EntityBalance>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.entityBalance(entityType, entityId),
        queryFn: () => transactionsAPI.getEntityBalance(entityType, entityId),
        enabled: !!entityType && !!entityId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useTransactionItems(
    transactionId: number,
    options?: Omit<UseQueryOptions<TransactionItem[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.transactionItems(transactionId),
        queryFn: () => transactionsAPI.getItems(transactionId),
        enabled: !!transactionId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

// ==================== INVOICE QUERIES ====================

export function useOverdueInvoices(
    filters?: { clientId?: number; daysOverdue?: number },
    options?: Omit<UseQueryOptions<OverdueInvoice[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.overdueInvoices(filters),
        queryFn: () => transactionsAPI.getOverdueInvoices(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== EXPENSE QUERIES ====================

export function usePendingExpenses(
    filters?: { supplierId?: number },
    options?: Omit<UseQueryOptions<PendingExpense[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: transactionsKeys.pendingExpenses(filters),
        queryFn: () => transactionsAPI.getPendingExpenses(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== GENERAL MUTATIONS ====================

export function useCreateTransaction(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateTransactionDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTransactionDto) => transactionsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
        },
        ...options,
    })
}

export function useUpdateTransaction(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateTransactionDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTransactionDto }) =>
            transactionsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionDetail(id) })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
        },
        ...options,
    })
}

export function useDeleteTransaction(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => transactionsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
        },
        ...options,
    })
}

// ==================== INVOICE MUTATIONS ====================

export function useCreateInvoice(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateInvoiceDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateInvoiceDto) => transactionsAPI.createInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.invoices() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
        },
        ...options,
    })
}

// ==================== PAYMENT MUTATIONS ====================

export function useRecordPayment(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: RecordPaymentDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RecordPaymentDto }) =>
            transactionsAPI.recordPayment(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionDetail(id) })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.overdueInvoices() })
        },
        ...options,
    })
}

// ==================== EXPENSE MUTATIONS ====================

export function useCreateExpense(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateExpenseDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateExpenseDto) => transactionsAPI.createExpense(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.expenses() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
        },
        ...options,
    })
}

// ==================== REFUND MUTATIONS ====================

export function useProcessRefund(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, ProcessRefundDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ProcessRefundDto) => transactionsAPI.processRefund(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionDetail(data.transactionId) })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
        },
        ...options,
    })
}

// ==================== UTILITY MUTATIONS ====================

export function useMarkOverdueTransactions(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string; count: number }, Error, void>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => transactionsAPI.markOverdueTransactions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactions() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.overdueInvoices() })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() })
        },
        ...options,
    })
}

// ==================== TRANSACTION ITEMS MUTATIONS ====================

export function useAddTransactionItem(
    options?: Omit<
        UseMutationOptions<
            { id: number; success: boolean; message: string },
            Error,
            { transactionId: number; data: CreateTransactionItemDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ transactionId, data }: { transactionId: number; data: CreateTransactionItemDto }) =>
            transactionsAPI.addItem(transactionId, data),
        onSuccess: (_, { transactionId }) => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionItems(transactionId) })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionDetail(transactionId) })
        },
        ...options,
    })
}

export function useUpdateTransactionItem(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { transactionId: number; itemId: number; data: UpdateTransactionItemDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ transactionId, itemId, data }: { transactionId: number; itemId: number; data: UpdateTransactionItemDto }) =>
            transactionsAPI.updateItem(transactionId, itemId, data),
        onSuccess: (_, { transactionId }) => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionItems(transactionId) })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionDetail(transactionId) })
        },
        ...options,
    })
}

export function useDeleteTransactionItem(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { transactionId: number; itemId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ transactionId, itemId }: { transactionId: number; itemId: number }) =>
            transactionsAPI.deleteItem(transactionId, itemId),
        onSuccess: (_, { transactionId }) => {
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionItems(transactionId) })
            queryClient.invalidateQueries({ queryKey: transactionsKeys.transactionDetail(transactionId) })
        },
        ...options,
    })
}
