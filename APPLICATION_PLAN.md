# Application Plan

Before implementing features, agents must read:

AGENT_RULES.md

## Core Idea

A time-aware personal organizer that structures daily activity around fixed schedules.

The application integrates:

- schedule management
- task tracking
- project tracking

Schedules define the **structure of time**, while tasks and projects define **what work should be done inside that time**.

The system helps answer:

- what is happening right now
- what should I work on next

The application is **offline-first** and runs entirely on-device.

---

# Core Systems

## 1. Unified Schedule System

The application uses a **single unified schedule engine**.

All time blocks are stored as **schedule slots**.

Slots may represent:

- college lectures
- office work blocks
- meetings
- breaks
- free time

### Schedule Slot Structure

Each slot contains:

- start_time
- end_time
- title
- location
- description
- slot_type
- schedule_source

### Slot Types

Possible slot types:

- lecture
- work
- meeting
- break
- free

### Schedule Source

Used to distinguish schedule origin.

Possible values:

- college
- work
- personal

Example:

08:00–09:00  
Title: Data Structures  
Type: lecture  
Source: college  
Location: Room 204

14:00–15:30  
Title: API Development  
Type: work  
Source: work

---

## 2. Schedule Engine Capabilities

The schedule engine supports:

- weekly repeating schedules
- break periods
- detecting current slot
- detecting next slot
- calculating free time gaps
- preventing overlapping slots
- marking a slot cancelled for a specific day
- days without slots treated as free days

---

## 3. Priority Rules Between Schedules

Office work has higher operational priority than college events.

If schedule conflicts occur:

Priority order:

1. work
2. college
3. personal

Higher priority slots are **highlighted or surfaced first** in the interface.

---

## 4. Persistent Notifications

Two persistent notifications exist.

### Schedule Notification

Displays the **entire day's schedule** in concise format.

Example:

08:00–09:00 Data Structures  
09:00–10:00 Operating Systems  
10:00–10:30 Break  
10:30–11:30 Backend Work  
11:30–12:30 Free

Behavior:

- current slot highlighted
- updates automatically with time
- tapping opens the timetable screen
- removed after the final slot of the day

---

### Task Notification

Displays important tasks.

Shows:

- top pending tasks
- overdue tasks if present

Purpose:

Provide quick task awareness without opening the app.

---

# Task Management System

## Task Purpose

Tasks represent **short actionable work**.

Examples:

- assignments
- errands
- reminders
- project actions
- work items

---

## Task Properties

Each task contains:

- title
- optional deadline
- optional time
- priority (high / medium / low)
- notes
- completion status
- optional project_id
- optional tags

---

## Task Categories

Tasks are grouped into:

- Today
- Upcoming
- Unscheduled
- Overdue
- Completed

Completed tasks are hidden under **Completed section**.

---

## Task–Project Relationship

Tasks are **standalone by default** but may optionally belong to a project.

Example:

Task: Write parser documentation  
Project: Compiler Design Project

If a project is deleted:

All tasks belonging to that project are also deleted.

---

# Project Tracker

## Purpose

Track longer-term work across days or months.

Projects act as **context containers** rather than task managers.

---

## Project Fields

Each project stores:

- name
- description
- status
- notes
- start date
- optional reference links

---

## Project Status

Possible status values:

- active
- paused
- completed
- abandoned

Projects can optionally contain related tasks.

---

# Now Dashboard

The **Now Dashboard** is the central screen of the application.

Displays:

- current schedule slot
- next schedule slot
- today's tasks
- free time blocks
- quick navigation to task creation

Purpose:

Provide immediate situational awareness.

---

# Time-Aware Behavior

## Free Time Detection

The schedule engine continuously determines:

- current slot
- next slot
- free time duration

Example:

Current time: 10:05  
Next slot: 11:00

Free time: 55 minutes

---

## Task Suggestions During Free Time

When free time exists, the dashboard surfaces tasks.

Two sections are displayed.

### Suggested Tasks

Top 3 most urgent tasks.

Priority rules:

1. tasks due today
2. tasks due tomorrow
3. tasks with nearest deadline
4. tasks without deadlines

---

### All Pending Tasks

Displays all remaining tasks sorted by:

deadline ASC  
priority DESC  
creation_time ASC

Even very small time gaps still show suggested tasks.

---

# Core Engines

The application is powered by three main engines:

Schedule Engine  
Task Engine  
Project Tracker

The **Schedule Engine drives time awareness**, while tasks and projects fill available time with actionable work.
