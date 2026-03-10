# Implementation Plan

## Title and Purpose

This document is the master execution runbook for migrating CollegeApp from its current lecture-and-task MVP into the unified organizer described in `APPLICATION_PLAN.md`.

This plan is designed for phased delivery with explicit stop points, verification gates, and handoff checkpoints. It is not product prose. It is the implementation coordination document to be followed by engineers and agents during execution.

Execution goals:

- deliver the target product one phase at a time
- allow pauses between phases without losing context
- make phase entry and exit criteria explicit
- prevent implementers from re-deciding architecture mid-migration

---

## Target Product Summary

The target application is an offline-first personal organizer built around a unified schedule system, task tracking, and project tracking.

The target product must provide:

- a single schedule engine for lectures, work blocks, meetings, breaks, and free slots
- task management with deadlines, priority, notes, tags, completion, and optional project assignment
- project management as context containers for longer-running work
- a central Now dashboard that answers:
  - what is happening right now
  - what should I work on next
- free-time awareness based on schedule gaps
- local notification support for day schedule awareness and task awareness

The target product remains:

- local-first
- SQLite-backed
- Expo Router-based
- client-only
- free of backend, sync, auth, AI, analytics, and recurring task features

---

## Current Codebase Baseline

The current repository implements a narrower student productivity app with these active characteristics:

- `action_items` table stores lightweight tasks
- `lecture_slots` table stores college timetable entries
- `lib/domain/tasks.ts` orchestrates task creation, completion, deletion, and task notifications
- `lib/timetable/engine.ts` computes current and next lecture only
- tabs are currently:
  - Now
  - Upcoming
  - Inbox
  - Timetable
- notification support is task-reminder oriented, not schedule-summary oriented

Current core mismatches versus the target product:

- no unified schedule slot model
- no project system
- no task priorities
- no task tags
- no project assignment for tasks
- no date-specific schedule cancellation
- no free-time suggestion system
- no generalized Now dashboard
- no platform-aware day schedule notification architecture

Legacy items to be replaced during migration:

- `ActionItem`
- `LectureSlot`
- `action_items`
- `lecture_slots`
- lecture-centric timetable terminology where it remains canonical

---

## Migration Strategy

Migration strategy: `schema reset`

Decisions locked by this document:

- no legacy local database preservation is required
- old SQLite tables may be removed from canonical schema once replacement layers are ready
- old lecture-centric flows are transitional only
- the repo must end the migration with a unified schedule architecture as the only active schedule model

Implications:

- app startup on the new schema is expected to create a fresh local data set
- migration work should prioritize clean target architecture over compatibility shims
- legacy code can remain temporarily during phased implementation, but only until replacement flows are verified

---

## Global Rules and Constraints

These rules apply to every phase:

- SQLite remains the only system of record.
- No backend, sync, auth, AI, analytics, or recurring tasks may be introduced.
- All routing remains file-based through Expo Router.
- SQL must remain inside `lib/db/`.
- Workflow orchestration must remain in `lib/domain/`.
- Pure schedule calculations must remain deterministic and side-effect free.
- Shared styling must continue to reuse `lib/constants.ts`.
- The dark-theme-first visual language must be preserved unless a later product document replaces it.
- Notification logic must preserve the lazy import pattern for `expo-notifications`.
- Android may receive deeper support for persistent schedule notification behavior.
- iOS must be treated as a fallback platform for schedule notification persistence.
- Web must degrade safely when notifications are unsupported or unavailable.
- Phase progression is gate-based.
- Do not begin a phase unless the previous phase exit criteria have been met.
- Legacy lecture-specific architecture must be deleted before final completion.

Definitions used throughout this plan:

- `Task`: actionable item with optional deadline and optional project assignment
- `Project`: long-running context container for related work
- `ScheduleSlot`: weekly repeating time block from any supported source
- `ScheduleSlotCancellation`: date-specific suppression of a scheduled slot
- `FreeTimeBlock`: derived gap between effective day-agenda slots

---

## Phase Execution Model

Every phase in this document uses the same execution structure:

- `Objective`
- `Why this phase exists`
- `Inputs / prerequisites`
- `Deliverables`
- `Detailed task list`
- `Exit criteria`
- `Checkpoint pause`
- `Risks / watch items`
- `Next phase unlock`

Task format rules:

- every task starts with an action verb
- every task is atomic enough for one focused work session
- every task declares dependency if one exists
- every task declares a concrete completion signal
- tasks are grouped by phase, not by file tree

Checkpoint policy:

- complete the phase task list
- produce the required verification artifacts
- stop at the phase boundary
- write a handoff note
- only then begin the next phase

---

## Phase-by-Phase Implementation Plan

### Phase 1: Planning and Baseline Alignment

**Objective**

Establish one canonical migration runbook, confirm the current repo baseline, and freeze the top-level execution order.

**Why this phase exists**

Implementation will fail if the team starts coding against different assumptions about the current app, the target architecture, or the order of replacement.

**Inputs / prerequisites**

- `APPLICATION_PLAN.md`
- `AGENTS.md`
- `AGENT_RULES.md`
- current route structure
- current schema and type definitions

**Deliverables**

- finalized `IMPLEMENTATION_PLAN.md`
- recorded current-state baseline
- locked migration assumptions
- locked phase sequencing

**Detailed task list**

1. **Record baseline docs**  
   Action: Read `APPLICATION_PLAN.md`, `SYSTEM_ARCHITECTURE.md`, `PROJECT_CONTEXT.md`, and `TASK_WORKFLOW.md` before any implementation work starts.  
   Dependency: none  
   Completion signal: A baseline note exists in the phase handoff documenting the source docs used.

2. **Capture current route map**  
   Action: List all current app routes and identify which ones are legacy candidates.  
   Dependency: Task 1  
   Completion signal: The handoff note contains the current route inventory.

3. **Capture current schema map**  
   Action: List the active SQLite tables, columns, and current ownership modules.  
   Dependency: Task 1  
   Completion signal: The handoff note contains the current schema inventory.

4. **Capture current type map**  
   Action: List `ActionItem`, `LectureSlot`, and related input types that will be replaced.  
   Dependency: Task 1  
   Completion signal: The handoff note lists legacy types and planned canonical replacements.

5. **Capture current notification scope**  
   Action: Document which notification behaviors currently exist and which are missing relative to the target.  
   Dependency: Task 1  
   Completion signal: A gap list exists for current versus target notifications.

6. **Freeze migration mode**  
   Action: Mark the migration as schema reset with no data preservation obligations.  
   Dependency: none  
   Completion signal: This document includes the locked migration mode.

7. **Freeze product exclusions**  
   Action: Explicitly document that sync, auth, recurring tasks, AI, analytics, and collaboration remain out of scope.  
   Dependency: none  
   Completion signal: Exclusions are listed in this document and in the phase handoff note.

8. **Freeze canonical subsystems**  
   Action: Declare `Task`, `Project`, `ScheduleSlot`, and `ScheduleSlotCancellation` as the target canonical entities.  
   Dependency: Task 4  
   Completion signal: Canonical entities are documented in this plan.

9. **Freeze tab destination model**  
   Action: Declare the target tabs as `Now`, `Tasks`, `Projects`, and `Schedule`.  
   Dependency: Task 2  
   Completion signal: Target tab architecture is written in this document.

10. **Freeze schedule terminology**  
    Action: Replace lecture-first vocabulary in planning docs with schedule-slot vocabulary where the target model is described.  
    Dependency: Task 8  
    Completion signal: No canonical planning section still describes lectures as the primary schedule abstraction.

11. **Freeze gate policy**  
    Action: Require phase entry only after previous phase exit checks are satisfied.  
    Dependency: none  
    Completion signal: Gate policy is written in the phase execution model.

12. **Define handoff template**  
    Action: Specify the minimum contents for pause-and-resume notes between phases.  
    Dependency: Task 11  
    Completion signal: Every phase checkpoint includes a handoff note requirement.

**Exit criteria**

- baseline understanding is documented
- migration strategy is locked
- target tabs and target entities are locked
- no phase ordering ambiguity remains

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until the current app baseline, target tabs, target entities, and schema-reset policy are all confirmed in the handoff note.
- Required verification artifacts:
  - route inventory
  - schema inventory
  - legacy type inventory
  - notification gap inventory
- Known unresolved risks allowed to carry forward:
  - Android persistent notification feasibility remains unknown
  - exact route filenames for some future screens remain undecided
- Recommended handoff note contents:
  - current routes
  - current tables
  - canonical replacements
  - locked exclusions
  - top three migration risks

**Risks / watch items**

- an implementer may accidentally treat old architecture as additive rather than transitional
- schedule notification behavior may be over-assumed before platform validation

**Next phase unlock**

Begin Phase 2 only when the target app shell and route responsibilities can be defined without contradicting the current baseline.

---

### Phase 2: Target Architecture and Route Design

**Objective**

Define the target screen structure, route ownership, and subsystem boundaries before schema work begins.

**Why this phase exists**

The migration changes information architecture substantially. Route and screen ownership must be decided before storage and domain interfaces are implemented.

**Inputs / prerequisites**

- Phase 1 completed
- current route inventory
- target product summary

**Deliverables**

- target route map
- screen responsibility map
- subsystem ownership rules
- initial cutover order for screens

**Detailed task list**

13. **Define target tab shell**  
    Action: Document `Now`, `Tasks`, `Projects`, and `Schedule` as the final tab shell.  
    Dependency: Phase 1 complete  
    Completion signal: The route map section lists only the target tabs as canonical.

14. **Assign Now responsibilities**  
    Action: Define `Now` as the owner of current slot, next slot, free time, suggestions, and quick task creation.  
    Dependency: Task 13  
    Completion signal: The `Now` screen scope is documented with no overlap ambiguity.

15. **Assign Tasks responsibilities**  
    Action: Define `Tasks` as the owner of Today, Upcoming, Unscheduled, Overdue, and Completed sections.  
    Dependency: Task 13  
    Completion signal: The `Tasks` screen scope is documented with all required sections.

16. **Assign Projects responsibilities**  
    Action: Define `Projects` as the owner of grouped project lists, project create, and project detail.  
    Dependency: Task 13  
    Completion signal: The `Projects` screen scope is documented.

17. **Assign Schedule responsibilities**  
    Action: Define `Schedule` as the owner of weekly overview, day agenda review, and schedule-slot management.  
    Dependency: Task 13  
    Completion signal: The `Schedule` screen scope is documented.

18. **Define task detail route role**  
    Action: Document task detail as the owner of edit, delete, completion toggle, tags, and project assignment.  
    Dependency: Task 15  
    Completion signal: Task detail responsibilities are recorded.

