import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { clientsAPI } from './api'
import type {
    Client,
    ClientDetail,
    CreateClientDto,
    UpdateClientDto,
    ClientStats,
    ClientListFilters,
    ClientListResponse,
    BlockClientDto,
    Contact,
    CreateContactDto,
    UpdateContactDto,
    Address,
    CreateAddressDto,
    UpdateAddressDto,
} from './types'

// ==================== QUERY KEYS ====================
export const clientsKeys = {
    all: ['clients'] as const,
    lists: () => [...clientsKeys.all, 'list'] as const,
    list: (filters?: ClientListFilters) => [...clientsKeys.lists(), filters] as const,
    stats: () => [...clientsKeys.all, 'stats'] as const,
    details: () => [...clientsKeys.all, 'detail'] as const,
    detail: (id: number) => [...clientsKeys.details(), id] as const,
    byCompany: (companyId: number) => [...clientsKeys.all, 'by-company', companyId] as const,
    contacts: (clientId: number) => [...clientsKeys.detail(clientId), 'contacts'] as const,
    addresses: (clientId: number) => [...clientsKeys.detail(clientId), 'addresses'] as const,
}

// ==================== CLIENTS QUERIES ====================

/**
 * List all clients with optional filters
 */
export function useClients(
    filters?: ClientListFilters,
    options?: Omit<UseQueryOptions<ClientListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: clientsKeys.list(filters),
        queryFn: () => clientsAPI.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get client statistics
 */
export function useClientStats(
    options?: Omit<UseQueryOptions<ClientStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: clientsKeys.stats(),
        queryFn: () => clientsAPI.getStatistics(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get client by ID
 */
export function useClient(
    id: number,
    options?: Omit<UseQueryOptions<ClientDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: clientsKeys.detail(id),
        queryFn: () => clientsAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get client by company ID
 */
export function useClientByCompany(
    companyId: number,
    options?: Omit<UseQueryOptions<ClientDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: clientsKeys.byCompany(companyId),
        queryFn: () => clientsAPI.getByCompanyId(companyId),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== CLIENTS MUTATIONS ====================

/**
 * Create client
 */
export function useCreateClient(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateClientDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateClientDto) => clientsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: clientsKeys.stats() })
        },
        ...options,
    })
}

/**
 * Update client
 */
export function useUpdateClient(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateClientDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateClientDto }) =>
            clientsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.stats() })
        },
        ...options,
    })
}

/**
 * Delete client
 */
export function useDeleteClient(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, number>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => clientsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: clientsKeys.stats() })
        },
        ...options,
    })
}

/**
 * Block client
 */
export function useBlockClient(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: BlockClientDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: BlockClientDto }) =>
            clientsAPI.block(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.stats() })
        },
        ...options,
    })
}

/**
 * Unblock client
 */
export function useUnblockClient(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, number>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => clientsAPI.unblock(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.stats() })
        },
        ...options,
    })
}

// ==================== CONTACTS QUERIES ====================

/**
 * Get client contacts
 */
export function useClientContacts(
    clientId: number,
    options?: Omit<UseQueryOptions<Contact[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: clientsKeys.contacts(clientId),
        queryFn: () => clientsAPI.getContacts(clientId),
        enabled: !!clientId,
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
        mutationFn: (data: CreateContactDto) => clientsAPI.createContact(data),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.contacts(clientId) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(clientId) })
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
            { id: number; clientId: number; data: UpdateContactDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; clientId: number; data: UpdateContactDto }) =>
            clientsAPI.updateContact(id, data),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.contacts(clientId) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(clientId) })
        },
        ...options,
    })
}

/**
 * Delete contact
 */
export function useDeleteContact(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; clientId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; clientId: number }) => clientsAPI.deleteContact(id),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.contacts(clientId) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(clientId) })
        },
        ...options,
    })
}

// ==================== ADDRESSES QUERIES ====================

/**
 * Get client addresses
 */
export function useClientAddresses(
    clientId: number,
    options?: Omit<UseQueryOptions<Address[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: clientsKeys.addresses(clientId),
        queryFn: () => clientsAPI.getAddresses(clientId),
        enabled: !!clientId,
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
        mutationFn: (data: CreateAddressDto) => clientsAPI.createAddress(data),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.addresses(clientId) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(clientId) })
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
            { id: number; clientId: number; data: UpdateAddressDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; clientId: number; data: UpdateAddressDto }) =>
            clientsAPI.updateAddress(id, data),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.addresses(clientId) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(clientId) })
        },
        ...options,
    })
}

/**
 * Delete address
 */
export function useDeleteAddress(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; clientId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; clientId: number }) => clientsAPI.deleteAddress(id),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientsKeys.addresses(clientId) })
            queryClient.invalidateQueries({ queryKey: clientsKeys.detail(clientId) })
        },
        ...options,
    })
}
