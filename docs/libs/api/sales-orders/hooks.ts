import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { salesOrdersAPI } from './api'
import type {
    SalesOrder,
    CreateSalesOrderDto,
    UpdateSalesOrderDto,
    ConfirmOrderDto,
    ShipOrderDto,
    DeliverOrderDto,
    CancelOrderDto,
    CloneOrderDto,
    CreateReturnDto,
    RecordPaymentDto,
    SalesOrderListFilters,
    SalesOrderListResponse,
    SalesOrderStats,
    OverdueOrdersResponse,
} from './types'
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const salesOrdersKeys = {
    all: ['sales-orders'] as const,
    lists: () => [...salesOrdersKeys.all, 'list'] as const,
    list: (filters?: SalesOrderListFilters) => [...salesOrdersKeys.lists(), filters] as const,
    details: () => [...salesOrdersKeys.all, 'detail'] as const,
    detail: (id: number) => [...salesOrdersKeys.details(), id] as const,
    byNumber: (orderNumber: string) => [...salesOrdersKeys.all, 'number', orderNumber] as const,
    statistics: (filters?: { startDate?: string; endDate?: string; clientId?: number; assignedTo?: number }) =>
        [...salesOrdersKeys.all, 'statistics', filters] as const,
    overdue: (days?: number) => [...salesOrdersKeys.all, 'overdue', days] as const,
}

// ==================== QUERIES ====================

/**
 * Hook to fetch sales orders list with filtering and pagination
 */
export function useSalesOrders(filters?: SalesOrderListFilters, config?: RequestConfig) {
    return useQuery<SalesOrderListResponse>({
        queryKey: salesOrdersKeys.list(filters),
        queryFn: () => salesOrdersAPI.list(filters, config),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch sales order by ID
 */
export function useSalesOrder(id: number, config?: RequestConfig) {
    return useQuery<SalesOrder>({
        queryKey: salesOrdersKeys.detail(id),
        queryFn: () => salesOrdersAPI.getById(id, config),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch sales order by order number
 */
export function useSalesOrderByNumber(orderNumber: string, config?: RequestConfig) {
    return useQuery<SalesOrder>({
        queryKey: salesOrdersKeys.byNumber(orderNumber),
        queryFn: () => salesOrdersAPI.getByNumber(orderNumber, config),
        enabled: !!orderNumber,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch sales order statistics
 */
export function useSalesOrderStatistics(
    filters?: {
        startDate?: string
        endDate?: string
        clientId?: number
        assignedTo?: number
    },
    config?: RequestConfig
) {
    return useQuery<SalesOrderStats>({
        queryKey: salesOrdersKeys.statistics(filters),
        queryFn: () => salesOrdersAPI.getStatistics(filters, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch overdue sales orders
 */
export function useOverdueSalesOrders(days?: number, config?: RequestConfig) {
    return useQuery<OverdueOrdersResponse>({
        queryKey: salesOrdersKeys.overdue(days),
        queryFn: () => salesOrdersAPI.getOverdue(days, config),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ==================== MUTATIONS ====================

/**
 * Hook to create a new sales order
 */
export function useCreateSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateSalesOrderDto) => salesOrdersAPI.create(data, config),
        onSuccess: () => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to update an existing sales order
 */
export function useUpdateSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateSalesOrderDto }) =>
            salesOrdersAPI.update(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to delete a sales order
 */
export function useDeleteSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => salesOrdersAPI.delete(id, config),
        onSuccess: (_, id) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Remove the specific order from cache
            queryClient.removeQueries({ queryKey: salesOrdersKeys.detail(id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to confirm a sales order
 */
export function useConfirmSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ConfirmOrderDto }) =>
            salesOrdersAPI.confirm(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to ship a sales order
 */
export function useShipSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ShipOrderDto }) =>
            salesOrdersAPI.ship(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to deliver a sales order
 */
export function useDeliverSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: DeliverOrderDto }) =>
            salesOrdersAPI.deliver(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
            // Invalidate overdue orders
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'overdue'] })
        },
    })
}

/**
 * Hook to complete a sales order
 */
export function useCompleteSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => salesOrdersAPI.complete(id, config),
        onSuccess: (_, id) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to cancel a sales order
 */
export function useCancelSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CancelOrderDto }) =>
            salesOrdersAPI.cancel(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
            // Invalidate overdue orders
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'overdue'] })
        },
    })
}

/**
 * Hook to create a return for a sales order
 */
export function useCreateReturn(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateReturnDto }) =>
            salesOrdersAPI.createReturn(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to clone a sales order
 */
export function useCloneSalesOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CloneOrderDto }) =>
            salesOrdersAPI.clone(id, data, config),
        onSuccess: () => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
        },
    })
}

/**
 * Hook to record payment for a sales order
 */
export function useRecordPayment(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RecordPaymentDto }) =>
            salesOrdersAPI.recordPayment(id, data, config),
        onSuccess: (_, variables) => {
            // Invalidate all order lists
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.lists() })
            // Invalidate the specific order
            queryClient.invalidateQueries({ queryKey: salesOrdersKeys.detail(variables.id) })
            // Invalidate statistics
            queryClient.invalidateQueries({ queryKey: ['sales-orders', 'statistics'] })
            // Invalidate transactions list as well
            queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] })
        },
    })
}