19. **Define project detail route role**  
    Action: Document project detail as the owner of edit, delete, and related task inspection.  
    Dependency: Task 16  
    Completion signal: Project detail responsibilities are recorded.

20. **Define schedule slot detail role**  
    Action: Document schedule slot detail or edit route as the owner of update, delete, and cancellation-for-date actions.  
    Dependency: Task 17  
    Completion signal: Schedule slot detail responsibilities are recorded.

21. **Define quick-create entry points**  
    Action: Specify where task creation and schedule creation can be launched from the tab shell.  
    Dependency: Tasks 14, 15, 17  
    Completion signal: Create entry points are documented without conflict.

22. **Define collapse behavior for completed tasks**  
    Action: Specify that completed tasks are hidden by default under a collapsed section in `Tasks`.  
    Dependency: Task 15  
    Completion signal: Completed-section visibility behavior is documented.

23. **Define project grouping behavior**  
    Action: Specify that projects are grouped by status rather than by date or tag.  
    Dependency: Task 16  
    Completion signal: Project grouping behavior is documented.

24. **Define free-day rendering**  
    Action: Specify how `Now` and `Schedule` render a day with zero active slots.  
    Dependency: Tasks 14, 17  
    Completion signal: Free-day behavior is documented for both screens.

25. **Define slot-priority surfacing rule**  
    Action: Specify that `work > college > personal` influences interface surfacing order but does not delete lower-priority slots.  
    Dependency: Task 17  
    Completion signal: Priority interpretation is written in the architecture section.

26. **Define screen cutover order**  
    Action: Sequence which current screens are replaced first, second, and last.  
    Dependency: Tasks 13 to 25  
    Completion signal: Screen cutover order is listed in the phase section.

27. **Define route naming conventions**  
    Action: Decide route names that avoid lecture-specific naming in the target app shell.  
    Dependency: Task 26  
    Completion signal: Canonical route naming is recorded.

28. **Define route retirement conditions**  
    Action: Specify when each old route may be deleted after replacement validation.  
    Dependency: Task 26  
    Completion signal: Route retirement rules are documented.

**Exit criteria**

- target route shell is locked
- every major screen has clear ownership
- cutover order is defined
- legacy route retirement rules are documented

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until target routes, screen ownership, and route retirement rules are explicitly documented.
- Required verification artifacts:
  - target route map
  - screen responsibility matrix
  - cutover order list
- Known unresolved risks allowed to carry forward:
  - exact component reuse level remains open
  - final detail-route filename shape may still be adjusted
- Recommended handoff note contents:
  - target tabs
  - detail routes to add
  - old routes to retire later
  - any route naming decisions that affect linking

**Risks / watch items**

- premature schema work may encode the wrong route responsibilities
- detail-screen scope may expand if edits are not carefully assigned

**Next phase unlock**

Begin Phase 3 only when canonical entities and routes are both defined clearly enough to shape schema and type design.

---

### Phase 3: New Schema and Canonical Types

**Objective**

Replace the legacy data model with canonical entities and reset the schema design around the target product.

**Why this phase exists**

All downstream work depends on stable canonical types and database tables.

**Inputs / prerequisites**

- Phase 2 completed
- route ownership rules
- target product fields

**Deliverables**

- canonical TypeScript interfaces
- new SQLite schema definition
- entity field rules
- indexing strategy

**Detailed task list**

29. **Define Task entity**  
    Action: Specify the canonical `Task` fields including title, deadline date, deadline time, priority, notes, completion, project assignment, tags, and timestamps.  
    Dependency: Phase 2 complete  
    Completion signal: `Task` field contract is documented completely.

30. **Define Project entity**  
    Action: Specify the canonical `Project` fields including name, description, status, notes, start date, links, and timestamps.  
    Dependency: Phase 2 complete  
    Completion signal: `Project` field contract is documented completely.

31. **Define ScheduleSlot entity**  
    Action: Specify the canonical `ScheduleSlot` fields including day, start, end, title, location, description, slot type, source, and timestamps.  
    Dependency: Phase 2 complete  
    Completion signal: `ScheduleSlot` field contract is documented completely.

32. **Define ScheduleSlotCancellation entity**  
    Action: Specify the canonical cancellation fields including slot id and date.  
    Dependency: Task 31  
    Completion signal: Cancellation field contract is documented.

33. **Define TaskPriority union**  
    Action: Lock `high | medium | low` as the only supported task priorities.  
    Dependency: Task 29  
    Completion signal: Priority values are documented with no ambiguity.

34. **Define ProjectStatus union**  
    Action: Lock `active | paused | completed | abandoned` as project statuses.  
    Dependency: Task 30  
    Completion signal: Status values are documented with no ambiguity.

35. **Define SlotType union**  
    Action: Lock `lecture | work | meeting | break | free` as schedule slot types.  
    Dependency: Task 31  
    Completion signal: Slot types are documented with no ambiguity.

36. **Define ScheduleSource union**  
    Action: Lock `college | work | personal` as schedule slot sources.  
    Dependency: Task 31  
    Completion signal: Schedule sources are documented with no ambiguity.

37. **Define tags storage shape**  
    Action: Specify that task tags are stored as JSON text arrays and hydrated to `string[]`.  
    Dependency: Task 29  
    Completion signal: Tag persistence format is documented.

38. **Define project links storage shape**  
    Action: Specify that project reference links are stored as JSON text arrays and hydrated to `string[]`.  
    Dependency: Task 30  
    Completion signal: Link persistence format is documented.

39. **Define foreign key rule for tasks to projects**  
    Action: Specify nullable `project_id` with cascade delete semantics.  
    Dependency: Tasks 29, 30  
    Completion signal: Foreign key behavior is documented.

40. **Define schedule cancellation uniqueness rule**  
    Action: Require one cancellation row per slot and date pair.  
    Dependency: Task 32  
    Completion signal: Cancellation uniqueness behavior is documented.

41. **Define task table schema**  
    Action: Document the full `tasks` table columns and nullability.  
    Dependency: Tasks 29, 33, 37, 39  
    Completion signal: `tasks` schema definition exists in the plan.

42. **Define projects table schema**  
    Action: Document the full `projects` table columns and nullability.  
    Dependency: Tasks 30, 34, 38  
    Completion signal: `projects` schema definition exists in the plan.

43. **Define schedule_slots table schema**  
    Action: Document the full `schedule_slots` table columns and nullability.  
    Dependency: Tasks 31, 35, 36  
    Completion signal: `schedule_slots` schema definition exists in the plan.

44. **Define schedule_slot_cancellations table schema**  
    Action: Document the full cancellation table columns and nullability.  
    Dependency: Tasks 32, 40  
    Completion signal: `schedule_slot_cancellations` schema definition exists in the plan.

45. **Define schema bootstrap policy**  
    Action: Specify that `initializeDatabase` must create only the target canonical tables after cutover.  
    Dependency: Tasks 41 to 44  
    Completion signal: Schema bootstrap policy is documented.

46. **Define task indexes**  
    Action: Specify indexes supporting deadline queries, section queries, and project queries.  
    Dependency: Task 41  
    Completion signal: Task indexes are documented.

47. **Define project indexes**  
    Action: Specify indexes supporting status grouping and summary reads.  
    Dependency: Task 42  
    Completion signal: Project indexes are documented.

48. **Define schedule indexes**  
    Action: Specify indexes supporting day-of-week lookup and overlap checks.  
    Dependency: Tasks 43, 44  
    Completion signal: Schedule indexes are documented.

49. **Define timestamp ownership rule**  
    Action: Require `created_at` and `updated_at` on all mutable primary entities.  
    Dependency: Tasks 41 to 43  
    Completion signal: Timestamp ownership rule is documented.

50. **Define legacy replacement map**  
    Action: Map each legacy table and type to its canonical replacement.  
    Dependency: Tasks 29 to 49  
    Completion signal: Legacy-to-target mapping table exists in the plan.

**Exit criteria**

- canonical entities are fully defined
- target schema is fully defined
- indexes and foreign keys are documented
- no remaining ambiguity exists in field sets or legal enum values

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until canonical entities, table schemas, and indexes are all documented and internally consistent.
- Required verification artifacts:
  - entity definitions
  - table definitions
  - foreign key rules
  - index list
- Known unresolved risks allowed to carry forward:
  - exact schema versioning mechanism can remain minimal
  - whether helper DTOs live in one file or multiple files remains open
- Recommended handoff note contents:
  - final canonical fields
  - JSON-backed columns
  - cascade delete rule
  - schedule cancellation uniqueness rule

**Risks / watch items**

- field drift may occur if UI forms are designed before type contracts are stabilized
- tags and links JSON storage may be implemented inconsistently without centralized mapping rules

**Next phase unlock**

Begin Phase 4 only when DB modules can be implemented directly from the documented schema without inventing fields or query intent.

---

### Phase 4: DB Layer Replacement

**Objective**

Build the replacement persistence layer around the new schema and retire the legacy storage assumptions from active development.

**Why this phase exists**

All higher layers depend on stable CRUD and query methods that reflect the canonical model.

**Inputs / prerequisites**

- Phase 3 completed
- canonical schema and types

**Deliverables**

- `lib/db/tasks.ts`
- `lib/db/projects.ts`
- `lib/db/scheduleSlots.ts`
- optional `lib/db/scheduleCancellations.ts`
- updated database bootstrap

**Detailed task list**

51. **Create task row mapper**  
    Action: Define one row-to-`Task` mapping function that normalizes nulls and JSON tags.  
    Dependency: Phase 3 complete  
    Completion signal: A single canonical task row mapper exists in the implementation.

52. **Create project row mapper**  
    Action: Define one row-to-`Project` mapping function that normalizes nulls and JSON links.  
    Dependency: Phase 3 complete  
    Completion signal: A single canonical project row mapper exists.

53. **Create schedule slot row mapper**  
    Action: Define one row-to-`ScheduleSlot` mapping function for schedule rows.  
    Dependency: Phase 3 complete  
    Completion signal: A canonical schedule slot row mapper exists.

54. **Create cancellation row mapper**  
    Action: Define a mapper for `ScheduleSlotCancellation` rows.  
    Dependency: Phase 3 complete  
    Completion signal: A cancellation row mapper exists.

55. **Replace bootstrap schema creation**  
    Action: Rewrite database initialization to create target tables instead of `action_items` and `lecture_slots`.  
    Dependency: Tasks 41 to 45  
    Completion signal: Bootstrap SQL references only canonical target tables.

