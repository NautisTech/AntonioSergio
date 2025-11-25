/**
 * Public Content API Types
 * Type definitions for public-facing content endpoints
 */

// ==================== ENUMS ====================

/**
 * @typedef {'draft' | 'pending_review' | 'approved' | 'published' | 'scheduled' | 'archived' | 'rejected'} ContentStatus
 */

/**
 * @typedef {'public' | 'internal' | 'clients' | 'private'} ContentVisibility
 */

/**
 * @typedef {'news' | 'banner' | 'event' | 'project' | 'faq' | 'article' | 'announcement' | 'custom'} ContentType
 */

// ==================== BASE TYPES ====================

/**
 * Tag
 * @typedef {Object} Tag
 * @property {number} id - Tag ID
 * @property {string} name - Tag name
 * @property {string} slug - Tag slug
 * @property {string} [color] - Tag color
 * @property {number} [usageCount] - Number of times used
 */

/**
 * Category
 * @typedef {Object} Category
 * @property {number} id - Category ID
 * @property {string} name - Category name
 * @property {string} slug - Category slug
 * @property {string} [description] - Category description
 * @property {number} [parentId] - Parent category ID
 * @property {string} [icon] - Category icon
 * @property {string} [color] - Category color
 * @property {Category[]} [children] - Child categories
 * @property {number} [contentCount] - Number of content items
 */

/**
 * Author Information
 * @typedef {Object} Author
 * @property {number} id - Author ID
 * @property {string} name - Author name
 * @property {string} [email] - Author email
 * @property {string} [avatar] - Author avatar URL
 */

/**
 * Custom Field Value
 * @typedef {Object} CustomField
 * @property {string} code - Custom field code
 * @property {string} [value_text] - Text value
 * @property {number} [value_number] - Number value
 * @property {string} [value_date] - Date value
 * @property {boolean} [value_boolean] - Boolean value
 * @property {any} [value_json] - JSON value
 */

// ==================== CONTENT TYPES ====================

/**
 * Content Item (Public)
 * @typedef {Object} Content
 * @property {number} id - Content ID
 * @property {string} title - Content title
 * @property {string} slug - Content slug
 * @property {string} [excerpt] - Short excerpt
 * @property {string} content - Full content (HTML)
 * @property {ContentType} type - Content type
 * @property {number} [content_type_id] - Content type ID
 * @property {ContentStatus} status - Content status
 * @property {ContentVisibility} visibility - Content visibility
 * @property {string} [featured_image] - Featured image URL
 * @property {number} [author_id] - Author ID
 * @property {string} [author_name] - Author name
 * @property {Category[]} [categories] - Associated categories
 * @property {Tag[]} [tags] - Associated tags
 * @property {string} [published_at] - Publication date
 * @property {boolean} allow_comments - Whether comments are allowed
 * @property {boolean} is_featured - Whether content is featured
 * @property {string} language - Content language (e.g., 'pt', 'en')
 * @property {number} [view_count] - View count
 * @property {number} [like_count] - Like count
 * @property {number} [comment_count] - Comment count
 * @property {number} [share_count] - Share count
 * @property {string} created_at - Creation date
 * @property {string} [updated_at] - Last update date
 * @property {Object} [custom_fields] - Custom fields (dynamic)
 */

// ==================== FILTER TYPES ====================

/**
 * Content Filters
 * @typedef {Object} ContentFilters
 * @property {ContentType} [type] - Filter by content type
 * @property {number} [categoryId] - Filter by category ID
 * @property {string} [tags] - Filter by tags (comma-separated)
 * @property {string} [search] - Search query
 * @property {boolean} [featuredOnly] - Only featured content
 * @property {number} [page] - Page number
 * @property {number} [pageSize] - Items per page
 * @property {string} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [sortOrder] - Sort order
 * @property {string} [language] - Filter by language
 */

// ==================== RESPONSE TYPES ====================

/**
 * Paginated Response
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {T[]} data - Array of items
 * @property {Object} [pagination] - Pagination metadata
 * @property {number} pagination.total - Total number of items
 * @property {number} pagination.page - Current page
 * @property {number} pagination.pageSize - Items per page
 * @property {number} pagination.totalPages - Total pages
 */

/**
 * Comment
 * @typedef {Object} Comment
 * @property {number} id - Comment ID
 * @property {number} contentId - Content ID
 * @property {string} text - Comment text
 * @property {number} [parentId] - Parent comment ID (for replies)
 * @property {string} [authorName] - Comment author name
 * @property {string} [authorEmail] - Comment author email
 * @property {Comment[]} [replies] - Nested replies
 * @property {number} [likeCount] - Number of likes
 * @property {string} created_at - Creation date
 * @property {string} [updated_at] - Last update date
 */

/**
 * Create Comment DTO
 * @typedef {Object} CreateCommentDto
 * @property {number} contentId - Content ID
 * @property {string} text - Comment text
 * @property {number} [parentId] - Parent comment ID (for replies)
 * @property {string} [authorName] - Author name (for anonymous comments)
 * @property {string} [authorEmail] - Author email (for anonymous comments)
 */

// Export empty object to make this a module
export {};
