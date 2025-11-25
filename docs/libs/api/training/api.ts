import { apiClient, type RequestConfig } from '../client'
import type {
    Course,
    CreateCourseDto,
    UpdateCourseDto,
    CourseFilters,
    TrainingModule,
    CreateTrainingModuleDto,
    UpdateTrainingModuleDto,
    Lesson,
    CreateLessonDto,
    UpdateLessonDto,
    Quiz,
    CreateQuizDto,
    UpdateQuizDto,
    QuizQuestion,
    CreateQuizQuestionDto,
    UpdateQuizQuestionDto,
    SubmitQuizDto,
    QuizAttempt,
    Enrollment,
    CreateEnrollmentDto,
    UpdateEnrollmentDto,
    EnrollmentFilters,
    EnrollmentProgress,
    MarkLessonCompleteDto,
    Certificate,
    IssueCertificateDto,
    RevokeCertificateDto,
    CertificateVerification,
} from './types'

class TrainingAPI {
    private baseUrl = '/training'

    // ==================== COURSES ====================

    /**
     * List courses with filtering
     */
    async listCourses(filters?: CourseFilters, config?: RequestConfig): Promise<Course[]> {
        const params = new URLSearchParams()

        if (filters?.visibility) params.append('visibility', filters.visibility)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.level) params.append('level', filters.level)
        if (filters?.category) params.append('category', filters.category)
        if (filters?.instructorId) params.append('instructorId', String(filters.instructorId))
        if (filters?.search) params.append('search', filters.search)
        if (filters?.freeOnly !== undefined) params.append('freeOnly', String(filters.freeOnly))
        if (filters?.featuredOnly !== undefined) params.append('featuredOnly', String(filters.featuredOnly))
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