56. **Create task insert API**  
    Action: Add DB support for creating a task with nullable deadline fields, project id, and tags.  
    Dependency: Tasks 51, 55  
    Completion signal: Task insert method exists and returns a canonical `Task`.

57. **Create task update API**  
    Action: Add DB support for updating mutable task fields including project assignment and tags.  
    Dependency: Tasks 51, 56  
    Completion signal: Task update method exists and updates `updated_at`.

58. **Create task delete API**  
    Action: Add DB support for deleting a task by id.  
    Dependency: Task 56  
    Completion signal: Task delete method exists.

59. **Create task lookup API**  
    Action: Add DB support for reading a task by id.  
    Dependency: Task 56  
    Completion signal: Task lookup method exists and returns `null` correctly.

60. **Create task completion toggle API**  
    Action: Add DB support for flipping `completed_at` on a task.  
    Dependency: Tasks 56, 59  
    Completion signal: Completion toggle method exists and returns the new completion state.

61. **Create tasks-for-today query**  
    Action: Add DB support for incomplete tasks due today.  
    Dependency: Task 56  
    Completion signal: Today query exists and sorts deterministically.

62. **Create upcoming-tasks query**  
    Action: Add DB support for future-dated incomplete tasks.  
    Dependency: Task 56  
    Completion signal: Upcoming query exists and sorts deterministically.

63. **Create unscheduled-tasks query**  
    Action: Add DB support for incomplete tasks without any deadline date.  
    Dependency: Task 56  
    Completion signal: Unscheduled query exists.

64. **Create overdue-tasks query**  
    Action: Add DB support for incomplete tasks whose effective deadline is in the past.  
    Dependency: Task 56  
    Completion signal: Overdue query exists.

65. **Create completed-tasks query**  
    Action: Add DB support for completed tasks ordered by completion time.  
    Dependency: Task 56  
    Completion signal: Completed query exists.

66. **Create all-pending-tasks query**  
    Action: Add DB support for a consolidated incomplete-task query for dashboard ranking.  
    Dependency: Task 56  
    Completion signal: Pending query exists and supports downstream ranking.

67. **Create project insert API**  
    Action: Add DB support for creating a project with status and links.  
    Dependency: Tasks 52, 55  
    Completion signal: Project insert method exists.

68. **Create project update API**  
    Action: Add DB support for updating mutable project fields and `updated_at`.  
    Dependency: Tasks 52, 67  
    Completion signal: Project update method exists.

69. **Create project delete API**  
    Action: Add DB support for deleting a project by id with cascade-compatible assumptions.  
    Dependency: Tasks 52, 67  
    Completion signal: Project delete method exists.

70. **Create project lookup API**  
    Action: Add DB support for reading a project by id.  
    Dependency: Task 67  
    Completion signal: Project lookup method exists.

71. **Create projects-by-status query**  
    Action: Add DB support for grouped project list reads by status.  
    Dependency: Task 67  
    Completion signal: Projects-by-status query exists.

72. **Create project-task query**  
    Action: Add DB support for reading tasks attached to a project.  
    Dependency: Tasks 56, 67  
    Completion signal: Tasks-by-project query exists.

73. **Create project summary count query**  
    Action: Add DB support for counts by project status and related task totals where needed.  
    Dependency: Tasks 67, 72  
    Completion signal: Project summary query exists.

74. **Create schedule slot insert API**  
    Action: Add DB support for inserting a weekly schedule slot with slot type and source.  
    Dependency: Tasks 53, 55  
    Completion signal: Schedule slot insert method exists.

75. **Create schedule slot update API**  
    Action: Add DB support for updating a slot and `updated_at`.  
    Dependency: Tasks 53, 74  
    Completion signal: Schedule slot update method exists.

76. **Create schedule slot delete API**  
    Action: Add DB support for deleting a slot by id.  
    Dependency: Task 74  
    Completion signal: Schedule slot delete method exists.

77. **Create schedule slot lookup API**  
    Action: Add DB support for reading a slot by id.  
    Dependency: Task 74  
    Completion signal: Schedule slot lookup method exists.

78. **Create day-of-week slot query**  
    Action: Add DB support for reading slots for a day ordered by start time.  
    Dependency: Task 74  
    Completion signal: Day slot query exists.

79. **Create all-slots query**  
    Action: Add DB support for reading all schedule slots for weekly overview rendering.  
    Dependency: Task 74  
    Completion signal: All-slots query exists.

80. **Create overlap-check query**  
    Action: Add DB support for detecting conflicting slots during create and update operations.  
    Dependency: Tasks 74, 78  
    Completion signal: Overlap check method exists.

81. **Create cancellation insert API**  
    Action: Add DB support for marking a slot cancelled for a specific date.  
    Dependency: Tasks 54, 55, 77  
    Completion signal: Cancellation insert method exists.

82. **Create cancellation delete API**  
    Action: Add DB support for removing a cancellation for a specific date.  
    Dependency: Task 81  
    Completion signal: Cancellation delete method exists.

83. **Create cancellations-by-date query**  
    Action: Add DB support for reading applicable slot cancellations for a date.  
    Dependency: Task 81  
    Completion signal: Date cancellation query exists.

84. **Create cancellation-exists query**  
    Action: Add DB support for duplicate-cancellation prevention.  
    Dependency: Task 81  
    Completion signal: Cancellation existence query exists.

85. **Remove legacy DB modules from canonical plan**  
    Action: Mark `actionItems.ts` and `lectureSlots.ts` as legacy-only once replacement DB modules are live.  
    Dependency: Tasks 56 to 84  
    Completion signal: New work no longer routes through legacy DB modules.

**Exit criteria**

- canonical DB modules exist for tasks, projects, schedule slots, and cancellations
- bootstrap SQL creates the new schema
- core CRUD and query methods exist
- overlap and cancellation query support exist

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until DB methods cover all canonical entities and legacy DB modules are no longer the planned source for new work.
- Required verification artifacts:
  - canonical DB API inventory
  - schema bootstrap verification note
  - query coverage note
- Known unresolved risks allowed to carry forward:
  - transaction grouping for some multi-write workflows may still be refined in domain code
  - exact SQL decomposition across schedule modules may remain flexible
- Recommended handoff note contents:
  - created DB modules
  - legacy DB modules now considered transitional
  - missing DB work, if any
  - known query edge cases

**Risks / watch items**

- duplicate row-mapping logic may appear if helper functions are not centralized
- overdue query semantics may diverge if deadline interpretation is not kept consistent

**Next phase unlock**

Begin Phase 5 only when domain workflows can be written without inventing new storage methods.

---

### Phase 5: Domain Layer Expansion

**Objective**

Create canonical workflow orchestration for tasks, projects, and schedule behavior.

**Why this phase exists**

The app must keep DB code, business rules, and side effects separated cleanly.

**Inputs / prerequisites**

- Phase 4 completed
- canonical DB modules

**Deliverables**

- `lib/domain/tasks.ts` rewritten around `Task`
- `lib/domain/projects.ts`
- `lib/domain/schedule.ts`
- ranking and sectioning rules

**Detailed task list**

86. **Rewrite task creation normalization**  
    Action: Update task domain creation to support no deadline, date-only, and date-time task flows.  
    Dependency: Phase 4 complete  
    Completion signal: Task creation accepts the canonical input combinations.

87. **Add task validation**  
    Action: Validate required title, legal priority, legal tag shape, and coherent deadline input.  
    Dependency: Task 86  
    Completion signal: Task validation rules exist in the task domain layer.

88. **Add task update orchestration**  
    Action: Coordinate DB updates and notification rescheduling when task fields change.  
    Dependency: Tasks 57, 86  
    Completion signal: Task update workflow exists and owns notification side effects.

89. **Add task delete orchestration**  
    Action: Cancel related notifications before deleting a task.  
    Dependency: Tasks 58, 59  
    Completion signal: Task delete workflow exists and clears notification side effects.

90. **Add task completion orchestration**  
    Action: Cancel notifications on completion and restore them on reopen when applicable.  
    Dependency: Tasks 60, 66  
    Completion signal: Completion workflow exists in the task domain layer.

91. **Add task section builder**  
    Action: Build Today, Upcoming, Unscheduled, Overdue, and Completed task sections from canonical queries.  
    Dependency: Tasks 61 to 66  
    Completion signal: A task-sections domain helper exists.

92. **Add pending-task sorting helper**  
    Action: Sort all pending tasks by deadline ascending, priority descending, and creation ascending.  
    Dependency: Task 66  
    Completion signal: A deterministic pending-task ordering helper exists.

93. **Add suggested-task ranking helper**  
    Action: Rank top three suggested tasks using due today, due tomorrow, nearest deadline, then no deadline.  
    Dependency: Tasks 61 to 66  
    Completion signal: A suggestion-ranking helper exists with documented ordering rules.

94. **Add project creation orchestration**  
    Action: Validate and create projects through a dedicated domain entry point.  
    Dependency: Tasks 67, 68  
    Completion signal: Project creation workflow exists.

95. **Add project update orchestration**  
    Action: Validate and update project fields through a dedicated domain entry point.  
    Dependency: Task 68  
    Completion signal: Project update workflow exists.

96. **Add project delete orchestration**  
    Action: Cancel notifications for linked tasks, then delete the project.  
    Dependency: Tasks 69, 72, 89  
    Completion signal: Project delete workflow exists and handles linked task side effects.

97. **Add project grouping helper**  
    Action: Group projects by status for UI consumption.  
    Dependency: Tasks 71, 73  
    Completion signal: A project-grouping domain helper exists.

98. **Add schedule slot validation**  
    Action: Validate required title, legal type, legal source, and start/end ordering.  
    Dependency: Tasks 74 to 77  
    Completion signal: Schedule slot validation exists in domain code.

99. **Add schedule overlap guard**  
    Action: Reject slot create and update operations when overlap queries indicate a conflict.  
    Dependency: Task 80  
    Completion signal: Domain create/update workflows reject overlapping inputs.

100. **Add schedule slot create orchestration**  
     Action: Create slots through a dedicated schedule domain entry point.  
     Dependency: Tasks 74, 98, 99  
     Completion signal: Schedule create workflow exists.

101. **Add schedule slot update orchestration**  
     Action: Update slots through a dedicated schedule domain entry point.  
     Dependency: Tasks 75, 98, 99  
     Completion signal: Schedule update workflow exists.

102. **Add schedule slot delete orchestration**  
     Action: Delete slots through a dedicated schedule domain entry point.  
     Dependency: Task 76  
     Completion signal: Schedule delete workflow exists.

