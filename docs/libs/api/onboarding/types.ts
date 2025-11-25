// ==================== ENUMS ====================

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled'

export type OffboardingStatus = 'initiated' | 'in_progress' | 'completed' | 'cancelled'

export type TerminationType = 'resignation' | 'termination' | 'retirement' | 'end_of_contract' | 'mutual_agreement'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export type TaskCategory = 'documentation' | 'equipment' | 'access' | 'training' | 'meeting' | 'other'

// ==================== ONBOARDING PROCESS ====================

export interface OnboardingProcess {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    startDate: string
    endDate?: string
    status: OnboardingStatus
    assignedTo?: number
    assigned_name?: string
    buddyId?: number
    buddy_name?: string
    progress?: number
    notes?: string
    tasks?: OnboardingTask[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface OnboardingTask {
    id: number
    processId: number
    title: string
    description?: string
    category: TaskCategory
    dueDate?: string
    completedDate?: string
    status: TaskStatus
    assignedTo?: number
    assigned_name?: string
    order?: number
    isRequired: boolean
}

export interface CreateOnboardingProcessDto {
    employeeId: number
    startDate: string
    endDate?: string
    assignedTo?: number
    buddyId?: number
    notes?: string
    tasks?: CreateOnboardingTaskDto[]
}

export interface UpdateOnboardingProcessDto {
    employeeId?: number
    startDate?: string
    endDate?: string
    status?: OnboardingStatus
    assignedTo?: number
    buddyId?: number
    progress?: number
    notes?: string
}

export interface CreateOnboardingTaskDto {
    title: string
    description?: string
    category: TaskCategory
    dueDate?: string
    assignedTo?: number
    order?: number
    isRequired?: boolean
}

export interface UpdateOnboardingTaskDto {
    title?: string
    description?: string
    category?: TaskCategory
    dueDate?: string
    completedDate?: string
    status?: TaskStatus
    assignedTo?: number
    order?: number
    isRequired?: boolean
}

// ==================== OFFBOARDING PROCESS ====================

export interface OffboardingProcess {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    terminationDate: string
    terminationType: TerminationType
    lastWorkingDay?: string
    reason?: string
    status: OffboardingStatus
    initiatedBy?: number
    initiator_name?: string
    exitInterviewDate?: string
    exitInterviewNotes?: string
    progress?: number
    notes?: string
    tasks?: OffboardingTask[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface OffboardingTask {
    id: number
    processId: number
    title: string
    description?: string
    category: TaskCategory
    dueDate?: string
    completedDate?: string
    status: TaskStatus
    assignedTo?: number
    assigned_name?: string
    order?: number
    isRequired: boolean
}

export interface CreateOffboardingProcessDto {
    employeeId: number
    terminationDate: string
    terminationType: TerminationType
    lastWorkingDay?: string
    reason?: string
    exitInterviewDate?: string
    notes?: string
    tasks?: CreateOffboardingTaskDto[]
}

export interface UpdateOffboardingProcessDto {
    employeeId?: number
    terminationDate?: string
    terminationType?: TerminationType
    lastWorkingDay?: string
    reason?: string
    status?: OffboardingStatus
    exitInterviewDate?: string
    exitInterviewNotes?: string
    progress?: number
    notes?: string
}

export interface CreateOffboardingTaskDto {
    title: string
    description?: string
    category: TaskCategory
    dueDate?: string
    assignedTo?: number
    order?: number
    isRequired?: boolean
}

export interface UpdateOffboardingTaskDto {
    title?: string
    description?: string
    category?: TaskCategory
    dueDate?: string
    completedDate?: string
    status?: TaskStatus
    assignedTo?: number
    order?: number
    isRequired?: boolean
}

// ==================== FILTERS & LISTS ====================

export interface OnboardingProcessListFilters {
    employeeId?: number
    status?: OnboardingStatus
    assignedTo?: number
    buddyId?: number
    fromDate?: string
    toDate?: string
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface OffboardingProcessListFilters {
    employeeId?: number
    status?: OffboardingStatus
    terminationType?: TerminationType
    initiatedBy?: number
    fromDate?: string
    toDate?: string
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

// ==================== STATISTICS ====================

export interface OnboardingStats {
    totalProcesses: number
    notStarted: number
    inProgress: number
    completed: number
    cancelled: number
    averageCompletionTime: number
    completionRate: number
    byMonth: Array<{
        month: string
        count: number
        completed: number
    }>
}

export interface OffboardingStats {
    totalProcesses: number
    initiated: number
    inProgress: number
    completed: number
    cancelled: number
    byTerminationType: Array<{
        type: TerminationType
        count: number
    }>
    byMonth: Array<{
        month: string
        count: number
        completed: number
    }>
}
