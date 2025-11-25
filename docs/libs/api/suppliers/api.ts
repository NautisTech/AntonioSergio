import { apiClient, type RequestConfig } from '../client'
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

class SuppliersAPI {
    private baseUrl = '/suppliers'

    // ==================== SUPPLIERS CRUD ====================

    /**
     * Create new supplier
     */
    async create(data: CreateSupplierDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Supplier created successfully',
            }
        )
    }

    /**
     * List all suppliers with optional filters
     */
    async list(filters?: SupplierListFilters, config?: RequestConfig): Promise<SupplierListResponse> {
        const params = new URLSearchParams()

        if (filters?.supplierType) params.append('supplierType', filters.supplierType)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.companyId) params.append('companyId', String(filters.companyId))
        if (filters?.searchText) params.append('searchText', filters.searchText)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<SupplierListResponse>(url, config)
    }

    /**
     * Get supplier statistics
     */
    async getStatistics(config?: RequestConfig): Promise<SupplierStats> {
        return apiClient.get<SupplierStats>(`${this.baseUrl}/statistics`, config)
    }

    /**
     * Get supplier by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<SupplierDetail> {
        return apiClient.get<SupplierDetail>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Get supplier by company ID
     */
    async getByCompanyId(companyId: number, config?: RequestConfig): Promise<SupplierDetail> {
        return apiClient.get<SupplierDetail>(`${this.baseUrl}/company/${companyId}`, config)
    }

    /**
     * Update supplier
     */
    async update(
        id: number,
        data: UpdateSupplierDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Supplier updated successfully',
            }
        )
    }

    /**
     * Delete supplier (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Supplier deleted successfully',
            }
        )
    }

    /**
     * Block supplier with reason
     */
    async block(
        id: number,
        data: BlockSupplierDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.patch<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/block`,
            data,
            {
                ...config,
                successMessage: 'Supplier blocked successfully',
            }
        )
    }

    /**
     * Unblock supplier
     */
    async unblock(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.patch<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/unblock`,
            {},
            {
                ...config,
                successMessage: 'Supplier unblocked successfully',
            }
        )
    }

    // ==================== CONTACTS MANAGEMENT ====================

    /**
     * Get supplier contacts
     */
    async getContacts(supplierId: number, config?: RequestConfig): Promise<SupplierContact[]> {
        return apiClient.get<SupplierContact[]>(`${this.baseUrl}/${supplierId}/contacts`, config)
    }

    /**
     * Create supplier contact
     */
    async createContact(
        data: CreateContactDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/contacts`,
            data,
            {
                ...config,
                successMessage: 'Contact created successfully',
            }
        )
    }

    /**
     * Update supplier contact
     */
    async updateContact(
        id: number,
        data: UpdateContactDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/contacts/${id}`,
            data,
            {
                ...config,
                successMessage: 'Contact updated successfully',
            }
        )
    }

    /**
     * Delete supplier contact
     */
    async deleteContact(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/contacts/${id}`,
            {
                ...config,
                successMessage: 'Contact deleted successfully',
            }
        )
    }

    // ==================== ADDRESSES MANAGEMENT ====================

    /**
     * Get supplier addresses
     */
    async getAddresses(supplierId: number, config?: RequestConfig): Promise<SupplierAddress[]> {
        return apiClient.get<SupplierAddress[]>(`${this.baseUrl}/${supplierId}/addresses`, config)
    }

    /**
     * Create supplier address
     */
    async createAddress(
        data: CreateAddressDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/addresses`,
            data,
            {
                ...config,
                successMessage: 'Address created successfully',
            }
        )
    }

    /**
     * Update supplier address
     */
    async updateAddress(
        id: number,
        data: UpdateAddressDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/addresses/${id}`,
            data,
            {
                ...config,
                successMessage: 'Address updated successfully',
            }
        )
    }

    /**
     * Delete supplier address
     */
    async deleteAddress(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/addresses/${id}`,
            {
                ...config,
                successMessage: 'Address deleted successfully',
            }
        )
    }
}

export const suppliersAPI = new SuppliersAPI()