103. **Add schedule cancellation orchestration**  
     Action: Validate date-specific cancellation and write cancellation rows through the schedule domain.  
     Dependency: Tasks 81 to 84  
     Completion signal: Schedule cancellation workflow exists.

104. **Add schedule uncancel orchestration**  
     Action: Remove date-specific cancellations through the schedule domain.  
     Dependency: Task 82  
     Completion signal: Schedule uncancel workflow exists.

105. **Add day-agenda loader orchestration**  
     Action: Assemble weekly slots and date cancellations into effective day agenda inputs.  
     Dependency: Tasks 78, 83  
     Completion signal: A day-agenda domain method exists.

106. **Add launch reconciliation entry points**  
     Action: Define startup reconciliation responsibilities for task notifications under the new task model.  
     Dependency: Tasks 66, 90  
     Completion signal: Task reconciliation workflow exists and is callable from app bootstrap.

**Exit criteria**

- task, project, and schedule workflows exist
- sectioning and ranking rules are explicit
- overlap validation is owned by domain code
- task and project deletions own notification side effects

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until all canonical workflows are reachable through domain modules rather than direct screen-to-DB coupling.
- Required verification artifacts:
  - domain API inventory
  - section/ranking behavior note
  - overlap-validation note
- Known unresolved risks allowed to carry forward:
  - exact return-shape tuning for UI view models may still evolve
  - some workflows may still use interim result types
- Recommended handoff note contents:
  - new domain entry points
  - ranking rules
  - schedule validation rules
  - any remaining workflow gaps

**Risks / watch items**

- screens may try to rebuild sorting logic locally if domain outputs are not shaped well
- cascade delete side effects can be missed if project deletion bypasses task-domain notification cleanup

**Next phase unlock**

Begin Phase 6 only when the schedule engine can be redesigned against stable schedule-domain inputs.

---

### Phase 6: Unified Schedule Engine

**Objective**

Replace lecture-specific timetable calculations with a schedule-agnostic time-awareness engine.

**Why this phase exists**

The target dashboard and schedule views depend on deterministic calculations for current slot, next slot, and free time.

**Inputs / prerequisites**

- Phase 5 completed
- canonical schedule entities
- day-agenda assembly workflow

**Deliverables**

- schedule-agnostic pure engine
- derived view-model helpers
- free-time calculation helpers

**Detailed task list**

107. **Create schedule engine module**  
     Action: Introduce a neutral pure module for canonical schedule calculations.  
     Dependency: Phase 5 complete  
     Completion signal: A non-lecture-specific schedule engine module exists.

108. **Create time-to-minutes helper**  
     Action: Add a reusable pure helper for converting `HH:MM` to minute counts.  
     Dependency: Task 107  
     Completion signal: Time normalization helper exists in the schedule engine.

109. **Create duration-label helper**  
     Action: Add a pure helper for formatting free-time durations for UI display.  
     Dependency: Task 107  
     Completion signal: Duration label helper exists.

110. **Create day-agenda sort helper**  
     Action: Add a pure helper for sorting effective day-agenda slots.  
     Dependency: Tasks 107, 108  
     Completion signal: Agenda sorting helper exists.

111. **Create current-slot helper**  
     Action: Add a pure helper that finds the slot active at the current time.  
     Dependency: Tasks 107, 110  
     Completion signal: Current-slot helper exists.

112. **Create next-slot helper**  
     Action: Add a pure helper that finds the next future slot in the day agenda.  
     Dependency: Tasks 107, 110  
     Completion signal: Next-slot helper exists.

113. **Create free-time-block helper**  
     Action: Add a pure helper that derives gaps between effective slots.  
     Dependency: Tasks 107, 110  
     Completion signal: Free-time block helper exists.

114. **Create agenda-state partition helper**  
     Action: Add a helper that partitions a day agenda into current, next, and remaining segments.  
     Dependency: Tasks 111, 112  
     Completion signal: Agenda partition helper exists.

115. **Create free-day detection helper**  
     Action: Add a helper that identifies and labels days with zero effective slots.  
     Dependency: Tasks 110, 113  
     Completion signal: Free-day detection helper exists.

116. **Create source-priority helper**  
     Action: Add a helper that exposes `work > college > personal` for interface surfacing.  
     Dependency: Task 107  
     Completion signal: Source-priority helper exists in shared schedule logic.

117. **Create slot-state helper**  
     Action: Add a helper that labels a slot as past, current, or upcoming relative to a selected date and time.  
     Dependency: Tasks 108, 111, 112  
     Completion signal: Slot-state helper exists.

118. **Create display-format helpers**  
     Action: Add pure helpers for time labels, slot labels, and source labels.  
     Dependency: Task 107  
     Completion signal: Display format helpers exist in the schedule layer.

119. **Exclude cancelled slots from effective agenda**  
     Action: Ensure agenda calculations operate only on slots not cancelled for the selected date.  
     Dependency: Tasks 105, 110  
     Completion signal: Engine inputs and behavior exclude cancelled slots.

120. **Define edge-case behavior for adjacent slots**  
     Action: Specify handling when one slot ends exactly when the next begins.  
     Dependency: Tasks 111 to 113  
     Completion signal: Adjacent-slot behavior is documented and implemented.

121. **Define edge-case behavior for first-slot cancellation**  
     Action: Specify how current, next, and free-time calculations behave when the day’s first slot is cancelled.  
     Dependency: Tasks 112, 113, 119  
     Completion signal: First-slot cancellation behavior is documented and implemented.

122. **Define edge-case behavior for all-day-free outcomes**  
     Action: Specify how engine outputs behave when every slot is cancelled or the day has none.  
     Dependency: Tasks 115, 119  
     Completion signal: All-day-free behavior is documented and implemented.

**Exit criteria**

- lecture-specific schedule calculation assumptions are gone from the active engine
- current, next, and free-time helpers exist
- cancelled-slot-aware agenda logic exists
- edge cases are explicitly documented

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until dashboard and schedule screens can consume engine outputs without adding local schedule logic.
- Required verification artifacts:
  - schedule-engine API list
  - edge-case behavior note
  - cancellation-aware agenda note
- Known unresolved risks allowed to carry forward:
  - exact view-model shapes for UI components may still be simplified later
- Recommended handoff note contents:
  - engine helpers created
  - known edge-case outputs
  - source-priority interpretation

**Risks / watch items**

- schedule logic may leak back into screens if engine outputs are too primitive
- manual `free` slots and derived free gaps may be confused if labeling is unclear

**Next phase unlock**

Begin Phase 7 only when notifications can be designed against stable task and schedule domain outputs.

---

### Phase 7: Notification Redesign

**Objective**

Redesign notifications to support task awareness and day schedule awareness within platform limits.

**Why this phase exists**

The target app requires richer notification behavior than the current task-reminder-only model.

**Inputs / prerequisites**

- Phase 5 completed
- Phase 6 completed
- startup bootstrap ownership still in `app/_layout.tsx`

**Deliverables**

- redesigned notification API surface
- task-summary notification behavior
- schedule-summary notification behavior
- platform fallback rules

**Detailed task list**

123. **Define notification capability matrix**  
     Action: Document Android, iOS, and web support expectations for task and schedule notifications.  
     Dependency: Phase 6 complete  
     Completion signal: A capability matrix exists in this plan or linked implementation notes.

124. **Preserve lazy import pattern**  
     Action: Keep dynamic notification imports as a non-negotiable architecture rule.  
     Dependency: none  
     Completion signal: Notification redesign notes explicitly preserve lazy import behavior.

125. **Define task-summary content rules**  
     Action: Specify that task notification content shows overdue tasks first, then top pending tasks.  
     Dependency: Task 93  
     Completion signal: Task-summary ranking rules are documented.

126. **Define schedule-summary content rules**  
     Action: Specify that schedule notification content shows the day agenda and highlights the current slot when one exists.  
     Dependency: Tasks 111, 112, 118  
     Completion signal: Schedule-summary content rules are documented.

127. **Define task-summary trigger moments**  
     Action: List task create, update, complete, reopen, and delete as refresh points for task notifications.  
     Dependency: Tasks 88 to 90  
     Completion signal: Task notification refresh triggers are documented.

128. **Define schedule-summary trigger moments**  
     Action: List slot create, update, delete, and cancellation changes as refresh points for schedule notifications.  
     Dependency: Tasks 100 to 104  
     Completion signal: Schedule notification refresh triggers are documented.

129. **Define deep-link destinations**  
     Action: Specify that task notifications open `Tasks` and schedule notifications open `Schedule`.  
     Dependency: Phase 2 complete  
     Completion signal: Notification deep-link routes are documented.

130. **Implement canonical task notification API**  
     Action: Refactor notification helpers to consume `Task` instead of `ActionItem`.  
     Dependency: Tasks 56 to 66, 124  
     Completion signal: Notification APIs no longer depend on legacy task types.

131. **Implement task notification reconciliation**  
     Action: Update startup reconciliation to use canonical tasks and new query helpers.  
     Dependency: Tasks 106, 130  
     Completion signal: Launch reconciliation works against the new task model.

132. **Implement task-summary scheduler**  
     Action: Add notification support for pending-task summary generation and refresh.  
     Dependency: Tasks 125, 127, 130  
     Completion signal: Task-summary scheduling behavior exists.

133. **Implement schedule-summary generator**  
     Action: Add notification support for generating day schedule summary content from the unified engine.  
     Dependency: Tasks 126, 128  
     Completion signal: Schedule-summary content generation exists.

134. **Implement Android-first schedule behavior**  
     Action: Build schedule notification behavior with Android as the primary advanced-support target.  
     Dependency: Tasks 123, 133  
     Completion signal: Android-specific schedule-notification path exists or is explicitly feature-gated.

135. **Implement iOS fallback behavior**  
     Action: Define and build a non-persistent fallback schedule-notification path for iOS.  
     Dependency: Tasks 123, 133  
     Completion signal: iOS schedule fallback is implemented and documented.

136. **Implement web no-crash behavior**  
     Action: Ensure web safely skips unsupported notification operations.  
     Dependency: Task 123  
     Completion signal: Notification operations degrade safely on web.

137. **Implement schedule-removal behavior after final slot**  
     Action: Remove or suppress the day schedule notification after the day’s final active slot concludes.  
     Dependency: Tasks 112, 133  
     Completion signal: Final-slot removal behavior exists.

138. **Implement permission-denied fallback**  
     Action: Keep the app functional when notification permissions are denied or revoked.  
     Dependency: Tasks 130 to 137  
     Completion signal: Notification calls fail safely with no flow-blocking crashes.

