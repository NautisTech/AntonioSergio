/**
 * Public Uploads Types
 * Matches backend UploadedFileDto camelCase naming
 */

export interface Attachment {
	id: number;
	entityType: string;
	entityId: number;
	fileName: string;
	originalName: string | null;
	url: string;
	mimeType: string;
	fileType: "image" | "document" | "video" | "audio" | "other";
	extension: string;
	sizeBytes: number;
	description: string | null;
	displayOrder: number;
	isPublic: boolean;
	downloadCount: number;
	uploadedBy: number | null;
	createdAt: string;
	storageProvider: "local" | "url" | "s3" | "azure";
	variants: any | null;
	tags: string[] | null;
	category: string | null;
}
