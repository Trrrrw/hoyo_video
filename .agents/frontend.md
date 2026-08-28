# Frontend guidance

Applies to React components, pages, hooks, layouts, theme code, and browser-side utilities.

## Routing and page state

- Keep route construction compatible with `src/App.tsx`.
- Use `URLSearchParams` for query parameters instead of manually concatenating query strings.
- Video detail navigation carries a `from` location so Back can restore the originating list. Preserve that behavior when changing cards, related videos, or detail navigation.
- `CardGrid` and `VideoTimeline` cooperate with `useRestoreScrollPosition`; changes to pagination, keys, hashes, or scroll containers must preserve restoration behavior.

## Lists and async hooks

- Virtualized list item keys must be stable across renders and pagination.
- Pagination must be safe against repeated `endReached`/load-more calls before React state has re-rendered. Do not rely on state alone as an immediate concurrency lock.
- Ignore results from stale requests when route/filter inputs change.
- Preserve filter values exactly. Do not serialize arbitrary tag/character strings with an ambiguous delimiter just to stabilize hook dependencies.

## Browser state

- Treat `localStorage` and `sessionStorage` as optional capabilities. Wrap reads/writes so privacy settings, quota errors, or stale values cannot crash the UI.
- Validate stored enum-like values before using them as application types.
- Keep persisted settings narrowly scoped. Aria2 credentials are only stored after the user explicitly opts in.

## UI conventions

- Reuse Ant Design components and the existing Tailwind utility approach before introducing another UI abstraction.
- Keep accessibility labels on icon-only controls and preserve keyboard/focus behavior.
- External links opened in a new tab must use `noopener`/`noreferrer` protection where applicable.
- Avoid replacing virtualized grids/timelines with fully rendered lists without a measured reason.

## Large components

`DownloadVideoModal.tsx` and `VideoTimeline.tsx` are intentionally feature-heavy. If adding substantial new responsibilities, prefer extracting focused hooks/helpers/components rather than continuing to grow one file, but do not split them solely for style.
