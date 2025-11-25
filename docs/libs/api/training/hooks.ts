import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { trainingAPI } from './api'
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
    QuizQuestion,
    CreateQuizQuestionDto,
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

// ==================== QUERY KEYS ====================
export const trainingKeys = {
    all: ['training'] as const,

    // Courses
    courses: () => [...trainingKeys.all, 'courses'] as const,
    coursesList: (filters?: CourseFilters) => [...trainingKeys.courses(), 'list', filters] as const,
    courseDetail: (id: number) => [...trainingKeys.courses(), 'detail', id] as const,

    // Modules
    modules: () => [...trainingKeys.all, 'modules'] as const,
    modulesByCourse: (courseId: number) => [...trainingKeys.modules(), 'course', courseId] as const,
    moduleDetail: (id: number) => [...trainingKeys.modules(), 'detail', id] as const,

    // Lessons
    lessons: () => [...trainingKeys.all, 'lessons'] as const,
    lessonsByModule: (moduleId: number) => [...trainingKeys.lessons(), 'module', moduleId] as const,
    lessonDetail: (id: number) => [...trainingKeys.lessons(), 'detail', id] as const,

    // Quizzes
    quizzes: () => [...trainingKeys.all, 'quizzes'] as const,
    quizDetail: (id: number) => [...trainingKeys.quizzes(), 'detail', id] as const,
    quizQuestions: (quizId: number) => [...trainingKeys.quizzes(), id, 'questions'] as const,

    // Enrollments
    enrollments: () => [...trainingKeys.all, 'enrollments'] as const,
    enrollmentsList: (filters?: EnrollmentFilters) => [...trainingKeys.enrollments(), 'list', filters] as const,
    enrollmentDetail: (id: number) => [...trainingKeys.enrollments(), 'detail', id] as const,
    enrollmentProgress: (id: number) => [...trainingKeys.enrollmentDetail(id), 'progress'] as const,
    quizAttempts: (enrollmentId: number, quizId: number) =>
        [...trainingKeys.enrollmentDetail(enrollmentId), 'quiz', quizId, 'attempts'] as const,

    // Certificates
    certificates: () => [...trainingKeys.all, 'certificates'] as const,
    myCertificates: () => [...trainingKeys.certificates(), 'my'] as const,
    certificateDetail: (id: number) => [...trainingKeys.certificates(), 'detail', id] as const,

    // My Learning
    myLearning: () => [...trainingKeys.all, 'my-learning'] as const,
    myEnrolledCourses: () => [...trainingKeys.myLearning(), 'courses'] as const,
}

// ==================== COURSES QUERIES ====================

export function useCourses(
    filters?: CourseFilters,
    options?: Omit<UseQueryOptions<Course[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.coursesList(filters),
        queryFn: () => trainingAPI.listCourses(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useCourse(
    id: number,
    options?: Omit<UseQueryOptions<Course>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.courseDetail(id),
        queryFn: () => trainingAPI.getCourseById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== COURSES MUTATIONS ====================

export function useCreateCourse(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateCourseDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCourseDto) => trainingAPI.createCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.courses() })
        },
        ...options,
    })
}

export function useUpdateCourse(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateCourseDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCourseDto }) =>
            trainingAPI.updateCourse(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.courses() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.courseDetail(id) })
        },
        ...options,
    })
}

export function useDeleteCourse(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => trainingAPI.deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.courses() })
        },
        ...options,
    })
}

// ==================== MODULES QUERIES ====================

export function useModulesByCourse(
    courseId: number,
    options?: Omit<UseQueryOptions<TrainingModule[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.modulesByCourse(courseId),
        queryFn: () => trainingAPI.getModulesByCourse(courseId),
        enabled: !!courseId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useModule(
    id: number,
    options?: Omit<UseQueryOptions<TrainingModule>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.moduleDetail(id),
        queryFn: () => trainingAPI.getModuleById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== MODULES MUTATIONS ====================

export function useCreateModule(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateTrainingModuleDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTrainingModuleDto) => trainingAPI.createModule(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.modulesByCourse(data.courseId) })
        },
        ...options,
    })
}

