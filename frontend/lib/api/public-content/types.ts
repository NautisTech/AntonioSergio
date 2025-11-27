/**
 * Public Content API Types
 * Type definitions for public-facing content endpoints
 */

// ==================== ENUMS ====================

export type ContentStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'scheduled' | 'archived' | 'rejected'

export type ContentVisibility = 'public' | 'internal' | 'clients' | 'private'

// Content Type IDs from database
export const CONTENT_TYPES = {
    NEWS: 1,
    BANNER: 3,
    EVENT: 4,
    PROJECT: 5,
    FAQ: 6,
} as const

export type ContentTypeId = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES]

// ==================== BASE TYPES ====================

export interface Tag {
    id: number
    name: string
    slug: string
    color?: string
    usageCount?: number
}

export interface Category {
    id: number
    name: string
    slug: string
    description?: string
    parentId?: number
    parent_name?: string
    children?: Category[]
    icon?: string
    color?: string
    order: number
    visible: boolean
    contentCount?: number
}

export interface Author {
    id: number
    name: string
    email?: string
    avatar?: string
}

export interface CustomFieldValue {
    label: string
    value: string | number | boolean | null
    type: 'text' | 'textarea' | 'number' | 'date' | 'multiselect' | 'select'
    options?: Array<{ value: string; label: string }>
}

export interface CustomField {
    code: string
    value_text?: string
    value_number?: number
    value_date?: string
    value_boolean?: boolean
    value_json?: any
}

// ==================== CONTENT TYPES ====================

export interface Content {
    id: number
    title: string
    slug: string
    excerpt?: string
    content: string
    type: string
    content_type_id?: number
    status: ContentStatus
    visibility: ContentVisibility
    featured_image?: string
    author_id?: number
    author_name?: string
    categories?: Category[]
    tags?: Tag[]
    published_at?: string
    allow_comments: boolean
    is_featured: boolean
    language: string
    view_count?: number
    like_count?: number
    comment_count?: number
    share_count?: number
    created_at: string
    updated_at?: string
    custom_fields?: Record<string, CustomFieldValue>
}

// ==================== FILTER TYPES ====================

export interface ContentFilters {
    type?: string
    content_type_id?: ContentTypeId
    categoryId?: number
    tags?: string
    search?: string
    featuredOnly?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    language?: string
}

// ==================== RESPONSE TYPES ====================

export interface PaginatedResponse<T> {
    data: T[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

export interface Comment {
    id: number
    contentId: number
    content_title?: string
    parentId?: number
    text: string
    status: string
    authorId?: number
    author_name?: string
    authorName?: string
    authorEmail?: string
    replies?: Comment[]
    likeCount?: number
    created_at: string
    updated_at?: string
}

export interface CreateCommentDto {
    contentId: number
    text: string
    parentId?: number
    authorName?: string
    authorEmail?: string
}
