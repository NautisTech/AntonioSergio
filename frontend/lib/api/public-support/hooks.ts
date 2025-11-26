/**
 * Public Support API Hooks
 * React hooks for ticket submission and management
 */

'use client'

import { useState, useEffect } from 'react'
import { publicSupportAPI } from './api'
import type { TicketType, CreatePublicTicketDto, CreateTicketResponse } from './types'

interface UseDataResult<T> {
    data: T | null
    loading: boolean
    error: Error | null
}

/**
 * Hook to fetch ticket types
 */
export function useTicketTypes(): UseDataResult<TicketType[]> {
    const [data, setData] = useState<TicketType[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                setLoading(true)
                const types = await publicSupportAPI.getTicketTypes()
                setData(types)
                setError(null)
            } catch (err) {
                setError(err as Error)
                setData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchTicketTypes()
    }, [])

    return { data, loading, error }
}

/**
 * Hook to submit a ticket
 */
export function useSubmitTicket() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [response, setResponse] = useState<CreateTicketResponse | null>(null)

    const submitTicket = async (
        data: CreatePublicTicketDto,
        clientId?: number
    ): Promise<CreateTicketResponse | null> => {
        try {
            setLoading(true)
            setError(null)
            const result = await publicSupportAPI.createTicket(data, clientId)
            setResponse(result)
            return result
        } catch (err) {
            setError(err as Error)
            setResponse(null)
            return null
        } finally {
            setLoading(false)
        }
    }

    return { submitTicket, loading, error, response }
}

/**
 * Hook to get ticket by code
 */
export function useTicketByCode(code: string | null) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!code) return

        const fetchTicket = async () => {
            try {
                setLoading(true)
                const ticket = await publicSupportAPI.getTicketByCode(code)
                setData(ticket)
                setError(null)
            } catch (err) {
                setError(err as Error)
                setData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchTicket()
    }, [code])

    return { data, loading, error }
}
