import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { equipmentAPI } from './api'
import type {
    Equipment,
    CreateEquipmentDto,
    UpdateEquipmentDto,
    EquipmentListFilters,
    EquipmentListResponse,
    EquipmentDashboardStats,
    EquipmentMaintenance,
    CreateMaintenanceDto,
    UpdateMaintenanceDto,
    MaintenanceStats,
    EquipmentAssignment,
    CreateAssignmentDto,
    UpdateAssignmentDto,
    AssignmentStats,
    Brand,
    CreateBrandDto,
    UpdateBrandDto,
    BrandListFilters,
    BrandListResponse,
    EquipmentCategory,
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryListFilters,
    CategoryListResponse,
    EquipmentModel,
    CreateModelDto,
    UpdateModelDto,
    ModelListFilters,
    ModelListResponse,
} from './types'

// ==================== QUERY KEYS ====================
export const equipmentKeys = {
    all: ['equipment'] as const,

    // Equipment
    equipment: () => [...equipmentKeys.all, 'equipment'] as const,
    equipmentList: (filters?: EquipmentListFilters) => [...equipmentKeys.equipment(), 'list', filters] as const,
    equipmentDetail: (id: number) => [...equipmentKeys.equipment(), 'detail', id] as const,
    equipmentDashboard: () => [...equipmentKeys.equipment(), 'dashboard'] as const,

    // Maintenance
    maintenance: () => [...equipmentKeys.all, 'maintenance'] as const,
    equipmentMaintenance: (equipmentId: number) => [...equipmentKeys.maintenance(), 'equipment', equipmentId] as const,
    upcomingMaintenance: () => [...equipmentKeys.maintenance(), 'upcoming'] as const,
    maintenanceStats: () => [...equipmentKeys.maintenance(), 'stats'] as const,

    // Assignments
    assignments: () => [...equipmentKeys.all, 'assignments'] as const,
    equipmentAssignments: (equipmentId: number) => [...equipmentKeys.assignments(), 'equipment', equipmentId] as const,
    currentAssignment: (equipmentId: number) => [...equipmentKeys.assignments(), 'current', equipmentId] as const,
    overdueReturns: () => [...equipmentKeys.assignments(), 'overdue'] as const,
    assignmentStats: () => [...equipmentKeys.assignments(), 'stats'] as const,

    // Brands
    brands: () => [...equipmentKeys.all, 'brands'] as const,
    brandsList: (filters?: BrandListFilters) => [...equipmentKeys.brands(), 'list', filters] as const,
    brandDetail: (id: number) => [...equipmentKeys.brands(), 'detail', id] as const,
    brandsStats: () => [...equipmentKeys.brands(), 'stats'] as const,

    // Categories
    categories: () => [...equipmentKeys.all, 'categories'] as const,
    categoriesList: (filters?: CategoryListFilters) => [...equipmentKeys.categories(), 'list', filters] as const,
    categoryDetail: (id: number) => [...equipmentKeys.categories(), 'detail', id] as const,
    categoriesStats: () => [...equipmentKeys.categories(), 'stats'] as const,

    // Models
    models: () => [...equipmentKeys.all, 'models'] as const,
    modelsList: (filters?: ModelListFilters) => [...equipmentKeys.models(), 'list', filters] as const,
    modelDetail: (id: number) => [...equipmentKeys.models(), 'detail', id] as const,
    modelsStats: () => [...equipmentKeys.models(), 'stats'] as const,
}

// ==================== EQUIPMENT QUERIES ====================

export function useEquipment(
    filters?: EquipmentListFilters,
    options?: Omit<UseQueryOptions<EquipmentListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.equipmentList(filters),
        queryFn: () => equipmentAPI.listEquipment(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useEquipmentDashboard(
    options?: Omit<UseQueryOptions<EquipmentDashboardStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.equipmentDashboard(),
        queryFn: () => equipmentAPI.getDashboardStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useEquipmentById(
    id: number,
    options?: Omit<UseQueryOptions<Equipment>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.equipmentDetail(id),
        queryFn: () => equipmentAPI.getEquipmentById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== EQUIPMENT MUTATIONS ====================

export function useCreateEquipment(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateEquipmentDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEquipmentDto) => equipmentAPI.createEquipment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipment() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentDashboard() })
        },
        ...options,
    })
}

