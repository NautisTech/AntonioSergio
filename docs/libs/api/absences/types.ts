// ==================== ENUMS ====================

export type AbsenceStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type HalfDayPeriod = 'morning' | 'afternoon'

// ==================== ABSENCE TYPES ====================

export interface AbsenceType {
    id: number
    code: string
    name: string
    description?: string
    isPaid: boolean
    requiresApproval: boolean
    requiresDocument: boolean
    maxDaysPerYear?: number
    color?: string
    icon?: string
    isActive: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateAbsenceTypeDto {
    code: string
    name: string
    description?: string
    isPaid?: boolean
    requiresApproval?: boolean
    requiresDocument?: boolean
    maxDaysPerYear?: number
    color?: string
    icon?: string
    isActive?: boolean
}

export interface UpdateAbsenceTypeDto {
    code?: string
    name?: string
    description?: string
    isPaid?: boolean
    requiresApproval?: boolean
    requiresDocument?: boolean
    maxDaysPerYear?: number
    color?: string
    icon?: string
    isActive?: boolean
}

// ==================== ABSENCE REQUESTS ====================

export interface AbsenceRequest {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    absenceTypeId: number
    absence_type_name?: string
    absence_type_code?: string
    startDate: string
    endDate: string
    isStartHalfDay: boolean
    isEndHalfDay: boolean
    startHalfDayPeriod?: HalfDayPeriod
    endHalfDayPeriod?: HalfDayPeriod
    totalDays: number
    reason?: string
    status: AbsenceStatus
    reviewedBy?: number
    reviewer_name?: string
    reviewedAt?: string
    reviewNotes?: string
    documents?: string[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
    deletedBy?: number
}

export interface CreateAbsenceRequestDto {
    employeeId: number
    absenceTypeId: number
    startDate: string
    endDate: string
    isStartHalfDay?: boolean
    isEndHalfDay?: boolean
    startHalfDayPeriod?: HalfDayPeriod
    endHalfDayPeriod?: HalfDayPeriod
    totalDays: number
    reason?: string
    documents?: string[]
}

export interface UpdateAbsenceRequestDto {
    employeeId?: number
    absenceTypeId?: number
    startDate?: string
    endDate?: string
    isStartHalfDay?: boolean
    isEndHalfDay?: boolean
    startHalfDayPeriod?: HalfDayPeriod
    endHalfDayPeriod?: HalfDayPeriod
    totalDays?: number
    reason?: string
    documents?: string[]
}

export interface ApproveAbsenceDto {
    action: 'approved' | 'rejected'
    reviewNotes?: string
}

// ==================== FILTERS & LISTS ====================

export interface AbsenceRequestListFilters {
    employeeId?: number
    absenceTypeId?: number
    status?: AbsenceStatus
    fromDate?: string
    toDate?: string
    search?: string
    departmentId?: number
    reviewedBy?: number
    isPaid?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface AbsenceRequestListResponse {
    data: AbsenceRequest[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface AbsenceTypeListFilters {
    activeOnly?: boolean
    isPaid?: boolean
    requiresApproval?: boolean
    requiresDocument?: boolean
    search?: string
}

// ==================== STATISTICS ====================

export interface AbsenceStats {
    totalRequests: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    totalDaysRequested: number
    totalDaysApproved: number
    byType: Array<{
        typeId: number
        typeName: string
        count: number
        totalDays: number
    }>
    byStatus: Array<{
        status: AbsenceStatus
        count: number
        totalDays: number
    }>
    byEmployee: Array<{
        employeeId: number
        employeeName: string
        count: number
        totalDays: number
    }>
    byMonth: Array<{
        month: string
        count: number
        totalDays: number
    }>
}

export interface EmployeeAbsenceBalance {
    employeeId: number
    employeeName: string
    byType: Array<{
        typeId: number
        typeName: string
        maxDaysPerYear?: number
        usedDays: number
        remainingDays?: number
        pendingDays: number
    }>
    totalUsedDays: number
    totalPendingDays: number
}
