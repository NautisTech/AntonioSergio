// ==================== ENUMS ====================

export type TopicStatus = 'draft' | 'pending' | 'approved' | 'locked' | 'archived' | 'deleted'

export type ReactionType = 'like' | 'helpful' | 'love' | 'insightful' | 'celebrate'

export type ReportReason = 'spam' | 'offensive' | 'harassment' | 'off_topic' | 'duplicate' | 'misinformation' | 'other'

export type BadgeType = 'bronze' | 'silver' | 'gold' | 'platinum'

// ==================== CATEGORIES ====================

export interface CommunityCategory {
    id: number
    name: string
    description?: string
    slug: string
    parentId?: number
    parent_name?: string
    icon?: string
    color?: string
    order: number
    visible: boolean
    requireApproval: boolean
    topicCount?: number
    replyCount?: number
    lastActivity?: string
    createdAt: string
    updatedAt?: string
}

export interface CreateCommunityCategoryDto {
    name: string
    description?: string
    slug?: string
    parentId?: number
    icon?: string
    color?: string
    order?: number
    visible?: boolean
    requireApproval?: boolean
}

export interface UpdateCommunityCategoryDto extends Partial<CreateCommunityCategoryDto> {}

// ==================== TOPICS ====================

export interface Topic {
    id: number
    categoryId: number
    category_name?: string
    authorId: number
    author_name?: string
    author_avatar?: string
    title: string
    content: string
    status: TopicStatus
    tags?: string[]
    pinned: boolean
    featured: boolean
    locked: boolean
    allowAnonymous: boolean
    viewCount: number
    replyCount: number
    reactionCount: number
    bestAnswerId?: number
    lastReplyAt?: string
    lastReplyBy?: number
    last_reply_by_name?: string
    createdAt: string
    updatedAt?: string
}

export interface CreateTopicDto {
    categoryId: number
    title: string
    content: string
    tags?: string[]
    pinned?: boolean
    featured?: boolean
    locked?: boolean
    allowAnonymous?: boolean
}

export interface UpdateTopicDto extends Partial<CreateTopicDto> {}

export interface TopicFilters {
    categoryId?: number
    status?: TopicStatus
    authorId?: number
    search?: string
    tags?: string
    pinnedOnly?: boolean
    featuredOnly?: boolean
    unansweredOnly?: boolean
    myTopicsOnly?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface TopicListResponse {
    data: Topic[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

// ==================== REPLIES ====================

export interface Reply {
    id: number
    topicId: number
    authorId: number
    author_name?: string
    author_avatar?: string
    parentId?: number
    content: string
    isBestAnswer: boolean
    reactionCount: number
    mentionedUsers?: number[]
    mentioned_users?: Array<{
        id: number
        name: string
    }>
    replies?: Reply[]
    createdAt: string
    updatedAt?: string
}

export interface CreateReplyDto {
    topicId: number
    content: string
    parentId?: number
    mentionedUsers?: number[]
}

export interface UpdateReplyDto {
    content: string
}

// ==================== REACTIONS ====================

export interface Reaction {
    id: number
    type: ReactionType
    userId: number
    user_name?: string
    topicId?: number
    replyId?: number
    createdAt: string
}

export interface AddReactionDto {
    type: ReactionType
    topicId?: number
    replyId?: number
}

// ==================== REPORTS ====================

export interface Report {
    id: number
    reason: ReportReason
    details?: string
    topicId?: number
    replyId?: number
    reportedBy: number
    reporter_name?: string
    status: 'pending' | 'reviewed' | 'dismissed'
    moderatedBy?: number
    moderator_name?: string
    action?: 'dismiss' | 'warn' | 'remove' | 'ban'
    moderatorNotes?: string
    createdAt: string
    reviewedAt?: string
}

export interface ReportContentDto {
    reason: ReportReason
    details?: string
    topicId?: number
    replyId?: number
}

export interface ModerateReportDto {
    reportId: number
    action: 'dismiss' | 'warn' | 'remove' | 'ban'
    notes?: string
}

// ==================== BADGES ====================

export interface Badge {
    id: number
    name: string
    description: string
    type: BadgeType
    icon?: string
    points: number
    criteria?: {
        topicsCreated?: number
        repliesPosted?: number
        reactionReceived?: number
        bestAnswers?: number
    }
    awardedCount?: number
    createdAt: string
}

export interface CreateBadgeDto {
    name: string
    description: string
    type: BadgeType
    icon?: string
    points?: number
    criteria?: {
        topicsCreated?: number
        repliesPosted?: number
        reactionReceived?: number
        bestAnswers?: number
    }
}

export interface UpdateBadgeDto extends Partial<CreateBadgeDto> {}

export interface AwardBadgeDto {
    badgeId: number
    userId: number
    reason?: string
}

export interface UserBadge {
    id: number
    badgeId: number
    badge?: Badge
    userId: number
    reason?: string
    awardedAt: string
}

// ==================== SUBSCRIPTIONS ====================

export interface Subscription {
    id: number
    userId: number
    topicId?: number
    topic_title?: string
    categoryId?: number
    category_name?: string
    followedUserId?: number
    followed_user_name?: string
    notifyEmail: boolean
    notifyInApp: boolean
    createdAt: string
}

export interface SubscribeDto {
    topicId?: number
    categoryId?: number
    userId?: number
}

// ==================== USER STATISTICS ====================

export interface UserStats {
    userId: number
    userName: string
    avatar?: string
    topicsCreated: number
    repliesPosted: number
    reactionsReceived: number
    bestAnswers: number
    reputation: number
    badges: Badge[]
    joinedAt: string
    lastActive: string
}

// ==================== ADVANCED SEARCH ====================

export interface AdvancedSearchFilters {
    query?: string
    categoryIds?: number[]
    tags?: string[]
    author?: string
    hasReplies?: boolean
    hasAcceptedAnswer?: boolean
    createdAfter?: string
    createdBefore?: string
    minReactions?: number
    sortBy?: 'relevance' | 'date' | 'reactions' | 'replies'
    page?: number
    pageSize?: number
}

export interface AdvancedSearchResponse {
    data: Topic[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

// ==================== COMMUNITY STATISTICS ====================

export interface CommunityStats {
    totalTopics: number
    totalReplies: number
    totalMembers: number
    activeMembers: number
    totalReactions: number
    topContributors: Array<{
        userId: number
        userName: string
        avatar?: string
        contributions: number
        reputation: number
    }>
    topicsByCategory: Array<{
        categoryId: number
        categoryName: string
        topicCount: number
    }>
    recentActivity: Array<{
        type: 'topic' | 'reply' | 'reaction'
        id: number
        userId: number
        userName: string
        title?: string
        createdAt: string
    }>
}
