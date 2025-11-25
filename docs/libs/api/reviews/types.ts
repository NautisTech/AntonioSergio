// ==================== ENUMS ====================

export type ReviewType =
    | 'customer_satisfaction'
    | 'support_quality'
    | 'intervention_quality'
    | 'employee_peer_review'
    | 'employee_self_review'
    | 'employee_to_manager'
    | 'manager_to_employee'
    | 'employee_satisfaction'
    | 'employee_performance'
    | 'supplier_quality'
    | 'brand_quality'
    | 'equipment_quality'
    | 'product_quality'
    | 'custom'

export type QuestionType =
    | 'rating'
    | 'scale'
    | 'multiple_choice'
    | 'single_choice'
    | 'yes_no'
    | 'text'
    | 'textarea'
    | 'nps'
    | 'csat'
    | 'ces'

export type ReviewRequestStatus = 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled'

export type TriggerType = 'manual' | 'automatic' | 'scheduled' | 'event_based'

export type TriggerEvent =
    | 'ticket_closed'
    | 'intervention_completed'
    | 'every_n_interventions'
    | 'every_n_tickets'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | 'employee_anniversary'
    | 'probation_end'

// ==================== QUESTION OPTIONS ====================

export interface QuestionOption {
    value: string
    label: string
    score?: number
}

// ==================== REVIEW QUESTIONS ====================

export interface ReviewQuestion {
    id: number
    templateId: number
    question: string
    description?: string
    type: QuestionType
    required: boolean
    order: number
    options?: QuestionOption[]
    minValue?: number
    maxValue?: number
    minLabel?: string
    maxLabel?: string
    createdAt: string
    updatedAt?: string
}

export interface CreateReviewQuestionDto {
    question: string
    description?: string
    type: QuestionType
    required?: boolean
    order?: number
    options?: QuestionOption[]
    minValue?: number
    maxValue?: number
    minLabel?: string
    maxLabel?: string
}

// ==================== REVIEW TEMPLATES ====================

export interface ReviewTemplate {
    id: number
    name: string
    description?: string
    type: ReviewType
    introMessage?: string
    thankYouMessage?: string
    requiresApproval: boolean
    allowAnonymous: boolean
    active: boolean
    icon?: string
    color?: string
    questions?: ReviewQuestion[]
    requestCount?: number
    responseCount?: number
    averageScore?: number
    createdAt: string
    updatedAt?: string
    createdBy?: number
}

export interface CreateReviewTemplateDto {
    name: string
    description?: string
    type: ReviewType
    questions: CreateReviewQuestionDto[]
    introMessage?: string
    thankYouMessage?: string
    requiresApproval?: boolean
    allowAnonymous?: boolean
    active?: boolean
    icon?: string
    color?: string
}

export interface UpdateReviewTemplateDto extends CreateReviewTemplateDto {}

// ==================== REVIEW REQUESTS ====================

export interface ReviewRequest {
    id: number
    templateId: number
    template_name?: string
    template_type?: ReviewType
    respondentUserId?: number
    respondentEmployeeId?: number
    respondentClientId?: number
    respondentEmail?: string
    respondent_name?: string
    subjectUserId?: number
    subjectEmployeeId?: number
    subject_name?: string
    ticketId?: number
    interventionId?: number
    supplierId?: number
    brandId?: number
    equipmentId?: number
    status: ReviewRequestStatus
    deadline?: string
    sentAt: string
    startedAt?: string
    completedAt?: string
    cancelledAt?: string
    customMessage?: string
    metadata?: any
    createdAt: string
    createdBy?: number
}

export interface CreateReviewRequestDto {
    templateId: number
    respondentUserId?: number
    respondentEmployeeId?: number
    respondentClientId?: number
    respondentEmail?: string
    subjectUserId?: number
    subjectEmployeeId?: number
    ticketId?: number
    interventionId?: number
    supplierId?: number
    brandId?: number
    equipmentId?: number
    deadline?: string
    sendEmail?: boolean
    customMessage?: string
    metadata?: any
}

// ==================== REVIEW RESPONSES ====================

export interface ReviewAnswer {
    questionId: number
    question_text?: string
    question_type?: QuestionType
    answer: any
    comment?: string
}

