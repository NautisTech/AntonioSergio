import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { emailAPI, emailAccountsAPI } from './api'
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

// ==================== QUERY KEYS ====================
export const emailKeys = {
    all: ['email'] as const,

    // Emails
    emails: () => [...emailKeys.all, 'list'] as const,
    emailsList: (filters?: EmailListFilters) => [...emailKeys.emails(), filters] as const,
    emailDetail: (id: number) => [...emailKeys.all, 'detail', id] as const,

    // Stats
    stats: () => [...emailKeys.all, 'stats'] as const,

    // Config
    config: () => [...emailKeys.all, 'config'] as const,
}

export const emailAccountsKeys = {
    all: ['email-accounts'] as const,

    // Connection
    connectionStatus: () => [...emailAccountsKeys.all, 'connection-status'] as const,
    oauthUrl: (provider: EmailAccountProvider) => [...emailAccountsKeys.all, 'oauth-url', provider] as const,

    // Emails
    emails: () => [...emailAccountsKeys.all, 'emails'] as const,
    emailsList: (params?: AccountListEmailsParams) => [...emailAccountsKeys.emails(), params] as const,
    email: (id: string) => [...emailAccountsKeys.all, 'email', id] as const,

    // Labels
    labels: () => [...emailAccountsKeys.all, 'labels'] as const,
}

// ==================== EMAIL HISTORY QUERIES ====================

export function useEmails(
    filters?: EmailListFilters,
    options?: Omit<UseQueryOptions<EmailLog[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailKeys.emailsList(filters),
        queryFn: () => emailAPI.list(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useEmail(
    id: number,
    options?: Omit<UseQueryOptions<EmailLog>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailKeys.emailDetail(id),
        queryFn: () => emailAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useEmailStats(
    options?: Omit<UseQueryOptions<EmailStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailKeys.stats(),
        queryFn: () => emailAPI.getStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== EMAIL SENDING MUTATIONS ====================

export function useSendEmail(
    options?: Omit<UseMutationOptions<EmailSentResponse, Error, SendEmailDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SendEmailDto) => emailAPI.send(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailKeys.emails() })
            queryClient.invalidateQueries({ queryKey: emailKeys.stats() })
        },
        ...options,
    })
}

export function useSendBulkEmail(
    options?: Omit<UseMutationOptions<BulkEmailSentResponse, Error, SendBulkEmailDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SendBulkEmailDto) => emailAPI.sendBulk(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailKeys.emails() })
            queryClient.invalidateQueries({ queryKey: emailKeys.stats() })
        },
        ...options,
    })
}

export function useSendTemplateEmail(
    options?: Omit<UseMutationOptions<EmailSentResponse, Error, SendTemplateEmailDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SendTemplateEmailDto) => emailAPI.sendTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailKeys.emails() })
            queryClient.invalidateQueries({ queryKey: emailKeys.stats() })
        },
        ...options,
    })
}

// ==================== EMAIL CONFIGURATION QUERIES ====================

export function useEmailConfig(
    options?: Omit<UseQueryOptions<EmailConfig>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailKeys.config(),
        queryFn: () => emailAPI.getConfig(),
        staleTime: 30 * 60 * 1000, // 30 minutes (configuration doesn't change often)
        ...options,
    })
}

// ==================== EMAIL CONFIGURATION MUTATIONS ====================

export function useSaveEmailConfig(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, EmailConfigDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: EmailConfigDto) => emailAPI.saveConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailKeys.config() })
        },
        ...options,
    })
}

export function useUpdateEmailConfig(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, EmailConfigDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: EmailConfigDto) => emailAPI.updateConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailKeys.config() })
        },
        ...options,
    })
}

export function useDeleteEmailConfig(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, void>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => emailAPI.deleteConfig(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailKeys.config() })
        },
        ...options,
    })
}

export function useTestEmailConfig(
    options?: Omit<UseMutationOptions<EmailConfigTestResponse, Error, EmailConfigDto>, 'mutationFn'>
) {
    return useMutation({
        mutationFn: (data: EmailConfigDto) => emailAPI.testConfig(data),
        ...options,
    })
}

// ==================== EMAIL ACCOUNTS (Google/Microsoft) ====================

// ==================== CONNECTION QUERIES ====================

/**
 * Get email connection status
 */
