import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { productsAPI } from './api'
import type {
    Product,
    CreateProductDto,
    UpdateProductDto,
    ProductListFilters,
    ProductListResponse,
    ProductStats,
    Category,
    AdjustStockDto,
    BulkPriceUpdateDto,
    CalculatePriceDto,
    CalculatePriceResponse,
} from './types'

// ==================== QUERY KEYS ====================
export const productsKeys = {
    all: ['products'] as const,
    lists: () => [...productsKeys.all, 'list'] as const,
    list: (filters?: ProductListFilters) => [...productsKeys.lists(), filters] as const,
    stats: () => [...productsKeys.all, 'stats'] as const,
    categories: () => [...productsKeys.all, 'categories'] as const,
    lowStock: () => [...productsKeys.all, 'low-stock'] as const,
    reorderNeeded: () => [...productsKeys.all, 'reorder-needed'] as const,
    details: () => [...productsKeys.all, 'detail'] as const,
    detail: (id: number) => [...productsKeys.details(), id] as const,
    byCode: (code: string) => [...productsKeys.all, 'by-code', code] as const,
    byBarcode: (barcode: string) => [...productsKeys.all, 'by-barcode', barcode] as const,
}

// ==================== QUERIES ====================

/**
 * List all products with filtering and pagination
 */
export function useProducts(
    filters?: ProductListFilters,
    options?: Omit<UseQueryOptions<ProductListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.list(filters),
        queryFn: () => productsAPI.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get product statistics
 */
export function useProductStats(
    options?: Omit<UseQueryOptions<ProductStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.stats(),
        queryFn: () => productsAPI.getStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get list of available product categories
 */
export function useProductCategories(
    options?: Omit<UseQueryOptions<Category[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.categories(),
        queryFn: () => productsAPI.getCategories(),
        staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
        ...options,
    })
}

/**
 * Get products with stock below minimum threshold
 */
export function useLowStockProducts(
    options?: Omit<UseQueryOptions<Product[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.lowStock(),
        queryFn: () => productsAPI.getLowStock(),
        staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for stock alerts)
        ...options,
    })
}

/**
 * Get products that have reached reorder point
 */
export function useReorderNeededProducts(
    options?: Omit<UseQueryOptions<Product[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.reorderNeeded(),
        queryFn: () => productsAPI.getReorderNeeded(),
        staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for stock alerts)
        ...options,
    })
}

/**
 * Get product by code/SKU
 */
export function useProductByCode(
    code: string,
    options?: Omit<UseQueryOptions<Product>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.byCode(code),
        queryFn: () => productsAPI.getByCode(code),
        enabled: !!code,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get product by barcode/EAN
 */
export function useProductByBarcode(
    barcode: string,
    options?: Omit<UseQueryOptions<Product>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.byBarcode(barcode),
        queryFn: () => productsAPI.getByBarcode(barcode),
        enabled: !!barcode,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get product by ID
 */
export function useProduct(
    id: number,
    options?: Omit<UseQueryOptions<Product>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productsKeys.detail(id),
        queryFn: () => productsAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== MUTATIONS ====================

/**
 * Create product
 */
export function useCreateProduct(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateProductDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateProductDto) => productsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: productsKeys.stats() })
            queryClient.invalidateQueries({ queryKey: productsKeys.categories() })
        },
        ...options,
    })
}

/**
 * Update product
 */
export function useUpdateProduct(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateProductDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
            productsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: productsKeys.stats() })
            queryClient.invalidateQueries({ queryKey: productsKeys.categories() })
        },
        ...options,
    })
}

/**
 * Delete product
 */
export function useDeleteProduct(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => productsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: productsKeys.stats() })
        },
        ...options,
    })
}

/**
 * Adjust product stock
 */
export function useAdjustStock(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string; newStock: number },
            Error,
            { id: number; data: AdjustStockDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AdjustStockDto }) =>
            productsAPI.adjustStock(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: productsKeys.stats() })
            queryClient.invalidateQueries({ queryKey: productsKeys.lowStock() })
            queryClient.invalidateQueries({ queryKey: productsKeys.reorderNeeded() })
        },
        ...options,
    })
}

/**
 * Bulk update prices for multiple products
 */
export function useBulkPriceUpdate(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string; updatedCount: number },
            Error,
            BulkPriceUpdateDto
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BulkPriceUpdateDto) => productsAPI.bulkPriceUpdate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: productsKeys.stats() })
            // Invalidate all product details as we don't know which ones were updated
            queryClient.invalidateQueries({ queryKey: productsKeys.details() })
        },
        ...options,
    })
}

/**
 * Calculate sale price based on cost and profit margin
 */
export function useCalculatePrice(
    options?: Omit<
        UseMutationOptions<CalculatePriceResponse, Error, CalculatePriceDto>,
        'mutationFn'
    >
) {
    return useMutation({
        mutationFn: (data: CalculatePriceDto) => productsAPI.calculatePrice(data),
        ...options,
    })
}
