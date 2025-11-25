import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { companiesAPI } from './api'
import type {
    Company,
    CompanyDetail,
    CreateCompanyDto,
    UpdateCompanyDto,
    CompanyStats,
    CompanyListFilters,
    CompanyListResponse,
    Contact,
    CreateContactDto,
    UpdateContactDto,
    Address,
    CreateAddressDto,
    UpdateAddressDto,
} from './types'

// ==================== QUERY KEYS ====================
export const companiesKeys = {
    all: ['companies'] as const,
    lists: () => [...companiesKeys.all, 'list'] as const,
    list: (filters?: CompanyListFilters) => [...companiesKeys.lists(), filters] as const,
    stats: () => [...companiesKeys.all, 'stats'] as const,
    details: () => [...companiesKeys.all, 'detail'] as const,
    detail: (id: number) => [...companiesKeys.details(), id] as const,
    contacts: (companyId: number) => [...companiesKeys.detail(companyId), 'contacts'] as const,
    addresses: (companyId: number) => [...companiesKeys.detail(companyId), 'addresses'] as const,
}

// ==================== COMPANIES QUERIES ====================

/**
 * List all companies with optional filters
 */
export function useCompanies(
    filters?: CompanyListFilters,
    options?: Omit<UseQueryOptions<CompanyListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: companiesKeys.list(filters),
        queryFn: () => companiesAPI.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get company statistics
 */
export function useCompanyStats(
    options?: Omit<UseQueryOptions<CompanyStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: companiesKeys.stats(),
        queryFn: () => companiesAPI.getStatistics(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get company by ID
 */
export function useCompany(
    id: number,
    options?: Omit<UseQueryOptions<CompanyDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: companiesKeys.detail(id),
        queryFn: () => companiesAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== COMPANIES MUTATIONS ====================

/**
 * Create company
 */
export function useCreateCompany(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateCompanyDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCompanyDto) => companiesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: companiesKeys.stats() })
        },
        ...options,
    })
}

/**
 * Update company
 */
export function useUpdateCompany(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateCompanyDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCompanyDto }) =>
            companiesAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: companiesKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: companiesKeys.stats() })
        },
        ...options,
    })
}

/**
 * Delete company
 */
export function useDeleteCompany(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, number>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => companiesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: companiesKeys.stats() })
        },
        ...options,
    })
}

// ==================== CONTACTS QUERIES ====================

/**
 * Get company contacts
 */
export function useCompanyContacts(
    companyId: number,
    options?: Omit<UseQueryOptions<Contact[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: companiesKeys.contacts(companyId),
        queryFn: () => companiesAPI.getContacts(companyId),
        enabled: !!companyId,
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
        mutationFn: (data: CreateContactDto) => companiesAPI.createContact(data),
        onSuccess: (_, { companyId }) => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.contacts(companyId) })
            queryClient.invalidateQueries({ queryKey: companiesKeys.detail(companyId) })
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
            { id: number; companyId: number; data: UpdateContactDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; companyId: number; data: UpdateContactDto }) =>
            companiesAPI.updateContact(id, data),
        onSuccess: (_, { companyId }) => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.contacts(companyId) })
            queryClient.invalidateQueries({ queryKey: companiesKeys.detail(companyId) })
        },
        ...options,
    })
}

/**
 * Delete contact
 */
export function useDeleteContact(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; companyId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; companyId: number }) => companiesAPI.deleteContact(id),
        onSuccess: (_, { companyId }) => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.contacts(companyId) })
            queryClient.invalidateQueries({ queryKey: companiesKeys.detail(companyId) })
        },
        ...options,
    })
}

// ==================== ADDRESSES QUERIES ====================

/**
 * Get company addresses
 */
export function useCompanyAddresses(
    companyId: number,
    options?: Omit<UseQueryOptions<Address[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: companiesKeys.addresses(companyId),
        queryFn: () => companiesAPI.getAddresses(companyId),
        enabled: !!companyId,
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
        mutationFn: (data: CreateAddressDto) => companiesAPI.createAddress(data),
        onSuccess: (_, { companyId }) => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.addresses(companyId) })
            queryClient.invalidateQueries({ queryKey: companiesKeys.detail(companyId) })
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
            { id: number; companyId: number; data: UpdateAddressDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; companyId: number; data: UpdateAddressDto }) =>
            companiesAPI.updateAddress(id, data),
        onSuccess: (_, { companyId }) => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.addresses(companyId) })
            queryClient.invalidateQueries({ queryKey: companiesKeys.detail(companyId) })
        },
        ...options,
    })
}

/**
 * Delete address
 */
export function useDeleteAddress(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; companyId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; companyId: number }) => companiesAPI.deleteAddress(id),
        onSuccess: (_, { companyId }) => {
            queryClient.invalidateQueries({ queryKey: companiesKeys.addresses(companyId) })
            queryClient.invalidateQueries({ queryKey: companiesKeys.detail(companyId) })
        },
        ...options,
    })
}
