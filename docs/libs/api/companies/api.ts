import { apiClient, type RequestConfig } from '../client'
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

class CompaniesAPI {
    private baseUrl = '/companies'

    // ==================== COMPANIES CRUD ====================

    /**
     * Create new company
     */
    async create(data: CreateCompanyDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Company created successfully',
            }
        )
    }

    /**
     * List all companies with optional filters
     */
    async list(filters?: CompanyListFilters, config?: RequestConfig): Promise<CompanyListResponse> {
        const params = new URLSearchParams()

        if (filters?.companyType) params.append('companyType', filters.companyType)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.searchText) params.append('searchText', filters.searchText)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<CompanyListResponse>(url, config)
    }

    /**
     * Get company statistics
     */
    async getStatistics(config?: RequestConfig): Promise<CompanyStats> {
        return apiClient.get<CompanyStats>(`${this.baseUrl}/statistics`, config)
    }

    /**
     * Get company by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<CompanyDetail> {
        return apiClient.get<CompanyDetail>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Update company
     */
    async update(
        id: number,
        data: UpdateCompanyDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Company updated successfully',
            }
        )
    }

    /**
     * Delete company (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Company deleted successfully',
            }
        )
    }

    // ==================== CONTACTS MANAGEMENT ====================

    /**
     * Get company contacts
     */
    async getContacts(companyId: number, config?: RequestConfig): Promise<Contact[]> {
        return apiClient.get<Contact[]>(`${this.baseUrl}/${companyId}/contacts`, config)
    }

    /**
     * Add contact to company
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
                successMessage: 'Contact added successfully',
            }
        )
    }

    /**
     * Update company contact
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
     * Delete company contact
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
     * Get company addresses
     */
    async getAddresses(companyId: number, config?: RequestConfig): Promise<Address[]> {
        return apiClient.get<Address[]>(`${this.baseUrl}/${companyId}/addresses`, config)
    }

    /**
     * Add address to company
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
                successMessage: 'Address added successfully',
            }
        )
    }

    /**
     * Update company address
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
     * Delete company address
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

export const companiesAPI = new CompaniesAPI()
