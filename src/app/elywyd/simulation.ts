// =============================================================================
// ELYWYD — Pure, deterministic simulation core.
// -----------------------------------------------------------------------------
// No React, no DOM, no timers here. Everything is a pure function of
// (config, seed), which makes the whole timeline reproducible and testable.
//
// The React layer (useSimulation.ts) owns a single clock and simply reveals
// the events whose timestamp has elapsed. Replaying with the same seed yields
// an identical run; changing the seed reshuffles the deterministic variation.
// =============================================================================

import {
  ALIVE_MESSAGES,
  ALIVE_REACTIONS,
  AUTHOR_NAMES,
  BRAND_NAMES,
  COMMENTATOR_HANDLES,
  CONTENT_POSTS,
  COUNTERS,
  HEADLINES,
  INITIAL_REACTIONS,
  INSTITUTION_NAMES,
  OUTLET_NAMES,
  PHASE_DURATIONS,
  PHASE_ORDER,
  Phase,
  VIRAL_COMMERCIAL,
  VIRAL_INSTITUTIONAL,
  VIRAL_PERSONAL,
  VIRAL_PUBLIC,
} from "./config";

// --- Seeded PRNG (mulberry32) -----------------------------------------------
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// --- Types ------------------------------------------------------------------
export type ItemKind =
  | "post" // a social feed card (author + text + meta)
  | "reaction" // a quiet metric line under an alive message
  | "headline" // editorial headline card
  | "statement" // institutional statement card
  | "system"; // a system/notification strip

export type ItemTone = "quiet" | "tribute" | "viral" | "chaos";
export type ItemGroup =
  | "self"
  | "personal"
  | "public"
  | "institutional"
  | "commercial"
  | "content";

export interface FeedItem {
  id: string;
  kind: ItemKind;
  tone: ItemTone;
  group: ItemGroup;
  text: string;
  author?: string;
  handle?: string;
  meta?: string;
  corrupted?: boolean;
  duplicate?: boolean;
}

export interface TimelineEvent {
  t: number; // ms from simulation start
  phase: Phase;
  item: FeedItem;
}

export interface CounterDef {
  key: string;
  label: string;
  target: number;
}

// --- Phase boundaries -------------------------------------------------------
export interface PhaseWindow {
  phase: Phase;
  start: number;
  end: number;
}

export function computePhaseWindows(): PhaseWindow[] {
  let acc = 0;
  const windows: PhaseWindow[] = [];
  for (const phase of PHASE_ORDER) {
    const start = acc;
    const end = start + PHASE_DURATIONS[phase];
    windows.push({ phase, start, end });
    acc = end;
  }
  return windows;
}

export function phaseWindow(phase: Phase): PhaseWindow {
  const w = computePhaseWindows().find((x) => x.phase === phase);
  if (!w) throw new Error(`Unknown phase: ${phase}`);
  return w;
}

/** Total runtime up to (but not including) the terminal ending phase. */
export function simulationRunLength(): number {
  return phaseWindow("collapse").end;
}

export function phaseAt(elapsed: number): Phase {
  const windows = computePhaseWindows();
  for (const w of windows) {
    if (elapsed < w.end) return w.phase;
  }
  return "ending";
}

// --- Distribute N items across a window -------------------------------------
// bias > 1 packs items toward the END of the window (acceleration).
function distribute(
  start: number,
  end: number,
  count: number,
  bias: number,
): number[] {
  const span = end - start;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const p = count === 1 ? 0.5 : i / (count - 1);
    out.push(start + span * Math.pow(p, bias));
  }
  return out;
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

