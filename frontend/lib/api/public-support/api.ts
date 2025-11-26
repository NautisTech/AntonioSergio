/**
 * Public Support API
 * Service for public ticket submission and management
 */

import { apiClient } from '../client'
import type {
    TicketType,
    CreatePublicTicketDto,
    CreateTicketResponse,
    TicketByCodeResponse,
} from './types'

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '4'

/**
 * Public Support API Service
 */
export const publicSupportAPI = {
    /**
     * Get available ticket types
     */
    getTicketTypes: async (): Promise<TicketType[]> => {
        return apiClient.get<TicketType[]>(
            `/public/support/ticket-types?tenantId=${TENANT_ID}`
        )
    },

    /**
     * Create a new public ticket
     * @param data - Ticket data
     * @param clientId - Optional client ID (defaults to 1 if not provided)
     */
    createTicket: async (
        data: CreatePublicTicketDto,
        clientId?: number
    ): Promise<CreateTicketResponse> => {
        const clientParam = clientId ? `&clientId=${clientId}` : ''
        return apiClient.post<CreateTicketResponse>(
            `/public/support/tickets?tenantId=${TENANT_ID}${clientParam}`,
            data
        )
    },

    /**
     * Get ticket by unique code
     * @param code - Unique ticket access code
     */
    getTicketByCode: async (code: string): Promise<TicketByCodeResponse> => {
        return apiClient.get<TicketByCodeResponse>(
            `/public/support/tickets/by-code/${code}?tenantId=${TENANT_ID}`
        )
    },

    /**
     * Reopen a ticket by unique code
     * @param code - Unique ticket access code
     * @param reason - Reason for reopening
     */
    reopenTicket: async (code: string, reason: string): Promise<void> => {
        return apiClient.post<void>(
            `/public/support/tickets/by-code/${code}/reopen?tenantId=${TENANT_ID}`,
            { reason }
        )
    },

    /**
     * Close a ticket by unique code
     * @param code - Unique ticket access code
     * @param reason - Optional reason for closing
     */
    closeTicket: async (code: string, reason?: string): Promise<void> => {
        return apiClient.post<void>(
            `/public/support/tickets/by-code/${code}/close?tenantId=${TENANT_ID}`,
            { reason }
        )
    },

    /**
     * Rate a ticket by unique code
     * @param code - Unique ticket access code
     * @param rating - Rating from 1 to 5
     * @param comment - Optional feedback comment
     */
    rateTicket: async (
        code: string,
        rating: number,
        comment?: string
    ): Promise<void> => {
        return apiClient.post<void>(
            `/public/support/tickets/by-code/${code}/rate?tenantId=${TENANT_ID}`,
            { rating, comment }
        )
    },
}

export default publicSupportAPI
