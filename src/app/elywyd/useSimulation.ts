"use client";

// =============================================================================
// ELYWYD — Simulation clock hook.
// -----------------------------------------------------------------------------
// Owns ONE requestAnimationFrame loop. The timeline is a pure, deterministic
// list (simulation.ts); this hook just advances a clock and reveals events
// whose timestamp has elapsed.
//
// Strict-Mode safety: the loop is only ever started from an explicit user
// gesture (start()/replay()), never from an effect, so React's double-mount
// cannot spawn a duplicate timeline. The single effect here only cancels the
// frame on unmount.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { Phase } from "./config";
import {
  buildTimeline,
  computePhaseWindows,
  counterValueAt,
  COUNTER_DEFS,
  FeedItem,
  phaseAt,
  phaseWindow,
  simulationRunLength,
  TimelineEvent,
} from "./simulation";

export type RunStatus = "idle" | "running" | "ending";

export interface SimulationCallbacks {
  onPhaseChange?: (phase: Phase) => void;
  onReveal?: (item: FeedItem) => void;
  onComplete?: () => void;
}

export interface UseSimulationOptions extends SimulationCallbacks {
  seed?: number;
  speed?: number; // multiplier from ?speed=
  startPhase?: Phase | null; // debug jump
}

export interface SimulationState {
  status: RunStatus;
  phase: Phase;
  items: FeedItem[];
  counters: Record<string, number>;
  elapsed: number;
  paused: boolean;
  start: (overridePhase?: Phase | null) => void;
  skip: () => void;
  replay: () => void;
  togglePause: () => void;
}

const RUN_LENGTH = simulationRunLength();

function initialCounters(): Record<string, number> {
  const c: Record<string, number> = {};
  for (const def of COUNTER_DEFS) c[def.key] = 0;
  return c;
}

export function useSimulation(
  opts: UseSimulationOptions = {},
): SimulationState {
  const {
    seed = 1337,
    speed = 1,
    startPhase = null,
    onPhaseChange,
    onReveal,
    onComplete,
  } = opts;

  const [status, setStatus] = useState<RunStatus>("idle");
  const [phase, setPhase] = useState<Phase>("identification");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [counters, setCounters] = useState<Record<string, number>>(
    initialCounters,
  );
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  // Imperative clock state (refs so the loop never captures stale values).
  const rafRef = useRef<number | null>(null);
  const timelineRef = useRef<TimelineEvent[]>([]);
  const revealIdxRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastTsRef = useRef(0);
  const pausedRef = useRef(false);
  const speedRef = useRef(speed);
  const phaseRef = useRef<Phase>("identification");
  const lastCounterTsRef = useRef(0);

  // Keep callbacks fresh without restarting the loop.
  const cbRef = useRef<SimulationCallbacks>({});
  cbRef.current = { onPhaseChange, onReveal, onComplete };
  speedRef.current = speed > 0 ? speed : 1;

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const revealUpTo = useCallback((t: number, silent: boolean) => {
    const timeline = timelineRef.current;
    const newItems: FeedItem[] = [];
    while (
      revealIdxRef.current < timeline.length &&
      timeline[revealIdxRef.current].t <= t
    ) {
      const ev = timeline[revealIdxRef.current];
      newItems.push(ev.item);
      if (!silent) cbRef.current.onReveal?.(ev.item);
      revealIdxRef.current += 1;
    }
    if (newItems.length) {
      setItems((prev) => {
        // Cap the DOM feed to keep the chaotic phase responsive.
        const merged = [...prev, ...newItems];
        return merged.length > 60 ? merged.slice(merged.length - 60) : merged;
      });
    }
  }, []);

  const finish = useCallback(() => {
    stopLoop();
    elapsedRef.current = RUN_LENGTH;
    phaseRef.current = "ending";
    setStatus("ending");
    setPhase("ending");
    setElapsed(RUN_LENGTH);
    const full: Record<string, number> = {};
    for (const def of COUNTER_DEFS) full[def.key] = def.target;
    setCounters(full);
    cbRef.current.onPhaseChange?.("ending");
    cbRef.current.onComplete?.();
  }, [stopLoop]);

  const tick = useCallback(
    (ts: number) => {
      if (lastTsRef.current === 0) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      if (!pausedRef.current) {
        elapsedRef.current += dt * speedRef.current;
      }
      const e = elapsedRef.current;

      if (e >= RUN_LENGTH) {
        revealUpTo(RUN_LENGTH, false);
        finish();
        return;
      }

      revealUpTo(e, false);

      const nextPhase = phaseAt(e);
      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
        cbRef.current.onPhaseChange?.(nextPhase);
      }

      // Throttle counter + elapsed state updates to ~10/s.
      if (ts - lastCounterTsRef.current > 100) {
        lastCounterTsRef.current = ts;
        const next: Record<string, number> = {};
        for (const def of COUNTER_DEFS) next[def.key] = counterValueAt(def.target, e);
        setCounters(next);
        setElapsed(e);
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [revealUpTo, finish],
  );

  const beginLoop = useCallback(
    (fromElapsed: number) => {
      stopLoop();
      elapsedRef.current = fromElapsed;
      lastTsRef.current = 0;
      lastCounterTsRef.current = 0;
      // Pre-reveal anything before the (possibly jumped) start, silently.
      revealUpTo(fromElapsed, true);
      const p = phaseAt(fromElapsed);
      phaseRef.current = p;
      setPhase(p);
      cbRef.current.onPhaseChange?.(p);
      setStatus("running");
      rafRef.current = requestAnimationFrame(tick);
    },
    [revealUpTo, stopLoop, tick],
  );

  const reset = useCallback(() => {
    stopLoop();
    timelineRef.current = buildTimeline(seed);
    revealIdxRef.current = 0;
    elapsedRef.current = 0;
    pausedRef.current = false;
    phaseRef.current = "identification";
    setPaused(false);
    setItems([]);
    setCounters(initialCounters());
    setElapsed(0);
    setPhase("identification");
  }, [seed, stopLoop]);

  const start = useCallback(
    (overridePhase?: Phase | null) => {
      reset();
      const p = overridePhase !== undefined ? overridePhase : startPhase;
      const from = p ? phaseWindow(p).start : 0;
      beginLoop(from);
    },
    [reset, beginLoop, startPhase],
  );

  const replay = useCallback(() => {
    reset();
    beginLoop(0);
  }, [reset, beginLoop]);

  const skip = useCallback(() => {
    // Reveal everything and jump straight to the ending.
    if (timelineRef.current.length === 0) timelineRef.current = buildTimeline(seed);
    revealUpTo(RUN_LENGTH, true);
    finish();
  }, [seed, revealUpTo, finish]);

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      pausedRef.current = next;
      return next;
    });
  }, []);

  // Single cleanup effect — cancels the frame on unmount only.
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  return {
    status,
    phase,
    items,
    counters,
    elapsed,
    paused,
    start,
    skip,
    replay,
    togglePause,
  };
}

export const PHASE_WINDOWS = computePhaseWindows();
