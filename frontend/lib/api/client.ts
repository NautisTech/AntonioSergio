/**
 * API Client
 * Base HTTP client for making requests to the backend API
 */

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface ApiError {
	message: string;
	statusCode: number;
	error?: string;
}

export interface RequestConfig extends RequestInit {
	skipErrorHandling?: boolean;
	params?: Record<string, any>;
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T = any>(
	url: string,
	options: RequestConfig = {}
): Promise<T> {
	const { skipErrorHandling = false, params, ...fetchOptions } = options;

	// Build query string from params
	let fullUrl = `${API_BASE_URL}${url}`;
	if (params) {
		const queryString = new URLSearchParams(
			Object.entries(params).reduce((acc, [key, value]) => {
				if (value !== undefined && value !== null) {
					acc[key] = String(value);
				}
				return acc;
			}, {} as Record<string, string>)
		).toString();
		if (queryString) {
			fullUrl += `?${queryString}`;
		}
	}

	const config: RequestInit = {
		...fetchOptions,
		headers: {
			"Content-Type": "application/json",
			...fetchOptions.headers,
		},
	};

	try {
		const response = await fetch(fullUrl, config);

		// Handle non-OK responses
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const error: ApiError = {
				message:
					errorData.message ||
					`HTTP error! status: ${response.status}`,
				statusCode: response.status,
				error: errorData.error,
			};

			if (!skipErrorHandling) {
				console.error("API request failed:", error);
			}

			throw error;
		}

		// Return parsed JSON
		return await response.json();
	} catch (error) {
		if (!skipErrorHandling) {
			console.error("API request failed:", error);
		}
		throw error;
	}
}

/**
 * API Client methods
 */
export const apiClient = {
	/**
	 * GET request
	 */
	get: <T = any>(url: string, config?: RequestConfig): Promise<T> =>
		apiFetch<T>(url, { ...config, method: "GET" }),

	/**
	 * POST request
	 */
	post: <T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<T> =>
		apiFetch<T>(url, {
			...config,
			method: "POST",
			body: JSON.stringify(data),
		}),

	/**
	 * PUT request
	 */
	put: <T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<T> =>
		apiFetch<T>(url, {
			...config,
			method: "PUT",
			body: JSON.stringify(data),
		}),

	/**
	 * DELETE request
	 */
	delete: <T = any>(url: string, config?: RequestConfig): Promise<T> =>
		apiFetch<T>(url, { ...config, method: "DELETE" }),
};

export default apiClient;
