/**
 * Newsletter API
 * API functions for newsletter subscription management
 */

import { apiClient } from "../client";
import type {
	SubscribeNewsletterInput,
	SubscribeNewsletterDto,
	UnsubscribeNewsletterDto,
	NewsletterResponse,
} from "./types";
import type { RequestConfig } from "../client";

/**
 * Get tenant ID from environment variable
 */
const getTenantId = (): number => {
	const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
	if (!tenantId) {
		throw new Error(
			"NEXT_PUBLIC_TENANT_ID environment variable is not set"
		);
	}
	return parseInt(tenantId, 10);
};

/**
 * Newsletter API endpoints
 */
export const publicNewsletterAPI = {
	/**
	 * Subscribe to newsletter
	 */
	async subscribe(
		data: SubscribeNewsletterInput,
		config?: RequestConfig
	): Promise<NewsletterResponse> {
		// Transform frontend input to backend DTO
		const dto: SubscribeNewsletterDto = {
			email: data.email,
			lang: data.language || "pt",
			tenantId: getTenantId(),
		};

		const response = await apiClient.post<NewsletterResponse>(
			"/mailer/public/newsletter/subscribe",
			dto,
			config
		);
		return response;
	},

	/**
	 * Unsubscribe from newsletter
	 */
	async unsubscribe(
		data: UnsubscribeNewsletterDto,
		config?: RequestConfig
	): Promise<NewsletterResponse> {
		const response = await apiClient.post<NewsletterResponse>(
			"/mailer/public/newsletter/unsubscribe",
			data,
			config
		);
		return response;
	},
};
