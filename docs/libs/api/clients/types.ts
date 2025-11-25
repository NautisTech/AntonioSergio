// ==================== CLIENT TYPES ====================

export interface Client {
    id: number
    code: string
    name: string
    taxId?: string
    clientType?: 'individual' | 'corporate' | 'government' | 'reseller'
    segment?: string
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    rating?: number
    creditLimit?: number
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days' | 'custom'
    notes?: string
    companyId?: number
    // Company join fields (from backend)
    company_name?: string
    company_trade_name?: string
    company_tax_id?: string
    company_logo?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface ClientDetail extends Client {
    contacts?: Contact[]
    addresses?: Address[]
}

export interface CreateClientDto {
    code: string
    name: string
    taxId?: string
    clientType?: 'individual' | 'corporate' | 'government' | 'reseller'
    segment?: string
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    rating?: number
    creditLimit?: number
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days' | 'custom'
    notes?: string
    companyId?: number
}

export interface UpdateClientDto {
    code?: string
    name?: string
    taxId?: string
    clientType?: 'individual' | 'corporate' | 'government' | 'reseller'
    segment?: string
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    rating?: number
    creditLimit?: number
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days' | 'custom'
    notes?: string
    companyId?: number
}

export interface ClientStats {
    totalClients: number
    activeClients: number
    blockedClients: number
    individualClients: number
    corporateClients: number
    clientsThisMonth: number
}

export interface ClientListFilters {
    clientType?: 'individual' | 'corporate' | 'government' | 'reseller'
    status?: 'active' | 'inactive' | 'blocked' | 'pending'
    companyId?: number
    searchText?: string
    page?: number
    pageSize?: number
}

export interface ClientListResponse {
    data: Client[]
    total: number
    page: number
    pageSize: number
}

export interface BlockClientDto {
    reason: string
}

// ==================== CONTACT TYPES ====================

export interface Contact {
    id: number
    entityType: 'client' | 'company' | 'person'
    entityId: number
    contactType: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social_media'
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
    clientId: number
    contactType: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social_media'
    contactValue: string
    label?: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}

export interface UpdateContactDto {
    contactType?: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social_media'
    contactValue?: string
    label?: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}

// ==================== ADDRESS TYPES ====================

export interface Address {
    id: number
    entityType: 'client' | 'company' | 'person'
    entityId: number
    addressType: 'billing' | 'shipping' | 'headquarters' | 'branch' | 'warehouse'
    street?: string
    streetNumber?: string
    floor?: string
    apartment?: string
    postalCode?: string
    city?: string
    region?: string
    country?: string
    isPrimary: boolean
    isActive: boolean
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateAddressDto {
    clientId: number
    addressType: 'billing' | 'shipping' | 'headquarters' | 'branch' | 'warehouse'
    street?: string
    streetNumber?: string
    floor?: string
    apartment?: string
    postalCode?: string
    city?: string
    region?: string
    country?: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}

export interface UpdateAddressDto {
    addressType?: 'billing' | 'shipping' | 'headquarters' | 'branch' | 'warehouse'
    street?: string
    streetNumber?: string
    floor?: string
    apartment?: string
    postalCode?: string
    city?: string
    region?: string
    country?: string
    isPrimary?: boolean
    isActive?: boolean
    notes?: string
}
