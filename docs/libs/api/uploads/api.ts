import { apiClient, type RequestConfig } from '../client'
import type {
    UploadedFile,
    UploadFileOptions,
    RegisterExternalFileDto,
    UploadSingleResponse,
    UploadMultipleResponse,
    ListFilesFilters,
    FileListResponse,
    StorageStats,
    S3Config,
    UpdateS3ConfigDto,
    GeneratePresignedUrlDto,
    PresignedUrl,
} from './types'

class UploadsAPI {
    private baseUrl = '/uploads'

    // ==================== FILE UPLOADS ====================

    /**
     * Upload single file
     */
    async uploadSingle(
        file: File,
        options?: UploadFileOptions,
        config?: RequestConfig
    ): Promise<UploadSingleResponse> {
        const formData = new FormData()
        formData.append('file', file)

        // Add optional metadata
        if (options?.entityType) formData.append('entityType', options.entityType)
        if (options?.entityId) formData.append('entityId', String(options.entityId))
        if (options?.category) formData.append('category', options.category)
        if (options?.customFolder) formData.append('customFolder', options.customFolder)
        if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic))
        if (options?.generateVariants !== undefined)
            formData.append('generateVariants', String(options.generateVariants))
        if (options?.tags) formData.append('tags', JSON.stringify(options.tags))
        if (options?.description) formData.append('description', options.description)
        if (options?.displayOrder) formData.append('displayOrder', String(options.displayOrder))

        return apiClient.post<UploadSingleResponse>(`${this.baseUrl}/single`, formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data',
            },
            successMessage: 'File uploaded successfully',
        })
    }

    /**
     * Upload multiple files
     */
    async uploadMultiple(
        files: File[],
        options?: UploadFileOptions,
        config?: RequestConfig
    ): Promise<UploadMultipleResponse> {
        const formData = new FormData()

        // Append all files
        files.forEach((file) => {
            formData.append('files', file)
        })

        // Add optional metadata
        if (options?.entityType) formData.append('entityType', options.entityType)
        if (options?.entityId) formData.append('entityId', String(options.entityId))
        if (options?.category) formData.append('category', options.category)
        if (options?.customFolder) formData.append('customFolder', options.customFolder)
        if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic))
        if (options?.generateVariants !== undefined)
            formData.append('generateVariants', String(options.generateVariants))
        if (options?.tags) formData.append('tags', JSON.stringify(options.tags))
        if (options?.description) formData.append('description', options.description)
        if (options?.displayOrder) formData.append('displayOrder', String(options.displayOrder))

        return apiClient.post<UploadMultipleResponse>(`${this.baseUrl}/multiple`, formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data',
            },
            successMessage: 'Files uploaded successfully',
        })
    }

    /**
     * Register external file (URL)
     */
    async registerExternal(
        data: RegisterExternalFileDto,
        config?: RequestConfig
    ): Promise<UploadSingleResponse> {
        return apiClient.post<UploadSingleResponse>(
            `${this.baseUrl}/external`,
            {
                url: data.url,
                tipo: data.category, // Backend expects 'tipo' instead of 'category'
                entityType: data.entityType,
                entityId: data.entityId,
                title: data.title,
                description: data.description,
                tags: data.tags,
                displayOrder: data.displayOrder,
            },
            {
                ...config,
                successMessage: 'External file registered successfully',
            }
        )
    }

    /**
     * Delete file
     */
    async delete(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'File deleted successfully',
            }
        )
    }

    // ==================== FILE MANAGEMENT ====================

    /**
     * List files with filtering and pagination
     */
    async list(filters?: ListFilesFilters, config?: RequestConfig): Promise<FileListResponse> {
        const params = new URLSearchParams()

        if (filters?.entityType) params.append('entityType', filters.entityType)
        if (filters?.entityId) params.append('entityId', String(filters.entityId))
        if (filters?.category) params.append('category', filters.category)
        if (filters?.fileType) params.append('fileType', filters.fileType)
        if (filters?.storageProvider) params.append('storageProvider', filters.storageProvider)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.tags) params.append('tags', JSON.stringify(filters.tags))
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        return apiClient.get<FileListResponse>(url, config)
    }

    /**
     * Get storage statistics
     */
    async getStats(config?: RequestConfig): Promise<StorageStats> {
        return apiClient.get<StorageStats>(`${this.baseUrl}/stats`, config)
    }

    /**
     * Get files by entity (polymorphic relationship)
     */
    async getByEntity(
        entityType: string,
        entityId: number,
        config?: RequestConfig
    ): Promise<UploadedFile[]> {
        return apiClient.get<UploadedFile[]>(
            `${this.baseUrl}/by-entity/${entityType}/${entityId}`,
            config
        )
    }

    /**
     * Get file by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<UploadedFile> {
        return apiClient.get<UploadedFile>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Update file display order
     */
    async updateDisplayOrder(
        id: number,
        displayOrder: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/display-order`,
            { displayOrder },
            {
                ...config,
                successMessage: 'Display order updated successfully',
            }
        )
    }

    // ==================== S3 OPERATIONS ====================

    /**
     * Generate presigned URL for temporary S3 access
     */
    async generatePresignedUrl(
        id: number,
        options: GeneratePresignedUrlDto,
        config?: RequestConfig
    ): Promise<PresignedUrl> {
        return apiClient.post<PresignedUrl>(
            `${this.baseUrl}/${id}/presigned-url`,
            options,
            config
        )
    }

    // ==================== S3 CONFIGURATION ====================

    /**
     * Get S3 configuration for tenant
     */
    async getS3Config(config?: RequestConfig): Promise<Partial<S3Config> & { enabled: boolean }> {
        return apiClient.get<Partial<S3Config> & { enabled: boolean }>(
            `${this.baseUrl}/settings/s3`,
            config
        )
    }

    /**
     * Save S3 configuration for tenant
     */
    async saveS3Config(
        data: S3Config,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/settings/s3`,
            data,
            {
                ...config,
                successMessage: 'S3 configuration saved successfully',
            }
        )
    }

    /**
     * Update S3 configuration for tenant
     */
    async updateS3Config(
        data: UpdateS3ConfigDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/settings/s3`,
            data,
            {
                ...config,
                successMessage: 'S3 configuration updated successfully',
            }
        )
    }

    /**
     * Delete S3 configuration for tenant
     */
    async deleteS3Config(config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/settings/s3`,
            {
                ...config,
                successMessage: 'S3 configuration deleted successfully',
            }
        )
    }

    /**
     * Test S3 connection
     */
    async testS3Config(config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.get<{ success: boolean; message: string }>(
            `${this.baseUrl}/settings/s3/test`,
            config
        )
    }

    // ==================== HELPERS ====================

    /**
     * Get file URL for serving
     * This is a public endpoint
     */
    getFileUrl(tenantId: number | string, filename: string): string {
        const baseUrl = apiClient.getBaseUrl()
        return `${baseUrl}${this.baseUrl}/tenant_${tenantId}/${filename}`
    }

    /**
     * Helper to build image variant URL
     */
    getImageVariantUrl(
        tenantId: number | string,
        filename: string,
        size: 'original' | 'large' | 'medium' | 'small' | 'thumbnail' = 'original'
    ): string {
        if (size === 'original') {
            return this.getFileUrl(tenantId, filename)
        }

        // Assuming variants have format: filename_size.ext
        const parts = filename.split('.')
        const ext = parts.pop()
        const name = parts.join('.')
        const variantFilename = `${name}_${size}.${ext}`

        return this.getFileUrl(tenantId, variantFilename)
    }
}

export const uploadsAPI = new UploadsAPI()
