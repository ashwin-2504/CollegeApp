# AGENTS.md

## Project Overview

CollegeApp is a local-first Expo Router application built with React Native and TypeScript. The current product scope, as inferred from the codebase, is:

- task capture and tracking
- date-based and time-based task organization
- college timetable creation and review
- local notification scheduling for dated tasks

The app does not contain a backend, sync layer, or external API integration. SQLite on the device is the system of record.

## Architecture

The codebase follows a lightweight layered structure:

1. `app/`
   - route entry points and screen composition
2. `components/`
   - reusable UI elements
3. `lib/domain/`
   - workflow orchestration and business rules
4. `lib/db/`
   - SQLite schema and persistence operations
5. `lib/notifications/`
   - local notification integration
6. `lib/timetable/`
   - pure timetable calculations and builder state logic

Key architectural constraints:

- routing is file-based through Expo Router
- app startup is centralized in `app/_layout.tsx`
- SQLite is initialized with `SQLiteProvider`
- task notifications are managed with `expo-notifications`
- timetable calculations are kept mostly pure and deterministic

## Folder Structure

Only the important project folders are listed below.

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    upcoming.tsx
    unscheduled.tsx
    timetable.tsx
  task/
    create.tsx
    [id].tsx
  timetable/
    create.tsx
    setup.tsx

components/
  ActionItemCard.tsx
  DeadlineSelector.tsx
  EmptyState.tsx
  LectureCard.tsx
  timetable/

lib/
  constants.ts
  types.ts
  db/
    database.ts
    actionItems.ts
    lectureSlots.ts
  domain/
    tasks.ts
  notifications/
    scheduler.ts
  timetable/
    engine.ts
    builder/
      presets.ts
      reducer.ts
      types.ts
      validation.ts

assets/
```

## Coding Conventions

Follow the patterns already present in the repository.

- Use TypeScript with `strict` mode preserved.
- Use the `@/*` import alias for project-local imports.
- Keep screen-level logic in `app/`.
- Keep reusable presentation components in `components/`.
- Keep SQL and row mapping in `lib/db/`.
- Keep multi-step task workflows in `lib/domain/tasks.ts`.
- Keep timetable calculations pure when possible in `lib/timetable/`.
- Reuse design tokens from `lib/constants.ts` instead of introducing new ad hoc values.
- Use functional React components and hooks.
- Keep `StyleSheet.create(...)` definitions in the same file as the component, usually near the bottom.
- Preserve the dark-theme-first visual approach unless explicitly changing design requirements.
- Preserve the lazy notification import pattern in `lib/notifications/scheduler.ts`.

## Commands

### Install

```bash
npm install
```

### Run

```bash
npm run start
npm run android
npm run ios
npm run web
```

### Build

No explicit production build script is defined in `package.json`.

For this repository, treat Expo start commands as the available runtime commands and `npx tsc --noEmit` as the required static verification step.

### Test

There is no `npm test` script configured.

Use:

```bash
npx tsc --noEmit
```

Then manually validate the affected flow in the relevant Expo target.

## Deterministic Rules For Agents

- Do not invent backend services, auth flows, or sync behavior.
- Do not add new architectural layers unless a task explicitly requires them.
- Do not place SQL inside screens or UI components.
- Do not bypass `lib/domain/tasks.ts` for task operations that affect notifications.
- When changing timetable builder behavior, inspect `lib/timetable/builder/` before editing screens.
- When documenting or changing behavior, base statements on code that exists in this repository today.
