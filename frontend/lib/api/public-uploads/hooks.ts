/**
 * Public Uploads React Hooks
 * Custom React hooks for fetching attachment data
 */

"use client";

import { useState, useEffect } from "react";
import { publicUploadsAPI } from "./api";
import type { Attachment } from "./types";
import type { RequestConfig } from "../client";

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data
 */
function useFetch<T>(
	fetcher: () => Promise<T>,
	dependencies: any[] = []
): FetchState<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await fetcher();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Unknown error"));
			console.error("Fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get attachments by entity type and ID
 * @param entityType - Type of entity (e.g., 'content', 'intervention', 'ticket')
 * @param entityId - ID of the entity
 * @param config - Optional request configuration
 *
 * @example
 * const { data: attachments, loading } = useAttachments('content', 123)
 */
export function useAttachments(
	entityType: string | null,
	entityId: number | null,
	config?: RequestConfig
): FetchState<Attachment[]> {
	console.log("[useAttachments] Called with:", {
		entityType,
		entityId,
		config,
	});
	return useFetch(() => {
		if (entityType && entityId) {
			console.log(
				"[useAttachments] Fetching attachments for:",
				entityType,
				entityId
			);
			return publicUploadsAPI.getAttachmentsByEntity(
				entityType,
				entityId,
				config
			);
		} else {
			console.log(
				"[useAttachments] Skipping fetch - missing entityType or entityId"
			);
			return Promise.resolve([] as Attachment[]);
		}
	}, [entityType, entityId, JSON.stringify(config)]);
}
