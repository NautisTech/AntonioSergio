/**
 * Public Uploads API
 * API functions for fetching public attachments
 */

"use client";

import { apiClient, type RequestConfig } from "../client";
import type { Attachment } from "./types";

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "4";

/**
 * Get attachments by entity type and ID
 * @param entityType - Type of entity (e.g., 'content', 'intervention', 'ticket')
 * @param entityId - ID of the entity
 * @param config - Optional request configuration
 */
export const publicUploadsAPI = {
	/**
	 * Get attachments for a specific entity
	 */
	async getAttachmentsByEntity(
		entityType: string,
		entityId: number,
		config?: RequestConfig
	): Promise<Attachment[]> {
		const url = `/public/uploads/by-entity/${entityType}/${entityId}`;
		const params = { tenantId: TENANT_ID, ...config?.params };
		console.log(
			"[publicUploadsAPI] Fetching:",
			url,
			"with params:",
			params
		);

		const result = await apiClient.get<Attachment[]>(url, {
			...config,
			params,
		});

		console.log("[publicUploadsAPI] Response:", result);
		return result;
	},
};
