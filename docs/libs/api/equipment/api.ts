import { apiClient, type RequestConfig } from '../client'
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

class EquipmentAPI {
    private baseUrl = '/equipment'

    // ==================== EQUIPMENT CRUD ====================

    /**
     * List equipment with filters
     */
    async listEquipment(filters?: EquipmentListFilters, config?: RequestConfig): Promise<EquipmentListResponse> {
        const params = new URLSearchParams()

        if (filters?.modelId) params.append('modelId', String(filters.modelId))
        if (filters?.responsibleId) params.append('responsibleId', String(filters.responsibleId))
        if (filters?.userId) params.append('userId', String(filters.userId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.location) params.append('location', filters.location)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.active !== undefined) params.append('active', String(filters.active))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<EquipmentListResponse>(url, config)
    }

    /**
     * Get equipment dashboard statistics
     */
    async getDashboardStats(config?: RequestConfig): Promise<EquipmentDashboardStats> {
        return apiClient.get<EquipmentDashboardStats>(`${this.baseUrl}/dashboard`, config)
    }

    /**
     * Get equipment by ID
     */
    async getEquipmentById(id: number, config?: RequestConfig): Promise<Equipment> {
        return apiClient.get<Equipment>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create equipment
     */
    async createEquipment(data: CreateEquipmentDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Equipment created successfully',
            }
        )
    }

    /**
     * Update equipment
     */
    async updateEquipment(
        id: number,
        data: UpdateEquipmentDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Equipment updated successfully',
            }
        )
    }

    /**
     * Delete equipment
     */
    async deleteEquipment(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Equipment deleted successfully',
            }
        )
    }

    // ==================== EQUIPMENT MAINTENANCE ====================

    /**
     * Get equipment maintenance history
     */
    async getEquipmentMaintenance(equipmentId: number, config?: RequestConfig): Promise<EquipmentMaintenance[]> {
        return apiClient.get<EquipmentMaintenance[]>(`${this.baseUrl}/${equipmentId}/maintenance`, config)
    }

    /**
     * Get upcoming maintenances (next 30 days)
     */
    async getUpcomingMaintenances(config?: RequestConfig): Promise<EquipmentMaintenance[]> {
        return apiClient.get<EquipmentMaintenance[]>(`${this.baseUrl}/maintenance/upcoming`, config)
    }

    /**
     * Get maintenance statistics
     */
    async getMaintenanceStatistics(config?: RequestConfig): Promise<MaintenanceStats> {
        return apiClient.get<MaintenanceStats>(`${this.baseUrl}/maintenance/statistics`, config)
    }

    /**
     * Create maintenance record
     */
    async createMaintenance(data: CreateMaintenanceDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/maintenance`,
            data,
            {
                ...config,
                successMessage: 'Maintenance scheduled successfully',
            }
        )
    }

    /**
     * Update maintenance record
     */
    async updateMaintenance(
        id: number,
        data: UpdateMaintenanceDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/maintenance/${id}`,
            data,
            {
                ...config,
                successMessage: 'Maintenance updated successfully',
            }
        )
    }

    /**
     * Delete maintenance record
     */
    async deleteMaintenance(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/maintenance/${id}`,
            {
                ...config,
                successMessage: 'Maintenance deleted successfully',
            }
        )
    }

    // ==================== EQUIPMENT ASSIGNMENTS ====================

    /**
     * Get equipment assignment history
     */
    async getEquipmentAssignments(equipmentId: number, config?: RequestConfig): Promise<EquipmentAssignment[]> {
        return apiClient.get<EquipmentAssignment[]>(`${this.baseUrl}/${equipmentId}/assignments`, config)
    }

    /**
     * Get current equipment assignment
     */
    async getCurrentAssignment(equipmentId: number, config?: RequestConfig): Promise<EquipmentAssignment | null> {
        return apiClient.get<EquipmentAssignment | null>(`${this.baseUrl}/${equipmentId}/current-assignment`, config)
    }

    /**
     * Get overdue equipment returns
     */
    async getOverdueReturns(config?: RequestConfig): Promise<EquipmentAssignment[]> {
        return apiClient.get<EquipmentAssignment[]>(`${this.baseUrl}/assignments/overdue`, config)
    }

    /**
     * Get assignment statistics
     */
    async getAssignmentStatistics(config?: RequestConfig): Promise<AssignmentStats> {
        return apiClient.get<AssignmentStats>(`${this.baseUrl}/assignments/statistics`, config)
    }

    /**
     * Create equipment assignment
     */
    async createAssignment(data: CreateAssignmentDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/assignments`,
            data,
            {
                ...config,
                successMessage: 'Equipment assigned successfully',
            }
        )
    }

    /**
     * Update assignment (mark as returned)
     */
    async updateAssignment(
        id: number,
        data: UpdateAssignmentDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/assignments/${id}`,
            data,
            {
                ...config,
                successMessage: 'Assignment updated successfully',
            }
        )
    }

    /**
     * Delete assignment record
     */
    async deleteAssignment(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/assignments/${id}`,
            {
                ...config,
                successMessage: 'Assignment deleted successfully',
            }
        )
    }

    // ==================== BRANDS ====================

    /**
     * List equipment brands
     */
    async listBrands(filters?: BrandListFilters, config?: RequestConfig): Promise<BrandListResponse> {
        const params = new URLSearchParams()

        if (filters?.active !== undefined) params.append('active', String(filters.active))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/brands${queryString ? `?${queryString}` : ''}`

        return apiClient.get<BrandListResponse>(url, config)
    }

    /**
     * Get equipment brand by ID
     */
    async getBrandById(id: number, config?: RequestConfig): Promise<Brand> {
        return apiClient.get<Brand>(`${this.baseUrl}/brands/${id}`, config)
    }

    /**
     * Create equipment brand
     */
    async createBrand(data: CreateBrandDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/brands`,
            data,
            {
                ...config,
                successMessage: 'Brand created successfully',
            }
        )
    }

    /**
     * Update equipment brand
     */
    async updateBrand(
        id: number,
        data: UpdateBrandDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/brands/${id}`,
            data,
            {
                ...config,
                successMessage: 'Brand updated successfully',
            }
        )
    }

    /**
     * Delete equipment brand
     */
    async deleteBrand(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/brands/${id}`,
            {
                ...config,
                successMessage: 'Brand deleted successfully',
            }
        )
    }

    /**
     * Get brands statistics
     */
    async getBrandsStatistics(config?: RequestConfig): Promise<any> {
        return apiClient.get<any>(`${this.baseUrl}/brands/statistics`, config)
    }

    // ==================== CATEGORIES ====================

    /**
     * List equipment categories
     */
    async listCategories(filters?: CategoryListFilters, config?: RequestConfig): Promise<CategoryListResponse> {
        const params = new URLSearchParams()

        if (filters?.active !== undefined) params.append('active', String(filters.active))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/categories${queryString ? `?${queryString}` : ''}`

        return apiClient.get<CategoryListResponse>(url, config)
    }

    /**
     * Get equipment category by ID
     */
    async getCategoryById(id: number, config?: RequestConfig): Promise<EquipmentCategory> {
        return apiClient.get<EquipmentCategory>(`${this.baseUrl}/categories/${id}`, config)
    }

    /**
     * Create equipment category
     */
    async createCategory(data: CreateCategoryDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/categories`,
            data,
            {
                ...config,
                successMessage: 'Category created successfully',
            }
        )
    }

    /**
     * Update equipment category
     */
    async updateCategory(
        id: number,
        data: UpdateCategoryDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/categories/${id}`,
            data,
            {
                ...config,
                successMessage: 'Category updated successfully',
            }
        )
    }

    /**
     * Delete equipment category
     */
    async deleteCategory(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/categories/${id}`,
            {
                ...config,
                successMessage: 'Category deleted successfully',
            }
        )
    }

    /**
     * Get categories statistics
     */
    async getCategoriesStatistics(config?: RequestConfig): Promise<any> {
        return apiClient.get<any>(`${this.baseUrl}/categories/statistics`, config)
    }

    // ==================== MODELS ====================

    /**
     * List equipment models
     */
    async listModels(filters?: ModelListFilters, config?: RequestConfig): Promise<ModelListResponse> {
        const params = new URLSearchParams()

        if (filters?.brandId) params.append('brandId', String(filters.brandId))
        if (filters?.categoryId) params.append('categoryId', String(filters.categoryId))
        if (filters?.active !== undefined) params.append('active', String(filters.active))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/models${queryString ? `?${queryString}` : ''}`

        return apiClient.get<ModelListResponse>(url, config)
    }

    /**
     * Get equipment model by ID
     */
    async getModelById(id: number, config?: RequestConfig): Promise<EquipmentModel> {
        return apiClient.get<EquipmentModel>(`${this.baseUrl}/models/${id}`, config)
    }

    /**
     * Create equipment model
     */
    async createModel(data: CreateModelDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/models`,
            data,
            {
                ...config,
                successMessage: 'Model created successfully',
            }
        )
    }

    /**
     * Update equipment model
     */
    async updateModel(
        id: number,
        data: UpdateModelDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/models/${id}`,
            data,
            {
                ...config,
                successMessage: 'Model updated successfully',
            }
        )
    }

    /**
     * Delete equipment model
     */
    async deleteModel(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/models/${id}`,
            {
                ...config,
                successMessage: 'Model deleted successfully',
            }
        )
    }

    /**
     * Get models statistics
     */
    async getModelsStatistics(config?: RequestConfig): Promise<any> {
        return apiClient.get<any>(`${this.baseUrl}/models/statistics`, config)
    }
}

export const equipmentAPI = new EquipmentAPI()