export function useUpdateEquipment(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateEquipmentDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateEquipmentDto }) =>
            equipmentAPI.updateEquipment(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipment() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentDetail(id) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentDashboard() })
        },
        ...options,
    })
}

export function useDeleteEquipment(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => equipmentAPI.deleteEquipment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipment() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentDashboard() })
        },
        ...options,
    })
}

// ==================== MAINTENANCE QUERIES ====================

export function useEquipmentMaintenance(
    equipmentId: number,
    options?: Omit<UseQueryOptions<EquipmentMaintenance[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.equipmentMaintenance(equipmentId),
        queryFn: () => equipmentAPI.getEquipmentMaintenance(equipmentId),
        enabled: !!equipmentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useUpcomingMaintenances(
    options?: Omit<UseQueryOptions<EquipmentMaintenance[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.upcomingMaintenance(),
        queryFn: () => equipmentAPI.getUpcomingMaintenances(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useMaintenanceStats(
    options?: Omit<UseQueryOptions<MaintenanceStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.maintenanceStats(),
        queryFn: () => equipmentAPI.getMaintenanceStatistics(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== MAINTENANCE MUTATIONS ====================

export function useCreateMaintenance(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateMaintenanceDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateMaintenanceDto) => equipmentAPI.createMaintenance(data),
        onSuccess: (_, { equipmentId }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentMaintenance(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.upcomingMaintenance() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.maintenanceStats() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentDetail(equipmentId) })
        },
        ...options,
    })
}

export function useUpdateMaintenance(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; equipmentId: number; data: UpdateMaintenanceDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; equipmentId: number; data: UpdateMaintenanceDto }) =>
            equipmentAPI.updateMaintenance(id, data),
        onSuccess: (_, { equipmentId }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentMaintenance(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.upcomingMaintenance() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.maintenanceStats() })
        },
        ...options,
    })
}

export function useDeleteMaintenance(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; equipmentId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; equipmentId: number }) => equipmentAPI.deleteMaintenance(id),
        onSuccess: (_, { equipmentId }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentMaintenance(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.upcomingMaintenance() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.maintenanceStats() })
        },
        ...options,
    })
}

// ==================== ASSIGNMENT QUERIES ====================

export function useEquipmentAssignments(
    equipmentId: number,
    options?: Omit<UseQueryOptions<EquipmentAssignment[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.equipmentAssignments(equipmentId),
        queryFn: () => equipmentAPI.getEquipmentAssignments(equipmentId),
        enabled: !!equipmentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useCurrentAssignment(
    equipmentId: number,
    options?: Omit<UseQueryOptions<EquipmentAssignment | null>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.currentAssignment(equipmentId),
        queryFn: () => equipmentAPI.getCurrentAssignment(equipmentId),
        enabled: !!equipmentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useOverdueReturns(
    options?: Omit<UseQueryOptions<EquipmentAssignment[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.overdueReturns(),
        queryFn: () => equipmentAPI.getOverdueReturns(),
        staleTime: 2 * 60 * 1000, // 2 minutes (alerts need fresher data)
        ...options,
    })
}

export function useAssignmentStats(
    options?: Omit<UseQueryOptions<AssignmentStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.assignmentStats(),
        queryFn: () => equipmentAPI.getAssignmentStatistics(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== ASSIGNMENT MUTATIONS ====================

export function useCreateAssignment(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateAssignmentDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAssignmentDto) => equipmentAPI.createAssignment(data),
        onSuccess: (_, { equipmentId }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentAssignments(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.currentAssignment(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.assignmentStats() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentDetail(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentDashboard() })
        },
        ...options,
    })
}

export function useUpdateAssignment(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; equipmentId: number; data: UpdateAssignmentDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; equipmentId: number; data: UpdateAssignmentDto }) =>
            equipmentAPI.updateAssignment(id, data),
        onSuccess: (_, { equipmentId }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentAssignments(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.currentAssignment(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.overdueReturns() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.assignmentStats() })
        },
        ...options,
    })
}

