import { apiClient, type RequestConfig } from '../client'
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

class EmployeesAPI {
    private baseUrl = '/employees'

    // ==================== EMPLOYEES CRUD ====================

    /**
     * Create new employee
     */
    async create(data: CreateEmployeeDto, config?: RequestConfig): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Employee created successfully',
            }
        )
    }

    /**
     * List all employees with optional filters
     */
    async list(filters?: EmployeeListFilters, config?: RequestConfig): Promise<EmployeeListResponse> {
        const params = new URLSearchParams()

        if (filters?.employeeTypeId) params.append('employeeTypeId', String(filters.employeeTypeId))
        if (filters?.companyId) params.append('companyId', String(filters.companyId))
        if (filters?.departmentId) params.append('departmentId', String(filters.departmentId))
        if (filters?.employmentStatus) params.append('employmentStatus', filters.employmentStatus)
        if (filters?.searchText) params.append('searchText', filters.searchText)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<EmployeeListResponse>(url, config)
    }

    /**
     * List all employee types
     */
    async getEmployeeTypes(config?: RequestConfig): Promise<EmployeeType[]> {
        return apiClient.get<EmployeeType[]>(`${this.baseUrl}/types`, config)
    }

    /**
     * Get employee statistics
     */
    async getStatistics(config?: RequestConfig): Promise<EmployeeStats> {
        return apiClient.get<EmployeeStats>(`${this.baseUrl}/statistics`, config)
    }

    /**
     * Get employee by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<EmployeeDetail> {
        return apiClient.get<EmployeeDetail>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Update employee
     */
    async update(
        id: number,
        data: UpdateEmployeeDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Employee updated successfully',
            }
        )
    }

    /**
     * Delete employee (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Employee deleted successfully',
            }
        )
    }

    // ==================== CONTACTS MANAGEMENT ====================

    /**
     * Get employee contacts
     */
    async getContacts(employeeId: number, config?: RequestConfig): Promise<EmployeeContact[]> {
        return apiClient.get<EmployeeContact[]>(`${this.baseUrl}/${employeeId}/contacts`, config)
    }

    /**
     * Create employee contact
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
     * Update employee contact
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
     * Delete employee contact
     */
    async deleteContact(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/contacts/${id}`,
            {
                ...config,
                successMessage: 'Contact deleted successfully',
            }
        )
    }

    // ==================== ADDRESSES MANAGEMENT ====================

    /**
     * Get employee addresses
     */
    async getAddresses(employeeId: number, config?: RequestConfig): Promise<EmployeeAddress[]> {
        return apiClient.get<EmployeeAddress[]>(`${this.baseUrl}/${employeeId}/addresses`, config)
    }

    /**
     * Create employee address
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
     * Update employee address
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
     * Delete employee address
     */
    async deleteAddress(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/addresses/${id}`,
            {
                ...config,
                successMessage: 'Address deleted successfully',
            }
        )
    }

    // ==================== BENEFITS MANAGEMENT ====================

    /**
     * Get employee benefits
     */
    async getBenefits(employeeId: number, config?: RequestConfig): Promise<EmployeeBenefit[]> {
        return apiClient.get<EmployeeBenefit[]>(`${this.baseUrl}/${employeeId}/benefits`, config)
    }

    /**
     * Create employee benefit
     */
    async createBenefit(
        data: CreateBenefitDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/benefits`,
            data,
            {
                ...config,
                successMessage: 'Benefit created successfully',
            }
        )
    }

    /**
     * Update employee benefit
     */
    async updateBenefit(
        id: number,
        data: UpdateBenefitDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/benefits/${id}`,
            data,
            {
                ...config,
                successMessage: 'Benefit updated successfully',
            }
        )
    }

    /**
     * Delete employee benefit
     */
    async deleteBenefit(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/benefits/${id}`,
            {
                ...config,
                successMessage: 'Benefit deleted successfully',
            }
        )
    }

    // ==================== DOCUMENTS MANAGEMENT ====================

    /**
     * Get employee documents
     */
    async getDocuments(employeeId: number, config?: RequestConfig): Promise<EmployeeDocument[]> {
        return apiClient.get<EmployeeDocument[]>(`${this.baseUrl}/${employeeId}/documents`, config)
    }

    /**
     * Create employee document
     */
    async createDocument(
        data: CreateDocumentDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/documents`,
            data,
            {
                ...config,
                successMessage: 'Document created successfully',
            }
        )
    }

    /**
     * Update employee document
     */
    async updateDocument(
        id: number,
        data: UpdateDocumentDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/documents/${id}`,
            data,
            {
                ...config,
                successMessage: 'Document updated successfully',
            }
        )
    }

    /**
     * Delete employee document
     */
    async deleteDocument(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/documents/${id}`,
            {
                ...config,
                successMessage: 'Document deleted successfully',
            }
        )
    }
}

export const employeesAPI = new EmployeesAPI()
