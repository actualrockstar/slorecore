"use client";

// =============================================================================
// ELYWYD — "Everybody Loves You When You're Dead"
// Posthumous Attention Simulator — main interactive component.
// -----------------------------------------------------------------------------
// Screens: entry -> simulation (identification..collapse) -> ending.
// All copy/timing lives in config.ts; all timeline logic in simulation.ts;
// the clock in useSimulation.ts; audio in audio.ts. This file is the UI +
// wiring (photo, analytics, reduced motion, controls, debug).
// =============================================================================

import { track } from "@vercel/analytics/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ALIVE_METRICS,
  ANALYTICS_EVENTS,
  COLLAPSE_MESSAGE,
  DEFAULT_SUBJECT_NAME,
  ENDING,
  HOME_URL,
  Phase,
  PHASE_ORDER,
  PRESAVE_URL,
  SHARE_TEXT,
  STATUS_CHANGE,
  TERMINAL_LINES,
  UNANSWERED_WHILE_ALIVE,
} from "./config";
import { SimAudio } from "./audio";
import {
  corruptText,
  COUNTER_DEFS,
  FeedItem,
  formatCount,
} from "./simulation";
import { PHASE_WINDOWS, useSimulation } from "./useSimulation";

// --- Analytics helper (never throws, never sends PII) ------------------------
function fire(event: string) {
  try {
    track(event);
  } catch {
    /* analytics is best-effort */
  }
}

// --- Debug options parsed from the URL --------------------------------------
interface DebugOptions {
  debug: boolean;
  speed: number;
  phase: Phase | null;
  reduced: boolean;
}

function parseDebug(): DebugOptions {
  const empty: DebugOptions = {
    debug: false,
    speed: 1,
    phase: null,
    reduced: false,
  };
  if (typeof window === "undefined") return empty;
  const isDev = process.env.NODE_ENV !== "production";
  const q = new URLSearchParams(window.location.search);
  const debug = isDev && q.get("debug") === "true";
  const speedRaw = Number(q.get("speed"));
  const speed = isDev && speedRaw > 0 ? Math.min(speedRaw, 10) : 1;
  const phaseParam = q.get("phase");
  const phase =
    isDev && phaseParam && (PHASE_ORDER as readonly string[]).includes(phaseParam)
      ? (phaseParam as Phase)
      : null;
  const reduced = isDev && q.get("reduced") === "true";
  return { debug, speed, phase, reduced };
}

const PHASE_INSTABILITY: Record<Phase, number> = {
  identification: 0.05,
  alive: 0.05,
  statusChange: 0.5,
  initialReaction: 0.15,
  viral: 0.45,
  content: 1,
  collapse: 0,
  ending: 0,
};

// ============================================================================
// Small presentational pieces
// ============================================================================

function Avatar({
  src,
  size,
  className = "",
  filter,
}: {
  src: string | null;
  size: number;
  className?: string;
  filter?: string;
}) {
  if (src) {
    // A local object URL (blob:) that must stay on-device — deliberately NOT
    // next/image, which would route it through the optimization pipeline.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Uploaded photo of the simulation subject"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "cover", filter }}
      />
    );
  }
  // Abstract fallback avatar — no real identity implied.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Abstract placeholder avatar"
      style={{ filter }}
    >
      <rect width="100" height="100" fill="#0f0f0f" />
      <circle cx="50" cy="38" r="18" fill="#2a2a2a" />
      <path d="M18 92c0-20 14-32 32-32s32 12 32 32Z" fill="#2a2a2a" />
    </svg>
  );
}

function ItemText({ item }: { item: FeedItem }) {
  const text =
    item.corrupted && item.id ? corruptText(item.text, hashId(item.id)) : item.text;
  return <span>{text}</span>;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h >>> 0;
}