139. **Document native-escalation contingency**  
     Action: Record that a config-plugin or native path may be required if Expo-managed APIs cannot provide Android ongoing-notification behavior.  
     Dependency: Task 134  
     Completion signal: Contingency path is documented explicitly.

140. **Update bootstrap notification ownership**  
     Action: Ensure app startup still initializes notifications once and reconciles canonical notification state.  
     Dependency: Tasks 131 to 138  
     Completion signal: Bootstrap responsibilities are documented and implemented for the new notification layer.

**Exit criteria**

- canonical task notifications work against the new task model
- schedule-summary behavior is designed and implemented within platform constraints
- Android/iOS/web behavior differences are explicit
- startup notification initialization remains stable

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until notification behavior is platform-safe and no active notification helper depends on legacy types.
- Required verification artifacts:
  - platform capability note
  - task notification verification note
  - schedule notification verification note
- Known unresolved risks allowed to carry forward:
  - Android ongoing-notification behavior may still need native escalation later
- Recommended handoff note contents:
  - supported notification behaviors per platform
  - deep-link expectations
  - unresolved Android persistence limits

**Risks / watch items**

- product wording may overpromise persistent behavior on iOS
- task-summary and schedule-summary responsibilities may overlap confusingly without clear copy

**Next phase unlock**

Begin Phase 8 only when navigation can be refactored around stable canonical subsystems.

---

### Phase 8: Navigation and Route Refactor

**Objective**

Replace the current tab and stack structure with the target app shell.

**Why this phase exists**

The new feature set needs new primary navigation before screen rebuilds can be finalized.

**Inputs / prerequisites**

- Phases 2 through 7 completed

**Deliverables**

- new tab shell
- new stack routes
- deep-link-aware navigation updates

**Detailed task list**

141. **Replace tab labels**  
     Action: Refactor the tab shell so the active tabs become `Now`, `Tasks`, `Projects`, and `Schedule`.  
     Dependency: Phase 7 complete  
     Completion signal: The tab bar shows the target tab set.

142. **Retire Upcoming tab as primary route**  
     Action: Remove `Upcoming` from the canonical tab shell and replace it with `Tasks`.  
     Dependency: Task 141  
     Completion signal: `Upcoming` is no longer a canonical primary tab.

143. **Retire Inbox tab as primary route**  
     Action: Remove `Inbox` from the canonical tab shell and replace it with `Projects`.  
     Dependency: Task 141  
     Completion signal: `Inbox` is no longer a canonical primary tab.

144. **Retire Timetable tab as primary route**  
     Action: Remove `Timetable` from the canonical tab shell and replace it with `Schedule`.  
     Dependency: Task 141  
     Completion signal: `Timetable` is no longer a canonical primary tab.

145. **Add project create route**  
     Action: Introduce a stack route for project creation.  
     Dependency: Tasks 16, 141  
     Completion signal: A project-create route exists.

146. **Add project detail route**  
     Action: Introduce a stack route for project detail and edit actions.  
     Dependency: Task 145  
     Completion signal: A project-detail route exists.

147. **Add schedule slot create route**  
     Action: Introduce a route for creating new schedule slots.  
     Dependency: Tasks 17, 141  
     Completion signal: A schedule-slot-create route exists.

148. **Add schedule slot detail or edit route**  
     Action: Introduce a route for editing and deleting existing schedule slots.  
     Dependency: Task 147  
     Completion signal: A schedule-slot-detail or edit route exists.

149. **Add schedule cancellation route if separate UI is needed**  
     Action: Introduce a cancellation-management route if the action is not embedded inside the slot-detail flow.  
     Dependency: Task 148  
     Completion signal: Cancellation management has a resolved route owner.

150. **Retain task create route semantics**  
     Action: Keep task create navigation but update all internal semantics from action item to task.  
     Dependency: Task 141  
     Completion signal: Task-create routing survives the shell refactor.

151. **Retain task detail route semantics**  
     Action: Keep task detail navigation but update all internal semantics from action item to task.  
     Dependency: Task 150  
     Completion signal: Task-detail routing survives the shell refactor.

152. **Update tab icons and labels**  
     Action: Align the tab bar iconography and labels with target terminology.  
     Dependency: Task 141  
     Completion signal: No primary tab uses legacy lecture or inbox naming.

153. **Update header titles**  
     Action: Align stack and tab headers with the target information architecture.  
     Dependency: Tasks 141 to 152  
     Completion signal: Active screens display target naming in headers.

154. **Update notification deep-link handling**  
     Action: Point task and schedule notifications to the correct target tabs or detail flows.  
     Dependency: Tasks 129, 141 to 151  
     Completion signal: Notification link resolution matches the target route shell.

155. **Mark legacy routes for retirement**  
     Action: Track old route files that remain temporary after the shell refactor.  
     Dependency: Tasks 142 to 149  
     Completion signal: A retirement list exists for temporary routes.

**Exit criteria**

- the target tab shell exists
- new project and schedule stack routes exist
- notification deep links target the new shell
- old tab semantics are no longer canonical

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until the target shell is navigable and route ownership is stable.
- Required verification artifacts:
  - new route inventory
  - old-route retirement list
  - deep-link verification note
- Known unresolved risks allowed to carry forward:
  - some screens may still temporarily render legacy content until rebuilt
- Recommended handoff note contents:
  - current active shell
  - added routes
  - temporary legacy routes still present

**Risks / watch items**

- route files may be renamed before content parity exists
- notification deep links can silently rot if route names keep changing

**Next phase unlock**

Begin Phase 9 only when the `Now` screen can be rebuilt into the central dashboard on the new shell.

---

### Phase 9: Now Dashboard Rebuild

**Objective**

Transform `Now` into the central situational-awareness dashboard.

**Why this phase exists**

The target product is defined primarily by what the dashboard answers in real time.

**Inputs / prerequisites**

- Phases 5, 6, 7, and 8 completed

**Deliverables**

- rebuilt `Now` dashboard
- current/next slot presentation
- free-time awareness
- suggestion and pending-task sections

**Detailed task list**

156. **Replace lecture context cards**  
     Action: Replace current and next lecture cards with current and next schedule-slot cards.  
     Dependency: Phase 8 complete  
     Completion signal: `Now` no longer renders lecture-specific context as canonical behavior.

157. **Add current-slot panel**  
     Action: Render the effective current slot when one exists.  
     Dependency: Tasks 111, 156  
     Completion signal: `Now` shows a current-slot panel.

158. **Add next-slot panel**  
     Action: Render the next upcoming slot when one exists.  
     Dependency: Tasks 112, 156  
     Completion signal: `Now` shows a next-slot panel.

159. **Add free-time panel**  
     Action: Render free-time duration and free-day messaging using engine outputs.  
     Dependency: Tasks 113, 115  
     Completion signal: `Now` shows free-time awareness.

160. **Add Suggested Tasks section**  
     Action: Render the top three suggested tasks using the domain ranking helper.  
     Dependency: Task 93  
     Completion signal: `Now` displays a `Suggested Tasks` section.

161. **Add All Pending Tasks section**  
     Action: Render all pending tasks sorted by the canonical pending-task ordering rule.  
     Dependency: Task 92  
     Completion signal: `Now` displays an `All Pending Tasks` section.

162. **Add quick task creation action**  
     Action: Ensure the dashboard contains a direct task-create entry point.  
     Dependency: Task 150  
     Completion signal: Users can launch task create directly from `Now`.

163. **Add schedule navigation shortcut**  
     Action: Ensure the dashboard can jump directly to the `Schedule` tab or related day view.  
     Dependency: Task 141  
     Completion signal: Users can navigate from `Now` to `Schedule` directly.

164. **Add empty-state handling for no current slot**  
     Action: Render graceful dashboard messaging when no slot is active.  
     Dependency: Task 157  
     Completion signal: The dashboard has an explicit no-current-slot state.

165. **Add empty-state handling for no upcoming slot**  
     Action: Render graceful dashboard messaging when no slot remains today.  
     Dependency: Task 158  
     Completion signal: The dashboard has an explicit no-upcoming-slot state.

166. **Add empty-state handling for no pending tasks**  
     Action: Render graceful dashboard messaging when there are no pending tasks.  
     Dependency: Tasks 160, 161  
     Completion signal: The dashboard has an explicit no-pending-tasks state.

167. **Refresh dashboard every minute**  
     Action: Ensure the dashboard refreshes time-aware state while focused.  
     Dependency: Tasks 157 to 159  
     Completion signal: The dashboard updates current/next/free state automatically.

168. **Wire pull-to-refresh to all dashboard inputs**  
     Action: Reload tasks, schedule slots, cancellations, and derived agenda state in one refresh action.  
     Dependency: Tasks 105, 160, 161  
     Completion signal: Pull-to-refresh reloads all dashboard data coherently.

169. **Display slot metadata chips**  
     Action: Show slot type and schedule source distinctly in dashboard schedule panels.  
     Dependency: Tasks 118, 156  
     Completion signal: Dashboard slot cards show type and source labels.

170. **Remove direct legacy queries from Now screen**  
     Action: Ensure the dashboard does not query lecture DB helpers or action-item-specific helpers directly.  
     Dependency: Tasks 156 to 169  
     Completion signal: `Now` consumes canonical domain outputs rather than legacy queries.

**Exit criteria**

- `Now` answers current, next, and what-to-do-next questions
- dashboard free-time awareness exists
- task suggestions and all pending tasks are both visible
- legacy lecture-first behavior is no longer canonical on `Now`

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until `Now` reflects the target dashboard model and no longer depends on lecture-first semantics.
- Required verification artifacts:
  - dashboard behavior checklist
  - refresh behavior note
  - no-legacy-query note
- Known unresolved risks allowed to carry forward:
  - visual polish can remain iterative as long as behavior is correct
- Recommended handoff note contents:
  - dashboard sections complete
  - remaining UX polish gaps
  - any edge cases still to test manually

**Risks / watch items**

- `Now` can become a duplicate of `Tasks` if suggestion and pending sections are not kept distinct
- free-time messaging can become misleading if cancelled-slot handling is missed

**Next phase unlock**

Begin Phase 10 only when `Now` is a credible central screen and task-specific workflows can be rebuilt around the canonical task model.

---

### Phase 10: Tasks Experience Rebuild

**Objective**

Rebuild task management around canonical task sections, metadata, and detail flows.

**Why this phase exists**

The target product expands tasks well beyond the current lightweight model.

**Inputs / prerequisites**

- Phases 4, 5, 7, 8, and 9 completed

**Deliverables**

- unified `Tasks` tab
- expanded task create and detail flows
- task sections and metadata support

