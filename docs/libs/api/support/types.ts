// ==================== ENUMS ====================

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'
export type TicketStatus = 'open' | 'in_progress' | 'awaiting_customer' | 'awaiting_technician' | 'on_hold' | 'resolved' | 'closed' | 'cancelled' | 'reopened'
export type InterventionType = 'preventive' | 'corrective' | 'installation' | 'configuration' | 'upgrade' | 'maintenance' | 'repair' | 'diagnosis' | 'inspection'
export type InterventionStatus = 'scheduled' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
export type ActivityType = 'created' | 'status_changed' | 'priority_changed' | 'assigned' | 'reassigned' | 'comment_added' | 'attachment_added' | 'intervention_added' | 'customer_response' | 'technician_response' | 'closed' | 'reopened' | 'sla_warning' | 'sla_breach'
export type SLAStatus = 'ok' | 'warning' | 'critical' | 'breached'

// ==================== TICKETS ====================

export interface Ticket {
    id: number
    ticketNumber: string
    ticketTypeId: number
    ticket_type_name?: string
    ticket_type_icon?: string
    ticket_type_color?: string
    clientId?: number
    client_name?: string
    equipmentId?: number
    equipment_serial_number?: string
    equipment_model_name?: string
    equipmentSerialNumber?: string
    equipmentDescription?: string
    title: string
    description: string
    priority: TicketPriority
    status: TicketStatus
    requesterId: number
    requester_name?: string
    assignedToId?: number
    assigned_to_name?: string
    location?: string
    expectedDate?: string
    resolution?: string
    tags?: string[]
    rating?: number
    feedback?: string
    slaHours?: number
    slaDueDate?: string
    slaStatus?: SLAStatus
    createdAt: string
    updatedAt?: string
    closedAt?: string
    resolvedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateTicketDto {
    ticketTypeId: number
    clientId?: number
    equipmentId?: number
    equipmentSerialNumber?: string
    equipmentDescription?: string
    title: string
    description: string
    priority: TicketPriority
    status?: TicketStatus
    requesterId: number
    assignedToId?: number
    location?: string
    expectedDate?: string
    tags?: string[]
    attachmentIds?: number[]
}

export interface UpdateTicketDto {
    title?: string
    description?: string
    priority?: TicketPriority
    status?: TicketStatus
    assignedToId?: number
    location?: string
    expectedDate?: string
    resolution?: string
    tags?: string[]
}

export interface CloseTicketDto {
    resolution: string
    notes?: string
}

export interface ReopenTicketDto {
    reason: string
}

export interface AddTicketCommentDto {
    comment: string
    isInternal?: boolean
    attachmentIds?: number[]
}

export interface RateTicketDto {
    rating: number
    feedback?: string
}

export interface TicketListFilters {
    ticketTypeId?: number
    clientId?: number
    status?: TicketStatus
    priority?: TicketPriority
    assignedToId?: number
    requesterId?: number
    equipmentId?: number
    search?: string
    tags?: string[]
    slaStatus?: SLAStatus
    overdueOnly?: boolean
    page?: number
    pageSize?: number
}

export interface TicketListResponse {
    data: Ticket[]
    total: number
    page: number
    pageSize: number
}

export interface TicketDashboard {
    totalTickets: number
    openTickets: number
    inProgressTickets: number
    resolvedTickets: number
    closedTickets: number
    overdueTickets: number
    averageResolutionTime: number
    averageResponseTime: number
    satisfactionRating: number
    byPriority: Array<{
        priority: string
        count: number
    }>
    byStatus: Array<{
        status: string
        count: number
    }>
    byType: Array<{
        typeId: number
        typeName: string
        count: number
    }>
    slaCompliance: {
        total: number
        met: number
        breached: number
        percentage: number
    }
}

// ==================== TICKET ACTIVITY ====================

export interface TicketActivity {
    id: number
    ticketId: number
    activityType: ActivityType
    userId?: number
    user_name?: string
    description: string
    comment?: string
    isInternal?: boolean
    oldValue?: string
    newValue?: string
    attachments?: Array<{
        id: number
        filename: string
        url: string
    }>
    createdAt: string
}

export interface ActivityStats {
    totalActivities: number
    commentsAdded: number
    statusChanges: number
    assignmentChanges: number
    averageResponseTime: number
    byType: Array<{
        type: string
        count: number
    }>
}

// ==================== INTERVENTIONS ====================

export interface Intervention {
    id: number
    interventionNumber: string
    ticketId?: number
    ticket_number?: string
    equipmentId?: number
    equipment_internal_number?: string
    equipment_model_name?: string
    equipmentSerialNumber?: string
    equipmentDescription?: string
    type: InterventionType
    title: string
    description?: string
    diagnosis?: string
    solution?: string
    technicianId: number
    technician_name?: string
    startDate?: string
    endDate?: string
    durationMinutes?: number
    laborCost?: number
    partsCost?: number
    totalCost?: number
    externalVendor?: string
    invoiceNumber?: string
    underWarranty?: boolean
    notes?: string
    status: InterventionStatus
    requiresCustomerApproval?: boolean
    customerApproved?: boolean
    approvalDate?: string
    partsUsed?: Array<{
        partId?: number
        partName: string
        quantity: number
        unitCost?: number
    }>
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateInterventionDto {
    ticketId?: number
    equipmentId?: number
    equipmentSerialNumber?: string
    equipmentDescription?: string
    type: InterventionType
    title: string
    description?: string
    diagnosis?: string
    solution?: string
    technicianId: number
    startDate?: string
    endDate?: string
    durationMinutes?: number
    laborCost?: number
    partsCost?: number
    externalVendor?: string
    invoiceNumber?: string
    underWarranty?: boolean
    notes?: string
    status?: InterventionStatus
    requiresCustomerApproval?: boolean
    customerApproved?: boolean
    approvalDate?: string
    attachmentIds?: number[]
    partsUsed?: Array<{
        partId?: number
        partName: string
        quantity: number
        unitCost?: number
    }>
}

export interface UpdateInterventionDto {
    title?: string
    description?: string
    diagnosis?: string
    solution?: string
    startDate?: string
    endDate?: string
    durationMinutes?: number
    laborCost?: number
    partsCost?: number
    notes?: string
    status?: InterventionStatus
    customerApproved?: boolean
    approvalDate?: string
}

export interface InterventionListFilters {
    ticketId?: number
    equipmentId?: number
    technicianId?: number
    type?: InterventionType
    status?: InterventionStatus
    clientId?: number
    search?: string
    page?: number
    pageSize?: number
}

export interface InterventionListResponse {
    data: Intervention[]
    total: number
    page: number
    pageSize: number
}

export interface InterventionStats {
    totalInterventions: number
    completed: number
    inProgress: number
    scheduled: number
    totalLaborCost: number
    totalPartsCost: number
    totalCost: number
    averageDuration: number
    byType: Array<{
        type: string
        count: number
        totalCost: number
    }>
    byTechnician: Array<{
        technicianId: number
        technicianName: string
        count: number
        totalCost: number
    }>
}

// ==================== TICKET TYPES ====================

export interface TicketType {
    id: number
    name: string
    description?: string
    slaHours?: number
    icon?: string
    color?: string
    active: boolean
    requiresEquipment?: boolean
    autoAssignDepartmentId?: number
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateTicketTypeDto {
    name: string
    description?: string
    slaHours?: number
    icon?: string
    color?: string
    active?: boolean
    requiresEquipment?: boolean
    autoAssignDepartmentId?: number
}

export interface UpdateTicketTypeDto {
    name?: string
    description?: string
    slaHours?: number
    icon?: string
    color?: string
    active?: boolean
    requiresEquipment?: boolean
    autoAssignDepartmentId?: number
}

export interface TicketTypeStats {
    totalTypes: number
    activeTypes: number
    byType: Array<{
        typeId: number
        typeName: string
        ticketCount: number
        averageResolutionTime: number
    }>
}
