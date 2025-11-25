import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { uploadsAPI } from './api'
import type {
    UploadFileOptions,
    RegisterExternalFileDto,
    UploadSingleResponse,
    UploadMultipleResponse,
    UploadedFile,
    ListFilesFilters,
    FileListResponse,
    StorageStats,
    S3Config,
    UpdateS3ConfigDto,
    GeneratePresignedUrlDto,
    PresignedUrl,
} from './types'
import type { RequestConfig } from '../client'

// ==================== QUERY KEYS ====================

export const uploadsKeys = {
    all: ['uploads'] as const,
    lists: () => [...uploadsKeys.all, 'list'] as const,
    list: (filters?: any) => [...uploadsKeys.lists(), filters] as const,
    detail: (id: number) => [...uploadsKeys.all, 'detail', id] as const,
    byEntity: (entityType: string, entityId: number) =>
        [...uploadsKeys.all, 'entity', entityType, entityId] as const,
    stats: () => [...uploadsKeys.all, 'stats'] as const,
    s3Config: () => [...uploadsKeys.all, 's3-config'] as const,
}

// ==================== MUTATIONS ====================

/**
 * Hook to upload a single file
 */
export function useUploadSingle(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ file, options }: { file: File; options?: UploadFileOptions }) =>
            uploadsAPI.uploadSingle(file, options, config),
        onSuccess: (data, variables) => {
            // Invalidate all upload lists
            queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() })

            // If file is associated with an entity, invalidate that entity's files
            if (variables.options?.entityType && variables.options?.entityId) {
                queryClient.invalidateQueries({
                    queryKey: uploadsKeys.byEntity(
                        variables.options.entityType,
                        variables.options.entityId
                    ),
                })
            }
        },
    })
}

/**
 * Hook to upload multiple files
 */
export function useUploadMultiple(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ files, options }: { files: File[]; options?: UploadFileOptions }) =>
            uploadsAPI.uploadMultiple(files, options, config),
        onSuccess: (data, variables) => {
            // Invalidate all upload lists
            queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() })

            // If files are associated with an entity, invalidate that entity's files
            if (variables.options?.entityType && variables.options?.entityId) {
                queryClient.invalidateQueries({
                    queryKey: uploadsKeys.byEntity(
                        variables.options.entityType,
                        variables.options.entityId
                    ),
                })
            }
        },
    })
}

/**
 * Hook to register external file
 */
export function useRegisterExternalFile(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RegisterExternalFileDto) => uploadsAPI.registerExternal(data, config),
        onSuccess: (data, variables) => {
            // Invalidate all upload lists
            queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() })

            // If file is associated with an entity, invalidate that entity's files
            if (variables.entityType && variables.entityId) {
                queryClient.invalidateQueries({
                    queryKey: uploadsKeys.byEntity(variables.entityType, variables.entityId),
                })
            }
        },
    })
}

/**
 * Hook to delete a file
 */
export function useDeleteFile(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => uploadsAPI.delete(id, config),
        onSuccess: () => {
            // Invalidate all upload lists
            queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() })
            // Invalidate all entity-specific file queries
            queryClient.invalidateQueries({ queryKey: [...uploadsKeys.all, 'entity'] })
        },
    })
}

// ==================== FILE MANAGEMENT QUERIES ====================

/**
 * List files with filtering and pagination
 */
export function useFiles(
    filters?: ListFilesFilters,
    options?: Omit<UseQueryOptions<FileListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: uploadsKeys.list(filters),
        queryFn: () => uploadsAPI.list(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

/**
 * Get storage statistics
 */
export function useStorageStats(
    options?: Omit<UseQueryOptions<StorageStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: uploadsKeys.stats(),
        queryFn: () => uploadsAPI.getStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get files by entity
 */
export function useFilesByEntity(
    entityType: string,
    entityId: number,
    options?: Omit<UseQueryOptions<UploadedFile[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: uploadsKeys.byEntity(entityType, entityId),
        queryFn: () => uploadsAPI.getByEntity(entityType, entityId),
        enabled: !!entityType && !!entityId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

/**
 * Get file by ID
 */
export function useFile(
    id: number,
    options?: Omit<UseQueryOptions<UploadedFile>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: uploadsKeys.detail(id),
        queryFn: () => uploadsAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== FILE MANAGEMENT MUTATIONS ====================

/**
 * Update file display order
 */
export function useUpdateDisplayOrder(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, displayOrder }: { id: number; displayOrder: number }) =>
            uploadsAPI.updateDisplayOrder(id, displayOrder, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: uploadsKeys.detail(variables.id) })
        },
    })
}

// ==================== S3 OPERATIONS ====================

/**
 * Generate presigned URL for S3 file access
 */
