// ==================== ENUMS ====================

export type HolidayType = 'national' | 'regional' | 'company' | 'religious' | 'other'

// ==================== HOLIDAY ====================

export interface Holiday {
    id: number
    name: string
    description?: string
    holidayDate: string
    holidayType: HolidayType
    isRecurring: boolean
    country?: string
    region?: string
    affectsWorkingDays: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

// ==================== CREATE/UPDATE DTOS ====================

export interface CreateHolidayDto {
    name: string
    description?: string
    holidayDate: string
    holidayType: HolidayType
    isRecurring?: boolean
    country?: string
    region?: string
    affectsWorkingDays?: boolean
}

export interface UpdateHolidayDto {
    name?: string
    description?: string
    holidayDate?: string
    holidayType?: HolidayType
    isRecurring?: boolean
    country?: string
    region?: string
    affectsWorkingDays?: boolean
}

// ==================== FILTERS & LISTS ====================

export interface HolidayListFilters {
    holidayType?: HolidayType
    year?: number
    month?: number
    fromDate?: string
    toDate?: string
    isRecurring?: boolean
    country?: string
    region?: string
    affectsWorkingDays?: boolean
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface HolidayListResponse {
    data: Holiday[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ==================== CALENDAR VIEW ====================

export interface HolidayCalendarView {
    year: number
    months: Array<{
        month: number
        monthName: string
        holidays: Holiday[]
    }>
}

// ==================== STATISTICS ====================

export interface HolidayStats {
    totalHolidays: number
    upcomingHolidays: number
    holidaysThisYear: number
    holidaysThisMonth: number
    byType: Array<{
        type: HolidayType
        count: number
    }>
    byMonth: Array<{
        month: string
        count: number
    }>
    recurringHolidays: number
    workingDaysAffected: number
}