**Detailed task list**

171. **Create unified Tasks screen**  
     Action: Replace the old split task-tab experience with one canonical `Tasks` screen.  
     Dependency: Phase 9 complete  
     Completion signal: A single `Tasks` tab owns task sections.

172. **Add Today section**  
     Action: Render tasks due today in a dedicated section.  
     Dependency: Tasks 91, 171  
     Completion signal: `Tasks` shows a Today section.

173. **Add Upcoming section**  
     Action: Render future-dated tasks in a dedicated section.  
     Dependency: Tasks 91, 171  
     Completion signal: `Tasks` shows an Upcoming section.

174. **Add Unscheduled section**  
     Action: Render tasks with no deadline date in a dedicated section.  
     Dependency: Tasks 91, 171  
     Completion signal: `Tasks` shows an Unscheduled section.

175. **Add Overdue section**  
     Action: Render past-due incomplete tasks in a dedicated section.  
     Dependency: Tasks 91, 171  
     Completion signal: `Tasks` shows an Overdue section.

176. **Add Completed section**  
     Action: Render completed tasks under a collapsed-by-default section.  
     Dependency: Tasks 91, 171  
     Completion signal: `Tasks` shows a collapsed Completed section.

177. **Update task card model**  
     Action: Replace any `ActionItem`-based task card usage with canonical `Task` props.  
     Dependency: Tasks 29, 171  
     Completion signal: Shared task cards no longer depend on legacy task types.

178. **Add priority badges to task cards**  
     Action: Display task priority visually in list cards and detail headers.  
     Dependency: Tasks 33, 177  
     Completion signal: Task UI shows priority state.

179. **Add tag chips to task UI**  
     Action: Display task tags where present in list or detail views.  
     Dependency: Tasks 37, 177  
     Completion signal: Task UI shows tag chips.

180. **Add project context to task cards**  
     Action: Display related project name when a task belongs to a project.  
     Dependency: Tasks 39, 72, 177  
     Completion signal: Task UI shows project context when applicable.

181. **Expand task create form fields**  
     Action: Add form support for title, date, time, priority, notes, optional project, and tags.  
     Dependency: Tasks 29, 86, 94  
     Completion signal: Task-create UI exposes all canonical task fields.

182. **Retain deadline intent UX**  
     Action: Preserve a clear none/date/date-time task-deadline flow in the new form.  
     Dependency: Tasks 86, 181  
     Completion signal: Task-create flow supports the three deadline modes.

183. **Add tag entry UX**  
     Action: Implement a simple chip-based or token-based tag entry control.  
     Dependency: Tasks 37, 181  
     Completion signal: Users can add and remove tags during task edit flows.

184. **Add project picker UX**  
     Action: Implement task-to-project assignment from task create and edit flows.  
     Dependency: Tasks 39, 71, 94, 181  
     Completion signal: Users can assign or unassign a project in task flows.

185. **Expand task detail screen**  
     Action: Show canonical task metadata, notes, tags, project relation, and completion controls.  
     Dependency: Tasks 151, 177 to 184  
     Completion signal: Task detail reflects the canonical task model.

186. **Add task edit capability**  
     Action: Support editing canonical task fields from task detail or a dedicated edit flow.  
     Dependency: Tasks 57, 88, 185  
     Completion signal: Tasks can be edited after creation.

187. **Update delete flow for canonical tasks**  
     Action: Ensure deletion uses canonical task-domain orchestration and updates sections correctly.  
     Dependency: Tasks 89, 185  
     Completion signal: Deleting a task removes it from all relevant task surfaces safely.

188. **Update completion flow for canonical tasks**  
     Action: Ensure list and detail completion toggles use the canonical completion workflow.  
     Dependency: Tasks 90, 185  
     Completion signal: Completing or reopening a task updates all task sections correctly.

189. **Add section empty states**  
     Action: Provide clear empty-state copy for task sections with no items.  
     Dependency: Tasks 172 to 176  
     Completion signal: Every task section has explicit empty-state behavior.

190. **Remove legacy task-tab ownership**  
     Action: Retire `Upcoming` and `Unscheduled` as canonical task surfaces once `Tasks` is verified.  
     Dependency: Tasks 171 to 189  
     Completion signal: The unified `Tasks` screen is the only canonical task list owner.

**Exit criteria**

- `Tasks` is the canonical owner of all task sections
- tasks support priority, tags, and optional project assignment
- create, edit, complete, reopen, and delete flows work against canonical domain logic

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until task flows are fully canonical and old task-tab ownership has been retired.
- Required verification artifacts:
  - section coverage checklist
  - task form-field checklist
  - create/edit/delete/complete verification note
- Known unresolved risks allowed to carry forward:
  - some visual grouping polish may remain
- Recommended handoff note contents:
  - task features complete
  - legacy task routes now transitional or retired
  - any remaining tag/project UX concerns

**Risks / watch items**

- overdue rules can become inconsistent between dashboard and tasks tab if not sourced from one domain helper
- project picker UX can become brittle if project list loading is not scoped clearly

**Next phase unlock**

Begin Phase 11 only when project-linked tasks are already supported by canonical task flows.

---

### Phase 11: Projects Experience Buildout

**Objective**

Add the full project system as a first-class user-facing capability.

**Why this phase exists**

Projects are a core target-product concept and must become the owner of longer-running work context.

**Inputs / prerequisites**

- Phases 4, 5, 8, and 10 completed

**Deliverables**

- `Projects` tab
- project create and detail flows
- cascade-aware deletion behavior

**Detailed task list**

191. **Create Projects tab screen**  
     Action: Build the canonical `Projects` tab as the primary project list surface.  
     Dependency: Phase 10 complete  
     Completion signal: A dedicated `Projects` tab screen exists.

192. **Add active-projects group**  
     Action: Render active projects in a dedicated group.  
     Dependency: Tasks 71, 97, 191  
     Completion signal: Active projects are grouped visibly.

193. **Add paused-projects group**  
     Action: Render paused projects in a dedicated group.  
     Dependency: Tasks 71, 97, 191  
     Completion signal: Paused projects are grouped visibly.

194. **Add completed-projects group**  
     Action: Render completed projects in a dedicated group.  
     Dependency: Tasks 71, 97, 191  
     Completion signal: Completed projects are grouped visibly.

195. **Add abandoned-projects group**  
     Action: Render abandoned projects in a dedicated group.  
     Dependency: Tasks 71, 97, 191  
     Completion signal: Abandoned projects are grouped visibly.

196. **Add project summary row model**  
     Action: Show name, status, start date, and related task count in project list rows.  
     Dependency: Tasks 73, 191  
     Completion signal: Project list rows expose canonical summary data.

197. **Create project create form**  
     Action: Add UI for name, description, status, notes, start date, and reference links.  
     Dependency: Tasks 145, 94  
     Completion signal: Project-create UI supports all canonical project fields.

198. **Create project detail screen**  
     Action: Render project metadata and related tasks in the project detail flow.  
     Dependency: Tasks 146, 70, 72, 197  
     Completion signal: Project detail exists and loads canonical data.

199. **Add project edit capability**  
     Action: Support editing project metadata from project detail or a dedicated edit flow.  
     Dependency: Tasks 68, 95, 198  
     Completion signal: Projects can be edited after creation.

200. **Add related-task list to project detail**  
     Action: Show tasks linked to the current project using canonical queries.  
     Dependency: Tasks 72, 198  
     Completion signal: Project detail lists linked tasks.

201. **Add project deletion confirmation**  
     Action: Warn explicitly that deleting a project also deletes linked tasks.  
     Dependency: Tasks 96, 198  
     Completion signal: Project deletion warns about cascading task removal.

202. **Implement cascade-safe project deletion UI flow**  
     Action: Trigger canonical project delete orchestration from the project detail screen.  
     Dependency: Tasks 96, 201  
     Completion signal: Project delete UI uses the canonical cascade-aware workflow.

203. **Add project empty states**  
     Action: Provide empty-state messaging for no projects and no active projects.  
     Dependency: Tasks 191 to 196  
     Completion signal: Projects tab has explicit empty states.

204. **Add reference-link rendering**  
     Action: Display saved project links in a platform-safe way.  
     Dependency: Tasks 38, 198  
     Completion signal: Project detail can render stored links.

205. **Remove non-target project complexity**  
     Action: Avoid milestones, progress percentages, dependency graphs, and other non-target features.  
     Dependency: none  
     Completion signal: Project UI and docs stay within the target scope.

**Exit criteria**

- projects are first-class in navigation and storage
- project create, edit, detail, and delete flows work
- task-to-project relationships are visible and manageable
- project scope remains intentionally simple

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until project flows are stable and cascade deletion has been manually validated.
- Required verification artifacts:
  - project CRUD checklist
  - cascade deletion note
  - related-task rendering note
- Known unresolved risks allowed to carry forward:
  - reference-link interaction polish may remain platform-sensitive
- Recommended handoff note contents:
  - project routes complete
  - status groups complete
  - known link-rendering caveats

**Risks / watch items**

- project deletion can orphan task UI state if caches or screen state are not refreshed correctly
- project status grouping may become inconsistent if raw DB outputs are used directly in UI

**Next phase unlock**

Begin Phase 12 only when tasks and projects are both canonical and schedule management can be rebuilt without relying on lecture-only UI.

---

### Phase 12: Schedule Management Rebuild

**Objective**

Rebuild the schedule experience around unified schedule slots rather than lecture-specific timetable flows.

**Why this phase exists**

The target app depends on one schedule system for multiple slot types and sources.

**Inputs / prerequisites**

- Phases 4, 5, 6, 8, and 9 completed

**Deliverables**

- `Schedule` tab
- weekly schedule overview
- slot create, edit, delete, and cancellation flows
- day agenda review

**Detailed task list**

206. **Create canonical Schedule screen**  
     Action: Build the `Schedule` tab as the owner of weekly schedule review and slot management.  
     Dependency: Phase 11 complete  
     Completion signal: A canonical `Schedule` tab screen exists.

207. **Add weekly grouped schedule view**  
     Action: Render schedule slots grouped by day of week.  
     Dependency: Tasks 79, 206  
     Completion signal: Schedule screen shows a weekly grouped layout.

208. **Add day-agenda view**  
     Action: Render effective day agenda using current schedule slots minus cancellations.  
     Dependency: Tasks 105, 119, 206  
     Completion signal: Users can inspect a selected day agenda.

209. **Add current and next agenda highlights**  
     Action: Surface current and next slots inside schedule views where relevant.  
     Dependency: Tasks 111, 112, 208  
     Completion signal: Schedule views show current and next context.

