// ==================== ENUMS ====================

export type EmailProvider = 'smtp' | 'aws_ses'

export type EmailAccountProvider = 'google' | 'microsoft'

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'queued'

export type EmailPriority = 'low' | 'normal' | 'high'

// ==================== EMAIL CONFIGURATION ====================

export interface SmtpConfig {
    host: string
    port: number
    secure: boolean
    username: string
    password?: string
    fromName?: string
    fromEmail?: string
}

export interface AwsSesConfig {
    accessKeyId?: string
    secretAccessKey?: string
    region: string
    fromName?: string
    fromEmail?: string
    configurationSetName?: string
}

export interface EmailConfig {
    provider: EmailProvider
    enabled: boolean
    smtp?: SmtpConfig
    awsSes?: AwsSesConfig
}

export interface EmailConfigDto {
    provider: EmailProvider
    enabled?: boolean
    smtp?: SmtpConfig
    awsSes?: AwsSesConfig
}

// ==================== EMAIL SENDING ====================

export interface EmailAttachment {
    filename: string
    content: string
    contentType?: string
}

export interface SendEmailDto {
    to: string
    toName?: string
    subject: string
    text?: string
    html?: string
    cc?: string[]
    bcc?: string[]
    replyTo?: string
    attachments?: EmailAttachment[]
    priority?: EmailPriority
    variables?: Record<string, any>
    entityType?: string
    entityId?: number
}

export interface SendBulkEmailDto {
    recipients: string[]
    subject: string
    text?: string
    html?: string
    individual?: boolean
}

export interface SendTemplateEmailDto {
    template: string
    to: string
    toName?: string
    variables: Record<string, any>
    subject?: string
    entityType?: string
    entityId?: number
}

// ==================== EMAIL LOG ====================

export interface EmailLog {
    id: number
    messageId?: string
    to: string
    toName?: string
    from?: string
    fromName?: string
    cc?: string[]
    bcc?: string[]
    replyTo?: string
    subject: string
    text?: string
    html?: string
    status: EmailStatus
    priority: EmailPriority
    provider?: EmailProvider
    sentAt?: string
    failedAt?: string
    errorMessage?: string
    entityType?: string
    entityId?: number
    attachmentCount?: number
    retryCount?: number
    createdAt: string
    createdBy?: number
    sender_name?: string
}

// ==================== FILTERS & LISTS ====================

export interface EmailListFilters {
    status?: EmailStatus
    to?: string
    entityType?: string
    entityId?: number
    search?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
}

export interface EmailListResponse {
    data: EmailLog[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ==================== STATISTICS ====================

export interface EmailStats {
    totalSent: number
    totalFailed: number
    totalPending: number
    totalQueued: number
    sentToday: number
    sentThisWeek: number
    sentThisMonth: number
    recentEmails: number
    byStatus: Array<{
        status: EmailStatus
        count: number
    }>
    byPriority: Array<{
        priority: EmailPriority
        count: number
    }>
    byProvider: Array<{
        provider: EmailProvider
        count: number
    }>
    byDay: Array<{
        date: string
        sent: number
        failed: number
    }>
    topRecipients: Array<{
        email: string
        count: number
    }>
    failureRate: number
    successRate: number
}

// ==================== RESPONSES ====================

export interface EmailSentResponse {
    id: number
    messageId: string
    status: EmailStatus
    to: string
    subject: string
    entityType?: string
    entityId?: number
    createdAt: string
}

export interface BulkEmailSentResponse {
    success: boolean
    message: string
    sent: number
    failed: number
    results: EmailSentResponse[]
}

export interface EmailConfigTestResponse {
    valid: boolean
    message: string
    error?: string
}

// ==================== EMAIL ACCOUNTS (Google/Microsoft) ====================

export interface ConnectEmailAccountDto {
    provider: EmailAccountProvider
    accessToken: string
    refreshToken: string
    expiresAt: Date | string
}

export interface AccountListEmailsParams {
    pageSize?: number
    pageToken?: string
    query?: string
    labelIds?: string[]
    labels?: Array<{ id: string; name: string; type?: string }>
}

export interface AccountSendEmailDto {
    to: string
    cc?: string
    bcc?: string
    subject: string
    body: string
    isHtml?: boolean
    isDraft?: boolean
    attachments?: Array<{ filename: string; content: string; contentType: string }>
}

export interface ModifyEmailDto {
    isRead?: boolean
    isStarred?: boolean
    addLabels?: string[]
    removeLabels?: string[]
}

export interface ReplyToEmailDto {
    comment: string
    replyAll?: boolean
}

export interface ForwardEmailDto {
    to: string
    comment?: string
}

// ==================== EMAIL ACCOUNTS RESPONSES ====================

export interface EmailLabel {
    id: string
    name: string
    type?: string
    color?: string
    textColor?: string
}

export interface EmailAttachmentInfo {
    attachmentId: string
    filename: string
    mimeType: string
    size: number
}

export interface EmailMessage {
    id: string
    threadId?: string
    from: string
    to: string[]
    cc?: string[]
    bcc?: string[]
    subject: string
    snippet?: string
    body?: string
    date: string
    isRead: boolean
    isStarred: boolean
    labelIds?: string[]
    labels?: EmailLabel[]
    attachments?: EmailAttachmentInfo[]
    headers?: Record<string, string>
}

export interface EmailListResponse {
    emails: EmailMessage[]
    nextPageToken?: string
    resultSizeEstimate?: number
}

export interface ConnectionStatus {
    google?: {
        connected: boolean
        email?: string
        expiresAt?: string
    }
    microsoft?: {
        connected: boolean
        email?: string
        expiresAt?: string
    }
}

export interface OAuthUrlResponse {
    url: string
    provider: EmailAccountProvider
}

export interface OAuthCallbackResponse {
    success: boolean
    message: string
    email?: string
    provider?: EmailAccountProvider
}
