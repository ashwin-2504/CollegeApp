# Agent Workflow

## Purpose

This file describes how coding agents should operate in this repository so changes stay consistent with the existing Expo, SQLite, and route-based architecture.

## How agents should approach the codebase

1. Start by locating the feature entry point in `app/`.
2. Trace any UI event to the next layer before editing:
   - screen in `app/`
   - shared component in `components/`
   - workflow logic in `lib/domain/`
   - persistence in `lib/db/`
   - pure logic in `lib/timetable/` or other `lib/` modules
3. Prefer the smallest change that fits the current structure instead of introducing a new pattern.
4. Preserve local-first behavior and avoid assuming backend services exist.

## Working rules for agents

- Treat `app/` as screen composition and navigation code, not as the place for persistence-heavy logic.
- Put reusable display logic in `components/`.
- Put SQLite reads/writes in `lib/db/`.
- Put multi-step task workflows in `lib/domain/`.
- Keep pure computations side-effect free when they belong in `lib/timetable/` or shared helpers.
- Reuse `lib/constants.ts` tokens instead of hardcoding styling values when touching UI.
- Keep imports on the existing `@/` alias path style.
- Preserve TypeScript strictness and explicit domain types.

## Folder map agents should know

- `app/_layout.tsx`
  - app bootstrap, font loading, splash control, SQLite provider, notification setup
- `app/(tabs)/`
  - top-level tabbed navigation and primary user flows
- `app/task/`
  - task CRUD entry points
- `app/timetable/`
  - timetable creation and editing
- `components/`
  - reusable cards, selectors, and empty states
- `components/timetable/`
  - advanced timetable builder UI building blocks
- `lib/db/`
  - data access layer
- `lib/domain/tasks.ts`
  - task orchestration with notification side effects
- `lib/notifications/scheduler.ts`
  - local notification behavior and Expo Go compatibility handling
- `lib/timetable/engine.ts`
  - deterministic timetable computations
- `lib/timetable/builder/`
  - reducer, presets, validation, and builder-specific types

## Change strategy by task type

### UI changes

- Check whether the change belongs in a screen or a shared component.
- Reuse existing spacing, colors, border radius, and typography tokens.
- Preserve the current dark-theme-first look unless the task explicitly asks for a redesign.

### Task feature changes

- Start at task screens in `app/task/` or task tabs in `app/(tabs)/`.
- Route task creation, completion, and deletion behavior through `lib/domain/tasks.ts` when notification behavior is involved.
- Keep raw SQL changes in `lib/db/actionItems.ts`.

### Timetable changes

- Use `lib/timetable/engine.ts` for display-time schedule logic.
- Use `lib/timetable/builder/` for builder state and validation changes.
- Keep lecture slot persistence in `lib/db/lectureSlots.ts`.

### Database changes

- Update schema initialization in `lib/db/database.ts`.
- Keep schema creation idempotent.
- Check all affected readers/writers in `lib/db/` and any domain code that depends on them.

### Notification changes

- Make changes in `lib/notifications/scheduler.ts`.
- Preserve the lazy import pattern used to avoid Expo Go notification module crashes.
- Verify behavior manually on a supported simulator/device when possible.

## Verification steps agents should run

- Always run `npx tsc --noEmit` after code changes when feasible.
- Run the relevant Expo target for the area being changed:
  - `npm run android`
  - `npm run ios`
  - `npm run web`
- Manually verify affected flows because there is no automated `test` script configured.

## Dependencies and commands

- Install dependencies: `npm install`
- Available app commands:
  - `npm run start`
  - `npm run android`
  - `npm run ios`
  - `npm run web`
- Available verification command:
  - `npx tsc --noEmit`

## Things agents should avoid

- Do not add new architectural layers unless the current structure is clearly insufficient.
- Do not bypass `lib/domain/tasks.ts` when task changes have notification implications.
- Do not scatter SQL across screens or components.
- Do not introduce backend assumptions, sync logic, or server APIs without explicit direction.
- Do not promise automated tests that do not exist in the repository.
