import { apiClient, type RequestConfig } from '../client'
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

class ClientsAPI {
    private baseUrl = '/clients'

    // ==================== CLIENTS CRUD ====================

    /**
     * Create new client
     */
    async create(data: CreateClientDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Client created successfully',
            }
        )
    }

    /**
     * List all clients with optional filters
     */
    async list(filters?: ClientListFilters, config?: RequestConfig): Promise<ClientListResponse> {
        const params = new URLSearchParams()

        if (filters?.clientType) params.append('clientType', filters.clientType)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.companyId) params.append('companyId', String(filters.companyId))
        if (filters?.searchText) params.append('searchText', filters.searchText)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<ClientListResponse>(url, config)
    }

    /**
     * Get client statistics
     */
    async getStatistics(config?: RequestConfig): Promise<ClientStats> {
        return apiClient.get<ClientStats>(`${this.baseUrl}/statistics`, config)
    }

    /**
     * Get client by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<ClientDetail> {
        return apiClient.get<ClientDetail>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Get client by company ID
     */
    async getByCompanyId(companyId: number, config?: RequestConfig): Promise<ClientDetail> {
        return apiClient.get<ClientDetail>(`${this.baseUrl}/company/${companyId}`, config)
    }

    /**
     * Update client
     */
    async update(
        id: number,
        data: UpdateClientDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Client updated successfully',
            }
        )
    }

    /**
     * Delete client (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Client deleted successfully',
            }
        )
    }

    /**
     * Block client
     */
    async block(id: number, data: BlockClientDto, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.patch<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/block`,
            data,
            {
                ...config,
                successMessage: 'Client blocked successfully',
            }
        )
    }

    /**
     * Unblock client
     */
    async unblock(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.patch<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/unblock`,
            {},
            {
                ...config,
                successMessage: 'Client unblocked successfully',
            }
        )
    }

    // ==================== CONTACTS MANAGEMENT ====================

    /**
     * Get client contacts
     */
    async getContacts(clientId: number, config?: RequestConfig): Promise<Contact[]> {
        return apiClient.get<Contact[]>(`${this.baseUrl}/${clientId}/contacts`, config)
    }

    /**
     * Add contact to client
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
     * Update client contact
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
     * Delete client contact
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
     * Get client addresses
     */
    async getAddresses(clientId: number, config?: RequestConfig): Promise<Address[]> {
        return apiClient.get<Address[]>(`${this.baseUrl}/${clientId}/addresses`, config)
    }

    /**
     * Add address to client
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
     * Update client address
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
     * Delete client address
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

export const clientsAPI = new ClientsAPI()
