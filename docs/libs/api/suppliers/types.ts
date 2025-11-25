// ==================== SUPPLIER TYPES ====================

export interface Supplier {
    id: number
    code: string
    name: string
    taxId?: string
    supplierType?: 'manufacturer' | 'distributor' | 'wholesaler' | 'service_provider'
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days' | 'custom'
    rating?: number
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    notes?: string
    companyId?: number
    company_name?: string
    company_trade_name?: string
    company_tax_id?: string
    company_logo?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface SupplierDetail extends Supplier {
    contacts?: SupplierContact[]
    addresses?: SupplierAddress[]
}

export interface CreateSupplierDto {
    code: string
    name: string
    taxId?: string
    supplierType?: 'manufacturer' | 'distributor' | 'wholesaler' | 'service_provider'
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days' | 'custom'
    rating?: number
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    notes?: string
    companyId?: number
}

export interface UpdateSupplierDto {
    code?: string
    name?: string
    taxId?: string
    supplierType?: 'manufacturer' | 'distributor' | 'wholesaler' | 'service_provider'
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days' | 'custom'
    rating?: number
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    notes?: string
    companyId?: number
}

export interface SupplierListFilters {
    supplierType?: 'manufacturer' | 'distributor' | 'wholesaler' | 'service_provider'
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    companyId?: number
    searchText?: string
    page?: number
    pageSize?: number
}

export interface SupplierListResponse {
    data: Supplier[]
    total: number
    page: number
    pageSize: number
}

export interface SupplierStats {
    totalSuppliers: number
    activeSuppliers: number
    blockedSuppliers: number
    manufacturers: number
    distributors: number
    suppliersThisMonth: number
}

export interface BlockSupplierDto {
    reason: string
}

// ==================== CONTACT TYPES ====================

export interface SupplierContact {
    id: number
    entityType: 'supplier'
    entityId: number
    contactType: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social'
    contactValue: string
    label?: string
    isPrimary: boolean
    isActive: boolean
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateContactDto {
    supplierId: number
    contactType: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social'
    contactValue: string
    label?: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}

export interface UpdateContactDto {
    contactType?: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social'
    contactValue?: string
    label?: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}

// ==================== ADDRESS TYPES ====================

export interface SupplierAddress {
    id: number
    entityType: 'supplier'
    entityId: number
    addressType: 'headquarters' | 'warehouse' | 'branch' | 'billing' | 'shipping'
    street: string
    streetNumber?: string
    postalCode?: string
    city?: string
    region?: string
    country: string
    isPrimary: boolean
    isActive: boolean
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateAddressDto {
    supplierId: number
    addressType: 'headquarters' | 'warehouse' | 'branch' | 'billing' | 'shipping'
    street: string
    streetNumber?: string
    postalCode?: string
    city?: string
    region?: string
    country: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}

export interface UpdateAddressDto {
    addressType?: 'headquarters' | 'warehouse' | 'branch' | 'billing' | 'shipping'
    street?: string
    streetNumber?: string
    postalCode?: string
    city?: string
    region?: string
    country?: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}
