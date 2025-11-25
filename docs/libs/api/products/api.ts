import { apiClient, type RequestConfig } from '../client'
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

class ProductsAPI {
    private baseUrl = '/products'

    // ==================== GENERAL CRUD OPERATIONS ====================

    /**
     * List all products with filtering and pagination
     */
    async list(filters?: ProductListFilters, config?: RequestConfig): Promise<ProductListResponse> {
        const params = new URLSearchParams()

        if (filters?.type) params.append('type', filters.type)
        if (filters?.category) params.append('category', filters.category)
        if (filters?.subcategory) params.append('subcategory', filters.subcategory)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.active !== undefined) params.append('active', String(filters.active))
        if (filters?.isFeatured !== undefined) params.append('isFeatured', String(filters.isFeatured))
        if (filters?.visibleInCatalog !== undefined) params.append('visibleInCatalog', String(filters.visibleInCatalog))
        if (filters?.lowStock !== undefined) params.append('lowStock', String(filters.lowStock))
        if (filters?.outOfStock !== undefined) params.append('outOfStock', String(filters.outOfStock))
        if (filters?.supplierId) params.append('supplierId', String(filters.supplierId))
        if (filters?.minPrice) params.append('minPrice', String(filters.minPrice))
        if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<ProductListResponse>(url, config)
    }

    /**
     * Get product statistics
     */
    async getStats(config?: RequestConfig): Promise<ProductStats> {
        return apiClient.get<ProductStats>(`${this.baseUrl}/stats`, config)
    }

    /**
     * Get list of available product categories
     */
    async getCategories(config?: RequestConfig): Promise<Category[]> {
        return apiClient.get<Category[]>(`${this.baseUrl}/categories`, config)
    }

    /**
     * Get products with stock below minimum threshold
     */
    async getLowStock(config?: RequestConfig): Promise<Product[]> {
        return apiClient.get<Product[]>(`${this.baseUrl}/low-stock`, config)
    }

    /**
     * Get products that have reached reorder point
     */
    async getReorderNeeded(config?: RequestConfig): Promise<Product[]> {
        return apiClient.get<Product[]>(`${this.baseUrl}/reorder-needed`, config)
    }

    /**
     * Get product by code/SKU
     */
    async getByCode(code: string, config?: RequestConfig): Promise<Product> {
        return apiClient.get<Product>(`${this.baseUrl}/code/${encodeURIComponent(code)}`, config)
    }

    /**
     * Get product by barcode/EAN
     */
    async getByBarcode(barcode: string, config?: RequestConfig): Promise<Product> {
        return apiClient.get<Product>(`${this.baseUrl}/barcode/${encodeURIComponent(barcode)}`, config)
    }

    /**
     * Get product by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Product> {
        return apiClient.get<Product>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Create new product
     */
    async create(data: CreateProductDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Product created successfully',
            }
        )
    }

    /**
     * Update product
     */
    async update(
        id: number,
        data: UpdateProductDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Product updated successfully',
            }
        )
    }

    /**
     * Delete product (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Product deleted successfully',
            }
        )
    }

    // ==================== STOCK OPERATIONS ====================

    /**
     * Adjust product stock (add or subtract quantity)
     */
    async adjustStock(
        id: number,
        data: AdjustStockDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; newStock: number }> {
        return apiClient.patch<{ success: boolean; message: string; newStock: number }>(
            `${this.baseUrl}/${id}/stock`,
            data,
            {
                ...config,
                successMessage: 'Stock adjusted successfully',
            }
        )
    }

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk update prices for multiple products
     */
    async bulkPriceUpdate(
        data: BulkPriceUpdateDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; updatedCount: number }> {
        return apiClient.post<{ success: boolean; message: string; updatedCount: number }>(
            `${this.baseUrl}/bulk/price-update`,
            data,
            {
                ...config,
                successMessage: 'Prices updated successfully',
            }
        )
    }

    // ==================== UTILITIES ====================

    /**
     * Calculate sale price based on cost and profit margin
     */
    async calculatePrice(data: CalculatePriceDto, config?: RequestConfig): Promise<CalculatePriceResponse> {
        return apiClient.post<CalculatePriceResponse>(
            `${this.baseUrl}/calculate-price`,
            data,
            config
        )
    }
}

export const productsAPI = new ProductsAPI()