export function useGeneratePresignedUrl(config?: RequestConfig) {
    return useMutation({
        mutationFn: ({ id, options }: { id: number; options: GeneratePresignedUrlDto }) =>
            uploadsAPI.generatePresignedUrl(id, options, config),
    })
}

// ==================== S3 CONFIGURATION QUERIES ====================

/**
 * Get S3 configuration
 */
export function useS3Config(
    options?: Omit<UseQueryOptions<Partial<S3Config> & { enabled: boolean }>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: uploadsKeys.s3Config(),
        queryFn: () => uploadsAPI.getS3Config(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

// ==================== S3 CONFIGURATION MUTATIONS ====================

/**
 * Save S3 configuration
 */
export function useSaveS3Config(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: S3Config) => uploadsAPI.saveS3Config(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: uploadsKeys.s3Config() })
        },
    })
}

/**
 * Update S3 configuration
 */
export function useUpdateS3Config(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateS3ConfigDto) => uploadsAPI.updateS3Config(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: uploadsKeys.s3Config() })
        },
    })
}

/**
 * Delete S3 configuration
 */
export function useDeleteS3Config(config?: RequestConfig) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => uploadsAPI.deleteS3Config(config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: uploadsKeys.s3Config() })
        },
    })
}

/**
 * Test S3 connection
 */
export function useTestS3Config(config?: RequestConfig) {
    return useMutation({
        mutationFn: () => uploadsAPI.testS3Config(config),
    })
}

// ==================== UPLOAD WITH PROGRESS ====================

/**
 * Hook to upload file with progress tracking
 * This is a more advanced version that can track upload progress
 */
export function useUploadWithProgress(
    onProgress?: (progress: number) => void,
    config?: RequestConfig
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ file, options }: { file: File; options?: UploadFileOptions }) => {
            // Create a config with progress tracking
            const progressConfig: RequestConfig = {
                ...config,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        onProgress?.(percentCompleted)
                    }
                },
            }

            return uploadsAPI.uploadSingle(file, options, progressConfig)
        },
        onSuccess: (data, variables) => {
            // Invalidate all upload lists
            queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() })

            // If file is associated with an entity, invalidate that entity's files
            if (variables.options?.entityType && variables.options?.entityId) {
                queryClient.invalidateQueries({
                    queryKey: uploadsKeys.byEntity(
                        variables.options.entityType,
                        variables.options.entityId
                    ),
                })
            }
        },
    })
}

/**
 * Hook to upload multiple files with progress tracking
 */
export function useUploadMultipleWithProgress(
    onProgress?: (progress: number) => void,
    config?: RequestConfig
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ files, options }: { files: File[]; options?: UploadFileOptions }) => {
            // Create a config with progress tracking
            const progressConfig: RequestConfig = {
                ...config,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        onProgress?.(percentCompleted)
                    }
                },
            }

            return uploadsAPI.uploadMultiple(files, options, progressConfig)
        },
        onSuccess: (data, variables) => {
            // Invalidate all upload lists
            queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() })

            // If files are associated with an entity, invalidate that entity's files
            if (variables.options?.entityType && variables.options?.entityId) {
                queryClient.invalidateQueries({
                    queryKey: uploadsKeys.byEntity(
                        variables.options.entityType,
                        variables.options.entityId
                    ),
                })
            }
        },
    })
}

// ==================== HELPER HOOKS ====================

/**
 * Custom hook to handle file input and upload
 */
export function useFileUpload(options?: {
    multiple?: boolean
    accept?: string
    maxSize?: number // in bytes
    onProgress?: (progress: number) => void
    uploadOptions?: UploadFileOptions
    config?: RequestConfig
}) {
    const uploadSingle = options?.onProgress
        ? useUploadWithProgress(options.onProgress, options.config)
        : useUploadSingle(options?.config)

    const uploadMultiple = options?.onProgress
        ? useUploadMultipleWithProgress(options.onProgress, options.config)
        : useUploadMultiple(options?.config)

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return

        // Validate file size
        if (options?.maxSize) {
            const oversizedFiles = Array.from(files).filter((f) => f.size > options.maxSize!)
            if (oversizedFiles.length > 0) {
                throw new Error(
                    `File(s) too large: ${oversizedFiles.map((f) => f.name).join(', ')}`
                )
            }
        }

        // Upload
        if (options?.multiple && files.length > 1) {
            return uploadMultiple.mutate({
                files: Array.from(files),
                options: options.uploadOptions,
            })
        } else {
            return uploadSingle.mutate({
                file: files[0],
                options: options.uploadOptions,
            })
        }
    }

    return {
        handleFileSelect,
        isUploading: uploadSingle.isPending || uploadMultiple.isPending,
        uploadProgress: 0, // Can be enhanced to track actual progress
        error: uploadSingle.error || uploadMultiple.error,
        uploadedFile: uploadSingle.data,
        uploadedFiles: uploadMultiple.data,
    }
}
