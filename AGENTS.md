# AGENTS.md

## Project

`hoyo_video` is a React + TypeScript web app for browsing, searching, playing, and downloading archived game videos. It uses Vite, React Router, Ant Design, Tailwind CSS, Video.js React, and a small typed API layer.

## Working rules

- Keep changes focused on the requested behavior. Do not perform unrelated visual or architectural rewrites.
- Preserve the existing React Router URL shapes and query-parameter semantics unless a task explicitly changes them.
- Treat backend and external-service data as untrusted at runtime. Keep or add validation at API/service boundaries instead of relying only on TypeScript casts.
- Encode dynamic URL path segments with `encodeURIComponent`.
- Browser storage is optional. Reads and writes to `localStorage` / `sessionStorage` must not make the app unusable when storage is unavailable or contains stale data.
- Do not put secrets in `VITE_*` variables; Vite embeds them in client builds.
- Before finishing code changes, run `pnpm check` and `pnpm build` when the environment allows it.

## Where to look

- Backend API, caching, parsing, and response contracts: `.agents/api.md`
- React UI, routing, virtualized lists, and browser state: `.agents/frontend.md`
- Ant Design-specific guidance already lives in `.agents/skills/antd/SKILL.md`.

Prefer the closest relevant guidance file instead of expanding this root file with subsystem details.
