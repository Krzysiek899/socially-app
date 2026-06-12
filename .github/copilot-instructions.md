# Copilot instructions for this repository

## Build, test, and lint commands

All frontend commands run from `app/`.

```bash
cd app
npm start
npm run build
npm test -- --watchAll=false
npm test -- --watchAll=false --runTestsByPath src/__tests__/tokens.test.ts
npm run lint
```

Notes:

- The app is a Vite + React + TypeScript frontend in `app/`.
- Jest tests live under `app/src/__tests__/`.
- `npm run lint` exists, but the current repo baseline already contains ESLint failures outside any new change. Do not assume a clean lint run unless you fixed those existing issues too.

## High-level architecture

- This repo is a **single-context** project. Read `CONTEXT.md` for domain vocabulary and `docs/adr/` for architectural decisions before changing behavior in a domain area.
- The runnable application lives in `app/`; the repo root mainly holds domain docs, ADRs, issue/process docs, and agent guidance.
- `app/src/main.tsx` bootstraps the app, loads design tokens (`tokens/primitive.css`, `tokens/semantic.css`), and starts the MSW worker in development before rendering React.
- `app/src/App.tsx` is the composition root: it wires `Provider` + `BrowserRouter`, restores auth state on startup, and persists the auth session according to the stored session-persistence preference.
- Redux state is split by feature in `app/src/redux/`. The current slices are `auth` and `discover`; routes/pages consume them through typed hooks from `app/src/redux/hooks.ts`.
- Feature code is organized by area under `app/src/pages/<feature>/`, with `api/`, `domain/`, and `dto/` subfolders. Keep feature-specific schemas and models close to the feature instead of moving them into a generic shared folder.
- API calls are funneled through `app/src/app/apiContractGateway.ts`, which validates request/response payloads with Zod and surfaces translation keys as errors. Mock API behavior lives in `app/src/mocks/` and is the current backend boundary for `auth` and `discover`.
- Reusable UI lives in `app/src/shared/components/` and reusable page-layout primitives live in `app/src/shared/layout/`. The shared component barrel in `app/src/shared/components/index.ts` is the expected import surface for app-facing usage.
- Text is centralized through `app/src/i18n/`. `t()` is a simple key lookup backed by `app/src/i18n/pl.ts`, so UI copy and user-facing error states should be added as translation keys, not inline strings.

## Key conventions

- Use the glossary terms from `CONTEXT.md` in code, tests, and issue/PR text. Avoid inventing synonyms for domain concepts that the glossary already defines.
- Follow ADR-0001: frontend work is built around React Router + Redux slices, with MSW standing in for the backend and Zod schemas protecting DTO boundaries.
- Auth session persistence is intentional behavior, not an implementation detail: `"remember me"` maps to `persistent` vs `session` storage in `pages/auth/domain/authSession.ts`. Preserve that distinction when touching auth flows.
- Prefer existing shared components and layout primitives over custom HTML/CSS. In particular, page composition should usually start from `Page`, `Section`, `Stack`, `Cluster`, `Split`, and `Grid`, plus shared components from `shared/components`.
- When adding or changing design-system components, update `app/src/playground/Playground.tsx` with an example so the component stays discoverable in the in-app playground route.
- Keep feature state in Redux slices and feature transport/domain concerns inside the feature folder. Do not bypass the slice/api/schema flow with ad hoc fetch logic inside components.
- Branch and commit conventions come from `AGENTS.md`: use a dedicated branch for the work, and use conventional commit prefixes such as `feat:`, `fix:`, `chore:`, or `refactor:`.
