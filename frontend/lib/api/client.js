/**
 * API Client Configuration
 * Base client for making HTTP requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Base fetch wrapper with error handling
 * @param {string} url - The endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiFetch(url, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Return parsed JSON
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API Client methods
 */
export const apiClient = {
  /**
   * GET request
   * @param {string} url - Endpoint URL
   * @param {RequestInit} config - Fetch config
   */
  get: (url, config = {}) => apiFetch(url, { ...config, method: 'GET' }),

  /**
   * POST request
   * @param {string} url - Endpoint URL
   * @param {any} data - Request body
   * @param {RequestInit} config - Fetch config
   */
  post: (url, data, config = {}) =>
    apiFetch(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * PUT request
   * @param {string} url - Endpoint URL
   * @param {any} data - Request body
   * @param {RequestInit} config - Fetch config
   */
  put: (url, data, config = {}) =>
    apiFetch(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * DELETE request
   * @param {string} url - Endpoint URL
   * @param {RequestInit} config - Fetch config
   */
  delete: (url, config = {}) => apiFetch(url, { ...config, method: 'DELETE' }),
};

export default apiClient;