210. **Add free-time visibility in schedule view**  
     Action: Surface free-time blocks or free-day messaging in schedule views.  
     Dependency: Tasks 113, 115, 208  
     Completion signal: Schedule views show derived free-time awareness.

211. **Create schedule slot create form**  
     Action: Build a form for title, start, end, type, source, location, and description.  
     Dependency: Tasks 147, 100  
     Completion signal: Schedule-slot-create UI supports canonical slot fields.

212. **Create schedule slot edit flow**  
     Action: Support updating schedule slot metadata through a slot detail or edit screen.  
     Dependency: Tasks 148, 101  
     Completion signal: Existing slots can be edited.

213. **Create schedule slot delete flow**  
     Action: Support deleting schedule slots through the canonical schedule workflow.  
     Dependency: Tasks 148, 102  
     Completion signal: Existing slots can be deleted.

214. **Create date-specific cancellation flow**  
     Action: Support marking a weekly slot cancelled for one date.  
     Dependency: Tasks 103, 149  
     Completion signal: Users can cancel a slot for one date.

215. **Create cancellation-removal flow**  
     Action: Support removing a date-specific cancellation.  
     Dependency: Tasks 104, 214  
     Completion signal: Users can uncancel a previously cancelled slot.

216. **Show cancellation indicators**  
     Action: Render cancellation state in schedule rows and detail views.  
     Dependency: Tasks 214, 215  
     Completion signal: Cancellations are visible in schedule UI.

217. **Show slot type labels**  
     Action: Render canonical slot type badges in schedule list and detail views.  
     Dependency: Tasks 35, 211  
     Completion signal: Schedule UI shows slot types.

218. **Show schedule source labels**  
     Action: Render canonical schedule source badges in schedule list and detail views.  
     Dependency: Tasks 36, 211  
     Completion signal: Schedule UI shows schedule sources.

219. **Enforce overlap validation in UI flow**  
     Action: Surface meaningful errors when slot create or edit is rejected for overlap.  
     Dependency: Tasks 99, 211, 212  
     Completion signal: Overlap errors are visible and actionable.

220. **Enforce invalid-time validation in UI flow**  
     Action: Surface meaningful errors when start and end times are invalid.  
     Dependency: Tasks 98, 211, 212  
     Completion signal: Invalid time ranges are visible and actionable.

221. **Support break slots**  
     Action: Ensure users can create and review `break` slot types as first-class entries.  
     Dependency: Tasks 35, 211  
     Completion signal: Break slots are available in schedule create/edit flows.

222. **Support free slots if manually entered**  
     Action: Ensure manually entered `free` slot types still obey standard slot validation and overlap rules.  
     Dependency: Tasks 35, 211, 219  
     Completion signal: Free slots are supported consistently when entered manually.

223. **Add empty-state handling for days without slots**  
     Action: Provide explicit empty states for empty schedule days.  
     Dependency: Tasks 207, 208  
     Completion signal: Schedule UI has clear empty-day behavior.

224. **Retire lecture-specific schedule ownership**  
     Action: Mark timetable-create and timetable-setup flows as legacy once the new schedule management flows are validated.  
     Dependency: Tasks 206 to 223  
     Completion signal: Unified schedule management is the canonical schedule owner.

**Exit criteria**

- unified schedule management exists
- create/edit/delete/cancel/uncancel slot flows work
- day agenda and free-time awareness exist in schedule views
- lecture-specific timetable ownership is retired

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until schedule management is fully canonical and lecture-specific timetable flows are no longer the active schedule owner.
- Required verification artifacts:
  - schedule CRUD checklist
  - cancellation-flow verification note
  - overlap-validation verification note
- Known unresolved risks allowed to carry forward:
  - schedule layout polish and grouping visuals may continue iterating
- Recommended handoff note contents:
  - schedule features complete
  - timetable flows now legacy
  - any remaining slot-form UX gaps

**Risks / watch items**

- cancellation state can become confusing if day-specific context is not visible enough
- manual free slots can be mistaken for derived free blocks if labels are weak

**Next phase unlock**

Begin Phase 13 only when all primary screens exist and shared components can be consolidated safely.

---

### Phase 13: Shared Component Adaptation

**Objective**

Adapt or replace shared UI components so the target app uses canonical visual primitives.

**Why this phase exists**

Shared components still reflect legacy lecture and action-item semantics.

**Inputs / prerequisites**

- Phases 9 through 12 completed

**Deliverables**

- canonical shared cards and badges
- reused design tokens
- reduced legacy component coupling

**Detailed task list**

225. **Audit shared component reuse**  
     Action: Review existing cards, selectors, and empty states for reuse versus replacement.  
     Dependency: Phase 12 complete  
     Completion signal: A component reuse decision list exists.

226. **Replace LectureCard semantics**  
     Action: Convert or replace `LectureCard` with a schedule-agnostic slot card.  
     Dependency: Tasks 156, 206, 225  
     Completion signal: No active canonical screen depends on lecture-only card semantics.

227. **Replace ActionItemCard semantics**  
     Action: Convert or replace task card components so they accept canonical `Task` props.  
     Dependency: Tasks 177, 225  
     Completion signal: No active canonical task screen depends on `ActionItem` props.

228. **Create priority badge component**  
     Action: Add a shared UI element for task priority labels if one does not already exist.  
     Dependency: Tasks 178, 225  
     Completion signal: Priority display is shared consistently.

229. **Create slot-type badge component**  
     Action: Add a shared UI element for schedule slot type labels if one does not already exist.  
     Dependency: Tasks 217, 225  
     Completion signal: Slot type display is shared consistently.

230. **Create schedule-source badge component**  
     Action: Add a shared UI element for schedule source labels if one does not already exist.  
     Dependency: Tasks 218, 225  
     Completion signal: Schedule source display is shared consistently.

231. **Create project-status badge component**  
     Action: Add a shared UI element for project status labels if one does not already exist.  
     Dependency: Tasks 196, 225  
     Completion signal: Project status display is shared consistently.

232. **Create section-header component if warranted**  
     Action: Introduce a reusable grouped-section header only if duplication is obvious across `Tasks`, `Projects`, and `Schedule`.  
     Dependency: Tasks 171, 191, 206, 225  
     Completion signal: Section headers are either shared intentionally or documented as intentionally local.

233. **Normalize empty-state component usage**  
     Action: Ensure empty-state visuals and copy patterns are consistent across new primary screens.  
     Dependency: Tasks 166, 189, 203, 223  
     Completion signal: Empty-state behavior is visually consistent.

234. **Normalize design-token usage**  
     Action: Replace ad hoc styling values introduced during migration with tokens from `lib/constants.ts` where appropriate.  
     Dependency: Tasks 225 to 233  
     Completion signal: New canonical screens primarily use shared tokens.

235. **Remove lecture-first copy from shared UI**  
     Action: Eliminate lecture-first terminology from any remaining active shared component.  
     Dependency: Tasks 226, 233  
     Completion signal: Shared components use target schedule terminology.

236. **Confirm mobile and web rendering coherence**  
     Action: Review shared-component behavior on at least one mobile target and web.  
     Dependency: Tasks 226 to 235  
     Completion signal: Shared canonical components render coherently on supported targets.

**Exit criteria**

- shared UI is aligned with canonical types and terminology
- design tokens are reused consistently
- active shared components no longer assume lecture-only or action-item-only semantics

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until canonical screens no longer depend on legacy semantic component contracts.
- Required verification artifacts:
  - component replacement note
  - token-normalization note
  - mobile/web rendering note
- Known unresolved risks allowed to carry forward:
  - visual polish improvements may still continue during cleanup
- Recommended handoff note contents:
  - components replaced
  - components retained
  - remaining visual consistency gaps

**Risks / watch items**

- unnecessary abstraction can creep in during component consolidation
- shared badge components can become too generic if they ignore canonical semantics

**Next phase unlock**

Begin Phase 14 only when all primary user-facing flows work on canonical screens.

---

### Phase 14: Legacy Cutover

**Objective**

Remove legacy architecture and make the new systems the only canonical implementation.

**Why this phase exists**

The migration is incomplete until old models, routes, and terminology stop shaping the active codebase.

**Inputs / prerequisites**

- Phases 1 through 13 completed

**Deliverables**

- retired legacy routes
- retired legacy models and modules
- canonical architecture only

**Detailed task list**

237. **Mark old tables as retired in code comments and docs**  
     Action: Remove any claim that `action_items` and `lecture_slots` remain canonical.  
     Dependency: Phase 13 complete  
     Completion signal: Canonical docs no longer present old tables as active architecture.

238. **Remove legacy type imports from active screens**  
     Action: Eliminate `ActionItem` and `LectureSlot` imports from canonical UI flows.  
     Dependency: Tasks 177, 226, 227  
     Completion signal: Active screens import only canonical types.

239. **Remove legacy DB usage from active domain code**  
     Action: Eliminate active use of `actionItems.ts` and `lectureSlots.ts` from canonical domain flows.  
     Dependency: Tasks 85, 170, 224  
     Completion signal: Canonical domain code no longer routes through legacy DB modules.

240. **Remove legacy route ownership**  
     Action: Delete or archive old task and timetable route files that are no longer canonical.  
     Dependency: Tasks 190, 224  
     Completion signal: Old route files are removed or clearly archived.

241. **Remove legacy lecture engine usage**  
     Action: Delete or archive lecture-specific schedule helpers once the unified engine is the sole active schedule logic.  
     Dependency: Tasks 107 to 122, 224  
     Completion signal: Active schedule logic is unified only.

242. **Remove legacy task-query ownership**  
     Action: Delete or archive old task query assumptions that reflected only Now/Upcoming/Unscheduled segmentation.  
     Dependency: Tasks 171 to 190  
     Completion signal: Canonical task list ownership is unified only.

243. **Remove timetable-builder canonical role**  
     Action: Retire timetable-builder modules from canonical architecture unless a clearly reusable subset remains schedule-agnostic.  
     Dependency: Task 224  
     Completion signal: Timetable builder no longer owns canonical schedule behavior.

244. **Rename lingering lecture-first identifiers**  
     Action: Eliminate lecture-first naming from active file names, symbols, comments, and copy where it remains canonical.  
     Dependency: Tasks 238 to 243  
     Completion signal: Active code no longer uses lecture-first names as canonical abstractions.

245. **Search for legacy canonical terms**  
     Action: Run a final search for `ActionItem`, `LectureSlot`, `lecture`, `timetable`, `action_items`, and `lecture_slots` to identify unwanted canonical remnants.  
     Dependency: Tasks 238 to 244  
     Completion signal: Remaining matches are either intentionally archived or removed.

