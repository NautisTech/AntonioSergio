import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

export interface ApiError {
	message: string;
	statusCode: number;
	error?: string;
}

export interface RequestConfig extends AxiosRequestConfig {
	skipErrorHandling?: boolean;
}

class PublicApiClient {
	private client: AxiosInstance;
	private tenantId: string;

	constructor() {
		this.tenantId = "1005";

		this.client = axios.create({
			baseURL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL ,
			timeout: 30000,
			headers: {
				"Content-Type": "application/json",
			},
		});

		this.setupInterceptors();
	}

	private setupInterceptors() {
		// Response interceptor
		this.client.interceptors.response.use(
			response => response,
			async (error: AxiosError<ApiError>) => {
				const config = error.config as RequestConfig;

				if (!config?.skipErrorHandling) {
					console.error(
						"API Error:",
						error.response?.data || error.message
					);
				}

				return Promise.reject(this.normalizeError(error));
			}
		);
	}

	private normalizeError(error: any): ApiError {
		// Se é um erro do Axios com resposta
		if (error.response?.data) {
			return {
				message:
					error.response.data.message ||
					error.response.data.error ||
					"Request failed",
				statusCode: error.response.status,
				error: error.response.data.error,
			};
		}

		// Se é um erro de rede
		if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
			return {
				message: "Não foi possível conectar ao servidor",
				statusCode: 503,
			};
		}

		// Erro genérico
		return {
			message: error.message || "Ocorreu um erro inesperado",
			statusCode: error.status || 500,
		};
	}

	public getTenantId(): string {
		return this.tenantId;
	}

	public async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
		const response = await this.client.get<T>(url, config);
		return response.data;
	}

	public async post<T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<T> {
		const response = await this.client.post<T>(url, data, config);
		return response.data;
	}
}

export const publicApiClient = new PublicApiClient();
