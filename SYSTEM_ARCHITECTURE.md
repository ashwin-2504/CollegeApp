# System Architecture

## High-level architecture

The repository implements a client-only mobile/web application using Expo Router and React Native. The architecture is layered but intentionally lightweight:

1. presentation and navigation in `app/` and `components/`
2. domain orchestration in `lib/domain/`
3. data access in `lib/db/`
4. side-effect integrations in `lib/notifications/`
5. pure scheduling/timetable logic in `lib/timetable/`

SQLite is the system of record for local data. No backend, sync service, or external API integration is present in the current codebase.

## Runtime bootstrap

The app starts in `app/_layout.tsx`.

Bootstrap responsibilities:

- load fonts
- hold the splash screen until assets are ready
- configure a dark navigation theme
- initialize the SQLite database through `SQLiteProvider`
- configure notifications once on app startup
- mount the root Expo Router stack

## Route architecture

### Root stack

Defined in `app/_layout.tsx`:

- `(tabs)` as the primary application shell
- `task/create`
- `task/[id]`
- `timetable/setup`
- `timetable/create`

### Tab shell

Defined in `app/(tabs)/_layout.tsx` and screens under `app/(tabs)/`:

- `index.tsx`
  - current context screen combining timed tasks and lecture awareness
- `upcoming.tsx`
  - sectioned list of dated tasks
- `unscheduled.tsx`
  - inbox list for undated tasks
- `timetable.tsx`
  - today’s lecture schedule, current lecture, and next lecture

## Module boundaries

### Presentation layer

- `app/`
  - route-level screens and navigation
- `components/`
  - reusable cards, selectors, sheets, and empty states

Responsibilities:

- render UI
- hold screen-local state
- trigger workflows based on user actions

### Domain layer

- `lib/domain/tasks.ts`

Responsibilities:

- normalize task creation inputs
- coordinate database writes with notification scheduling
- handle completion toggles and rescheduling
- reconcile notifications at launch

### Persistence layer

- `lib/db/database.ts`
  - table creation and database initialization
- `lib/db/actionItems.ts`
  - task CRUD and task query methods
- `lib/db/lectureSlots.ts`
  - lecture slot CRUD, bulk replace, and existence checks

Responsibilities:

- own SQL queries
- translate raw rows into typed objects
- provide focused storage APIs to upper layers

### Notification integration

- `lib/notifications/scheduler.ts`

Responsibilities:

- configure `expo-notifications`
- schedule task reminders
- cancel scheduled reminders
- reconcile scheduled notifications with persisted task state

Notable implementation detail:

- uses lazy `import("expo-notifications")` to avoid Expo Go push-module startup issues

### Timetable logic

- `lib/timetable/engine.ts`
  - pure schedule computations for current/next lecture and formatting
- `lib/timetable/builder/`
  - advanced timetable builder reducer, presets, validation, and types

Responsibilities:

- isolate deterministic scheduling logic from UI
- support builder validation and bulk editing behavior

## Data flow

### Task creation flow

1. user submits the task form in `app/task/create.tsx`
2. screen calls `createTask` in `lib/domain/tasks.ts`
3. domain logic normalizes deadline intent
4. `lib/db/actionItems.ts` writes the task into SQLite
5. `lib/notifications/scheduler.ts` schedules a local notification when applicable
6. notification id is written back to SQLite if scheduling succeeds

### Task completion flow

1. tab screen triggers completion toggle
2. `toggleTaskComplete` in `lib/domain/tasks.ts` loads the task
3. DB completion state flips
4. notification is canceled or rescheduled depending on the new state

### Timetable save flow

1. setup or builder screen collects slot inputs
2. inputs are converted to `CreateLectureSlotInput`
3. `lib/db/lectureSlots.ts` inserts or replaces persisted lecture slots
4. timetable screens query today’s slots and derive current/next lecture via `lib/timetable/engine.ts`

## Important folders

- `app/`
- `app/(tabs)/`
- `app/task/`
- `app/timetable/`
- `components/`
- `components/timetable/`
- `lib/`
- `lib/db/`
- `lib/domain/`
- `lib/notifications/`
- `lib/timetable/`
- `lib/timetable/builder/`
- `assets/`

## Dependencies

Runtime dependencies:

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- Expo SQLite
- Expo Notifications
- Expo Haptics
- React Navigation
- React Native Reanimated

Development dependencies:

- TypeScript 5.9
- React type definitions
- React test renderer

## Commands

- Install: `npm install`
- Start dev server: `npm run start`
- Run Android: `npm run android`
- Run iOS: `npm run ios`
- Run web: `npm run web`
- Type-check: `npx tsc --noEmit`

## Testing and validation status

- No dedicated automated test command is configured.
- Validation is currently based on:
  - TypeScript compile checks
  - manual flow testing in Expo targets
  - targeted verification of SQLite and notification behavior

## Architectural constraints

- Local-first design: SQLite is authoritative.
- No server-side components are present.
- Navigation is file-based through Expo Router.
- Notification logic must remain defensive for Expo Go compatibility.
- Shared visual constants should continue to come from `lib/constants.ts`.