// --- Timeline builder (deterministic) ---------------------------------------
export function buildTimeline(seed: number): TimelineEvent[] {
  idCounter = 0;
  const rng = makeRng(seed);
  const events: TimelineEvent[] = [];
  const w = (p: Phase) => phaseWindow(p);

  const push = (t: number, phase: Phase, item: FeedItem) =>
    events.push({ t, phase, item });

  // --- Phase 2: alive & overlooked -----------------------------------------
  {
    const win = w("alive");
    // Use a stable subset of alive messages, always leading with index 0
    // (the message restored at the collapse).
    const msgs = [ALIVE_MESSAGES[0], ...ALIVE_MESSAGES.slice(1)];
    const times = distribute(win.start + 400, win.end - 700, msgs.length, 1);
    msgs.forEach((text, i) => {
      push(times[i], "alive", {
        id: nextId("alive"),
        kind: "post",
        tone: "quiet",
        group: "self",
        text,
        meta: pick(rng, ALIVE_REACTIONS),
      });
    });
  }

  // --- Phase 4: initial reaction -------------------------------------------
  {
    const win = w("initialReaction");
    const count = 6;
    const times = distribute(win.start + 500, win.end - 400, count, 0.85);
    for (let i = 0; i < count; i++) {
      push(times[i], "initialReaction", {
        id: nextId("init"),
        kind: "post",
        tone: "tribute",
        group: "personal",
        author: pick(rng, AUTHOR_NAMES),
        text: pick(rng, INITIAL_REACTIONS),
      });
    }
  }

  // --- Phase 5: viral escalation -------------------------------------------
  {
    const win = w("viral");
    const count = 18;
    // bias 1.6 => accelerating toward the end of the phase.
    const times = distribute(win.start + 300, win.end - 200, count, 1.6);
    for (let i = 0; i < count; i++) {
      const roll = rng();
      let item: FeedItem;
      if (roll < 0.34) {
        item = {
          id: nextId("v"),
          kind: "post",
          tone: "viral",
          group: "personal",
          author: pick(rng, AUTHOR_NAMES),
          text: pick(rng, VIRAL_PERSONAL),
        };
      } else if (roll < 0.62) {
        item = {
          id: nextId("v"),
          kind: "post",
          tone: "viral",
          group: "public",
          author: pick(rng, OUTLET_NAMES),
          text: pick(rng, VIRAL_PUBLIC),
        };
      } else if (roll < 0.82) {
        item = {
          id: nextId("v"),
          kind: "statement",
          tone: "viral",
          group: "institutional",
          author: pick(rng, INSTITUTION_NAMES),
          text: pick(rng, VIRAL_INSTITUTIONAL),
        };
      } else {
        item = {
          id: nextId("v"),
          kind: "post",
          tone: "viral",
          group: "commercial",
          author: pick(rng, BRAND_NAMES),
          text: pick(rng, VIRAL_COMMERCIAL),
        };
      }
      push(times[i], "viral", item);

      // Occasionally interleave a headline mid-viral.
      if (rng() < 0.22) {
        push(times[i] + 120, "viral", {
          id: nextId("vh"),
          kind: "headline",
          tone: "viral",
          group: "public",
          author: pick(rng, OUTLET_NAMES),
          text: pick(rng, HEADLINES),
        });
      }
    }
  }

  // --- Phase 6: the subject becomes content --------------------------------
  {
    const win = w("content");
    const count = 24;
    const times = distribute(win.start + 150, win.end - 150, count, 1.15);
    for (let i = 0; i < count; i++) {
      const text = pick(rng, CONTENT_POSTS);
      const corrupted = rng() < 0.28; // controlled corruption, never on essential copy
      const item: FeedItem = {
        id: nextId("c"),
        kind: "post",
        tone: "chaos",
        group: "content",
        author: pick(rng, COMMENTATOR_HANDLES),
        handle: pick(rng, COMMENTATOR_HANDLES),
        text,
        corrupted,
      };
      push(times[i], "content", item);

      // Duplicate selected comments (the "everyone reposting" effect).
      if (rng() < 0.3) {
        push(times[i] + 90, "content", {
          ...item,
          id: nextId("c"),
          duplicate: true,
        });
      }
      // Headlines keep surfacing.
      if (rng() < 0.25) {
        push(times[i] + 60, "content", {
          id: nextId("ch"),
          kind: "headline",
          tone: "chaos",
          group: "public",
          author: pick(rng, OUTLET_NAMES),
          text: pick(rng, HEADLINES),
        });
      }
    }
  }

  return events.sort((a, b) => a.t - b.t);
}

// --- Counters ---------------------------------------------------------------
export const COUNTER_DEFS: CounterDef[] = COUNTERS.map((c) => ({ ...c }));

/** Eased attention counter value at a given elapsed time. */
export function counterValueAt(target: number, elapsed: number): number {
  const start = phaseWindow("viral").start;
  const end = phaseWindow("content").end;
  if (elapsed <= start) return 0;
  if (elapsed >= end) return target;
  const p = (elapsed - start) / (end - start);
  // ease-in-cubic so numbers explode late — "suddenly everyone cares".
  const eased = p * p * p;
  return Math.floor(target * eased);
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 10_000) return Math.round(n / 1000) + "K";
  if (n >= 1_000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// --- Text corruption (deterministic, readability-preserving) ----------------
const GLITCH_CHARS = "▓▒░#@%&";

/**
 * Corrupts a fraction of characters while leaving the string readable.
 * Never corrupts more than ~18% of characters and never the first/last few.
 */
export function corruptText(text: string, seed: number): string {
  const rng = makeRng(seed);
  const chars = text.split("");
  const editable = Math.max(0, chars.length - 6);
  const maxHits = Math.floor(editable * 0.18);
  let hits = 0;
  for (let i = 3; i < chars.length - 3 && hits < maxHits; i++) {
    if (chars[i] === " ") continue;
    if (rng() < 0.14) {
      chars[i] = GLITCH_CHARS[Math.floor(rng() * GLITCH_CHARS.length)];
      hits++;
    }
  }
  return chars.join("");
}
