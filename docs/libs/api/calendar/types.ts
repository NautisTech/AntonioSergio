// ==================== ENUMS ====================

export type EventType = 'meeting' | 'reminder' | 'deadline' | 'personal' | 'training' | 'other'

export type EventVisibility = 'private' | 'department' | 'company' | 'public'

export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export type ParticipantType = 'user' | 'employee' | 'department' | 'external'

export type ResponseStatus = 'pending' | 'accepted' | 'declined' | 'tentative'

// ==================== CALENDAR EVENT ====================

export interface CalendarEvent {
    id: number
    title: string
    description?: string
    eventType: EventType
    visibility: EventVisibility
    status: EventStatus
    location?: string
    onlineMeetingUrl?: string
    startDate: string
    endDate: string
    isAllDay: boolean
    color?: string
    isRecurring: boolean
    recurrenceRule?: string
    recurrenceEndDate?: string
    reminderMinutes?: number
    notes?: string
    organizerId: number
    organizer_name?: string
    organizer_email?: string
    participants?: EventParticipant[]
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
    deletedBy?: number
}

export interface EventParticipant {
    id: number
    eventId: number
    participantType: ParticipantType
    participantId?: number
    participant_name?: string
    participant_email?: string
    externalEmail?: string
    externalName?: string
    isRequired: boolean
    responseStatus: ResponseStatus
    responseNotes?: string
    respondedAt?: string
    createdAt: string
    updatedAt?: string
}

// ==================== CREATE/UPDATE DTOS ====================

export interface CreateCalendarEventDto {
    title: string
    description?: string
    eventType: EventType
    visibility?: EventVisibility
    location?: string
    onlineMeetingUrl?: string
    startDate: string
    endDate: string
    isAllDay?: boolean
    color?: string
    isRecurring?: boolean
    recurrenceRule?: string
    recurrenceEndDate?: string
    reminderMinutes?: number
    notes?: string
    participants?: CreateEventParticipantDto[]
}

export interface UpdateCalendarEventDto {
    title?: string
    description?: string
    eventType?: EventType
    visibility?: EventVisibility
    status?: EventStatus
    location?: string
    onlineMeetingUrl?: string
    startDate?: string
    endDate?: string
    isAllDay?: boolean
    color?: string
    isRecurring?: boolean
    recurrenceRule?: string
    recurrenceEndDate?: string
    reminderMinutes?: number
    notes?: string
    participants?: CreateEventParticipantDto[]
}

export interface CreateEventParticipantDto {
    participantType: ParticipantType
    participantId?: number
    externalEmail?: string
    externalName?: string
    isRequired?: boolean
}

export interface RespondToEventDto {
    responseStatus: ResponseStatus
    notes?: string
}

// ==================== FILTERS & LISTS ====================

export interface CalendarEventListFilters {
    eventType?: EventType
    status?: EventStatus
    visibility?: EventVisibility
    organizerId?: number
    participantId?: number
    fromDate?: string
    toDate?: string
    search?: string
    isRecurring?: boolean
    isAllDay?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface CalendarEventListResponse {
    data: CalendarEvent[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ==================== CALENDAR VIEWS ====================

export interface DayView {
    date: string
    events: CalendarEvent[]
}

export interface WeekView {
    weekStart: string
    weekEnd: string
    days: DayView[]
}

export interface MonthView {
    month: string
    year: number
    weeks: {
        weekStart: string
        weekEnd: string
        days: DayView[]
    }[]
}

// ==================== STATISTICS ====================

export interface CalendarStats {
    totalEvents: number
    upcomingEvents: number
    todayEvents: number
    thisWeekEvents: number
    thisMonthEvents: number
    byType: Array<{
        type: EventType
        count: number
    }>
    byStatus: Array<{
        status: EventStatus
        count: number
    }>
    byVisibility: Array<{
        visibility: EventVisibility
        count: number
    }>
    participationStats: {
        organized: number
        invited: number
        accepted: number
        declined: number
        pending: number
    }
}