export interface ReviewResponse {
    id: number
    requestId: number
    respondentUserId?: number
    respondent_name?: string
    answers: ReviewAnswer[]
    overallComment?: string
    overallScore?: number
    completedAt: string
}

export interface SubmitReviewResponseDto {
    requestId: number
    answers: Array<{
        questionId: number
        answer: any
        comment?: string
    }>
    overallComment?: string
}

// ==================== REVIEW TRIGGERS ====================

export interface ReviewTrigger {
    id: number
    name: string
    description?: string
    templateId: number
    template_name?: string
    triggerType: TriggerType
    event?: TriggerEvent
    eventCount?: number
    targetRole?: string
    targetDepartmentId?: number
    daysUntilDeadline?: number
    reminderDays?: number
    active: boolean
    conditions?: any
    lastTriggeredAt?: string
    triggerCount?: number
    createdAt: string
    updatedAt?: string
}

export interface CreateReviewTriggerDto {
    name: string
    description?: string
    templateId: number
    triggerType: TriggerType
    event?: TriggerEvent
    eventCount?: number
    targetRole?: string
    targetDepartmentId?: number
    daysUntilDeadline?: number
    reminderDays?: number
    active?: boolean
    conditions?: any
}

export interface UpdateReviewTriggerDto extends CreateReviewTriggerDto {}

// ==================== FILTERS & RESPONSES ====================

export interface TemplateListFilters {
    type?: ReviewType
    active?: boolean
    page?: number
    pageSize?: number
}

export interface TemplateListResponse {
    data: ReviewTemplate[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

export interface ReviewRequestFilters {
    templateId?: number
    status?: ReviewRequestStatus
    respondentUserId?: number
    respondentEmployeeId?: number
    subjectUserId?: number
    overdueOnly?: boolean
    page?: number
    pageSize?: number
}

export interface ReviewRequestListResponse {
    data: ReviewRequest[]
    pagination?: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

export interface TriggerListFilters {
    activeOnly?: boolean
}

export interface TriggerListResponse {
    data: ReviewTrigger[]
}

// ==================== ANALYTICS ====================

export interface ReviewAnalyticsFilters {
    templateId?: number
    type?: ReviewType
    startDate?: string
    endDate?: string
    subjectUserId?: number
    departmentId?: number
}

export interface OverviewAnalytics {
    totalTemplates: number
    activeTemplates: number
    totalRequests: number
    totalResponses: number
    completionRate: number
    averageScore: number
    averageResponseTime: number
    pendingRequests: number
    overdueRequests: number
    byStatus: {
        pending: number
        in_progress: number
        completed: number
        expired: number
        cancelled: number
    }
    byType: {
        [key in ReviewType]?: {
            count: number
            averageScore: number
        }
    }
}

export interface TypeStatistics {
    type: ReviewType
    totalRequests: number
    totalResponses: number
    completionRate: number
    averageScore: number
    averageResponseTime: number
}

export interface TopRatedSubject {
    id: number
    name: string
    type: 'employee' | 'supplier' | 'brand'
    reviewCount: number
    averageScore: number
    latestReview?: string
}

export interface ResponseTrend {
    period: string
    requests: number
    responses: number
    completionRate: number
    averageScore: number
}

export interface QuestionAnalytics {
    questionId: number
    question: string
    type: QuestionType
    responseCount: number
    averageScore?: number
    distribution?: {
        [key: string]: number
    }
    textResponses?: string[]
}

export interface CompletionRates {
    overall: number
    byRespondentType: {
        employee: number
        client: number
        external: number
    }
    byTemplateType: {
        [key in ReviewType]?: number
    }
}

export interface EmployeePerformanceSummary {
    employeeId: number
    employeeName: string
    totalReviews: number
    averageScore: number
    reviewsByType: {
        [key in ReviewType]?: {
            count: number
            averageScore: number
        }
    }
    strengths?: string[]
    areasForImprovement?: string[]
    trendOverTime?: Array<{
        period: string
        averageScore: number
    }>
}

export interface TemplateStatistics {
    totalTemplates: number
    activeTemplates: number
    inactiveTemplates: number
    byType: {
        [key in ReviewType]?: number
    }
    mostUsedTemplate?: {
        id: number
        name: string
        usageCount: number
    }
}
