# API Library Documentation

This directory contains the API client library for fetching data from the backend API.

## Structure

```
lib/api/
├── client.js                    # Base API client with fetch wrapper
├── public-content/              # Public content API module
│   ├── api.js                   # API methods for public content
│   ├── hooks.js                 # React hooks for data fetching
│   ├── types.js                 # JSDoc type definitions
│   └── index.js                 # Main exports
└── README.md                    # This file
```

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Replace `http://localhost:3000/api` with your actual API URL.

### 2. Usage

#### Using API Methods Directly

```javascript
import { publicContentAPI } from '@/lib/api/public-content';

// In a Server Component or API route
export default async function Page() {
  const news = await publicContentAPI.getNews({ pageSize: 10 });

  return (
    <div>
      {news.data.map(item => (
        <article key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

#### Using React Hooks (Client Components)

```javascript
'use client';

import { useNews } from '@/lib/api/public-content';

export default function NewsSection() {
  const { data, loading, error } = useNews({ pageSize: 5 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(item => (
        <article key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

## Public Content API

### Content Methods

#### List Content
```javascript
// Get all content with filters
const result = await publicContentAPI.list({
  type: 'news',           // Filter by type
  categoryId: 1,          // Filter by category
  tags: 'tag1,tag2',      // Filter by tags (comma-separated)
  search: 'query',        // Search query
  featuredOnly: true,     // Only featured content
  page: 1,                // Page number
  pageSize: 10,           // Items per page
  language: 'pt',         // Filter by language
});
```

#### Get Content by Slug
```javascript
const content = await publicContentAPI.getBySlug('novo-sistema-treinamento-pt');
```

#### Get Content by ID
```javascript
const content = await publicContentAPI.getById(7);
```

#### Get Featured Content
```javascript
const featured = await publicContentAPI.getFeatured(5);
```

#### Get Recent Content
```javascript
const recent = await publicContentAPI.getRecent(10);
```

#### Get Popular Content
```javascript
const popular = await publicContentAPI.getPopular(5);
```

### Content Type Methods

Convenience methods for specific content types:

```javascript
// News
const news = await publicContentAPI.getNews({ pageSize: 10 });

// Events
const events = await publicContentAPI.getEvents({ featuredOnly: true });

// Projects
const projects = await publicContentAPI.getProjects({ page: 1, pageSize: 6 });

// FAQs
const faqs = await publicContentAPI.getFaqs();

// Banners
const banners = await publicContentAPI.getBanners({ featuredOnly: true });
```

### Category Methods

```javascript
// Get all categories
const categories = await publicContentAPI.getCategories();

// Get category tree (hierarchical)
const tree = await publicContentAPI.getCategoryTree();

// Get content by category
const newsInCategory = await publicContentAPI.getByCategory(1, {
  page: 1,
  pageSize: 10
});
```

### Tag Methods

```javascript
// Get all tags
const tags = await publicContentAPI.getTags();

// Get popular tags
const popularTags = await publicContentAPI.getPopularTags(5);
```

### Comment Methods

```javascript
// Get comments for content
const comments = await publicContentAPI.getComments(7);

// Post a comment
const comment = await publicContentAPI.postComment({
  contentId: 7,
  text: 'Great article!',
  authorName: 'João Silva',
  authorEmail: 'joao@example.com',
});
```

### Search

```javascript
// Search content
const results = await publicContentAPI.search('tecnologia', {
  type: 'news',
  pageSize: 10
});
```

## React Hooks

All API methods have corresponding React hooks for use in client components:

### Content Hooks

- `useContentList(filters)` - List content with filters
- `useContentBySlug(slug)` - Get content by slug
- `useContentById(id)` - Get content by ID
- `useFeaturedContent(limit)` - Get featured content
- `useRecentContent(limit)` - Get recent content
- `usePopularContent(limit)` - Get popular content
- `useContentByType(type, filters)` - Get content by type

### Convenience Hooks

- `useNews(filters)` - Get news articles
- `useEvents(filters)` - Get events
- `useProjects(filters)` - Get projects
- `useFaqs(filters)` - Get FAQs
- `useBanners(filters)` - Get banners

### Category & Tag Hooks

- `useCategories()` - Get all categories
- `useCategoryTree()` - Get category tree
- `useTags()` - Get all tags
- `usePopularTags(limit)` - Get popular tags

### Comment Hooks

- `useComments(contentId)` - Get comments for content

### Search Hook

- `useSearch(query, filters)` - Search content

### Hook Return Value

All hooks return an object with:

```javascript
{
  data: T | null,           // The fetched data
  loading: boolean,         // Loading state
  error: Error | null,      // Error object if request failed
  refetch: () => Promise<void>  // Function to manually refetch data
}
```

## Examples

### Example 1: Homepage with Featured Content

```javascript
import { publicContentAPI } from '@/lib/api/public-content';

export default async function HomePage() {
  // Fetch data in parallel
  const [featuredNews, featuredEvents, featuredProjects, banners] = await Promise.all([
    publicContentAPI.getNews({ featuredOnly: true, pageSize: 3 }),
    publicContentAPI.getEvents({ featuredOnly: true, pageSize: 3 }),
    publicContentAPI.getProjects({ featuredOnly: true, pageSize: 3 }),
    publicContentAPI.getBanners({ featuredOnly: true }),
  ]);

  return (
    <main>
      {/* Render banners */}
      <section>
        {banners.data.map(banner => (
          <div key={banner.id}>{banner.title}</div>
        ))}
      </section>

      {/* Render featured news */}
      <section>
        <h2>Latest News</h2>
        {featuredNews.data.map(item => (
          <article key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
          </article>
        ))}
      </section>

      {/* Render featured events */}
      <section>
        <h2>Upcoming Events</h2>
        {featuredEvents.data.map(item => (
          <article key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
          </article>
        ))}
      </section>

      {/* Render featured projects */}
      <section>
        <h2>Our Projects</h2>
        {featuredProjects.data.map(item => (
          <article key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

### Example 2: Blog List Page with Pagination

```javascript
import { publicContentAPI } from '@/lib/api/public-content';

export default async function BlogPage({ searchParams }) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 12;

  const news = await publicContentAPI.getNews({
    page,
    pageSize,
    language: 'pt',
  });

  return (
    <div>
      <h1>Blog</h1>

      <div className="blog-grid">
        {news.data.map(post => (
          <article key={post.id}>
            <img src={post.featured_image} alt={post.title} />
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <a href={`/blog/${post.slug}`}>Read more</a>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: news.pagination?.totalPages || 1 }, (_, i) => (
          <a key={i + 1} href={`/blog?page=${i + 1}`}>
            {i + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Single Post Page

```javascript
import { publicContentAPI } from '@/lib/api/public-content';

export default async function BlogPostPage({ params }) {
  const content = await publicContentAPI.getBySlug(params.slug);
  const comments = await publicContentAPI.getComments(content.id);

  return (
    <article>
      <h1>{content.title}</h1>
      <img src={content.featured_image} alt={content.title} />
      <div dangerouslySetInnerHTML={{ __html: content.content }} />

      <div className="tags">
        {content.tags?.map(tag => (
          <span key={tag.id} className="tag">{tag.name}</span>
        ))}
      </div>

      <div className="comments">
        <h2>Comments ({comments.length})</h2>
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <strong>{comment.authorName}</strong>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
```

### Example 4: Client Component with Hook

```javascript
'use client';

import { useNews } from '@/lib/api/public-content';

export default function RecentNews() {
  const { data, loading, error, refetch } = useNews({
    pageSize: 5,
    language: 'pt'
  });

  if (loading) return <div>Loading news...</div>;
  if (error) return <div>Error loading news: {error.message}</div>;
  if (!data?.data.length) return <div>No news available</div>;

  return (
    <div>
      <h2>Recent News</h2>
      <button onClick={refetch}>Refresh</button>

      {data.data.map(item => (
        <article key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
          <small>{new Date(item.published_at).toLocaleDateString()}</small>
        </article>
      ))}
    </div>
  );
}
```

## Content Types

The API supports the following content types:

- `news` - News articles and blog posts
- `event` - Events and activities
- `project` - Projects and initiatives
- `faq` - Frequently Asked Questions
- `banner` - Promotional banners
- `article` - General articles
- `announcement` - Announcements
- `custom` - Custom content types

## Data Structure

### Content Object

```javascript
{
  id: number,
  title: string,
  slug: string,
  excerpt: string,
  content: string,              // HTML content
  type: string,                 // 'news', 'event', 'project', etc.
  status: string,               // 'published', 'draft', etc.
  visibility: string,           // 'public', 'internal', 'clients', 'private'
  featured_image: string,       // Image URL
  author_name: string,
  categories: Category[],
  tags: Tag[],
  published_at: string,         // ISO date
  allow_comments: boolean,
  is_featured: boolean,
  language: string,             // 'pt', 'en'
  view_count: number,
  like_count: number,
  comment_count: number,
  created_at: string,
  updated_at: string,
  custom_fields: object,        // Dynamic custom fields
}
```

### Paginated Response

```javascript
{
  data: Content[],
  pagination: {
    total: number,
    page: number,
    pageSize: number,
    totalPages: number,
  }
}
```

## Error Handling

The API client automatically handles errors and logs them to the console. In production, you may want to implement custom error handling:

```javascript
try {
  const news = await publicContentAPI.getNews();
} catch (error) {
  console.error('Failed to fetch news:', error);
  // Handle error (show toast, redirect, etc.)
}
```

## Notes

- All API methods return Promises
- Use hooks only in client components (`'use client'`)
- Use API methods directly in server components for better performance
- Consider implementing React Query or SWR for advanced caching and revalidation
- All dates are returned in ISO 8601 format
- Content includes HTML, remember to sanitize before rendering