export function useEmailConnectionStatus(
    options?: Omit<UseQueryOptions<ConnectionStatus>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailAccountsKeys.connectionStatus(),
        queryFn: () => emailAccountsAPI.getConnectionStatus(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

/**
 * Get OAuth URL for provider
 */
export function useOAuthUrl(
    provider: EmailAccountProvider,
    options?: Omit<UseQueryOptions<OAuthUrlResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailAccountsKeys.oauthUrl(provider),
        queryFn: () => emailAccountsAPI.getOAuthUrl(provider),
        enabled: !!provider,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    })
}

// ==================== CONNECTION MUTATIONS ====================

/**
 * Handle OAuth callback
 */
export function useHandleOAuthCallback(
    options?: Omit<
        UseMutationOptions<OAuthCallbackResponse, Error, { code: string; state: string }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ code, state }) => emailAccountsAPI.handleOAuthCallback(code, state),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.connectionStatus() })
        },
        ...options,
    })
}

/**
 * Connect email account
 */
export function useConnectEmailAccount(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, ConnectEmailAccountDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ConnectEmailAccountDto) => emailAccountsAPI.connect(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.connectionStatus() })
        },
        ...options,
    })
}

/**
 * Disconnect email account
 */
export function useDisconnectEmailAccount(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, EmailAccountProvider>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (provider: EmailAccountProvider) => emailAccountsAPI.disconnect(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.connectionStatus() })
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.emails() })
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.labels() })
        },
        ...options,
    })
}

// ==================== EMAIL OPERATIONS QUERIES ====================

/**
 * List emails from connected account
 */
export function useAccountEmails(
    params?: AccountListEmailsParams,
    options?: Omit<UseQueryOptions<EmailListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailAccountsKeys.emailsList(params),
        queryFn: () => emailAccountsAPI.listEmails(params),
        staleTime: 1 * 60 * 1000, // 1 minute
        ...options,
    })
}

/**
 * Get specific email
 */
export function useAccountEmail(
    id: string,
    options?: Omit<UseQueryOptions<EmailMessage>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailAccountsKeys.email(id),
        queryFn: () => emailAccountsAPI.getEmail(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

/**
 * Get email labels/folders
 */
export function useEmailLabels(
    options?: Omit<UseQueryOptions<EmailLabel[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: emailAccountsKeys.labels(),
        queryFn: () => emailAccountsAPI.getLabels(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== EMAIL OPERATIONS MUTATIONS ====================

/**
 * Send email via connected account
 */
export function useSendAccountEmail(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string; id?: string }, Error, AccountSendEmailDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: AccountSendEmailDto) => emailAccountsAPI.sendEmail(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.emails() })
        },
        ...options,
    })
}

/**
 * Modify email (read/unread, star/unstar, labels)
 */
export function useModifyEmail(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: string; data: ModifyEmailDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => emailAccountsAPI.modifyEmail(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.emails() })
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.email(variables.id) })
        },
        ...options,
    })
}

/**
 * Delete/trash email
 */
export function useDeleteAccountEmail(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, string>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => emailAccountsAPI.deleteEmail(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.emails() })
            queryClient.removeQueries({ queryKey: emailAccountsKeys.email(id) })
        },
        ...options,
    })
}

/**
 * Permanently delete email
 */
export function usePermanentlyDeleteEmail(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, string>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => emailAccountsAPI.permanentlyDeleteEmail(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.emails() })
            queryClient.removeQueries({ queryKey: emailAccountsKeys.email(id) })
        },
        ...options,
    })
}

/**
 * Reply to email
 */
export function useReplyToEmail(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string; id?: string },
            Error,
            { id: string; data: ReplyToEmailDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => emailAccountsAPI.replyToEmail(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.emails() })
        },
        ...options,
    })
}

/**
 * Forward email
 */
export function useForwardEmail(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string; id?: string },
            Error,
            { id: string; data: ForwardEmailDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => emailAccountsAPI.forwardEmail(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emailAccountsKeys.emails() })
        },
        ...options,
    })
}

/**
 * Download email attachment
 */
export function useDownloadAttachment() {
    return useMutation({
        mutationFn: ({ emailId, attachmentId }: { emailId: string; attachmentId: string }) =>
            emailAccountsAPI.downloadAttachment(emailId, attachmentId),
    })
}
