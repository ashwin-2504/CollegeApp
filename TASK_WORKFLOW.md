# TASK_WORKFLOW.md

## Purpose

This file defines how AI agents should implement changes in this repository in a deterministic way.

## Feature Implementation Workflow

### 1. Locate the feature entry point

Start from the user-visible screen in `app/`.

Common entry points:

- `app/(tabs)/index.tsx`
- `app/(tabs)/upcoming.tsx`
- `app/(tabs)/unscheduled.tsx`
- `app/(tabs)/timetable.tsx`
- `app/task/create.tsx`
- `app/task/[id].tsx`
- `app/timetable/setup.tsx`
- `app/timetable/create.tsx`

### 2. Trace dependencies before editing

For any feature, trace in this order:

1. route screen in `app/`
2. shared UI in `components/`
3. domain logic in `lib/domain/`
4. persistence logic in `lib/db/`
5. helper or pure logic in `lib/timetable/` or `lib/constants.ts`

Do not edit only the screen if behavior is actually owned by a lower layer.

### 3. Make changes in the correct layer

- UI rendering change:
  - edit `app/` or `components/`
- task workflow change:
  - inspect `lib/domain/tasks.ts` and `lib/db/actionItems.ts`
- timetable display change:
  - inspect `lib/timetable/engine.ts`
- timetable builder change:
  - inspect `lib/timetable/builder/`
- notification change:
  - inspect `lib/notifications/scheduler.ts`
- schema or data model change:
  - inspect `lib/db/database.ts` and all affected DB access modules

### 4. Preserve repository conventions

- keep imports on `@/` alias paths
- keep TypeScript types explicit for domain boundaries
- keep SQL isolated to `lib/db/`
- keep screen code focused on view and interaction orchestration
- keep side effects out of pure timetable utilities
- reuse constants from `lib/constants.ts`

## How To Run Tests

There is no dedicated test runner configured in `package.json`.

Use this as the required verification command:

```bash
npx tsc --noEmit
```

If the change affects runtime behavior, also launch the most relevant target:

```bash
npm run start
npm run android
npm run ios
npm run web
```

Choose the smallest relevant runtime command for the change being made.

## How To Validate Code Changes

### Always do

1. Run `npx tsc --noEmit`.
2. Confirm imports resolve and no new type errors are introduced.
3. Review impacted screens and lower-level modules together.

### For UI changes

1. Launch a relevant Expo target.
2. Verify layout, navigation, and interaction behavior manually.
3. Check that existing dark theme styling remains coherent.

### For task changes

1. Create a task with no deadline.
2. Create a task with a date only.
3. Create a task with date and time.
4. Toggle completion from both list and detail flows if affected.
5. Verify deletion behavior if task detail logic changed.

### For timetable changes

1. Verify a timetable can still be created or edited.
2. Confirm lecture ordering remains correct.
3. Confirm current and next lecture derivation still behaves correctly for today.
4. If builder logic changed, check validation warnings and blocking errors.

### For database-related changes

1. Verify the app still starts with an empty local database.
2. Verify affected CRUD flows still work after restart.
3. Ensure schema initialization remains idempotent.

### For notification changes

1. Verify scheduling logic only runs for tasks with valid future dates.
2. Verify completion cancels notifications and reopening reschedules them when applicable.
3. Expect Expo Go compatibility warnings in some cases; do not treat those warnings alone as proof of failure.

## Deterministic Guardrails

- Do not claim automated tests exist when they do not.
- Do not introduce undocumented backend assumptions.
- Do not duplicate logic across screens and domain modules.
- Do not move database logic into components.
- Do not bypass `lib/domain/tasks.ts` when task notification behavior is involved.
- Do not document or implement features that are not present in the repository unless the task explicitly requests a new feature.

## Command Reference

### Install dependencies

```bash
npm install
```

### Available run commands

```bash
npm run start
npm run android
npm run ios
npm run web
```

### Static verification

```bash
npx tsc --noEmit
```
