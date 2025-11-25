import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { coreAPI } from './api'
import type { MenuResponse } from './types'

// ==================== QUERY KEYS ====================
export const coreKeys = {
  all: ['core'] as const,
  menu: () => [...coreKeys.all, 'menu'] as const,
}

// ==================== QUERIES ====================

/**
 * Get user menu based on modules and permissions
 */
export function useMenu(options?: Omit<UseQueryOptions<MenuResponse>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: coreKeys.menu(),
    queryFn: () => coreAPI.getMenu(),
    staleTime: 10 * 60 * 1000, // 10 minutes - menu doesn't change frequently
    ...options,
  })
}