export function useUpdateModule(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateTrainingModuleDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTrainingModuleDto }) =>
            trainingAPI.updateModule(id, data),
        onSuccess: (_, { id, data }) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.modules() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.moduleDetail(id) })
            if (data.courseId) {
                queryClient.invalidateQueries({ queryKey: trainingKeys.modulesByCourse(data.courseId) })
            }
        },
        ...options,
    })
}

export function useDeleteModule(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => trainingAPI.deleteModule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.modules() })
        },
        ...options,
    })
}

// ==================== LESSONS QUERIES ====================

export function useLessonsByModule(
    moduleId: number,
    options?: Omit<UseQueryOptions<Lesson[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.lessonsByModule(moduleId),
        queryFn: () => trainingAPI.getLessonsByModule(moduleId),
        enabled: !!moduleId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useLesson(
    id: number,
    options?: Omit<UseQueryOptions<Lesson>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.lessonDetail(id),
        queryFn: () => trainingAPI.getLessonById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== LESSONS MUTATIONS ====================

export function useCreateLesson(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateLessonDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateLessonDto) => trainingAPI.createLesson(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.lessonsByModule(data.moduleId) })
        },
        ...options,
    })
}

export function useUpdateLesson(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateLessonDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateLessonDto }) =>
            trainingAPI.updateLesson(id, data),
        onSuccess: (_, { id, data }) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.lessons() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.lessonDetail(id) })
            if (data.moduleId) {
                queryClient.invalidateQueries({ queryKey: trainingKeys.lessonsByModule(data.moduleId) })
            }
        },
        ...options,
    })
}

export function useDeleteLesson(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => trainingAPI.deleteLesson(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.lessons() })
        },
        ...options,
    })
}

// ==================== QUIZZES QUERIES ====================

export function useQuiz(
    id: number,
    options?: Omit<UseQueryOptions<Quiz>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.quizDetail(id),
        queryFn: () => trainingAPI.getQuizById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

export function useQuizQuestions(
    quizId: number,
    options?: Omit<UseQueryOptions<QuizQuestion[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.quizQuestions(quizId),
        queryFn: () => trainingAPI.getQuizQuestions(quizId),
        enabled: !!quizId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== QUIZZES MUTATIONS ====================

export function useCreateQuiz(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateQuizDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateQuizDto) => trainingAPI.createQuiz(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.quizzes() })
        },
        ...options,
    })
}

export function useCreateQuizQuestion(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateQuizQuestionDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateQuizQuestionDto) => trainingAPI.createQuizQuestion(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.quizQuestions(data.quizId) })
        },
        ...options,
    })
}

// ==================== ENROLLMENTS QUERIES ====================

export function useEnrollments(
    filters?: EnrollmentFilters,
    options?: Omit<UseQueryOptions<Enrollment[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.enrollmentsList(filters),
        queryFn: () => trainingAPI.listEnrollments(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useEnrollment(
    id: number,
    options?: Omit<UseQueryOptions<Enrollment>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.enrollmentDetail(id),
        queryFn: () => trainingAPI.getEnrollmentById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

export function useEnrollmentProgress(
    enrollmentId: number,
    options?: Omit<UseQueryOptions<EnrollmentProgress>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.enrollmentProgress(enrollmentId),
        queryFn: () => trainingAPI.getEnrollmentProgress(enrollmentId),
        enabled: !!enrollmentId,
        staleTime: 1 * 60 * 1000, // 1 minute
        ...options,
    })
}

export function useQuizAttempts(
    enrollmentId: number,
    quizId: number,
    options?: Omit<UseQueryOptions<QuizAttempt[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.quizAttempts(enrollmentId, quizId),
        queryFn: () => trainingAPI.getQuizAttempts(enrollmentId, quizId),
        enabled: !!enrollmentId && !!quizId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== ENROLLMENTS MUTATIONS ====================

export function useCreateEnrollment(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, CreateEnrollmentDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEnrollmentDto) => trainingAPI.createEnrollment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.myEnrolledCourses() })
        },
        ...options,
    })
}

