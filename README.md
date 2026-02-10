# Check (MVP)

## Project Overview

"Check" is a mobile-first academic productivity app designed to reduce cognitive load. It features two independent modules:

1. **Personal Action Manager**: For tasks, deadlines, and notes.
2. **College Timetable Calendar**: For passive, real-time academic context.

## Core Principles

- **Local-first**: Offline by default.
- **Explicit Input**: No NLP, deterministic behavior.
- **Minimal Interaction**: Design for speed and low friction.
- **Scope**: MVP focused (no cloud sync, no user accounts, no cross-device sync).

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Database**: SQLite (Local)
- **OCR**: On-device (ML Kit) for timetable setup
- **Scheduling**: Deterministic logic

## Module 1: Personal Action Manager (MVP)

### Data Model (ActionItem)

- `id`: string
- `text`: string (required)
- `date`: string (YYYY-MM-DD, optional)
- `time`: string (HH:MM, optional)
- `notes`: string (optional)
- `createdAt`: ISO timestamp
- `completedAt`: ISO timestamp (optional)

### Views

- **Now**: `date == today` AND `time != null` (Sorted by time)
- **Upcoming**: `date != null` AND `time == null` (Grouped by date)
- **Unscheduled**: `date == null` (List view)

## Module 2: College Timetable Calendar (MVP)

### Data Model (LectureSlot)

- `dayOfWeek`: number (0-6)
- `startTime`: string (HH:MM)
- `endTime`: string (HH:MM)
- `subjectCode`: string
- `subjectName`: string
- `faculty`: string
- `location`: string
- `type`: 'THEORY' | 'LAB' | 'OTHER'

### Features

- One-time setup via Image OCR + Parsing.
- Runtime "Current/Next Lecture" display.
- Silent persistent notifications.

## Roadmap (MVP)

- [ ] Initialize Expo project
- [ ] Setup Navigation (Tabs/Stack)
- [ ] Setup SQLite Database
- [ ] Implement Action Manager (CRUD + Views)
- [ ] Implement Timetable Data Model & Parsing Logic
- [ ] Implement OCR (TBD tech choice for Expo)
- [ ] Implement Timetable UI (Current/Next)
