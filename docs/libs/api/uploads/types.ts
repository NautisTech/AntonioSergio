// ==================== ENUMS ====================

export type FileCategory = 'image' | 'document' | 'video' | 'audio' | 'avatar' | 'attachment'

export type StorageProvider = 'local' | 's3'

export type ImageSize = 'original' | 'large' | 'medium' | 'small' | 'thumbnail'

// ==================== IMAGE VARIANTS ====================

export interface ImageVariant {
    size: ImageSize
    url: string
    width: number
    height: number
    sizeBytes: number
}

// ==================== UPLOADED FILES ====================

export interface UploadedFile {
    id: number
    entityType?: string
    entityId?: number
    fileName: string
    originalName: string
    url: string
    category: FileCategory
    storageProvider: StorageProvider
    mimeType: string
    extension: string
    sizeBytes: number
    variants?: ImageVariant[]
    tags?: string[]
    description?: string
    isPublic?: boolean
    downloadCount?: number
    displayOrder?: number
    createdAt: string
    uploadedBy: number
    uploadedBy_name?: string
}

// ==================== UPLOAD DTOs ====================

export interface UploadFileOptions {
    entityType?: string
    entityId?: number
    category?: FileCategory
    customFolder?: string
    isPublic?: boolean
    generateVariants?: boolean
    tags?: string[]
    description?: string
    displayOrder?: number
}

export interface RegisterExternalFileDto {
    url: string
    category: FileCategory
    entityType?: string
    entityId?: number
    title?: string
    description?: string
    tags?: string[]
    displayOrder?: number
}

// ==================== S3 CONFIGURATION ====================

export interface S3Config {
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucket: string
    enabled?: boolean
    cloudFrontUrl?: string
    acl?: string
}

export interface UpdateS3ConfigDto {
    accessKeyId?: string
    secretAccessKey?: string
    region?: string
    bucket?: string
    enabled?: boolean
    cloudFrontUrl?: string
    acl?: string
}

// ==================== PRESIGNED URLS ====================

export interface GeneratePresignedUrlDto {
    fileKey: string
    expiresIn?: number
    contentDisposition?: string
}

export interface PresignedUrl {
    url: string
    expiresAt: string
    fileKey: string
}

// ==================== STORAGE STATS ====================

export interface StorageStats {
    totalFiles: number
    totalSizeBytes: number
    totalSizeMB: number
    totalSizeGB: number
    byCategory: {
        [key in FileCategory]?: {
            count: number
            sizeBytes: number
        }
    }
    byProvider: {
        [key in StorageProvider]?: {
            count: number
            sizeBytes: number
        }
    }
    recentUploads: number
}

// ==================== FILTERS & RESPONSES ====================

export interface ListFilesFilters {
    entityType?: string
    entityId?: number
    category?: FileCategory
    fileType?: string
    storageProvider?: StorageProvider
    search?: string
    tags?: string[]
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
}

export interface FileListResponse {
    data: UploadedFile[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

// ==================== UPLOAD RESPONSES ====================

export interface UploadSingleResponse {
    success: boolean
    message: string
    file: UploadedFile
}

export interface UploadMultipleResponse {
    success: boolean
    message: string
    files: UploadedFile[]
    failedFiles?: Array<{
        filename: string
        error: string
    }>
}
