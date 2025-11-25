import { apiClient } from '@/libs/api/client'
import type { MenuResponse } from './types'

/**
 * Core API endpoints
 */
export const coreAPI = {
  /**
   * Get user menu based on modules and permissions
   */
  async getMenu(): Promise<MenuResponse> {
    return apiClient.get<MenuResponse>('/core/menu')
  },
}
