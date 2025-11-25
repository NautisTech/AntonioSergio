import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { suppliersAPI } from './api'
import type {
    Supplier,
    SupplierDetail,
    CreateSupplierDto,
    UpdateSupplierDto,
    SupplierListFilters,
    SupplierListResponse,
    SupplierStats,
    BlockSupplierDto,
    SupplierContact,
    CreateContactDto,
    UpdateContactDto,
    SupplierAddress,
    CreateAddressDto,
    UpdateAddressDto,
} from './types'

// ==================== QUERY KEYS ====================
export const suppliersKeys = {
    all: ['suppliers'] as const,
    lists: () => [...suppliersKeys.all, 'list'] as const,
    list: (filters?: SupplierListFilters) => [...suppliersKeys.lists(), filters] as const,
    stats: () => [...suppliersKeys.all, 'stats'] as const,
    details: () => [...suppliersKeys.all, 'detail'] as const,
    detail: (id: number) => [...suppliersKeys.details(), id] as const,
    byCompany: (companyId: number) => [...suppliersKeys.all, 'by-company', companyId] as const,
    contacts: (supplierId: number) => [...suppliersKeys.detail(supplierId), 'contacts'] as const,
    addresses: (supplierId: number) => [...suppliersKeys.detail(supplierId), 'addresses'] as const,
}

// ==================== SUPPLIERS QUERIES ====================

/**
 * List all suppliers with optional filters
 */
export function useSuppliers(
    filters?: SupplierListFilters,
    options?: Omit<UseQueryOptions<SupplierListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: suppliersKeys.list(filters),
        queryFn: () => suppliersAPI.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get supplier statistics
 */
export function useSupplierStats(
    options?: Omit<UseQueryOptions<SupplierStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: suppliersKeys.stats(),
        queryFn: () => suppliersAPI.getStatistics(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get supplier by ID
 */
export function useSupplier(
    id: number,
    options?: Omit<UseQueryOptions<SupplierDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: suppliersKeys.detail(id),
        queryFn: () => suppliersAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get supplier by company ID
 */
export function useSupplierByCompany(
    companyId: number,
    options?: Omit<UseQueryOptions<SupplierDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: suppliersKeys.byCompany(companyId),
        queryFn: () => suppliersAPI.getByCompanyId(companyId),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== SUPPLIERS MUTATIONS ====================

/**
 * Create supplier
 */
export function useCreateSupplier(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateSupplierDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateSupplierDto) => suppliersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.stats() })
        },
        ...options,
    })
}

/**
 * Update supplier
 */
export function useUpdateSupplier(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateSupplierDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateSupplierDto }) =>
            suppliersAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.stats() })
        },
        ...options,
    })
}

/**
 * Delete supplier
 */
export function useDeleteSupplier(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => suppliersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.stats() })
        },
        ...options,
    })
}

/**
 * Block supplier
 */
export function useBlockSupplier(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: BlockSupplierDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: BlockSupplierDto }) =>
            suppliersAPI.block(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.stats() })
        },
        ...options,
    })
}

/**
 * Unblock supplier
 */
export function useUnblockSupplier(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => suppliersAPI.unblock(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.stats() })
        },
        ...options,
    })
}

// ==================== CONTACTS QUERIES ====================

/**
 * Get supplier contacts
 */
export function useSupplierContacts(
    supplierId: number,
    options?: Omit<UseQueryOptions<SupplierContact[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: suppliersKeys.contacts(supplierId),
        queryFn: () => suppliersAPI.getContacts(supplierId),
        enabled: !!supplierId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== CONTACTS MUTATIONS ====================

/**
 * Create contact
 */
export function useCreateContact(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateContactDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateContactDto) => suppliersAPI.createContact(data),
        onSuccess: (_, { supplierId }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.contacts(supplierId) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(supplierId) })
        },
        ...options,
    })
}

/**
 * Update contact
 */
export function useUpdateContact(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; supplierId: number; data: UpdateContactDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; supplierId: number; data: UpdateContactDto }) =>
            suppliersAPI.updateContact(id, data),
        onSuccess: (_, { supplierId }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.contacts(supplierId) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(supplierId) })
        },
        ...options,
    })
}

/**
 * Delete contact
 */
export function useDeleteContact(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; supplierId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; supplierId: number }) => suppliersAPI.deleteContact(id),
        onSuccess: (_, { supplierId }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.contacts(supplierId) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(supplierId) })
        },
        ...options,
    })
}

// ==================== ADDRESSES QUERIES ====================

/**
 * Get supplier addresses
 */
export function useSupplierAddresses(
    supplierId: number,
    options?: Omit<UseQueryOptions<SupplierAddress[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: suppliersKeys.addresses(supplierId),
        queryFn: () => suppliersAPI.getAddresses(supplierId),
        enabled: !!supplierId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== ADDRESSES MUTATIONS ====================

/**
 * Create address
 */
export function useCreateAddress(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateAddressDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAddressDto) => suppliersAPI.createAddress(data),
        onSuccess: (_, { supplierId }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.addresses(supplierId) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(supplierId) })
        },
        ...options,
    })
}

/**
 * Update address
 */
export function useUpdateAddress(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; supplierId: number; data: UpdateAddressDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; supplierId: number; data: UpdateAddressDto }) =>
            suppliersAPI.updateAddress(id, data),
        onSuccess: (_, { supplierId }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.addresses(supplierId) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(supplierId) })
        },
        ...options,
    })
}

/**
 * Delete address
 */
export function useDeleteAddress(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; supplierId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; supplierId: number }) => suppliersAPI.deleteAddress(id),
        onSuccess: (_, { supplierId }) => {
            queryClient.invalidateQueries({ queryKey: suppliersKeys.addresses(supplierId) })
            queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(supplierId) })
        },
        ...options,
    })
}
