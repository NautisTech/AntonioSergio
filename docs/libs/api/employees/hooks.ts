import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { employeesAPI } from './api'
import type {
    Employee,
    EmployeeDetail,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    EmployeeListFilters,
    EmployeeListResponse,
    EmployeeType,
    EmployeeStats,
    EmployeeContact,
    CreateContactDto,
    UpdateContactDto,
    EmployeeAddress,
    CreateAddressDto,
    UpdateAddressDto,
    EmployeeBenefit,
    CreateBenefitDto,
    UpdateBenefitDto,
    EmployeeDocument,
    CreateDocumentDto,
    UpdateDocumentDto,
} from './types'

// ==================== QUERY KEYS ====================
export const employeesKeys = {
    all: ['employees'] as const,
    lists: () => [...employeesKeys.all, 'list'] as const,
    list: (filters?: EmployeeListFilters) => [...employeesKeys.lists(), filters] as const,
    types: () => [...employeesKeys.all, 'types'] as const,
    stats: () => [...employeesKeys.all, 'stats'] as const,
    details: () => [...employeesKeys.all, 'detail'] as const,
    detail: (id: number) => [...employeesKeys.details(), id] as const,
    contacts: (employeeId: number) => [...employeesKeys.detail(employeeId), 'contacts'] as const,
    addresses: (employeeId: number) => [...employeesKeys.detail(employeeId), 'addresses'] as const,
    benefits: (employeeId: number) => [...employeesKeys.detail(employeeId), 'benefits'] as const,
    documents: (employeeId: number) => [...employeesKeys.detail(employeeId), 'documents'] as const,
}

// ==================== EMPLOYEES QUERIES ====================

/**
 * List all employees with optional filters
 */
export function useEmployees(
    filters?: EmployeeListFilters,
    options?: Omit<UseQueryOptions<EmployeeListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.list(filters),
        queryFn: () => employeesAPI.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * List all employee types
 */
export function useEmployeeTypes(
    options?: Omit<UseQueryOptions<EmployeeType[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.types(),
        queryFn: () => employeesAPI.getEmployeeTypes(),
        staleTime: 30 * 60 * 1000, // 30 minutes - types rarely change
        ...options,
    })
}

/**
 * Get employee statistics
 */
export function useEmployeeStats(
    options?: Omit<UseQueryOptions<EmployeeStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.stats(),
        queryFn: () => employeesAPI.getStatistics(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get employee by ID
 */
export function useEmployee(
    id: number,
    options?: Omit<UseQueryOptions<EmployeeDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.detail(id),
        queryFn: () => employeesAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== EMPLOYEES MUTATIONS ====================

/**
 * Create employee
 */
export function useCreateEmployee(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateEmployeeDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEmployeeDto) => employeesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: employeesKeys.stats() })
        },
        ...options,
    })
}

/**
 * Update employee
 */
export function useUpdateEmployee(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateEmployeeDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDto }) =>
            employeesAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.stats() })
        },
        ...options,
    })
}

/**
 * Delete employee
 */
export function useDeleteEmployee(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => employeesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: employeesKeys.stats() })
        },
        ...options,
    })
}

// ==================== CONTACTS QUERIES ====================

/**
 * Get employee contacts
 */
export function useEmployeeContacts(
    employeeId: number,
    options?: Omit<UseQueryOptions<EmployeeContact[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.contacts(employeeId),
        queryFn: () => employeesAPI.getContacts(employeeId),
        enabled: !!employeeId,
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
        mutationFn: (data: CreateContactDto) => employeesAPI.createContact(data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.contacts(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
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
            { id: number; employeeId: number; data: UpdateContactDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; employeeId: number; data: UpdateContactDto }) =>
            employeesAPI.updateContact(id, data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.contacts(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

/**
 * Delete contact
 */
export function useDeleteContact(
    options?: Omit<UseMutationOptions<void, Error, { id: number; employeeId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; employeeId: number }) => employeesAPI.deleteContact(id),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.contacts(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

// ==================== ADDRESSES QUERIES ====================

/**
 * Get employee addresses
 */
export function useEmployeeAddresses(
    employeeId: number,
    options?: Omit<UseQueryOptions<EmployeeAddress[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.addresses(employeeId),
        queryFn: () => employeesAPI.getAddresses(employeeId),
        enabled: !!employeeId,
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
        mutationFn: (data: CreateAddressDto) => employeesAPI.createAddress(data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.addresses(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
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
            { id: number; employeeId: number; data: UpdateAddressDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; employeeId: number; data: UpdateAddressDto }) =>
            employeesAPI.updateAddress(id, data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.addresses(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

/**
 * Delete address
 */
export function useDeleteAddress(
    options?: Omit<UseMutationOptions<void, Error, { id: number; employeeId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; employeeId: number }) => employeesAPI.deleteAddress(id),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.addresses(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

// ==================== BENEFITS QUERIES ====================

/**
 * Get employee benefits
 */
export function useEmployeeBenefits(
    employeeId: number,
    options?: Omit<UseQueryOptions<EmployeeBenefit[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.benefits(employeeId),
        queryFn: () => employeesAPI.getBenefits(employeeId),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== BENEFITS MUTATIONS ====================

/**
 * Create benefit
 */
export function useCreateBenefit(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateBenefitDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateBenefitDto) => employeesAPI.createBenefit(data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.benefits(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

/**
 * Update benefit
 */
export function useUpdateBenefit(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; employeeId: number; data: UpdateBenefitDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; employeeId: number; data: UpdateBenefitDto }) =>
            employeesAPI.updateBenefit(id, data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.benefits(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

/**
 * Delete benefit
 */
export function useDeleteBenefit(
    options?: Omit<UseMutationOptions<void, Error, { id: number; employeeId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; employeeId: number }) => employeesAPI.deleteBenefit(id),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.benefits(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

// ==================== DOCUMENTS QUERIES ====================

/**
 * Get employee documents
 */
export function useEmployeeDocuments(
    employeeId: number,
    options?: Omit<UseQueryOptions<EmployeeDocument[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: employeesKeys.documents(employeeId),
        queryFn: () => employeesAPI.getDocuments(employeeId),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== DOCUMENTS MUTATIONS ====================

/**
 * Create document
 */
export function useCreateDocument(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateDocumentDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateDocumentDto) => employeesAPI.createDocument(data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.documents(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

/**
 * Update document
 */
export function useUpdateDocument(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; employeeId: number; data: UpdateDocumentDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; employeeId: number; data: UpdateDocumentDto }) =>
            employeesAPI.updateDocument(id, data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.documents(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}

/**
 * Delete document
 */
export function useDeleteDocument(
    options?: Omit<UseMutationOptions<void, Error, { id: number; employeeId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; employeeId: number }) => employeesAPI.deleteDocument(id),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.documents(employeeId) })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) })
        },
        ...options,
    })
}
