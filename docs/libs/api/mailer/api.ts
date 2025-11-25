import { apiClient, type RequestConfig } from '../client'
import type {
    SubscribeNewsletterDto,
    UnsubscribeNewsletterDto,
    ListSubscribersFilters,
    SubscriberListResponse,
    NewsletterStats,
    SendNewsletterDto,
    SendTestNewsletterDto,
    NewsletterSendResult,
    NewsletterTemplates,
    SaveNewsletterTemplatesDto,
} from './types'

class MailerAPI {
    private baseUrl = '/mailer'

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Subscribe to newsletter (public endpoint)
     */
    async subscribe(
        data: SubscribeNewsletterDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/public/newsletter/subscribe`,
            data,
            {
                ...config,
                successMessage: 'Subscribed successfully',
            }
        )
    }

    /**
     * Unsubscribe from newsletter (public endpoint)
     */
    async unsubscribe(
        data: UnsubscribeNewsletterDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/public/newsletter/unsubscribe`,
            data,
            {
                ...config,
                successMessage: 'Unsubscribed successfully',
            }
        )
    }

    // ==================== SUBSCRIBERS MANAGEMENT ====================

    /**
     * List newsletter subscribers
     */
    async listSubscribers(
        filters?: ListSubscribersFilters,
        config?: RequestConfig
    ): Promise<SubscriberListResponse> {
        const params = new URLSearchParams()

        if (filters?.language) params.append('language', filters.language)
        if (filters?.active !== undefined) params.append('active', String(filters.active))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/newsletter/subscribers${queryString ? `?${queryString}` : ''}`

        return apiClient.get<SubscriberListResponse>(url, config)
    }

    /**
     * Get newsletter statistics
     */
    async getStatistics(config?: RequestConfig): Promise<NewsletterStats> {
        return apiClient.get<NewsletterStats>(`${this.baseUrl}/newsletter/stats`, config)
    }

    // ==================== NEWSLETTER SENDING ====================

    /**
     * Send newsletter to all active subscribers
     */
    async sendNewsletter(
        data: SendNewsletterDto,
        config?: RequestConfig
    ): Promise<NewsletterSendResult> {
        return apiClient.post<NewsletterSendResult>(`${this.baseUrl}/newsletter/send`, data, {
            ...config,
            successMessage: 'Newsletter sent successfully',
        })
    }

    /**
     * Send test newsletter to specific email
     */
    async sendTestNewsletter(
        data: SendTestNewsletterDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/newsletter/send-test`,
            data,
            {
                ...config,
                successMessage: 'Test newsletter sent successfully',
            }
        )
    }

    // ==================== TEMPLATES MANAGEMENT ====================

    /**
     * Get newsletter email templates
     */
    async getTemplates(config?: RequestConfig): Promise<NewsletterTemplates> {
        return apiClient.get<NewsletterTemplates>(`${this.baseUrl}/newsletter/templates`, config)
    }

    /**
     * Save newsletter email templates
     */
    async saveTemplates(
        data: SaveNewsletterTemplatesDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/newsletter/templates`,
            data,
            {
                ...config,
                successMessage: 'Templates saved successfully',
            }
        )
    }
}

export const mailerAPI = new MailerAPI()
