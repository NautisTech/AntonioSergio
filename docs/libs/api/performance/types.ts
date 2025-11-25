// ==================== ENUMS ====================

export type ReviewType = 'annual' | 'quarterly' | 'probation' | 'project' | 'spot' | 'self'

export type ReviewStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled'

export type GoalType = 'individual' | 'team' | 'company' | 'development' | 'performance'

export type GoalStatus = 'active' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'

export type RatingScale = 1 | 2 | 3 | 4 | 5

// ==================== PERFORMANCE REVIEWS ====================

export interface PerformanceReview {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    reviewerId: number
    reviewer_name?: string
    reviewPeriodStart: string
    reviewPeriodEnd: string
    reviewType: ReviewType
    status: ReviewStatus
    overallRating?: RatingScale
    strengths?: string
    areasForImprovement?: string
    achievements?: string
    goals?: string
    comments?: string
    reviewDate?: string
    nextReviewDate?: string
    categories?: ReviewCategory[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface ReviewCategory {
    id: number
    reviewId: number
    categoryName: string
    rating: RatingScale
    comments?: string
    weight?: number
}

export interface CreatePerformanceReviewDto {
    employeeId: number
    reviewerId: number
    reviewPeriodStart: string
    reviewPeriodEnd: string
    reviewType: ReviewType
    overallRating?: RatingScale
    strengths?: string
    areasForImprovement?: string
    achievements?: string
    goals?: string
    comments?: string
    reviewDate?: string
    nextReviewDate?: string
    categories?: CreateReviewCategoryDto[]
}

export interface UpdatePerformanceReviewDto {
    employeeId?: number
    reviewerId?: number
    reviewPeriodStart?: string
    reviewPeriodEnd?: string
    reviewType?: ReviewType
    status?: ReviewStatus
    overallRating?: RatingScale
    strengths?: string
    areasForImprovement?: string
    achievements?: string
    goals?: string
    comments?: string
    reviewDate?: string
    nextReviewDate?: string
}

export interface CreateReviewCategoryDto {
    categoryName: string
    rating: RatingScale
    comments?: string
    weight?: number
}

// ==================== PERFORMANCE GOALS ====================

export interface PerformanceGoal {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    setBy: number
    setter_name?: string
    goalType: GoalType
    title: string
    description?: string
    startDate: string
    targetDate: string
    completedDate?: string
    status: GoalStatus
    progress?: number
    priority?: 'low' | 'medium' | 'high'
    measurementCriteria?: string
    actualOutcome?: string
    notes?: string
    milestones?: GoalMilestone[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface GoalMilestone {
    id: number
    goalId: number
    title: string
    description?: string
    targetDate: string
    completedDate?: string
    isCompleted: boolean
}

export interface CreatePerformanceGoalDto {
    employeeId: number
    goalType: GoalType
    title: string
    description?: string
    startDate: string
    targetDate: string
    priority?: 'low' | 'medium' | 'high'
    measurementCriteria?: string
    milestones?: CreateGoalMilestoneDto[]
}

export interface UpdatePerformanceGoalDto {
    employeeId?: number
    goalType?: GoalType
    title?: string
    description?: string
    startDate?: string
    targetDate?: string
    completedDate?: string
    status?: GoalStatus
    progress?: number
    priority?: 'low' | 'medium' | 'high'
    measurementCriteria?: string
    actualOutcome?: string
    notes?: string
}

export interface CreateGoalMilestoneDto {
    title: string
    description?: string
    targetDate: string
}

export interface UpdateGoalMilestoneDto {
    title?: string
    description?: string
    targetDate?: string
    completedDate?: string
    isCompleted?: boolean
}

// ==================== FILTERS & LISTS ====================

export interface PerformanceReviewListFilters {
    employeeId?: number
    reviewerId?: number
    reviewType?: ReviewType
    status?: ReviewStatus
    fromDate?: string
    toDate?: string
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface PerformanceGoalListFilters {
    employeeId?: number
    setBy?: number
    goalType?: GoalType
    status?: GoalStatus
    priority?: 'low' | 'medium' | 'high'
    fromDate?: string
    toDate?: string
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

// ==================== STATISTICS ====================

export interface PerformanceStats {
    totalReviews: number
    completedReviews: number
    draftReviews: number
    inProgressReviews: number
    averageRating: number
    totalGoals: number
    activeGoals: number
    completedGoals: number
    overdueGoals: number
    goalCompletionRate: number
    byReviewType: Array<{
        type: ReviewType
        count: number
        averageRating: number
    }>
    byGoalType: Array<{
        type: GoalType
        count: number
        completionRate: number
    }>
    upcomingReviews: PerformanceReview[]
    overdueGoals: PerformanceGoal[]
}

export interface EmployeePerformanceSummary {
    employeeId: number
    employeeName: string
    totalReviews: number
    latestReview?: PerformanceReview
    averageRating: number
    totalGoals: number
    completedGoals: number
    activeGoals: number
    goalCompletionRate: number
    nextReviewDate?: string
}