function ItemCard({ item, reduced }: { item: FeedItem; reduced: boolean }) {
  const groupClass = `elywyd-card-${item.group}`;
  if (item.kind === "headline") {
    return (
      <div className="elywyd-headline elywyd-fade-in">
        <div className="elywyd-label mb-1">{item.author ?? "PRESS"}</div>
        <div
          className="text-[0.95rem] leading-snug"
          style={{ color: "#eae7e1" }}
        >
          <ItemText item={item} />
        </div>
      </div>
    );
  }
  if (item.kind === "statement") {
    return (
      <div className={`elywyd-card ${groupClass} elywyd-fade-in`}>
        <div className="elywyd-label mb-1">{item.author}</div>
        <div className="elywyd-dim text-[0.85rem] leading-snug italic">
          &ldquo;<ItemText item={item} />&rdquo;
        </div>
        <div className="elywyd-faint text-[0.6rem] mt-1 uppercase tracking-widest">
          Official statement
        </div>
      </div>
    );
  }
  // default: post
  const jitter = item.tone === "chaos" && !reduced ? "elywyd-jitter" : "";
  return (
    <div className={`elywyd-card ${groupClass} elywyd-fade-in ${jitter}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="elywyd-label truncate">
          {item.author ?? item.handle ?? "anonymous"}
        </span>
        {item.duplicate && (
          <span className="elywyd-faint text-[0.55rem] uppercase tracking-widest">
            reposted
          </span>
        )}
      </div>
      <div
        className="text-[0.9rem] leading-snug"
        style={{ color: item.tone === "quiet" ? "#9a968f" : "#d7d3cb" }}
      >
        <ItemText item={item} />
      </div>
      {item.meta && (
        <div className="elywyd-faint text-[0.6rem] mt-1.5 uppercase tracking-widest">
          {item.meta}
        </div>
      )}
    </div>
  );
}

function Counters({ counters }: { counters: Record<string, number> }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5">
        {COUNTER_DEFS.map((def) => (
          <div key={def.key} className="elywyd-card px-2 py-1.5">
            <div className="elywyd-label text-[0.5rem] leading-tight">
              {def.label}
            </div>
            <div
              className="elywyd-mono text-lg font-bold tabular-nums"
              style={{ color: "#f0ede7" }}
            >
              {formatCount(counters[def.key] ?? 0)}
            </div>
          </div>
        ))}
      </div>
      {/* This number is fixed for the entire escalation and never changes. */}
      <div className="elywyd-card mt-1.5 px-2 py-1.5 border-l-2 border-l-[var(--red)]">
        <div className="elywyd-label text-[0.5rem]">
          UNANSWERED MESSAGES WHILE ALIVE
        </div>
        <div className="elywyd-red elywyd-mono text-lg font-bold tabular-nums">
          {UNANSWERED_WHILE_ALIVE}
        </div>
      </div>
    </div>
  );
}

// Deterministic decorative "the photo becomes content" swarm.
function PhotoSwarm({
  src,
  active,
}: {
  src: string | null;
  active: boolean;
}) {
  const specs = useMemo(
    () => [
      { top: "12%", left: "8%", rot: -6, size: 74, filter: "grayscale(1) contrast(1.2)", label: "IN MEMORY" },
      { top: "62%", left: "6%", rot: 5, size: 58, filter: "sepia(0.6) hue-rotate(-20deg)", label: "RIP" },
      { top: "22%", left: "78%", rot: 8, size: 82, filter: "grayscale(1) brightness(0.8)", label: "GONE TOO SOON" },
      { top: "70%", left: "74%", rot: -9, size: 64, filter: "contrast(1.4) saturate(0)", label: "FOREVER" },
      { top: "44%", left: "44%", rot: 3, size: 52, filter: "invert(0.15) grayscale(1)", label: "" },
    ],
    [],
  );
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {specs.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            transform: `rotate(${s.rot}deg)`,
            opacity: 0.14,
          }}
        >
          <div className="border border-[#222] p-1 bg-black">
            <Avatar src={src} size={s.size} filter={s.filter} />
            {s.label && (
              <div className="elywyd-label text-[0.45rem] text-center mt-0.5">
                {s.label}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export default function Experience() {
  const [screen, setScreen] = useState<"entry" | "sim">("entry");
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);

  const debug = useMemo(parseDebug, []);
  const reduced = systemReduced || debug.reduced;

  const audioRef = useRef<SimAudio | null>(null);
  const skippedRef = useRef(false);
  const audioAnnouncedRef = useRef(false);
  const pageViewedRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);

  const subjectName = name.trim() || DEFAULT_SUBJECT_NAME;

  // --- Reduced motion (system) ----------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // --- Page view (once) ------------------------------------------------------
  useEffect(() => {
    if (pageViewedRef.current) return;
    pageViewedRef.current = true;
    fire(ANALYTICS_EVENTS.pageView);
  }, []);

  // --- Object URL cleanup on unmount ----------------------------------------
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      audioRef.current?.destroy();
    };
  }, []);

  // --- Simulation hook -------------------------------------------------------
  const sim = useSimulation({
    seed: 20260803,
    speed: debug.speed,
    startPhase: debug.phase,
    onPhaseChange: (p) => {
      audioRef.current?.setPhase(p);
    },
    onReveal: () => {
      audioRef.current?.blip(0.6);
    },
    onComplete: () => {
      if (skippedRef.current) return;
      fire(ANALYTICS_EVENTS.completed);
    },
  });

  // --- Photo handling (local only, never uploaded) --------------------------
  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhotoUrl(url);
    // Only a boolean signal is sent — never the image, name, or metadata.
    fire(ANALYTICS_EVENTS.photoSelected);
  }, []);

  const clearPhoto = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPhotoUrl(null);
  }, []);

  // --- Audio -----------------------------------------------------------------
  const ensureAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new SimAudio();
    if (!audioRef.current.isStarted) audioRef.current.start();
    audioRef.current.setMuted(muted);
    if (!muted && !audioAnnouncedRef.current) {
      audioAnnouncedRef.current = true;
      fire(ANALYTICS_EVENTS.audioEnabled);
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      const a = audioRef.current;
      if (a) {
        a.setMuted(next);
        if (!next && !a.isStarted) a.start();
      }
      if (!next && !audioAnnouncedRef.current) {
        audioAnnouncedRef.current = true;
        fire(ANALYTICS_EVENTS.audioEnabled);
      }
      return next;
    });
  }, []);

  // --- Controls --------------------------------------------------------------
  const handleBegin = useCallback(() => {
    skippedRef.current = false;
    ensureAudio();
    fire(ANALYTICS_EVENTS.started);
    setScreen("sim");
    sim.start();
  }, [ensureAudio, sim]);

  const handleSkip = useCallback(() => {
    skippedRef.current = true;
    fire(ANALYTICS_EVENTS.skipped);
    sim.skip();
  }, [sim]);

  const handleReplay = useCallback(() => {
    skippedRef.current = false;
    fire(ANALYTICS_EVENTS.replayed);
    audioRef.current?.setPhase("identification");
    sim.replay();
  }, [sim]);

  const handlePresave = useCallback(() => {
    fire(ANALYTICS_EVENTS.presaveClicked);
  }, []);

  const handleShare = useCallback(async () => {
    fire(ANALYTICS_EVENTS.shareClicked);
    const shareData = {
      title: "Everybody Loves You When You're Dead",
      text: SHARE_TEXT,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${SHARE_TEXT} ${shareData.url}`);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      /* user cancelled or unsupported — no-op */
    }
  }, []);

  const [shareCopied, setShareCopied] = useState(false);

  // Debug: jump to a phase mid-run.
  const jumpTo = useCallback(
    (p: Phase) => {
      skippedRef.current = false;
      if (screen !== "sim") setScreen("sim");
      ensureAudio();
      if (p === "ending") sim.skip();
      else sim.start(p);
    },
    [screen, ensureAudio, sim],
  );

  const instability = PHASE_INSTABILITY[sim.phase] ?? 0;
  const deceased =
    sim.phase !== "identification" &&
    sim.phase !== "alive" &&
    sim.status !== "idle";

  return (
    <div
      className="elywyd elywyd-mono"
      data-reduced={reduced ? "true" : "false"}
      style={
        { ["--instability" as string]: String(instability) } as React.CSSProperties
      }
    >
      {/* Screen-reader context: this experience is fictional. */}
      <p className="sr-only">
        This is a fictional interactive art piece about online mourning and
        performative grief. It depicts a made-up profile changing status from
        alive to deceased. No real person is involved, and your uploaded photo
        never leaves your device.
      </p>

      {/* Effect overlays */}
      <div className="elywyd-noise" aria-hidden />
      <div className="elywyd-tracking" aria-hidden />
      <div className="elywyd-scanlines" aria-hidden />
      <div className="elywyd-vignette" aria-hidden />

      {/* Controls (skip / mute) — reachable one-handed, top-right. */}
      {screen === "sim" && sim.status === "running" && (
        <div
          className="absolute z-[70] flex gap-1.5"
          style={{
            top: "calc(env(safe-area-inset-top) + 0.5rem)",
            right: "calc(env(safe-area-inset-right) + 0.5rem)",
          }}
        >
          <button
            className="elywyd-chip"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? "SOUND OFF" : "SOUND ON"}
          </button>
          <button
            className="elywyd-chip"
            onClick={handleSkip}
            aria-label="Skip to the end"
          >
            SKIP ▸▸
          </button>
        </div>
      )}

      {/* ---------------- ENTRY SCREEN ---------------- */}
      {screen === "entry" && (
        <EntryScreen
          name={name}
          setName={setName}
          photoUrl={photoUrl}
          onPhoto={handlePhoto}
          onClearPhoto={clearPhoto}
          onBegin={handleBegin}
        />
      )}

      {/* ---------------- SIMULATION ---------------- */}
      {screen === "sim" && sim.status !== "ending" && (
        <SimStage
          phase={sim.phase}
          items={sim.items}
          counters={sim.counters}
          elapsed={sim.elapsed}
          photoUrl={photoUrl}
          subjectName={subjectName}
          deceased={deceased}
          reduced={reduced}
        />
      )}

      {/* ---------------- ENDING ---------------- */}
      {screen === "sim" && sim.status === "ending" && (
        <EndingScreen
          reduced={reduced}
          onPresave={handlePresave}
          onReplay={handleReplay}
          onShare={handleShare}
          shareCopied={shareCopied}
        />
      )}

      {/* ---------------- DEBUG PANEL (dev + ?debug=true) ---------------- */}
      {debug.debug && (
        <DebugPanel
          phase={sim.phase}
          status={sim.status}
          elapsed={sim.elapsed}
          paused={sim.paused}
          speed={debug.speed}
          reduced={reduced}
          onJump={jumpTo}
          onTogglePause={sim.togglePause}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}

// ============================================================================
// Entry screen
// ============================================================================

function EntryScreen({
  name,
  setName,
  photoUrl,
  onPhoto,
  onClearPhoto,
  onBegin,
}: {
  name: string;
  setName: (v: string) => void;
  photoUrl: string | null;
  onPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPhoto: () => void;
  onBegin: () => void;
}) {
  return (
    <div className="elywyd-stage z-10 items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md px-5 py-8 flex flex-col gap-6">
        <header className="text-center">
          <h1
            className="elywyd-ending-title text-2xl sm:text-3xl elywyd-rgb"
            data-glitch="on"
          >
            Posthumous
            <br />
            Attention Simulator
          </h1>
          <p className="elywyd-dim text-sm mt-3 leading-relaxed">
            See how much everyone loves you after you&rsquo;re gone.
          </p>
        </header>

        {/* Photo upload — central, mobile-friendly. */}
        <div className="flex flex-col items-center gap-3">
          <label
            htmlFor="elywyd-photo"
            className="relative cursor-pointer group"
            aria-label="Upload a photo of yourself"
          >
            <div className="w-40 h-40 border border-[var(--line)] bg-[#0a0a0a] flex items-center justify-center overflow-hidden elywyd-flicker">
              {photoUrl ? (
                <Avatar src={photoUrl} size={160} className="w-full h-full" />
              ) : (
                <div className="text-center px-3">
                  <div className="text-3xl elywyd-dim">＋</div>
                  <div className="elywyd-label mt-1">TAP TO ADD PHOTO</div>
                </div>
              )}
            </div>
          </label>
          <input
            id="elywyd-photo"
            type="file"
            accept="image/*"
            onChange={onPhoto}
            className="sr-only"
          />
          {photoUrl && (
            <button
              type="button"
              onClick={onClearPhoto}
              className="elywyd-chip"
              aria-label="Remove uploaded photo"
            >
              REMOVE PHOTO
            </button>
          )}
          <p className="elywyd-faint text-[0.62rem] text-center leading-relaxed uppercase tracking-widest">
            Your photo stays on your device. It is never uploaded, stored, or
            analyzed. Optional.
          </p>
        </div>

        {/* Optional name */}
        <div>
          <label htmlFor="elywyd-name" className="elywyd-label block mb-1.5">
            First name (optional)
          </label>
          <input
            id="elywyd-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="THE SUBJECT"
            autoComplete="off"
            className="elywyd-input"
          />
        </div>

        <button className="elywyd-btn elywyd-btn-primary text-base" onClick={onBegin}>
          Begin Simulation
        </button>

        <p className="elywyd-faint text-[0.62rem] text-center leading-relaxed">
          Content note: fictional simulation involving death and online
          mourning.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Simulation stage
// ============================================================================

function AutoFeed({
  items,
  reduced,
  filter,
  maxVisible = 6,
}: {
  items: FeedItem[];
  reduced: boolean;
  filter?: (i: FeedItem) => boolean;
  // Only ever render a rolling window of the most recent items, so the feed
  // occupies a bounded region instead of growing into a full-screen wall
  // (critical on small phones) — and keeps the DOM light during the chaos.
  maxVisible?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const all = filter ? items.filter(filter) : items;
  const shown = all.slice(Math.max(0, all.length - maxVisible));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [shown.length, reduced]);
  return (
    <div ref={ref} className="elywyd-scroll elywyd-feed-mask px-3 py-3 space-y-2">
      {shown.map((item) => (
        <ItemCard key={item.id} item={item} reduced={reduced} />
      ))}
    </div>
  );
}

function SimStage({
  phase,
  items,
  counters,
  elapsed,
  photoUrl,
  subjectName,
  deceased,
  reduced,
}: {
  phase: Phase;
  items: FeedItem[];
  counters: Record<string, number>;
  elapsed: number;
  photoUrl: string | null;
  subjectName: string;
  deceased: boolean;
  reduced: boolean;
}) {
  const idWin = PHASE_WINDOWS.find((w) => w.phase === "identification")!;
  // Spread the terminal lines across ~55% of the phase, leaving the rest to
  // hold on the revealed profile + STATUS: ALIVE.
  const lineInterval =
    ((idWin.end - idWin.start) * 0.55) / TERMINAL_LINES.length;
  const linesShown =
    phase === "identification"
      ? Math.min(
          TERMINAL_LINES.length,
          Math.max(0, Math.floor((elapsed - idWin.start) / lineInterval) + 1),
        )
      : TERMINAL_LINES.length;

  const showEscalation =
    phase === "initialReaction" || phase === "viral" || phase === "content";
  const chaos = phase === "content";

  // ---- Identification ----
  if (phase === "identification") {
    return (
      <div className="elywyd-stage z-10 items-center justify-center">
        <div className="w-full max-w-md px-6 flex flex-col items-center gap-5">
          <div className="w-full space-y-1.5" role="status" aria-live="polite">
            {TERMINAL_LINES.slice(0, linesShown).map((line, i) => (
              <div key={i} className="elywyd-dim text-sm elywyd-fade-in">
                <span className="elywyd-red mr-2">&gt;</span>
                {line}
              </div>
            ))}
          </div>
          {linesShown >= TERMINAL_LINES.length && (
            <div className="flex flex-col items-center gap-3 elywyd-fade-in">
              <div className="border border-[var(--line)] p-1 bg-black elywyd-flicker">
                <Avatar src={photoUrl} size={120} />
              </div>
              <div className="text-lg tracking-widest uppercase">{subjectName}</div>
              <div className="elywyd-label">
                STATUS:{" "}
                <span style={{ color: "#7fdf8f" }}>ALIVE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Status change interrupt ----
  if (phase === "statusChange") {
    return (
      <div className="elywyd-stage z-10 items-center justify-center">
        <div className="w-full max-w-md px-6 text-center flex flex-col items-center gap-4">
          <div className="elywyd-red text-sm tracking-[0.3em] elywyd-blink">
            {STATUS_CHANGE.interrupt}
          </div>
          <div className="elywyd-dim text-xs tracking-[0.25em]">
            {STATUS_CHANGE.changed}
          </div>
          <div
            className="elywyd-slam text-2xl sm:text-3xl font-bold tracking-widest my-2"
            aria-live="assertive"
          >
            <span className="elywyd-faint line-through">
              {STATUS_CHANGE.from}
            </span>
            <span className="elywyd-red mx-3">→</span>
            <span style={{ color: "#f0ede7" }}>{STATUS_CHANGE.to}</span>
          </div>
          <div className="space-y-1">
            {STATUS_CHANGE.details.map((d) => (
              <div key={d} className="elywyd-faint text-[0.7rem] tracking-widest">
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Collapse ----
  if (phase === "collapse") {
    return (
      <div className="elywyd-stage z-10 items-center justify-center">
        <div className="w-full max-w-sm px-6">
          <div className="elywyd-card elywyd-fade-in">
            <div className="elywyd-label mb-2">{subjectName}</div>
            <div className="text-base" style={{ color: "#d7d3cb" }}>
              {COLLAPSE_MESSAGE.text}
            </div>
            <div className="mt-3 space-y-0.5">
              {COLLAPSE_MESSAGE.reactions.map((r) => (
                <div
                  key={r}
                  className="elywyd-faint text-[0.65rem] uppercase tracking-widest"
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Alive & escalation (feed layouts) ----
  return (
    <div className="elywyd-stage z-10">
      {/* Header: persistent profile + status */}
      <header
        className="flex items-center gap-3 px-3 py-2 border-b border-[var(--line)] bg-black/60 backdrop-blur-[1px]"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
      >
        <div className={`border p-0.5 bg-black ${deceased ? "border-[var(--red-deep)]" : "border-[var(--line)]"}`}>
          <Avatar
            src={photoUrl}
            size={40}
            filter={deceased ? "grayscale(0.7)" : undefined}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm truncate uppercase tracking-widest">
            {subjectName}
          </div>
          <div className="elywyd-label text-[0.55rem]">
            STATUS:{" "}
            {deceased ? (
              <span className="elywyd-red">DECEASED</span>
            ) : (
              <span style={{ color: "#7fdf8f" }}>ALIVE</span>
            )}
          </div>
        </div>
      </header>

      {phase === "alive" ? (
        // ALIVE: quiet feed + restrained metrics
        <div className="flex-1 min-h-0 flex flex-col">
          <AutoFeed items={items} reduced={reduced} maxVisible={4} />
          <div className="px-3 py-2 border-t border-[var(--line)] grid grid-cols-2 gap-1.5">
            {ALIVE_METRICS.map((m) => (
              <div key={m.label} className="flex items-baseline justify-between">
                <span className="elywyd-label text-[0.5rem]">{m.label}</span>
                <span className="elywyd-dim tabular-nums">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ESCALATION: mobile single feed; desktop multi-panel
        <div className="flex-1 min-h-0 relative">
          <PhotoSwarm src={photoUrl} active={chaos && !reduced} />

          {/* Mobile feed */}
          <div className="md:hidden h-full flex flex-col relative z-10">
            <div className="flex-1 min-h-0">
              <AutoFeed items={items} reduced={reduced} maxVisible={5} />
            </div>
            {showEscalation && (
              <div className="px-3 py-2 border-t border-[var(--line)] bg-black/70">
                <Counters counters={counters} />
              </div>
            )}
          </div>

          {/* Desktop multi-panel */}
          <div className="hidden md:grid h-full grid-cols-[1fr_1.4fr_1fr] gap-0 relative z-10">
            <aside className="border-r border-[var(--line)] overflow-hidden flex flex-col">
              <div className="elywyd-label px-3 py-2 border-b border-[var(--line)]">
                STATEMENTS
              </div>
              <AutoFeed
                items={items}
                reduced={reduced}
                maxVisible={8}
                filter={(i) => i.kind === "statement" || i.group === "institutional"}
              />
            </aside>
            <section className="overflow-hidden flex flex-col">
              <AutoFeed
                items={items}
                reduced={reduced}
                maxVisible={10}
                filter={(i) => i.kind === "post"}
              />
            </section>
            <aside className="border-l border-[var(--line)] overflow-hidden flex flex-col">
              <div className="elywyd-label px-3 py-2 border-b border-[var(--line)]">
                HEADLINES
              </div>
              <AutoFeed
                items={items}
                reduced={reduced}
                maxVisible={7}
                filter={(i) => i.kind === "headline"}
              />
              {showEscalation && (
                <div className="px-3 py-2 border-t border-[var(--line)]">
                  <Counters counters={counters} />
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Ending
// ============================================================================

function EndingScreen({
  reduced,
  onPresave,
  onReplay,
  onShare,
  shareCopied,
}: {
  reduced: boolean;
  onPresave: () => void;
  onReplay: () => void;
  onShare: () => void;
  shareCopied: boolean;
}) {
  // Staged reveal of the closing beats (collapses to instant under reduced motion).
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const steps = reduced ? [0, 0, 0, 0] : [400, 1600, 2900, 4200];
    const timers = steps.map((delay, i) =>
      window.setTimeout(() => setStage((s) => Math.max(s, i + 1)), delay),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  return (
    <div className="elywyd-stage z-10 items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md px-6 py-10 flex flex-col items-center text-center gap-5">
        {stage >= 1 && (
          <p className="elywyd-dim text-sm elywyd-fade-in">{ENDING.beat1}</p>
        )}
        {stage >= 2 && (
          <p className="elywyd-dim text-sm elywyd-fade-in">{ENDING.beat2}</p>
        )}
        {stage >= 3 && (
          <h2 className="elywyd-ending-title text-2xl sm:text-3xl leading-tight elywyd-fade-in">
            {ENDING.title}
          </h2>
        )}
        {stage >= 4 && (
          <div className="w-full flex flex-col gap-3 mt-2 elywyd-fade-in">
            <a
              href={PRESAVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onPresave}
              className="elywyd-btn elywyd-btn-primary text-lg py-4"
            >
              {ENDING.primaryCta}
            </a>
            <p className="elywyd-dim text-xs">{ENDING.supporting}</p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={onShare}
                className="elywyd-btn elywyd-btn-ghost flex-1 text-xs"
              >
                {shareCopied ? "COPIED ✓" : "SHARE"}
              </button>
              <button
                onClick={onReplay}
                className="elywyd-btn elywyd-btn-ghost flex-1 text-xs"
              >
                REPLAY
              </button>
            </div>

            <a
              href={HOME_URL}
              className="elywyd-faint text-[0.6rem] uppercase tracking-widest mt-3 hover:text-[var(--ink)]"
            >
              &larr; the slores
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Debug panel (dev only)
// ============================================================================

function DebugPanel({
  phase,
  status,
  elapsed,
  paused,
  speed,
  reduced,
  onJump,
  onTogglePause,
  onReplay,
}: {
  phase: Phase;
  status: string;
  elapsed: number;
  paused: boolean;
  speed: number;
  reduced: boolean;
  onJump: (p: Phase) => void;
  onTogglePause: () => void;
  onReplay: () => void;
}) {
  return (
    <div
      className="absolute z-[80] bottom-2 left-2 right-2 md:right-auto md:w-72 border border-[var(--red-deep)] bg-black/90 p-2 text-[0.6rem] elywyd-mono"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-between mb-1 elywyd-red">
        <span>DEBUG</span>
        <span>
          {phase} · {status} · {(elapsed / 1000).toFixed(1)}s · x{speed}
          {reduced ? " · RM" : ""}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1 mb-1">
        {PHASE_ORDER.map((p) => (
          <button
            key={p}
            onClick={() => onJump(p)}
            className="elywyd-chip !min-h-0 !min-w-0 py-1 px-1 text-[0.5rem]"
          >
            {p.slice(0, 5)}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        <button onClick={onTogglePause} className="elywyd-chip flex-1 !min-h-0 py-1">
          {paused ? "RESUME" : "PAUSE"}
        </button>
        <button onClick={onReplay} className="elywyd-chip flex-1 !min-h-0 py-1">
          RESTART
        </button>
      </div>
    </div>
  );
}
