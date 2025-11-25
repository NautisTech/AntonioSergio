// ==================== ENUMS ====================

export type CourseVisibility = 'public' | 'internal' | 'clients' | 'private'

export type CourseStatus = 'draft' | 'published' | 'archived'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type LessonType = 'video' | 'text' | 'quiz' | 'assignment' | 'download' | 'external_link'

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'expired' | 'cancelled'

export type CertificateStatus = 'pending' | 'issued' | 'revoked'

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'

// ==================== COURSES ====================

export interface Course {
    id: number
    title: string
    description: string
    visibility: CourseVisibility
    status: CourseStatus
    level: CourseLevel
    category?: string
    coverImage?: string
    price?: number
    currency?: string
    estimatedDuration?: number
    language?: string
    prerequisites?: string
    objectives?: string
    instructorId?: number
    instructor_name?: string
    certificateEnabled: boolean
    certificateTemplate?: string
    passingScore?: number
    enrollmentExpiryDays?: number
    maxEnrollments?: number
    requireApproval: boolean
    featured: boolean
    totalEnrollments?: number
    rating?: number
    reviewCount?: number
    modules?: TrainingModule[]
    permissions?: {
        userIds?: number[]
        roleIds?: number[]
        departmentIds?: number[]
        clientIds?: number[]
    }
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateCourseDto {
    title: string
    description: string
    visibility: CourseVisibility
    status: CourseStatus
    level: CourseLevel
    category?: string
    coverImage?: string
    price?: number
    currency?: string
    estimatedDuration?: number
    language?: string
    prerequisites?: string
    objectives?: string
    instructorId?: number
    certificateEnabled?: boolean
    certificateTemplate?: string
    passingScore?: number
    enrollmentExpiryDays?: number
    maxEnrollments?: number
    requireApproval?: boolean
    featured?: boolean
    permissions?: {
        userIds?: number[]
        roleIds?: number[]
        departmentIds?: number[]
        clientIds?: number[]
    }
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface CourseFilters {
    visibility?: CourseVisibility
    status?: CourseStatus
    level?: CourseLevel
    category?: string
    instructorId?: number
    search?: string
    freeOnly?: boolean
    featuredOnly?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

// ==================== TRAINING MODULES ====================

export interface TrainingModule {
    id: number
    courseId: number
    title: string
    description?: string
    order: number
    estimatedDuration?: number
    lessons?: Lesson[]
    createdAt: string
    updatedAt?: string
}

export interface CreateTrainingModuleDto {
    courseId: number
    title: string
    description?: string
    order?: number
    estimatedDuration?: number
}

export interface UpdateTrainingModuleDto extends Partial<CreateTrainingModuleDto> {}

// ==================== LESSONS ====================

export interface Lesson {
    id: number
    moduleId: number
    title: string
    type: LessonType
    content?: string
    videoUrl?: string
    videoDuration?: number
    downloadUrl?: string
    externalUrl?: string
    order: number
    estimatedDuration?: number
    freePreview: boolean
    createdAt: string
    updatedAt?: string
}

export interface CreateLessonDto {
    moduleId: number
    title: string
    type: LessonType
    content?: string
    videoUrl?: string
    videoDuration?: number
    downloadUrl?: string
    externalUrl?: string
    order?: number
    estimatedDuration?: number
    freePreview?: boolean
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {}

// ==================== QUIZZES ====================

export interface Quiz {
    id: number
    moduleId: number
    title: string
    description?: string
    passingScore: number
    timeLimit?: number
    maxAttempts?: number
    randomizeQuestions: boolean
    showCorrectAnswers: boolean
    questions?: QuizQuestion[]
    createdAt: string
    updatedAt?: string
}

export interface QuizQuestion {
    id: number
    quizId: number
    type: QuestionType
    question: string
    options?: QuizQuestionOption[]
    correctAnswer?: string
    points: number
    order: number
    explanation?: string
}

export interface QuizQuestionOption {
    id: number
    text: string
    isCorrect: boolean
    explanation?: string
}

export interface CreateQuizDto {
    moduleId: number
    title: string
    description?: string
    passingScore?: number
    timeLimit?: number
    maxAttempts?: number
    randomizeQuestions?: boolean
    showCorrectAnswers?: boolean
}

export interface UpdateQuizDto extends Partial<CreateQuizDto> {}

export interface CreateQuizQuestionDto {
    quizId: number
    type: QuestionType
    question: string
    options?: {
        text: string
        isCorrect: boolean
        explanation?: string
    }[]
    correctAnswer?: string
    points?: number
    order?: number
    explanation?: string
}

export interface UpdateQuizQuestionDto extends Partial<CreateQuizQuestionDto> {}

export interface SubmitQuizDto {
    quizId: number
    answers: {
        questionId: number
        selectedOptions?: number[]
        textAnswer?: string
    }[]
}

export interface QuizAttempt {
    id: number
    enrollmentId: number
    quizId: number
    score: number
    totalPoints: number
    percentage: number
    passed: boolean
    startedAt: string
    submittedAt: string
    timeSpent: number
    answers: QuizAttemptAnswer[]
}

export interface QuizAttemptAnswer {
    questionId: number
    selectedOptions?: number[]
    textAnswer?: string
    isCorrect: boolean
    pointsEarned: number
}

// ==================== ENROLLMENTS ====================

export interface Enrollment {
    id: number
    courseId: number
    course_title?: string
    userId: number
    user_name?: string
    user_email?: string
    status: EnrollmentStatus
    paymentReference?: string
    enrolledAt: string
    expiresAt?: string
    completedAt?: string
    progress?: number
    lastAccessedAt?: string
    notes?: string
    createdAt: string
    updatedAt?: string
}

export interface CreateEnrollmentDto {
    courseId: number
    userId?: number
    paymentReference?: string
    notes?: string
}

export interface UpdateEnrollmentDto {
    status?: EnrollmentStatus
    expiresAt?: string
    notes?: string
}

export interface EnrollmentFilters {
    courseId?: number
    userId?: number
    status?: EnrollmentStatus
    page?: number
    pageSize?: number
}

// ==================== PROGRESS ====================

export interface EnrollmentProgress {
    enrollmentId: number
    courseId: number
    userId: number
    totalModules: number
    completedModules: number
    totalLessons: number
    completedLessons: number
    totalQuizzes: number
    passedQuizzes: number
    overallProgress: number
    lastAccessedAt?: string
    modules: ModuleProgress[]
}

export interface ModuleProgress {
    moduleId: number
    moduleName: string
    totalLessons: number
    completedLessons: number
    progress: number
    lessons: LessonProgress[]
}

export interface LessonProgress {
    lessonId: number
    lessonTitle: string
    lessonType: LessonType
    isCompleted: boolean
    completedAt?: string
    timeSpent?: number
}

export interface MarkLessonCompleteDto {
    lessonId: number
    timeSpent?: number
    notes?: string
}

// ==================== CERTIFICATES ====================

export interface Certificate {
    id: number
    enrollmentId: number
    courseId: number
    course_title?: string
    userId: number
    user_name?: string
    user_email?: string
    certificateNumber: string
    verificationCode: string
    status: CertificateStatus
    issuedAt: string
    revokedAt?: string
    revocationReason?: string
    expiresAt?: string
    customData?: {
        title?: string
        description?: string
        additionalInfo?: string
    }
    pdfUrl?: string
    createdAt: string
}

export interface IssueCertificateDto {
    enrollmentId: number
    customData?: {
        title?: string
        description?: string
        additionalInfo?: string
    }
}

export interface RevokeCertificateDto {
    certificateId: number
    reason: string
}

export interface CertificateVerification {
    valid: boolean
    certificate?: Certificate
    message: string
}

// ==================== STATISTICS ====================

export interface TrainingStats {
    totalCourses: number
    publishedCourses: number
    totalEnrollments: number
    activeEnrollments: number
    completedEnrollments: number
    certificatesIssued: number
    averageCompletionRate: number
    topCourses: Array<{
        courseId: number
        courseTitle: string
        enrollments: number
        completionRate: number
    }>
    recentEnrollments: Enrollment[]
}
