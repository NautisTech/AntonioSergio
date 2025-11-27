/**
 * Public Support API Types
 * TypeScript interfaces for public ticket submission
 */

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
    CRITICAL = 'critical',
}

export interface TicketType {
    id: number
    name: string
    description: string
    sla_hours: number
    icon?: string
    color?: string
}

export interface CreatePublicTicketDto {
    ticketTypeId: number
    title: string
    description: string
    priority: TicketPriority
    location?: string
    equipmentSerialNumber?: string
    equipmentDescription?: string
    tags?: string[]
}

export interface CreateTicketResponse {
    id: number
    ticketNumber: string
    uniqueCode: string
    success: boolean
    message: string
}

export interface TicketByCodeResponse {
    id: number
    ticketNumber: string
    title: string
    description: string
    status: string
    priority: string
    createdAt: string
    updatedAt: string
}
