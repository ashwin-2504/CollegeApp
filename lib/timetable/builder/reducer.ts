// Timetable Builder — Reducer
// Central state management. All mutations via dispatched actions.

import { createEmptySlot } from "./presets";
import {
  ALL_DAYS,
  type DayNumber,
  type DaySlot,
  type TimetableAction,
  type TimetableState,
} from "./types";
import { validate } from "./validation";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Create a blank initial state */
export function createInitialState(): TimetableState {
  const days = {} as Record<DayNumber, DaySlot[]>;
  for (const d of ALL_DAYS) {
    days[d] = [];
  }
  return {
    phase: "preset",
    days,
    activeEditor: null,
    validation: {
      errors: [],
      warnings: [],
      filledCount: 0,
      totalCount: 0,
      canSave: false,
    },
  };
}

/** Deep-clone a slot with a new ID */
function cloneSlot(slot: DaySlot): DaySlot {
  return { ...slot, id: generateId() };
}

/** Deep-clone a day's slots with new IDs */
function cloneDaySlots(slots: DaySlot[]): DaySlot[] {
  return slots.map(cloneSlot);
}

function applyAndValidate(
  state: TimetableState,
  updates: Partial<TimetableState>,
): TimetableState {
  const next = { ...state, ...updates };
  next.validation = validate(next);
  return next;
}

export function timetableReducer(
  state: TimetableState,
  action: TimetableAction,
): TimetableState {
  switch (action.type) {
    // ── Preset & Phase ─────────────────────────────────────

    case "APPLY_PRESET": {
      return applyAndValidate(state, {
        phase: "preset",
        days: action.days,
        activeEditor: null,
      });
    }

    case "START_FILL": {
      return { ...state, phase: "fill" };
    }

    // ── Slot CRUD ──────────────────────────────────────────

    case "FILL_SLOT": {
      const daySlots = state.days[action.day];
      const idx = daySlots.findIndex((s) => s.id === action.slotId);
      if (idx === -1) return state;

      const updatedSlots = [...daySlots];
      updatedSlots[idx] = { ...updatedSlots[idx], ...action.data };

      return applyAndValidate(state, {
        days: { ...state.days, [action.day]: updatedSlots },
      });
    }

    case "CLEAR_SLOT": {
      const daySlots = state.days[action.day];
      const idx = daySlots.findIndex((s) => s.id === action.slotId);
      if (idx === -1) return state;

      const updatedSlots = [...daySlots];
      updatedSlots[idx] = {
        ...updatedSlots[idx],
        subjectName: "",
        subjectCode: "",
        faculty: "",
        location: "",
        type: "THEORY",
      };

      return applyAndValidate(state, {
        days: { ...state.days, [action.day]: updatedSlots },
      });
    }

    case "ADD_SLOT": {
      const newSlot = createEmptySlot(action.startTime, action.endTime);
      const existing = [...state.days[action.day], newSlot];
      // Sort by start time to maintain order
      existing.sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
      );

      return applyAndValidate(state, {
        days: { ...state.days, [action.day]: existing },
      });
    }

    case "REMOVE_SLOT": {
      const filtered = state.days[action.day].filter(
        (s) => s.id !== action.slotId,
      );
      return applyAndValidate(state, {
        days: { ...state.days, [action.day]: filtered },
        activeEditor:
          state.activeEditor?.slotId === action.slotId
            ? null
            : state.activeEditor,
      });
    }

    // ── Merge / Unmerge ────────────────────────────────────

    case "MERGE_DOWN": {
      const daySlots = [...state.days[action.day]];
      // Sort to ensure correct adjacency
      daySlots.sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
      );

      const idx = daySlots.findIndex((s) => s.id === action.slotId);
      if (idx === -1 || idx >= daySlots.length - 1) return state; // last slot can't merge

      const current = daySlots[idx];
      const next = daySlots[idx + 1];

      // Absorb next slot's endTime, remove next
      const merged: DaySlot = {
        ...current,
        endTime: next.endTime,
      };

      const newSlots = [
        ...daySlots.slice(0, idx),
        merged,
        ...daySlots.slice(idx + 2),
      ];

      return applyAndValidate(state, {
        days: { ...state.days, [action.day]: newSlots },
        activeEditor:
          state.activeEditor?.slotId === next.id ? null : state.activeEditor,
      });
    }

    case "UNMERGE": {
      const daySlots = [...state.days[action.day]];
      const idx = daySlots.findIndex((s) => s.id === action.slotId);
      if (idx === -1) return state;

      const slot = daySlots[idx];
      const startMin = timeToMinutes(slot.startTime);
      const endMin = timeToMinutes(slot.endTime);
      const midMin = Math.floor((startMin + endMin) / 2);

      // Split into two empty slots at midpoint
      const firstHalf: DaySlot = {
        ...slot,
        endTime: minutesToTime(midMin),
        // Keep data on first half
      };

      const secondHalf = createEmptySlot(minutesToTime(midMin), slot.endTime);

      const newSlots = [
        ...daySlots.slice(0, idx),
        firstHalf,
        secondHalf,
        ...daySlots.slice(idx + 1),
      ];

      return applyAndValidate(state, {
        days: { ...state.days, [action.day]: newSlots },
      });
    }

    // ── Day Operations ─────────────────────────────────────

    case "APPLY_PATTERN": {
      const sourceSlots = state.days[action.fromDay];
      const newDays = { ...state.days };
      for (const targetDay of action.toDays) {
        // Full replace with cloned slots (new IDs)
        newDays[targetDay] = cloneDaySlots(sourceSlots);
      }

      return applyAndValidate(state, {
        days: newDays,
        activeEditor: null,
      });
    }

    case "CLEAR_DAY": {
      // Keep slot structure (times), clear all data
      const cleared = state.days[action.day].map((slot) => ({
        ...slot,
        subjectName: "",
        subjectCode: "",
        faculty: "",
        location: "",
        type: "THEORY" as const,
      }));

      return applyAndValidate(state, {
        days: { ...state.days, [action.day]: cleared },
        activeEditor: null,
      });
    }

    // ── Editor State ───────────────────────────────────────

    case "SET_EDITOR": {
      return {
        ...state,
        activeEditor: { day: action.day, slotId: action.slotId },
      };
    }

    case "CLOSE_EDITOR": {
      return { ...state, activeEditor: null };
    }

    // ── Load / Reset ───────────────────────────────────────

    case "LOAD_EXISTING": {
      return applyAndValidate(state, {
        phase: "fill",
        days: action.days,
        activeEditor: null,
      });
    }

    case "RESET_ALL": {
      return createInitialState();
    }

    default:
      return state;
  }
}
