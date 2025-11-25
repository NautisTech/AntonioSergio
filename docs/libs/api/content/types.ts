// ==================== ENUMS ====================

export type ContentStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'scheduled' | 'archived' | 'rejected'

export type ContentVisibility = 'public' | 'internal' | 'clients' | 'private'

export type ContentType =
    | 'article'
    | 'news'
    | 'tutorial'
    | 'documentation'
    | 'faq'
    | 'announcement'
    | 'policy'
    | 'guide'
    | 'changelog'
    | 'custom'

export type MediaType = 'image' | 'video' | 'document' | 'audio' | 'other'

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam'

// ==================== SEO & METADATA ====================

export interface SeoMetadata {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string[]
    canonicalUrl?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    twitterCard?: string
    robots?: string
}

// ==================== CONTENT ====================

export interface Content {
    id: number
    title: string
    slug: string
    excerpt?: string
    content: string
    type: ContentType
    contentTypeId?: number
    status: ContentStatus
    visibility: ContentVisibility
    featuredImage?: string
    authorId?: number
    author_name?: string
    categoryIds?: number[]
    categories?: ContentCategory[]
    tags?: Tag[]
    seo?: SeoMetadata
    publishedAt?: string
    allowComments: boolean
    isFeatured: boolean
    language: string
    parentId?: number
    relatedContentIds?: number[]
    relatedContent?: Content[]
    customFields?: any
    permissions?: {
        userIds?: number[]
        roleIds?: number[]
        departmentIds?: number[]
    }
    viewCount?: number
    likeCount?: number
    commentCount?: number
    shareCount?: number
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateContentDto {
    title: string
    slug?: string
    excerpt?: string
    content: string
    type: ContentType
    contentTypeId?: number
    status: ContentStatus
    visibility: ContentVisibility
    featuredImage?: string
    authorId?: number
    categoryIds?: number[]
    tags?: string[]
    seo?: SeoMetadata
    publishedAt?: string
    allowComments?: boolean
    isFeatured?: boolean
    language?: string
    parentId?: number
    relatedContentIds?: number[]
    customFields?: any
    permissions?: {
        userIds?: number[]
        roleIds?: number[]
        departmentIds?: number[]
    }
}

export interface UpdateContentDto extends CreateContentDto {}

export interface ContentVersion {
    id: number
    contentId: number
    version: number
    title: string
    content: string
    createdAt: string
    createdBy: number
    created_by_name?: string
}

// ==================== CATEGORIES ====================

export interface ContentCategory {
    id: number
    name: string
    slug: string
    description?: string
    parentId?: number
    parent_name?: string
    children?: ContentCategory[]
    icon?: string
    color?: string
    order: number
    visible: boolean
    contentCount?: number
    createdAt: string
    updatedAt?: string
}

export interface CreateContentCategoryDto {
    name: string
    slug?: string
    description?: string
    parentId?: number
    icon?: string
    color?: string
    order?: number
    visible?: boolean
}

export interface UpdateContentCategoryDto extends CreateContentCategoryDto {}

// ==================== TAGS ====================

export interface Tag {
    id: number
    name: string
    slug: string
    color?: string
    usageCount?: number
    createdAt: string
}

export interface CreateTagDto {
    name: string
    slug?: string
    color?: string
}

// ==================== COMMENTS ====================

export interface Comment {
    id: number
    contentId: number
    content_title?: string
    parentId?: number
    text: string
    status: CommentStatus
    authorId?: number
    author_name?: string
    authorName?: string
    authorEmail?: string
    authorIp?: string
    userAgent?: string
    replies?: Comment[]
    likeCount?: number
    createdAt: string
    updatedAt?: string
    moderatedAt?: string
    moderatedBy?: number
    moderator_name?: string
    moderationReason?: string
}

export interface CreateCommentDto {
    contentId: number
    text: string
    parentId?: number
    authorName?: string
    authorEmail?: string
}

export interface UpdateCommentDto {
    text: string
}

export interface ModerateCommentDto {
    status: CommentStatus
    reason?: string
}

// ==================== MEDIA LIBRARY ====================

export interface Media {
    id: number
    title: string
    description?: string
    fileUrl: string
    fileName: string
    fileSize: number
    mimeType: string
    type: MediaType
    altText?: string
    tags?: string[]
    metadata?: any
    usageCount?: number
    createdAt: string
    updatedAt?: string
    uploadedBy?: number
    uploader_name?: string
}

export interface CreateMediaDto {
    title: string
    description?: string
    fileUrl: string
    fileName: string
    fileSize: number
    mimeType: string
    type: MediaType
    altText?: string
    tags?: string[]
    metadata?: any
}

export interface UpdateMediaDto extends CreateMediaDto {}

// ==================== FILTERS & RESPONSES ====================

export interface ContentFilters {
    type?: ContentType
    status?: ContentStatus
    visibility?: ContentVisibility
    categoryId?: number
    authorId?: number
    search?: string
    tags?: string
    language?: string
    featuredOnly?: boolean
    includeScheduled?: boolean
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface ContentListResponse {
    data: Content[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

export interface MediaListFilters {
    type?: MediaType
    tag?: string
    search?: string
    page?: number
    pageSize?: number
}

export interface MediaListResponse {
    data: Media[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

export interface CommentListFilters {
    approvedOnly?: boolean
    page?: number
    pageSize?: number
}

export interface CommentListResponse {
    data: Comment[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

// ==================== ANALYTICS ====================

export interface OverviewAnalytics {
    totalContent: number
    publishedContent: number
    draftContent: number
    scheduledContent: number
    totalViews: number
    totalComments: number
    totalShares: number
    averageEngagement: number
    byStatus: {
        [key in ContentStatus]?: number
    }
    byType: {
        [key in ContentType]?: number
    }
    byVisibility: {
        [key in ContentVisibility]?: number
    }
}

export interface TypeStatistics {
    type: ContentType
    count: number
    published: number
    totalViews: number
    averageViews: number
}

export interface TopPerformingContent {
    id: number
    title: string
    slug: string
    type: ContentType
    views: number
    likes: number
    comments: number
    shares: number
    score: number
    publishedAt: string
}

export interface PerformanceTrend {
    date: string
    views: number
    likes: number
    comments: number
    shares: number
    published: number
}

export interface PublishingTrend {
    month: string
    published: number
    draft: number
    scheduled: number
}

export interface AuthorStatistics {
    authorId: number
    authorName: string
    contentCount: number
    publishedCount: number
    totalViews: number
    averageViews: number
    totalComments: number
}

export interface CategoryStatistics {
    categoryId: number
    categoryName: string
    contentCount: number
    totalViews: number
    averageViews: number
}

export interface TagStatistics {
    tagId: number
    tagName: string
    usageCount: number
    totalViews: number
}

export interface EngagementStatistics {
    contentId?: number
    totalViews: number
    totalLikes: number
    totalComments: number
    totalShares: number
    engagementRate: number
    averageTimeOnPage?: number
    bounceRate?: number
}

export interface VisitorStatistics {
    date: string
    uniqueVisitors: number
    pageViews: number
    newVisitors: number
    returningVisitors: number
}

export interface VisibilityPerformance {
    visibility: ContentVisibility
    count: number
    averageViews: number
    averageEngagement: number
}

export interface MediaStatistics {
    totalMedia: number
    totalSize: number
    byType: {
        [key in MediaType]?: {
            count: number
            size: number
        }
    }
    recentUploads: number
}
