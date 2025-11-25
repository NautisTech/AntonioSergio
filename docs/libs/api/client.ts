import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { toastService } from '@/libs/notifications/toasterService'

// Tipos
export interface ApiError {
    message: string
    statusCode: number
    error?: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: {
        id: number
        username: string
        email: string
        fotoUrl: string | null
    }
    tenant: {
        id: number
        nome: string
        slug: string
    }
    empresas: Array<{
        id: number
        nome: string
        principal: boolean
    }>
}

export interface RefreshResponse {
    accessToken: string
}

interface ModulesResponse {
    modulos: Array<{
        modulo: string
        nome: string
        icone: string
        permissoes: Array<{
            codigo: string
            nome: string
            tipo: string
        }>
    }>
    empresas: Array<{
        empresa_id: number
        empresa_principal: boolean
        empresa_nome: string
        empresa_codigo: string
        logo_url?: string
        cor?: string
    }>
    totalPermissoes: number
    permissoesCodigos: string[]
}

export interface RequestConfig extends AxiosRequestConfig {
    showSuccessToast?: boolean
    showErrorToast?: boolean
    successMessage?: string
    errorMessage?: string
}

class ApiClient {
    private client: AxiosInstance
    private refreshPromise: Promise<string> | null = null

    constructor() {
        this.client = axios.create({
            baseURL: process.env.API_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        this.setupInterceptors()
    }

    public get defaults() {
        return this.client.defaults
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            config => {
                const token = this.getAccessToken()
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            error => {
                return Promise.reject(this.normalizeError(error))
            }
        )

        // Response interceptor
        this.client.interceptors.response.use(
            response => {
                // Toast de sucesso automático para POST, PUT, PATCH, DELETE
                const config = response.config as RequestConfig
                const method = response.config.method?.toLowerCase()

                if (config.showSuccessToast !== false && ['post', 'put', 'patch', 'delete'].includes(method || '')) {
                    const successMessage = config.successMessage
                    if (successMessage) {
                        toastService.success(successMessage)
                    }
                }

                return response
            },
            async (error: AxiosError<ApiError>) => {
                const originalRequest = error.config as RequestConfig & { _retry?: boolean }

                // Toast de erro automático
                if (originalRequest.showErrorToast !== false) {
                    const errorMessage = originalRequest.errorMessage ||
                        error.response?.data?.message ||
                        this.getDefaultErrorMessage(error.response?.status || 500)

                    toastService.error(errorMessage)
                }

                // Tentar refresh token se 401
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    try {
                        const newToken = await this.handleTokenRefresh()

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`
                        }

                        return this.client(originalRequest)
                    } catch (refreshError) {
                        this.handleAuthError()
                        return Promise.reject(this.normalizeError(refreshError as AxiosError))
                    }
                }

                return Promise.reject(this.normalizeError(error))
            }
        )
    }

    private getDefaultSuccessMessage(method: string): string {
        const messages: Record<string, string> = {
            post: 'Criado(a) com sucesso!',
            put: 'Atualizado(a) com sucesso!',
            patch: 'Atualizado(a) com sucesso!',
            delete: 'Excluído(a) com sucesso!'
        }
        return messages[method] || ''
    }

    private getDefaultErrorMessage(status: number): string {
        const messages: Record<number, string> = {
            400: 'Requisição inválida',
            401: 'Credenciais inválidas ou sessão expirada',
            403: 'Acesso negado',
            404: 'Recurso não encontrado',
            422: 'Dados inválidos',
            500: 'Erro interno do servidor',
            503: 'Serviço indisponível'
        }
        return messages[status] || 'Ocorreu um erro inesperado'
    }

    private async handleTokenRefresh(): Promise<string> {
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        this.refreshPromise = (async () => {
            try {
                const refreshToken = this.getRefreshToken()

                if (!refreshToken) {
                    throw new Error('No refresh token available')
                }

                const response = await axios.post<RefreshResponse>(
                    `${process.env.API_URL}/auth/refresh`,
                    { refreshToken }
                )

                const { accessToken } = response.data
                this.setAccessToken(accessToken)

                return accessToken
            } finally {
                this.refreshPromise = null
            }
        })()

        return this.refreshPromise
    }

    private normalizeError(error: any): ApiError {

        // Se é um erro do Axios com resposta
        if (error.response?.data) {
            return {
                message: error.response.data.message || error.response.data.error || 'Request failed',
                statusCode: error.response.status,
                error: error.response.data.error
            }
        }

        // Se é um erro de rede
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            return {
                message: 'Não foi possível conectar ao servidor',
                statusCode: 503
            }
        }

        // Se é um erro de timeout
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return {
                message: 'A requisição demorou muito tempo. Tente novamente.',
                statusCode: 408
            }
        }

        // Erro genérico
        return {
            message: error.message || 'Ocorreu um erro inesperado',
            statusCode: error.status || 500
        }
    }

    private handleAuthError() {
        this.clearTokens()
        toastService.warning('Sessão expirada. Faça login novamente.')

        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname
            const langMatch = pathname.match(/^\/(en|pt|es|de|fr|it)/)
            const lang = langMatch ? langMatch[1] : 'en'

            setTimeout(() => {
                window.location.href = `/${lang}/login`
            }, 1500)
        }
    }

    // Token management
    private getAccessToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('accessToken')
    }

    private getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('refreshToken')
    }

    private setAccessToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token)
        }
    }

    private setRefreshToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', token)
        }
    }

    private clearTokens() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        }
    }

    // Public methods
    public async login(email: string, password: string, tenantSlug: string): Promise<LoginResponse> {
        try {

            const response = await this.client.post<LoginResponse>(
                '/auth/login',
                {
                    email,
                    password,
                    tenant_slug: tenantSlug
                },
                {
                    showSuccessToast: false,
                    showErrorToast: false,
                } as RequestConfig
            )


            // Salva os tokens
            this.setAccessToken(response.data.accessToken)
            this.setRefreshToken(response.data.refreshToken)

            return response.data
        } catch (error: any) {
            throw this.normalizeError(error)
        }
    }

    public async logout(): Promise<void> {
        try {
            await this.client.post('/auth/logout', {}, {
                showSuccessToast: false,
            } as RequestConfig)
        } catch (error) {
        } finally {
            this.clearTokens()
        }
    }

    public async getProfile() {
        const response = await this.client.get('/auth/me', {
            showErrorToast: false,
        } as RequestConfig)
        return response.data
    }

    public async getModules(): Promise<ModulesResponse> {
        const response = await this.client.get('/auth/me/modules', {
            showErrorToast: false,
        } as RequestConfig)
        return response.data
    }

    // Generic methods com controle de toast
    public async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config)
        return response.data
    }

    public async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config)
        return response.data
    }

    public async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config)
        return response.data
    }

    public async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config)
        return response.data
    }

    public async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config)
        return response.data
    }

    // Método especial para operações de deploy com timeout longo (10 minutos)
    public async postWithLongTimeout<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, {
            ...config,
            timeout: 600000 // 10 minutos
        })
        return response.data
    }
}

export const apiClient = new ApiClient()