        const queryString = params.toString()
        const url = `${this.baseUrl}/courses${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Course[]>(url, config)
    }

    /**
     * Get course by ID
     */
    async getCourseById(id: number, config?: RequestConfig): Promise<Course> {
        return apiClient.get<Course>(`${this.baseUrl}/courses/${id}`, config)
    }

    /**
     * Create course
     */
    async createCourse(
        data: CreateCourseDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/courses`,
            data,
            {
                ...config,
                successMessage: 'Course created successfully',
            }
        )
    }

    /**
     * Update course
     */
    async updateCourse(
        id: number,
        data: UpdateCourseDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/courses/${id}`,
            data,
            {
                ...config,
                successMessage: 'Course updated successfully',
            }
        )
    }

    /**
     * Delete course
     */
    async deleteCourse(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/courses/${id}`,
            {
                ...config,
                successMessage: 'Course deleted successfully',
            }
        )
    }

    // ==================== TRAINING MODULES ====================

    /**
     * Get modules by course
     */
    async getModulesByCourse(courseId: number, config?: RequestConfig): Promise<TrainingModule[]> {
        return apiClient.get<TrainingModule[]>(`${this.baseUrl}/courses/${courseId}/modules`, config)
    }

    /**
     * Get module by ID
     */
    async getModuleById(id: number, config?: RequestConfig): Promise<TrainingModule> {
        return apiClient.get<TrainingModule>(`${this.baseUrl}/modules/${id}`, config)
    }

    /**
     * Create module
     */
    async createModule(
        data: CreateTrainingModuleDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/modules`,
            data,
            {
                ...config,
                successMessage: 'Module created successfully',
            }
        )
    }

    /**
     * Update module
     */
    async updateModule(
        id: number,
        data: UpdateTrainingModuleDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/modules/${id}`,
            data,
            {
                ...config,
                successMessage: 'Module updated successfully',
            }
        )
    }

    /**
     * Delete module
     */
    async deleteModule(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/modules/${id}`,
            {
                ...config,
                successMessage: 'Module deleted successfully',
            }
        )
    }

    // ==================== LESSONS ====================

    /**
     * Get lessons by module
     */
    async getLessonsByModule(moduleId: number, config?: RequestConfig): Promise<Lesson[]> {
        return apiClient.get<Lesson[]>(`${this.baseUrl}/modules/${moduleId}/lessons`, config)
    }

    /**
     * Get lesson by ID
     */
    async getLessonById(id: number, config?: RequestConfig): Promise<Lesson> {
        return apiClient.get<Lesson>(`${this.baseUrl}/lessons/${id}`, config)
    }

    /**
     * Create lesson
     */
    async createLesson(
        data: CreateLessonDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/lessons`,
            data,
            {
                ...config,
                successMessage: 'Lesson created successfully',
            }
        )
    }

    /**
     * Update lesson
     */
    async updateLesson(
        id: number,
        data: UpdateLessonDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/lessons/${id}`,
            data,
            {
                ...config,
                successMessage: 'Lesson updated successfully',
            }
        )
    }

    /**
     * Delete lesson
     */
    async deleteLesson(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/lessons/${id}`,
            {
                ...config,
                successMessage: 'Lesson deleted successfully',
            }
        )
    }

    // ==================== QUIZZES ====================

    /**
     * Get quiz by ID
     */
    async getQuizById(id: number, config?: RequestConfig): Promise<Quiz> {
        return apiClient.get<Quiz>(`${this.baseUrl}/quizzes/${id}`, config)
    }

    /**
     * Create quiz
     */
    async createQuiz(
        data: CreateQuizDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/quizzes`,
            data,
            {
                ...config,
                successMessage: 'Quiz created successfully',
            }
        )
    }

    /**
     * Get quiz questions
     */
    async getQuizQuestions(quizId: number, config?: RequestConfig): Promise<QuizQuestion[]> {
        return apiClient.get<QuizQuestion[]>(`${this.baseUrl}/quizzes/${quizId}/questions`, config)
    }

    /**
     * Create quiz question
     */
    async createQuizQuestion(
        data: CreateQuizQuestionDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/quiz-questions`,
            data,
            {
                ...config,
                successMessage: 'Quiz question created successfully',
            }
        )
    }

    // ==================== ENROLLMENTS ====================

    /**
     * List enrollments
     */
    async listEnrollments(filters?: EnrollmentFilters, config?: RequestConfig): Promise<Enrollment[]> {
        const params = new URLSearchParams()

        if (filters?.courseId) params.append('courseId', String(filters.courseId))
        if (filters?.userId) params.append('userId', String(filters.userId))
        if (filters?.status) params.append('status', filters.status)
        if (filters?.page) params.append('page', String(filters.page))
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))

        const queryString = params.toString()
        const url = `${this.baseUrl}/enrollments${queryString ? `?${queryString}` : ''}`

        return apiClient.get<Enrollment[]>(url, config)
    }

    /**
     * Get enrollment by ID
     */
    async getEnrollmentById(id: number, config?: RequestConfig): Promise<Enrollment> {
        return apiClient.get<Enrollment>(`${this.baseUrl}/enrollments/${id}`, config)
    }

    /**
     * Create enrollment
     */
    async createEnrollment(
        data: CreateEnrollmentDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/enrollments`,
            data,
            {
                ...config,
                successMessage: 'Enrollment created successfully',
            }
        )
    }

    /**
     * Update enrollment
     */
    async updateEnrollment(
        id: number,
        data: UpdateEnrollmentDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/enrollments/${id}`,
            data,
            {
                ...config,
                successMessage: 'Enrollment updated successfully',
            }
        )
    }

    /**
     * Approve enrollment
     */
    async approveEnrollment(
        id: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/enrollments/${id}/approve`,
            {},
            {
                ...config,
                successMessage: 'Enrollment approved successfully',
            }
        )
    }

    /**
     * Cancel enrollment
     */
    async cancelEnrollment(
        id: number,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/enrollments/${id}/cancel`,
            {},
            {
                ...config,
                successMessage: 'Enrollment cancelled successfully',
            }
        )
    }

    /**
     * Delete enrollment
     */
    async deleteEnrollment(id: number, config?: RequestConfig): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `${this.baseUrl}/enrollments/${id}`,
            {
                ...config,
                successMessage: 'Enrollment deleted successfully',
            }
        )
    }

    // ==================== PROGRESS ====================

    /**
     * Get enrollment progress
     */
    async getEnrollmentProgress(enrollmentId: number, config?: RequestConfig): Promise<EnrollmentProgress> {
        return apiClient.get<EnrollmentProgress>(`${this.baseUrl}/enrollments/${enrollmentId}/progress`, config)
    }

    /**
     * Mark lesson as complete
     */
    async markLessonComplete(
        enrollmentId: number,
        data: MarkLessonCompleteDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/enrollments/${enrollmentId}/lessons/complete`,
            data,
            {
                ...config,
                successMessage: 'Lesson marked as complete',
            }
        )
    }

    /**
     * Submit quiz
     */
    async submitQuiz(
        enrollmentId: number,
        data: SubmitQuizDto,
        config?: RequestConfig
    ): Promise<QuizAttempt> {
        return apiClient.post<QuizAttempt>(
            `${this.baseUrl}/enrollments/${enrollmentId}/quizzes/submit`,
            data,
            {
                ...config,
                successMessage: 'Quiz submitted successfully',
            }
        )
    }

    /**
     * Get quiz attempts
     */
    async getQuizAttempts(
        enrollmentId: number,
        quizId: number,
        config?: RequestConfig
    ): Promise<QuizAttempt[]> {
        return apiClient.get<QuizAttempt[]>(
            `${this.baseUrl}/enrollments/${enrollmentId}/quizzes/${quizId}/attempts`,
            config
        )
    }

    // ==================== CERTIFICATES ====================

    /**
     * Get my certificates
     */
    async getMyCertificates(config?: RequestConfig): Promise<Certificate[]> {
        return apiClient.get<Certificate[]>(`${this.baseUrl}/certificates`, config)
    }

    /**
     * Get certificate by ID
     */
    async getCertificateById(id: number, config?: RequestConfig): Promise<Certificate> {
        return apiClient.get<Certificate>(`${this.baseUrl}/certificates/${id}`, config)
    }

    /**
     * Issue certificate
     */
    async issueCertificate(
        data: IssueCertificateDto,
        config?: RequestConfig
    ): Promise<{ id: number; success: boolean; message: string }> {
        return apiClient.post<{ id: number; success: boolean; message: string }>(
            `${this.baseUrl}/certificates/issue`,
            data,
            {
                ...config,
                successMessage: 'Certificate issued successfully',
            }
        )
    }

    /**
     * Revoke certificate
     */
    async revokeCertificate(
        data: RevokeCertificateDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/certificates/revoke`,
            data,
            {
                ...config,
                successMessage: 'Certificate revoked successfully',
            }
        )
    }

    /**
     * Verify certificate (public)
     */
    async verifyCertificate(
        certificateNumber: string,
        code: string,
        config?: RequestConfig
    ): Promise<CertificateVerification> {
        return apiClient.get<CertificateVerification>(
            `${this.baseUrl}/certificates/verify/${certificateNumber}?code=${code}`,
            config
        )
    }

    // ==================== MY LEARNING ====================

    /**
     * Get my enrolled courses
     */
    async getMyEnrolledCourses(config?: RequestConfig): Promise<Course[]> {
        return apiClient.get<Course[]>(`${this.baseUrl}/my-courses`, config)
    }
}

export const trainingAPI = new TrainingAPI()