export function useUpdateEnrollment(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: UpdateEnrollmentDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateEnrollmentDto }) =>
            trainingAPI.updateEnrollment(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollmentDetail(id) })
        },
        ...options,
    })
}

export function useApproveEnrollment(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => trainingAPI.approveEnrollment(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollmentDetail(id) })
        },
        ...options,
    })
}

export function useCancelEnrollment(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => trainingAPI.cancelEnrollment(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollmentDetail(id) })
        },
        ...options,
    })
}

export function useDeleteEnrollment(
    options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => trainingAPI.deleteEnrollment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments() })
        },
        ...options,
    })
}

// ==================== PROGRESS MUTATIONS ====================

export function useMarkLessonComplete(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { enrollmentId: number; data: MarkLessonCompleteDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ enrollmentId, data }: { enrollmentId: number; data: MarkLessonCompleteDto }) =>
            trainingAPI.markLessonComplete(enrollmentId, data),
        onSuccess: (_, { enrollmentId }) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollmentProgress(enrollmentId) })
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollmentDetail(enrollmentId) })
        },
        ...options,
    })
}

export function useSubmitQuiz(
    options?: Omit<
        UseMutationOptions<QuizAttempt, Error, { enrollmentId: number; data: SubmitQuizDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ enrollmentId, data }: { enrollmentId: number; data: SubmitQuizDto }) =>
            trainingAPI.submitQuiz(enrollmentId, data),
        onSuccess: (_, { enrollmentId, data }) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.enrollmentProgress(enrollmentId) })
            queryClient.invalidateQueries({ queryKey: trainingKeys.quizAttempts(enrollmentId, data.quizId) })
        },
        ...options,
    })
}

// ==================== CERTIFICATES QUERIES ====================

export function useMyCertificates(
    options?: Omit<UseQueryOptions<Certificate[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.myCertificates(),
        queryFn: () => trainingAPI.getMyCertificates(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

export function useCertificate(
    id: number,
    options?: Omit<UseQueryOptions<Certificate>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.certificateDetail(id),
        queryFn: () => trainingAPI.getCertificateById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

// ==================== CERTIFICATES MUTATIONS ====================

export function useIssueCertificate(
    options?: Omit<
        UseMutationOptions<{ id: number; success: boolean; message: string }, Error, IssueCertificateDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: IssueCertificateDto) => trainingAPI.issueCertificate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.certificates() })
        },
        ...options,
    })
}

export function useRevokeCertificate(
    options?: Omit<
        UseMutationOptions<{ success: boolean; message: string }, Error, RevokeCertificateDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RevokeCertificateDto) => trainingAPI.revokeCertificate(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: trainingKeys.certificates() })
            queryClient.invalidateQueries({ queryKey: trainingKeys.certificateDetail(data.certificateId) })
        },
        ...options,
    })
}

export function useVerifyCertificate(
    certificateNumber: string,
    code: string,
    options?: Omit<UseQueryOptions<CertificateVerification>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: [...trainingKeys.certificates(), 'verify', certificateNumber, code],
        queryFn: () => trainingAPI.verifyCertificate(certificateNumber, code),
        enabled: !!certificateNumber && !!code,
        staleTime: 0, // Don't cache verification results
        ...options,
    })
}

// ==================== MY LEARNING QUERIES ====================

export function useMyEnrolledCourses(
    options?: Omit<UseQueryOptions<Course[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: trainingKeys.myEnrolledCourses(),
        queryFn: () => trainingAPI.getMyEnrolledCourses(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}
