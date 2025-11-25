import { apiClient, type RequestConfig } from '../client'
import type {
    EmailLog,
    SendEmailDto,
    SendBulkEmailDto,
    SendTemplateEmailDto,
    EmailConfig,
    EmailConfigDto,
    EmailListFilters,
    EmailStats,
    EmailSentResponse,
    BulkEmailSentResponse,
    EmailConfigTestResponse,
    EmailAccountProvider,
    ConnectEmailAccountDto,
    AccountListEmailsParams,
    AccountSendEmailDto,
    ModifyEmailDto,
    ReplyToEmailDto,
    ForwardEmailDto,
    EmailLabel,
    EmailMessage,
    EmailListResponse,
    ConnectionStatus,
    OAuthUrlResponse,
    OAuthCallbackResponse,
} from './types'

class EmailAPI {
    private baseUrl = '/email'

    // ==================== EMAIL SENDING ====================

    /**
     * Send email
     */
    async send(
        data: SendEmailDto,
        config?: RequestConfig
    ): Promise<EmailSentResponse> {
        return apiClient.post<EmailSentResponse>(
            `${this.baseUrl}/send`,
            data,
            {
                ...config,
                successMessage: 'Email sent successfully',
            }
        )
    }

    /**
     * Send bulk emails to multiple recipients
     */
    async sendBulk(
        data: SendBulkEmailDto,
        config?: RequestConfig
    ): Promise<BulkEmailSentResponse> {
        return apiClient.post<BulkEmailSentResponse>(
            `${this.baseUrl}/send-bulk`,
            data,
            {
                ...config,
                successMessage: 'Bulk emails sent successfully',
            }
        )
    }

    /**
     * Send template email
     */
    async sendTemplate(
        data: SendTemplateEmailDto,
        config?: RequestConfig
    ): Promise<EmailSentResponse> {
        return apiClient.post<EmailSentResponse>(
            `${this.baseUrl}/send-template`,
            data,
            {
                ...config,
                successMessage: 'Template email sent successfully',
            }
        )
    }

    // ==================== EMAIL HISTORY ====================

    /**
     * List sent emails with filtering and pagination
     */
    async list(filters?: EmailListFilters, config?: RequestConfig): Promise<EmailLog[]> {
        const params = new URLSearchParams()

        if (filters?.status) params.append('status', filters.status)
        if (filters?.to) params.append('to', filters.to)
        if (filters?.entityType) params.append('entityType', filters.entityType)
        if (filters?.entityId) params.append('entityId', String(filters.entityId))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<EmailLog[]>(url, config)
    }

    /**
     * Get email statistics
     */
    async getStats(config?: RequestConfig): Promise<EmailStats> {
        return apiClient.get<EmailStats>(`${this.baseUrl}/stats`, config)
    }

    /**
     * Get email by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<EmailLog> {
        return apiClient.get<EmailLog>(`${this.baseUrl}/${id}`, config)
    }

    // ==================== EMAIL CONFIGURATION ====================

    /**
     * Get email configuration for tenant
     */
    async getConfig(config?: RequestConfig): Promise<EmailConfig> {
        return apiClient.get<EmailConfig>(`${this.baseUrl}/settings/config`, config)
    }

