/**
 * Newsletter API Types
 * Type definitions for newsletter subscription endpoints
 */

/**
 * Frontend-facing interface for newsletter subscription
 * Accepts language code and automatically adds tenantId
 */
export interface SubscribeNewsletterInput {
	email: string;
	language?: string;
}

/**
 * Backend DTO for newsletter subscription
 * Matches the backend SubscribeNewsletterDto expectations
 */
export interface SubscribeNewsletterDto {
	email: string;
	lang: string;
	tenantId: number;
}

export interface UnsubscribeNewsletterDto {
	email: string;
	token: string;
}

export interface NewsletterResponse {
	message: string;
}
