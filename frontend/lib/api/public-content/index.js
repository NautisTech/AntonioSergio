/**
 * Public Content API - Main Export
 *
 * This module provides access to public content endpoints including:
 * - News articles
 * - Events
 * - Projects
 * - FAQs
 * - Banners
 * - Categories and Tags
 * - Comments
 */

// Export API client
export { publicContentAPI, default } from './api';

// Export all hooks
export {
  useContentList,
  useContentBySlug,
  useContentById,
  useFeaturedContent,
  useRecentContent,
  usePopularContent,
  useContentByType,
  useNews,
  useEvents,
  useProjects,
  useFaqs,
  useBanners,
  useCategories,
  useCategoryTree,
  useTags,
  usePopularTags,
  useComments,
  useSearch,
} from './hooks';
