# Automatic Language Filtering

## Overview

All public content API hooks automatically filter content by the currently selected language from the `LanguageContext`. This ensures that users only see content in their preferred language without needing to manually specify it in every API call.

## How It Works

### 1. Language Context Integration

The hooks automatically inject the current language from `useLanguage()` context:

```typescript
import { useLanguage } from '@/context/LanguageContext'

export function useNews(filters?: ContentFilters) {
    const { language } = useLanguage() // Gets current language ('pt' or 'en')

    // Language is automatically merged into filters
    const filtersWithLanguage = {
        ...filters,
        language: filters?.language || language
    }

    // API call includes language filter
    return publicContentAPI.getNews(filtersWithLanguage)
}
```

### 2. Smart Merging

The `mergeLanguageFilter` helper function smartly merges the language:

```typescript
function mergeLanguageFilter(filters: ContentFilters | undefined, contextLanguage: string): ContentFilters {
    return {
        ...filters,
        language: filters?.language || contextLanguage
    }
}
```

**Behavior:**
- ✅ **No language specified**: Uses language from context
- ✅ **Language explicitly specified**: Uses the explicit language (override)
- ✅ **Context changes**: Automatically refetches with new language

### 3. Automatic Refetching

When the user switches language, components automatically refetch data:

```jsx
export default function NewsSection() {
    // No language parameter needed!
    const { data, loading, error } = useNews({
        pageSize: 10,
        featuredOnly: true
    })

    // When user switches from 'pt' to 'en', this automatically refetches
    // with the new language filter
}
```

## Supported Hooks

### With Automatic Language Filtering

These hooks automatically filter by current language:

- ✅ `useContentList(filters)` - Lists all content types
- ✅ `useNews(filters)` - News articles
- ✅ `useEvents(filters)` - Events
- ✅ `useProjects(filters)` - Projects
- ✅ `useFaqs(filters)` - FAQs
- ✅ `useBanners(filters)` - Banners
- ✅ `useSearch(query, filters)` - Search results
- ✅ `useFeaturedContent(limit)` - Featured content
- ✅ `useRecentContent(limit)` - Recent content
- ✅ `usePopularContent(limit)` - Popular content

### Without Language Filtering

These hooks don't filter by language (language-independent):

- ℹ️ `useContentBySlug(slug)` - Slug is already language-specific
- ℹ️ `useContentById(id)` - ID is unique per language version
- ℹ️ `useCategories()` - Categories might be shared across languages
- ℹ️ `useTags()` - Tags might be shared across languages
- ℹ️ `useComments(contentId)` - User comments are language-independent

## Usage Examples

### Basic Usage (Automatic)

```jsx
'use client'
import { useNews } from '@/lib/api/public-content'

export default function NewsPage() {
    // Language is automatically filtered based on context
    const { data, loading, error } = useNews({
        pageSize: 10
    })

    // User sees news in their selected language
    return <div>{/* Render news */}</div>
}
```

### Explicit Language Override (Advanced)

```jsx
'use client'
import { useNews } from '@/lib/api/public-content'

export default function BilingualNewsPage() {
    // Show Portuguese news regardless of selected language
    const { data: ptNews } = useNews({
        language: 'pt', // Explicit override
        pageSize: 5
    })

    // Show English news regardless of selected language
    const { data: enNews } = useNews({
        language: 'en', // Explicit override
        pageSize: 5
    })

    return (
        <div>
            <section>
                <h2>Portuguese News</h2>
                {/* Render ptNews */}
            </section>
            <section>
                <h2>English News</h2>
                {/* Render enNews */}
            </section>
        </div>
    )
}
```

### Search with Automatic Language

```jsx
'use client'
import { useState } from 'react'
import { useSearch } from '@/lib/api/public-content'

export default function SearchPage() {
    const [query, setQuery] = useState('')

    // Search automatically filters by current language
    const { data, loading } = useSearch(query, {
        pageSize: 20
    })

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
            />
            {/* Results in current language only */}
            {loading ? <p>Searching...</p> : <ResultsList data={data} />}
        </div>
    )
}
```

## Adding New Languages

To add support for new languages:

### 1. Update Language Configuration

Add the new language to `AES_LANGUAGES` in `/frontend/data/aesContent.js`:

```javascript
export const AES_LANGUAGES = [
    { code: "pt", label: "PT" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" }, // New language
    { code: "fr", label: "FR" }, // New language
]
```

### 2. Create Content in New Language

Add content in the backend with the new language code:

```sql
INSERT INTO content (title, slug, content, language, ...)
VALUES ('Título em Espanhol', 'titulo-em-espanhol', '...', 'es', ...)
```

### 3. Update Translations (Optional)

Add UI translations for the new language:

```javascript
const translations = {
    loading: {
        pt: "Carregando...",
        en: "Loading...",
        es: "Cargando...",
        fr: "Chargement...",
    }
}
```

### 4. That's It!

The automatic language filtering will work immediately with the new language. No changes needed to:
- ❌ API hooks (already support any language)
- ❌ API methods (language-agnostic)
- ❌ Component logic (uses context automatically)

## Implementation Details

### Performance Optimization

The hooks use `useMemo` to prevent unnecessary API calls:

```typescript
const filtersWithLanguage = useMemo(
    () => mergeLanguageFilter(filters, language),
    [filters, language]
)
```

This ensures the merged filters object only changes when:
- The `filters` prop changes
- The `language` context changes

### Dependency Tracking

The language is included in the dependency array:

```typescript
return useFetch(
    () => publicContentAPI.getNews(filtersWithLanguage, config),
    [JSON.stringify(filtersWithLanguage), JSON.stringify(config)]
)
```

This ensures:
- ✅ Automatic refetch when language changes
- ✅ Proper cache invalidation
- ✅ No stale data from previous language

### Type Safety

All language filtering is fully type-safe:

```typescript
interface ContentFilters {
    language?: string  // Optional, injected automatically
    pageSize?: number
    // ... other filters
}
```

## Best Practices

### ✅ Do

- Let the hooks automatically handle language filtering
- Use explicit language override only when showing multi-language content side-by-side
- Test language switching to ensure automatic refetching works

### ❌ Don't

- Don't manually add `language` filter unless you need to override
- Don't bypass the hooks and call the API directly (loses automatic filtering)
- Don't forget to wrap your app with `LanguageProvider`

## Troubleshooting

### Content Not Filtering by Language

**Check:**
1. Is `LanguageProvider` wrapping your app?
2. Is the `language` field set correctly in the database?
3. Are you using the hooks (not calling API directly)?

### Language Switch Not Refetching

**Check:**
1. Is the language value changing in context?
2. Are the hooks properly included in the component tree?
3. Check browser console for errors

### TypeScript Errors

**Check:**
1. Are you importing types from `@/lib/api/public-content`?
2. Is `ContentFilters` interface used correctly?
3. Check that `language` is optional in your filter types

## Summary

Automatic language filtering:
- ✅ Works automatically for all content hooks
- ✅ Uses `LanguageContext` for current language
- ✅ Allows explicit override when needed
- ✅ Supports future languages without code changes
- ✅ Fully type-safe with TypeScript
- ✅ Optimized with `useMemo` and proper dependencies
- ✅ Automatically refetches on language change
