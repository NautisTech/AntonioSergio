// ==================== ENUMS ====================

export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted'

export type QuoteType = 'standard' | 'custom' | 'recurring'

// ==================== QUOTE ITEMS ====================

export interface QuoteItem {
    id: number
    quoteId: number
    productId?: number
    product_name?: string
    lineNumber: number
    description: string
    quantity: number
    unitPrice: number
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
    taxAmount?: number
    lineTotal: number
    notes?: string
    createdAt: string
    updatedAt?: string
}

export interface CreateQuoteItemDto {
    productId?: number
    lineNumber: number
    description: string
    quantity: number
    unitPrice: number
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
    taxAmount?: number
    lineTotal: number
    notes?: string
}

export interface UpdateQuoteItemDto extends Partial<CreateQuoteItemDto> {}

// ==================== QUOTES ====================

export interface Quote {
    id: number
    quoteNumber: string
    companyId?: number
    company_name_ref?: string
    clientId: number
    client_name?: string
    client_email?: string
    assignedTo?: number
    assigned_to_name?: string
    title: string
    description?: string
    status: QuoteStatus
    type: QuoteType
    quoteDate: string
    validUntil: string
    sentAt?: string
    viewedAt?: string
    acceptedAt?: string
    rejectedAt?: string
    rejectionReason?: string
    rejectionNotes?: string
    acceptanceNotes?: string
    signature?: string
    notes?: string
    termsAndConditions?: string
    subtotal: number
    discountPercentage?: number
    discountAmount?: number
    discountTotal: number
    taxPercentage?: number
    taxTotal: number
    total: number
    items?: QuoteItem[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateQuoteDto {
    companyId?: number
    clientId: number
    assignedTo?: number
    title: string
    description?: string
    quoteDate: string
    validUntil: string
    notes?: string
    termsAndConditions?: string
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
    items: CreateQuoteItemDto[]
}

export interface UpdateQuoteDto {
    companyId?: number
    clientId?: number
    assignedTo?: number
    title?: string
    description?: string
    quoteDate?: string
    validUntil?: string
    status?: QuoteStatus
    notes?: string
    termsAndConditions?: string
    discountPercentage?: number
    discountAmount?: number
    taxPercentage?: number
}

// ==================== WORKFLOW DTOs ====================

export interface SendQuoteDto {
    sendEmail?: boolean
    emailMessage?: string
    ccEmails?: string[]
}

export interface AcceptQuoteDto {
    acceptanceNotes?: string
    signature?: string
}

export interface RejectQuoteDto {
    reason: string
    notes?: string
}

export interface CloneQuoteDto {
    newTitle?: string
    newClientId?: number
    newValidUntil?: string
    asDraft?: boolean
}

// ==================== FILTERS & RESPONSES ====================

export interface QuoteListFilters {
    status?: QuoteStatus
    clientId?: number
    assignedTo?: number
    companyId?: number
    startDate?: string
    endDate?: string
    minAmount?: number
    maxAmount?: number
    expired?: boolean
    expiringIn?: number
    page?: number
    pageSize?: number
}

export interface QuoteListResponse {
    data: Quote[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

// ==================== STATISTICS ====================

export interface QuoteStats {
    totalQuotes: number
    totalValue: number
    acceptedValue: number
    rejectedValue: number
    pendingValue: number
    expiredValue: number
    winRate: number
    averageValue: number
    averageTimeToClose: number
    expiredCount: number
    byStatus: {
        draft: { count: number; total: number }
        sent: { count: number; total: number }
        viewed: { count: number; total: number }
        accepted: { count: number; total: number }
        rejected: { count: number; total: number }
        expired: { count: number; total: number }
        converted: { count: number; total: number }
    }
    topClients: Array<{
        clientId: number
        clientName: string
        totalQuotes: number
        totalValue: number
        acceptedCount: number
        winRate: number
    }>
}

export interface ExpiringQuotesResponse {
    data: Quote[]
    expiringIn: number
}