246. **Resolve all active legacy references**  
     Action: Eliminate any remaining active imports, references, or copy discovered in the final search pass.  
     Dependency: Task 245  
     Completion signal: No active canonical path depends on legacy architecture.

**Exit criteria**

- the new architecture is the only canonical implementation
- legacy routes and modules are retired
- active code no longer uses lecture-first or action-item-first terminology as canonical abstractions

**Checkpoint pause**

- Pause after completion of this phase.
- Do not begin next phase until the old architecture is fully retired from active code paths.
- Required verification artifacts:
  - legacy-removal inventory
  - search-results note
  - canonical-only architecture confirmation
- Known unresolved risks allowed to carry forward:
  - archived code location can remain if intentionally preserved outside active paths
- Recommended handoff note contents:
  - removed modules
  - archived modules
  - any intentional retained legacy artifacts and why

**Risks / watch items**

- deleting legacy helpers too early can break less-obvious paths
- leaving legacy names in comments can confuse future contributors about what is still canonical

**Next phase unlock**

Begin Phase 15 only when the codebase is functionally canonical and cleanup is focused on docs and verification rather than feature completion.

---

### Phase 15: Documentation and Final Verification

**Objective**

Align documentation with the new architecture and complete final verification for the migration.

**Why this phase exists**

A large migration is not complete until the repo’s docs and validation checklist match the resulting architecture.

**Inputs / prerequisites**

- Phases 1 through 14 completed

**Deliverables**

- updated architecture docs
- updated workflow docs
- final verification record

**Detailed task list**

247. **Update architecture documentation**  
     Action: Rewrite architecture docs to describe tasks, projects, and unified schedule as canonical systems.  
     Dependency: Phase 14 complete  
     Completion signal: Architecture docs match the final architecture.

248. **Update project context documentation**  
     Action: Rewrite project context docs to reflect target tabs, entities, and responsibilities.  
     Dependency: Task 247  
     Completion signal: Project context docs match the final app shell.

249. **Update workflow documentation**  
     Action: Rewrite task and agent workflow docs where they still describe the old MVP model.  
     Dependency: Task 247  
     Completion signal: Workflow docs reflect the final architecture and phase-complete reality.

250. **Update AGENTS-facing repository guidance**  
     Action: Ensure repository instructions no longer describe the app as lecture-and-task only.  
     Dependency: Task 247  
     Completion signal: Agent guidance aligns with the final canonical architecture.

251. **Update README if used as repo entry point**  
     Action: Add a meaningful summary to `README.md` if it remains empty or outdated.  
     Dependency: Tasks 247 to 250  
     Completion signal: README reflects the current product and setup commands.

252. **Run TypeScript verification**  
     Action: Execute `npx tsc --noEmit` against the final migrated codebase.  
     Dependency: Tasks 247 to 251  
     Completion signal: TypeScript verification completes without new errors.

253. **Run startup verification on fresh local state**  
     Action: Verify app boot on the reset schema with a fresh local database.  
     Dependency: Task 252  
     Completion signal: The app starts successfully on empty local state.

254. **Run task-flow verification**  
     Action: Verify task create, edit, delete, complete, reopen, tagging, priority, and project assignment flows.  
     Dependency: Tasks 252, 253  
     Completion signal: Task flows pass manual verification.

255. **Run project-flow verification**  
     Action: Verify project create, edit, delete, status grouping, links, and task-cascade behavior.  
     Dependency: Tasks 252, 253  
     Completion signal: Project flows pass manual verification.

256. **Run schedule-flow verification**  
     Action: Verify slot create, edit, delete, overlap rejection, cancellation, uncancellation, and day-agenda derivation.  
     Dependency: Tasks 252, 253  
     Completion signal: Schedule flows pass manual verification.

257. **Run dashboard verification**  
     Action: Verify current slot, next slot, free time, suggestions, and pending-task ordering on the Now screen.  
     Dependency: Tasks 252, 253  
     Completion signal: Dashboard behavior passes manual verification.

258. **Run notification verification**  
     Action: Verify task and schedule notification behavior across at least the primary supported targets.  
     Dependency: Tasks 252, 253  
     Completion signal: Notification behavior is manually verified and platform caveats are recorded.

259. **Run final legacy-reference verification**  
     Action: Confirm no active canonical docs or code paths still point to retired architecture.  
     Dependency: Tasks 247 to 258  
     Completion signal: Final verification confirms canonical-only architecture.

260. **Write migration completion note**  
     Action: Produce a concise final summary of what shipped, what platform caveats remain, and what future v2+ work remains intentionally excluded.  
     Dependency: Tasks 252 to 259  
     Completion signal: A final migration completion note exists.

**Exit criteria**

- repository docs match the final architecture
- `npx tsc --noEmit` passes
- manual verification is complete for core flows
- final migration note is written

**Checkpoint pause**

- Pause after completion of this phase only if post-migration stabilization work is intentionally deferred.
- Do not begin unrelated new feature work until final verification notes and known platform caveats are recorded.
- Required verification artifacts:
  - final type-check result
  - task-flow verification note
  - project-flow verification note
  - schedule-flow verification note
  - dashboard verification note
  - notification verification note
- Known unresolved risks allowed to carry forward:
  - Android persistent schedule-notification behavior may still need native escalation
  - future non-v1 features remain intentionally excluded
- Recommended handoff note contents:
  - migration completion summary
  - platform caveats
  - deferred out-of-scope ideas

**Risks / watch items**

- docs can fall out of sync if updated before the final cleanup stabilizes
- incomplete manual verification can leave false confidence after a large schema reset

**Next phase unlock**

None. This is the final migration phase.

---

## Cross-Phase Dependencies

Use these dependency rules during execution:

- Phase 3 depends on Phase 2 because schema fields follow screen and ownership decisions.
- Phase 4 depends on Phase 3 because DB modules require stable entities and table design.
- Phase 5 depends on Phase 4 because domain workflows require stable DB methods.
- Phase 6 depends on Phase 5 because schedule engine inputs are shaped by canonical workflows.
- Phase 7 depends on Phases 5 and 6 because notifications need stable task and schedule outputs.
- Phase 8 depends on Phases 2 and 7 because route design and deep links must be consistent with new behaviors.
- Phase 9 depends on Phases 5, 6, 7, and 8 because the dashboard is a cross-subsystem screen.
- Phase 10 depends on Phases 4, 5, 7, and 8 because tasks require stable storage, workflows, notifications, and routes.
- Phase 11 depends on Phases 4, 5, 8, and 10 because projects depend on task linkage and route availability.
- Phase 12 depends on Phases 4, 5, 6, 8, and 9 because schedule management depends on new schema, workflow, engine, routes, and dashboard semantics.
- Phase 13 depends on Phases 9 through 12 because component consolidation should follow primary feature stabilization.
- Phase 14 depends on Phases 1 through 13 because legacy removal should happen after canonical parity is achieved.
- Phase 15 depends on Phases 1 through 14 because docs and final verification must reflect the fully migrated state.

Parallelization guidance:

- Phases are not globally parallel.
- Tasks within a phase may be parallelized if they do not mutate the same modules or decision surface.
- DB and domain work may overlap only after schema and API contracts are frozen.
- UI work may overlap across `Tasks`, `Projects`, and `Schedule` only after route and type contracts are stable.
- Legacy removal must not overlap with incomplete feature parity work.

---

## Verification Strategy

Verification exists at two levels: per-task completion and per-phase gates.

### Per-task completion expectations

Every task in this document must end with these checks where applicable:

- code compiles under TypeScript strict mode
- affected manual flow is exercised
- no layering violations are introduced
- no new canonical dependency is added to legacy modules

### Per-phase gate expectations

At each phase boundary:

- run `npx tsc --noEmit`
- manually verify the subsystem changed in that phase
- confirm route ownership still matches the plan
- confirm storage and domain boundaries remain clean
- confirm no temporary shortcut created in the phase has silently become canonical

### Manual scenario minimums

Task verification scenarios:

- create task with no deadline
- create task with date only
- create task with date and time
- edit task priority, tags, notes, and project assignment
- complete and reopen a task
- delete a task with scheduled notifications

Project verification scenarios:

- create project
- edit project fields
- attach tasks to project
- delete project and verify task cascade behavior

Schedule verification scenarios:

- create non-overlapping slots
- reject overlapping slots
- create work, college, meeting, break, and free slot types
- cancel a slot for one date
- remove a cancellation
- verify free-day behavior

Dashboard verification scenarios:

- verify current slot changes over time
- verify next slot changes after current slot ends
- verify free-time messaging when no slot is active
- verify suggested-task ordering
- verify all pending-task ordering

Notification verification scenarios:

- verify permissions granted flow
- verify permissions denied flow
- verify task summary refresh on task mutations
- verify schedule summary refresh on schedule mutations
- verify notification deep links
- verify no-crash behavior on unsupported targets

---

## Final Cutover Checklist

Complete this checklist before declaring the migration complete:

- target tabs are `Now`, `Tasks`, `Projects`, and `Schedule`
- canonical entities are `Task`, `Project`, `ScheduleSlot`, and `ScheduleSlotCancellation`
- old `action_items` and `lecture_slots` assumptions are removed from active architecture
- `Now` answers both “what is happening right now” and “what should I work on next”
- `Tasks` owns Today, Upcoming, Unscheduled, Overdue, and Completed
- `Projects` owns grouped project views and project CRUD
- `Schedule` owns weekly overview, day agenda, and slot CRUD
- date-specific slot cancellation works
- free-time derivation works
- task priority, tags, and project assignment work
- project cascade deletion works
- notification behavior is platform-safe
- legacy lecture-first code is retired from active use
- documentation matches the final architecture
- `npx tsc --noEmit` passes
- manual validation notes exist for tasks, projects, schedule, dashboard, and notifications

---

## Assumptions

- This file is the master implementation runbook for the migration.
- The migration is intentionally destructive to local data because schema reset was chosen.
- SQLite remains the only persistence layer.
- Notifications remain local-only.
- Android is the primary target for any advanced schedule-notification persistence ambitions.
- iOS uses fallback schedule-notification behavior if true persistence is unavailable.
- Web does not attempt unsupported notification behavior and must fail safely.
- Free time is primarily derived from schedule gaps, though manual `free` slots are still allowed by the target model.
- Source priority affects surfacing and emphasis, not automatic deletion or suppression of lower-priority slots.
- Projects remain context containers only and do not gain milestones, progress percentages, or dependency graphs.
- Recurring tasks remain out of scope for this migration.
