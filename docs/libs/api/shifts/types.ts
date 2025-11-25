// ==================== ENUMS ====================

export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export type ShiftTemplateType = 'morning' | 'afternoon' | 'night' | 'full_day' | 'custom'

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

// ==================== SHIFT TEMPLATES ====================

export interface ShiftTemplate {
    id: number
    name: string
    description?: string
    shiftType: ShiftTemplateType
    startTime: string
    endTime: string
    breakDuration?: number
    color?: string
    isActive: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateShiftTemplateDto {
    name: string
    description?: string
    shiftType: ShiftTemplateType
    startTime: string
    endTime: string
    breakDuration?: number
    color?: string
    isActive?: boolean
}

export interface UpdateShiftTemplateDto {
    name?: string
    description?: string
    shiftType?: ShiftTemplateType
    startTime?: string
    endTime?: string
    breakDuration?: number
    color?: string
    isActive?: boolean
}

// ==================== EMPLOYEE SHIFTS ====================

export interface EmployeeShift {
    id: number
    employeeId: number
    employee_name?: string
    employee_email?: string
    shiftTemplateId?: number
    shift_template_name?: string
    shift_type?: ShiftTemplateType
    shiftDate: string
    startTime?: string
    endTime?: string
    breakDuration?: number
    status: ShiftStatus
    assignedBy?: number
    assigner_name?: string
    checkInTime?: string
    checkOutTime?: string
    actualBreakDuration?: number
    notes?: string
    location?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateEmployeeShiftDto {
    employeeId: number
    shiftTemplateId?: number
    shiftDate: string
    startTime?: string
    endTime?: string
    breakDuration?: number
    status?: ShiftStatus
    notes?: string
    location?: string
}

export interface UpdateEmployeeShiftDto {
    employeeId?: number
    shiftTemplateId?: number
    shiftDate?: string
    startTime?: string
    endTime?: string
    breakDuration?: number
    status?: ShiftStatus
    checkInTime?: string
    checkOutTime?: string
    actualBreakDuration?: number
    notes?: string
    location?: string
}

export interface CheckInDto {
    checkInTime: string
    location?: string
    notes?: string
}

export interface CheckOutDto {
    checkOutTime: string
    actualBreakDuration?: number
    notes?: string
}

// ==================== FILTERS & LISTS ====================

export interface EmployeeShiftListFilters {
    employeeId?: number
    shiftTemplateId?: number
    status?: ShiftStatus
    shiftType?: ShiftTemplateType
    fromDate?: string
    toDate?: string
    date?: string
    week?: number
    month?: number
    year?: number
    assignedBy?: number
    departmentId?: number
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface EmployeeShiftListResponse {
    data: EmployeeShift[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface ShiftTemplateListFilters {
    shiftType?: ShiftTemplateType
    activeOnly?: boolean
    search?: string
}

// ==================== SCHEDULE VIEWS ====================

export interface DailySchedule {
    date: string
    shifts: EmployeeShift[]
    totalEmployees: number
}

export interface WeeklySchedule {
    weekStart: string
    weekEnd: string
    days: DailySchedule[]
}

export interface MonthlySchedule {
    month: string
    year: number
    weeks: WeeklySchedule[]
}

// ==================== STATISTICS ====================

export interface ShiftStats {
    totalShifts: number
    scheduledShifts: number
    completedShifts: number
    inProgressShifts: number
    cancelledShifts: number
    noShowShifts: number
    byStatus: Array<{
        status: ShiftStatus
        count: number
    }>
    byType: Array<{
        type: ShiftTemplateType
        count: number
    }>
    byEmployee: Array<{
        employeeId: number
        employeeName: string
        totalShifts: number
        completedShifts: number
        noShows: number
    }>
    byDay: Array<{
        date: string
        count: number
    }>
    totalHoursScheduled: number
    totalHoursWorked: number
}

export interface EmployeeShiftSummary {
    employeeId: number
    employeeName: string
    totalShifts: number
    completedShifts: number
    scheduledShifts: number
    cancelledShifts: number
    noShows: number
    totalHoursScheduled: number
    totalHoursWorked: number
}
