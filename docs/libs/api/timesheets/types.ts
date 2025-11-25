// ==================== ENUMS ====================

export type TimesheetStatus = 'pending' | 'approved' | 'rejected' | 'submitted'

export type EntryType = 'regular' | 'overtime' | 'break' | 'leave' | 'training' | 'meeting'

// ==================== TIMESHEET ENTRY ====================

export interface TimesheetEntry {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    workDate: string
    clockIn: string
    clockOut?: string
    totalHours?: number
    regularHours?: number
    overtimeHours?: number
    breakDuration?: number
    entryType: EntryType
    projectId?: number
    project_name?: string
    taskId?: number
    task_name?: string
    description?: string
    notes?: string
    status: TimesheetStatus
    approvedBy?: number
    approver_name?: string
    approvedAt?: string
    rejectionReason?: string
    location?: string
    billable: boolean
    hourlyRate?: number
    totalCost?: number
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

// ==================== CREATE/UPDATE DTOS ====================

export interface CreateTimesheetEntryDto {
    employeeId: number
    workDate: string
    clockIn: string
    clockOut?: string
    breakDuration?: number
    entryType?: EntryType
    projectId?: number
    taskId?: number
    description?: string
    notes?: string
    location?: string
    billable?: boolean
    hourlyRate?: number
}

export interface UpdateTimesheetEntryDto {
    employeeId?: number
    workDate?: string
    clockIn?: string
    clockOut?: string
    breakDuration?: number
    entryType?: EntryType
    projectId?: number
    taskId?: number
    description?: string
    notes?: string
    location?: string
    billable?: boolean
    hourlyRate?: number
}

export interface ApproveTimesheetDto {
    action: 'approved' | 'rejected'
    rejectionReason?: string
}

export interface BulkApproveDto {
    entryIds: number[]
    action: 'approved' | 'rejected'
    rejectionReason?: string
}

// ==================== FILTERS & LISTS ====================

export interface TimesheetEntryListFilters {
    employeeId?: number
    projectId?: number
    taskId?: number
    status?: TimesheetStatus
    entryType?: EntryType
    fromDate?: string
    toDate?: string
    date?: string
    week?: number
    month?: number
    year?: number
    approvedBy?: number
    departmentId?: number
    billable?: boolean
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface TimesheetEntryListResponse {
    data: TimesheetEntry[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ==================== TIMESHEET SUMMARY ====================

export interface TimesheetSummary {
    employeeId: number
    employeeName: string
    period: {
        startDate: string
        endDate: string
    }
    totalHours: number
    regularHours: number
    overtimeHours: number
    billableHours: number
    nonBillableHours: number
    totalCost: number
    totalRevenue: number
    byProject: Array<{
        projectId: number
        projectName: string
        totalHours: number
        billableHours: number
        totalCost: number
    }>
    byEntryType: Array<{
        type: EntryType
        totalHours: number
    }>
    byStatus: Array<{
        status: TimesheetStatus
        count: number
        totalHours: number
    }>
}

// ==================== STATISTICS ====================

export interface TimesheetStats {
    totalEntries: number
    pendingEntries: number
    approvedEntries: number
    rejectedEntries: number
    totalHours: number
    regularHours: number
    overtimeHours: number
    billableHours: number
    totalCost: number
    totalRevenue: number
    byStatus: Array<{
        status: TimesheetStatus
        count: number
        totalHours: number
    }>
    byEntryType: Array<{
        type: EntryType
        count: number
        totalHours: number
    }>
    byEmployee: Array<{
        employeeId: number
        employeeName: string
        totalHours: number
        regularHours: number
        overtimeHours: number
    }>
    byProject: Array<{
        projectId: number
        projectName: string
        totalHours: number
        billableHours: number
        totalCost: number
    }>
    byDay: Array<{
        date: string
        totalHours: number
        entries: number
    }>
}

// ==================== WEEKLY VIEW ====================

export interface WeeklyTimesheetView {
    employeeId: number
    employeeName: string
    weekStart: string
    weekEnd: string
    days: Array<{
        date: string
        dayOfWeek: string
        entries: TimesheetEntry[]
        totalHours: number
    }>
    weekTotalHours: number
    weekRegularHours: number
    weekOvertimeHours: number
}