    /**
     * Save email configuration for tenant
     */
    async saveConfig(
        data: EmailConfigDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/settings/config`,
            data,
            {
                ...config,
                successMessage: 'Email configuration saved successfully',
            }
        )
    }

    /**
     * Update email configuration for tenant
     */
    async updateConfig(
        data: EmailConfigDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/settings/config`,
            data,
            {
                ...config,
                successMessage: 'Email configuration updated successfully',
            }
        )
    }

    /**
     * Delete email configuration for tenant
     */
    async deleteConfig(config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/settings/config`,
            {
                ...config,
                successMessage: 'Email configuration deleted successfully',
            }
        )
    }

    /**
     * Test email configuration
     */
    async testConfig(
        data: EmailConfigDto,
        config?: RequestConfig
    ): Promise<EmailConfigTestResponse> {
        return apiClient.post<EmailConfigTestResponse>(
            `${this.baseUrl}/settings/test`,
            data,
            config
        )
    }
}

// ==================== EMAIL ACCOUNTS API (Google/Microsoft Integration) ====================

class EmailAccountsAPI {
    private baseUrl = '/email-accounts'

    // ==================== OAUTH & CONNECTION MANAGEMENT ====================

    /**
     * Get OAuth authorization URL for email provider
     */
    async getOAuthUrl(
        provider: EmailAccountProvider,
        config?: RequestConfig
    ): Promise<OAuthUrlResponse> {
        const params = new URLSearchParams({ provider })
        return apiClient.get<OAuthUrlResponse>(
            `${this.baseUrl}/oauth-url?${params.toString()}`,
            config
        )
    }

    /**
     * Handle OAuth callback (POST) - for manual token submission
     */
    async handleOAuthCallback(
        code: string,
        state: string,
        config?: RequestConfig
    ): Promise<OAuthCallbackResponse> {
        return apiClient.post<OAuthCallbackResponse>(
            `${this.baseUrl}/oauth-callback`,
            { code, state },
            {
                ...config,
                successMessage: 'Email account connected successfully',
            }
        )
    }

    /**
     * Connect email account with existing tokens
     */
    async connect(
        data: ConnectEmailAccountDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/connect`,
            data,
            {
                ...config,
                successMessage: 'Email account connected successfully',
            }
        )
    }

    /**
     * Disconnect email account
     */
    async disconnect(
        provider: EmailAccountProvider,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/disconnect/${provider}`,
            {
                ...config,
                successMessage: 'Email account disconnected successfully',
            }
        )
    }

    /**
     * Get email connection status
     */
    async getConnectionStatus(config?: RequestConfig): Promise<ConnectionStatus> {
        return apiClient.get<ConnectionStatus>(`${this.baseUrl}/connection-status`, config)
    }

    // ==================== EMAIL OPERATIONS ====================

    /**
     * List emails from connected account
     */
    async listEmails(
        params?: AccountListEmailsParams,
        config?: RequestConfig
    ): Promise<EmailListResponse> {
        const urlParams = new URLSearchParams()

        if (params?.pageSize) urlParams.append('pageSize', String(params.pageSize))
        if (params?.pageToken) urlParams.append('pageToken', params.pageToken)
        if (params?.query) urlParams.append('query', params.query)
        if (params?.labelIds) {
            params.labelIds.forEach(id => urlParams.append('labelIds', id))
        }
        if (params?.labels) {
            urlParams.append('labels', JSON.stringify(params.labels))
        }

        const queryString = urlParams.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<EmailListResponse>(url, config)
    }

    /**
     * Get email labels/folders
     */
    async getLabels(config?: RequestConfig): Promise<EmailLabel[]> {
        return apiClient.get<EmailLabel[]>(`${this.baseUrl}/labels`, config)
    }

    /**
     * Get specific email by ID
     */
    async getEmail(id: string, config?: RequestConfig): Promise<EmailMessage> {
        return apiClient.get<EmailMessage>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Send email via connected account
     */
    async sendEmail(
        data: AccountSendEmailDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; id?: string }> {
        return apiClient.post<{ success: boolean; message: string; id?: string }>(
            `${this.baseUrl}/send`,
            data,
            {
                ...config,
                successMessage: data.isDraft ? 'Draft saved successfully' : 'Email sent successfully',
            }
        )
    }

    /**
     * Modify email (read/unread, star/unstar, labels)
     */
    async modifyEmail(
        id: string,
        data: ModifyEmailDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.patch<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Email updated successfully',
            }
        )
    }

    /**
     * Download email attachment
     */
    async downloadAttachment(
        emailId: string,
        attachmentId: string,
        config?: RequestConfig
    ): Promise<Blob> {
        return apiClient.get<Blob>(
            `${this.baseUrl}/${emailId}/attachments/${attachmentId}`,
            {
                ...config,
                responseType: 'blob',
            }
        )
    }

    /**
     * Delete/trash email
     */
    async deleteEmail(
        id: string,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Email moved to trash',
            }
        )
    }

    /**
     * Permanently delete email
     */
    async permanentlyDeleteEmail(
        id: string,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/permanent`,
            {
                ...config,
                successMessage: 'Email permanently deleted',
            }
        )
    }

    /**
     * Reply to email
     */
    async replyToEmail(
        id: string,
        data: ReplyToEmailDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; id?: string }> {
        return apiClient.post<{ success: boolean; message: string; id?: string }>(
            `${this.baseUrl}/${id}/reply`,
            data,
            {
                ...config,
                successMessage: 'Reply sent successfully',
            }
        )
    }

    /**
     * Forward email
     */
    async forwardEmail(
        id: string,
        data: ForwardEmailDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string; id?: string }> {
        return apiClient.post<{ success: boolean; message: string; id?: string }>(
            `${this.baseUrl}/${id}/forward`,
            data,
            {
                ...config,
                successMessage: 'Email forwarded successfully',
            }
        )
    }
}

export const emailAPI = new EmailAPI()
export const emailAccountsAPI = new EmailAccountsAPI()
