// ==================== COMPANY TYPES ====================

export interface Company {
    id: number
    code: string
    name: string
    tradeName?: string
    legalName?: string
    taxId?: string
    logoUrl?: string
    color?: string
    companyType?: 'client' | 'supplier' | 'partner' | 'internal'
    legalNature?: 'LDA' | 'SA' | 'Unipessoal' | 'ENI' | 'SGPS'
    shareCapital?: number
    registrationNumber?: string
    incorporationDate?: string
    segment?: string
    industrySector?: string
    caeCode?: string
    clientNumber?: string
    supplierNumber?: string
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days'
    preferredPaymentMethod?: 'bank_transfer' | 'cash' | 'check' | 'credit_card' | 'mb_way'
    creditLimit?: number
    commercialDiscount?: number
    rating?: number
    status?: 'active' | 'inactive' | 'pending' | 'suspended'
    notes?: string
    externalRef?: string
    phcId?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CompanyDetail extends Company {
    contacts?: Contact[]
    addresses?: Address[]
}

export interface CreateCompanyDto {
    code: string
    name: string
    tradeName?: string
    legalName?: string
    taxId?: string
    logoUrl?: string
    color?: string
    companyType?: 'client' | 'supplier' | 'partner' | 'internal'
    legalNature?: 'LDA' | 'SA' | 'Unipessoal' | 'ENI' | 'SGPS'
    shareCapital?: number
    registrationNumber?: string
    incorporationDate?: string
    segment?: string
    industrySector?: string
    caeCode?: string
    clientNumber?: string
    supplierNumber?: string
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days'
    preferredPaymentMethod?: 'bank_transfer' | 'cash' | 'check' | 'credit_card' | 'mb_way'
    creditLimit?: number
    commercialDiscount?: number
    rating?: number
    status?: 'active' | 'inactive' | 'pending' | 'suspended'
    notes?: string
    externalRef?: string
    phcId?: string
}

export interface UpdateCompanyDto {
    code?: string
    name?: string
    tradeName?: string
    legalName?: string
    taxId?: string
    logoUrl?: string
    color?: string
    companyType?: 'client' | 'supplier' | 'partner' | 'internal'
    legalNature?: 'LDA' | 'SA' | 'Unipessoal' | 'ENI' | 'SGPS'
    shareCapital?: number
    registrationNumber?: string
    incorporationDate?: string
    segment?: string
    industrySector?: string
    caeCode?: string
    clientNumber?: string
    supplierNumber?: string
    paymentTerms?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days'
    preferredPaymentMethod?: 'bank_transfer' | 'cash' | 'check' | 'credit_card' | 'mb_way'
    creditLimit?: number
    commercialDiscount?: number
    rating?: number
    status?: 'active' | 'inactive' | 'pending' | 'suspended'
    notes?: string
    externalRef?: string
    phcId?: string
}

export interface CompanyStats {
    totalCompanies: number
    activeCompanies: number
    clients: number
    suppliers: number
    partners: number
    companiesThisMonth: number
}

export interface CompanyListFilters {
    companyType?: 'client' | 'supplier' | 'partner' | 'internal'
    status?: 'active' | 'inactive' | 'pending' | 'suspended'
    searchText?: string
    page?: number
    pageSize?: number
}

export interface CompanyListResponse {
    data: Company[]
    total: number
    page: number
    pageSize: number
}

// ==================== CONTACT TYPES ====================

export interface Contact {
    id: number
    entityType: 'company' | 'person'
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
    companyId: number
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
    entityType: 'company' | 'person'
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
    companyId: number
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
