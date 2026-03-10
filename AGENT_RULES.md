# Agent Development Rules (Version 1)

These rules define constraints for the AI agent working on the project.

The goal of v1 is to build a **stable offline productivity application** with predictable behavior.

Agents must follow these rules strictly.

---

# General Principles

DO:

- keep the architecture simple
- prefer deterministic logic over complex automation
- reuse existing modules when possible
- maintain clear separation between UI, domain logic, and database
- follow the defined application plan

DO NOT:

- introduce new features outside the application plan
- introduce AI, ML, or heuristic-based automation
- introduce unnecessary abstractions
- modify the core architecture without explicit instruction

---

# Offline First

DO:

- use SQLite for all persistence
- keep all features functional without internet

DO NOT:

- introduce APIs
- add authentication systems
- add cloud sync
- add external storage services

---

# Schedule System

DO:

- use the unified schedule slot model
- enforce non-overlapping schedule slots
- support weekly repeating schedules
- allow marking slots cancelled for a specific day

DO NOT:

- create separate systems for college and work schedules
- introduce complex calendar integrations
- introduce timezone conversion systems

---

# Task System

DO:

- keep tasks lightweight
- support optional project assignment
- support tags
- support deadlines and priority levels

DO NOT:

- introduce recurring tasks (v2 feature)
- introduce natural language parsing
- introduce AI task suggestions

---

# Project System

DO:

- treat projects as context containers
- allow tasks to optionally belong to projects

DO NOT:

- implement milestone systems
- implement project progress percentages
- implement dependency graphs

---

# Notifications

DO:

- implement schedule notification
- implement task notification

DO NOT:

- implement push notifications
- implement remote notification services

---

# Free Time Logic

DO:

- prioritize tasks by deadline
- display suggested tasks during free blocks

DO NOT:

- attempt automatic scheduling
- attempt intelligent time estimation

---

# UI Complexity

DO:

- keep UI simple and functional 
- prioritize clarity and speed

DO NOT:

- add complex animations
- introduce unnecessary visual effects

---

# Version Boundaries

The following features belong to **future versions** and must not be implemented in v1:

- recurring tasks
- cloud sync
- collaboration
- AI suggestions
- analytics
- calendar integrations