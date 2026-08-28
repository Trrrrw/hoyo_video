# API and service guidance

Applies to `src/api/**` and `src/services/**`.

## Backend requests

- Use `backendFetch` instead of calling the application backend with `fetch` directly.
- Keep request timeout/error normalization centralized in `src/api/client.ts`.
- Dynamic path segments must use `encodeURIComponent`; query values belong in the query object / `URLSearchParams`.
- Preserve in-flight request deduplication. Completed-response caching is intentionally limited to stable metadata endpoints unless there is a clear reason to expand it.

## Runtime contracts

- Backend JSON must pass a runtime guard before being exposed as an application type.
- When adding fields to API types, update the corresponding parser guard at the same time.
- External JSON-RPC responses, including Aria2 responses, also need runtime validation for fields the UI consumes.
- Prefer a useful boundary error over allowing malformed data to fail later inside a component.

## API semantics

- `NewsInfo.video_url` may be absent from list/detail data and resolved separately through the media endpoint.
- The special UI tag `其他` maps to the backend `untagged` filter; do not send it as a normal tag value.
- Date filters use the compact `YYYYMMDD-YYYYMMDD` URL representation in the frontend and are converted to backend dates at the request boundary.

## Client configuration

- `VITE_BACKEND_BASE` can override the production backend.
- `VITE_DEV_BACKEND_BASE` is development-only.
- `VITE_API_TIMEOUT_MS` and `VITE_DEV_API_DELAY_MS` are client-visible configuration, not secret storage.
