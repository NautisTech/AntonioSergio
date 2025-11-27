/**
 * Newsletter React Hooks
 * Custom React hooks for newsletter subscription
 */

"use client";

import { useState } from "react";
import { publicNewsletterAPI } from "./api";
import type { SubscribeNewsletterInput, NewsletterResponse } from "./types";
import type { RequestConfig } from "../client";

interface SubscribeState {
	loading: boolean;
	error: Error | null;
	subscribe: (
		data: SubscribeNewsletterInput,
		config?: RequestConfig
	) => Promise<NewsletterResponse | null>;
}

/**
 * Hook for newsletter subscription
 * @example
 * const { subscribe, loading, error } = useNewsletterSubscribe()
 * await subscribe({ email: 'user@example.com', language: 'pt' })
 */
export function useNewsletterSubscribe(): SubscribeState {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const subscribe = async (
		data: SubscribeNewsletterInput,
		config?: RequestConfig
	): Promise<NewsletterResponse | null> => {
		try {
			setLoading(true);
			setError(null);
			const result = await publicNewsletterAPI.subscribe(data, config);
			return result;
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Failed to subscribe");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	return { subscribe, loading, error };
}