export function useDeleteAssignment(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; equipmentId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; equipmentId: number }) => equipmentAPI.deleteAssignment(id),
        onSuccess: (_, { equipmentId }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.equipmentAssignments(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.currentAssignment(equipmentId) })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.assignmentStats() })
        },
        ...options,
    })
}

// ==================== BRANDS QUERIES ====================

export function useBrands(
    filters?: BrandListFilters,
    options?: Omit<UseQueryOptions<BrandListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.brandsList(filters),
        queryFn: () => equipmentAPI.listBrands(filters),
        staleTime: 10 * 60 * 1000, // 10 minutes (reference data)
        ...options,
    })
}

export function useBrandById(
    id: number,
    options?: Omit<UseQueryOptions<Brand>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.brandDetail(id),
        queryFn: () => equipmentAPI.getBrandById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

export function useBrandsStats(
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.brandsStats(),
        queryFn: () => equipmentAPI.getBrandsStatistics(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

// ==================== BRANDS MUTATIONS ====================

export function useCreateBrand(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateBrandDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateBrandDto) => equipmentAPI.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.brands() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.brandsStats() })
        },
        ...options,
    })
}

export function useUpdateBrand(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateBrandDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateBrandDto }) =>
            equipmentAPI.updateBrand(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.brands() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.brandDetail(id) })
        },
        ...options,
    })
}

export function useDeleteBrand(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => equipmentAPI.deleteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.brands() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.brandsStats() })
        },
        ...options,
    })
}

// ==================== CATEGORIES QUERIES ====================

export function useCategories(
    filters?: CategoryListFilters,
    options?: Omit<UseQueryOptions<CategoryListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.categoriesList(filters),
        queryFn: () => equipmentAPI.listCategories(filters),
        staleTime: 10 * 60 * 1000, // 10 minutes (reference data)
        ...options,
    })
}

export function useCategoryById(
    id: number,
    options?: Omit<UseQueryOptions<EquipmentCategory>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.categoryDetail(id),
        queryFn: () => equipmentAPI.getCategoryById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

export function useCategoriesStats(
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.categoriesStats(),
        queryFn: () => equipmentAPI.getCategoriesStatistics(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

// ==================== CATEGORIES MUTATIONS ====================

export function useCreateCategory(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateCategoryDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCategoryDto) => equipmentAPI.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.categories() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.categoriesStats() })
        },
        ...options,
    })
}

export function useUpdateCategory(
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
            equipmentAPI.updateCategory(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.categories() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.categoryDetail(id) })
        },
        ...options,
    })
}

export function useDeleteCategory(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => equipmentAPI.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.categories() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.categoriesStats() })
        },
        ...options,
    })
}

// ==================== MODELS QUERIES ====================

export function useModels(
    filters?: ModelListFilters,
    options?: Omit<UseQueryOptions<ModelListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.modelsList(filters),
        queryFn: () => equipmentAPI.listModels(filters),
        staleTime: 10 * 60 * 1000, // 10 minutes (reference data)
        ...options,
    })
}

export function useModelById(
    id: number,
    options?: Omit<UseQueryOptions<EquipmentModel>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.modelDetail(id),
        queryFn: () => equipmentAPI.getModelById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

export function useModelsStats(
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: equipmentKeys.modelsStats(),
        queryFn: () => equipmentAPI.getModelsStatistics(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

// ==================== MODELS MUTATIONS ====================

export function useCreateModel(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateModelDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateModelDto) => equipmentAPI.createModel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.models() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.modelsStats() })
        },
        ...options,
    })
}

export function useUpdateModel(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateModelDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateModelDto }) =>
            equipmentAPI.updateModel(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.models() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.modelDetail(id) })
        },
        ...options,
    })
}

export function useDeleteModel(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => equipmentAPI.deleteModel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentKeys.models() })
            queryClient.invalidateQueries({ queryKey: equipmentKeys.modelsStats() })
        },
        ...options,
    })
}
