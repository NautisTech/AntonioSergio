// ==================== NEWSLETTER SUBSCRIPTION ====================

export interface SubscribeNewsletterDto {
    email: string
    lang: string
    tenantId: number
}

export interface UnsubscribeNewsletterDto {
    email: string
    tenantId: number
}

// ==================== NEWSLETTER SUBSCRIBER ====================

export interface NewsletterSubscriber {
    id: number
    email: string
    language: string
    active: boolean
    createdAt: string
}

// ==================== NEWSLETTER TEMPLATES ====================

export interface NewsletterTemplate {
    header: string
    greeting: string
    intro: string
    cta_text: string
    button_text: string
    footer_subscribed: string
    footer_unsubscribe: string
    subject_prefix: string
}

export interface NewsletterTemplates {
    templates: Record<string, NewsletterTemplate>
}

export interface SaveNewsletterTemplatesDto {
    templates: Record<string, NewsletterTemplate>
}

// ==================== SEND NEWSLETTER ====================

export interface SendNewsletterDto {
    title: string
    url: string
    language?: string
    customHtml?: string
}

export interface SendTestNewsletterDto {
    email: string
    title: string
    url: string
    language: string
}

// ==================== FILTERS & RESPONSES ====================

export interface ListSubscribersFilters {
    language?: string
    active?: boolean
    search?: string
    page?: number
    pageSize?: number
}

export interface SubscriberListResponse {
    data: NewsletterSubscriber[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

// ==================== STATISTICS ====================

export interface NewsletterStats {
    totalSubscribers: number
    activeSubscribers: number
    inactiveSubscribers: number
    byLanguage: Record<string, number>
    newThisMonth: number
}

export interface NewsletterSendResult {
    sent: number
    failed: number
    total: number
    failedEmails: string[]
}
