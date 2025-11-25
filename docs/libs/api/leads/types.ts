// ==================== ENUMS ====================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export type LeadSource = 'website' | 'referral' | 'campaign' | 'cold_call' | 'social_media' | 'event' | 'other'

// ==================== LEAD ====================

export interface Lead {
    id: number
    title: string
    fullName: string
    email?: string
    phone?: string
    companyName?: string
    jobTitle?: string
    source?: LeadSource
    status: LeadStatus
    estimatedValue?: number
    probability?: number
    expectedCloseDate?: string
    notes?: string
    companyId?: number
    company_name_ref?: string
    assignedTo?: number
    assigned_to_name?: string
    convertedToClientId?: number
    converted_to_client_name?: string
    convertedAt?: string
    lostReason?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

// ==================== CREATE/UPDATE DTOS ====================

export interface CreateLeadDto {
    title: string
    fullName: string
    email?: string
    phone?: string
    companyName?: string
    jobTitle?: string
    source?: LeadSource
    status?: LeadStatus
    estimatedValue?: number
    probability?: number
    expectedCloseDate?: string
    notes?: string
    companyId?: number
    assignedTo?: number
}

export interface UpdateLeadDto {
    title?: string
    fullName?: string
    email?: string
    phone?: string
    companyName?: string
    jobTitle?: string
    source?: LeadSource
    status?: LeadStatus
    estimatedValue?: number
    probability?: number
    expectedCloseDate?: string
    notes?: string
    companyId?: number
    assignedTo?: number
}

export interface ConvertLeadDto {
    convertedToClientId: number
}

export interface LoseLeadDto {
    lostReason: string
}

// ==================== FILTERS & LISTS ====================

export interface LeadListFilters {
    status?: LeadStatus
    source?: LeadSource
    assignedTo?: number
    companyId?: number
    searchText?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface LeadListResponse {
    data: Lead[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ==================== STATISTICS ====================

export interface LeadStats {
    totalLeads: number
    newLeads: number
    contactedLeads: number
    qualifiedLeads: number
    convertedLeads: number
    lostLeads: number
    conversionRate: number
    leadsThisMonth: number
    totalEstimatedValue: number
    bySource: Array<{
        source: LeadSource
        count: number
        conversionRate: number
    }>
    byStatus: Array<{
        status: LeadStatus
        count: number
    }>
    topAssignedUsers: Array<{
        userId: number
        userName: string
        leadCount: number
        conversionRate: number
    }>
    recentLeads: Lead[]
}
