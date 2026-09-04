# /elywyd — "Everybody Loves You When You're Dead"

A standalone, mobile-first posthumous **attention simulator** for the single.
The visitor uploads a photo, is marked alive (and ignored), then marked
deceased — at which point the internet suddenly floods with tributes,
statements, headlines, and merch. It ends on the original ignored message and a
pre-save CTA.

Route: **`/elywyd`** (noindex). It renders with none of the site's normal
chrome (bypassed in `src/app/components/LayoutClientWrapper.tsx`).

## File map

| File | Responsibility |
| --- | --- |
| `config.ts` | **All** copy, phase durations, pre-save URL, analytics event names |
| `simulation.ts` | Pure, deterministic core: seeded PRNG, timeline builder, counters, corruption |
| `useSimulation.ts` | React hook — one `requestAnimationFrame` clock that reveals timeline events |
| `audio.ts` | Optional WebAudio ambience/blips + optional instrumental slot |
| `Experience.tsx` | UI + wiring (photo, analytics, reduced motion, controls, debug) |
| `elywyd.css` | Scoped CRT / scanline / VHS / glitch styling (namespaced under `.elywyd`) |
| `page.tsx` / `layout.tsx` | Route entry + metadata |

## How to change the pre-save URL

Edit one value in `config.ts`:

```ts
export const PRESAVE_URL = "[INSERT_PRE_SAVE_URL]"; // ← put the live link here
```

The CTA opens it via the site's normal external-link behavior
(`target="_blank" rel="noopener noreferrer"`).

## How to edit simulation copy

Everything on screen is data in `config.ts` — nothing is hard-coded in
components. Edit the relevant array/object:

- Alive messages: `ALIVE_MESSAGES` (index `0` is reused verbatim at the ending
  collapse — keep it in sync with `COLLAPSE_MESSAGE`).
- Tributes: `INITIAL_REACTIONS`, `VIRAL_PERSONAL`, `VIRAL_PUBLIC`,
  `VIRAL_INSTITUTIONAL`, `VIRAL_COMMERCIAL`.
- Chaos posts: `CONTENT_POSTS`. Headlines: `HEADLINES`.
- Attention counters: `COUNTERS` (label + target). The fixed
  `UNANSWERED_WHILE_ALIVE` never changes during the run.
- Fictional authors/outlets/brands/handles: the `*_NAMES` / `*_HANDLES` arrays.
- Status-change + ending copy: `STATUS_CHANGE`, `ENDING`.

## How to adjust timings

All phase durations (ms) are in `config.ts`:

```ts
export const PHASE_DURATIONS = {
  identification: 3000,
  alive: 7500,
  statusChange: 3000,
  initialReaction: 9000,
  viral: 14000,
  content: 11000,
  collapse: 4000,
  ending: 0, // terminal, ignored
};
```

Total run ≈ 51s + terminal ending. Phase boundaries are derived automatically,
so changing any number re-paces the whole experience.

## Where to add audio assets

`public/elywyd/audio/` — drop `instrumental.mp3` (see that folder's README).
The path is `AUDIO.instrumentalSrc` in `config.ts`. Missing/broken audio
degrades gracefully to synthesized ambience.

## How photo privacy is handled

- The image is read **only** via `URL.createObjectURL` — a local browser
  object URL. It is never uploaded, never sent to analytics, never persisted.
- No facial recognition, no metadata inspection.
- The object URL is revoked on replacement and on unmount.
- It does not survive a refresh (state is in-memory only).
- If no photo is provided, an abstract SVG avatar is used. If no name is
  entered, the subject is `THE SUBJECT`.

## How to use development controls

Only active when `NODE_ENV !== "production"`.

Query params:

- `/elywyd?debug=true` — on-screen debug panel (jump to any phase, pause,
  restart) plus a live phase/elapsed HUD.
- `/elywyd?speed=3` — run the timeline at 3× (clamped to 10×).
- `/elywyd?phase=viral` — start the run at a given phase after pressing Begin.
- `/elywyd?reduced=true` — preview the reduced-motion variant.

These can be combined, e.g. `/elywyd?debug=true&speed=4&phase=content`.

## Accessibility & motion

- Full `prefers-reduced-motion` support (and the `?reduced=true` preview):
  glitch/noise/jitter/flicker are disabled and reveals collapse to discrete
  fades.
- Skip, mute, and replay are semantic `<button>`s with labels and visible
  focus rings. No hover-only interactions.
- A visually-hidden paragraph tells screen readers the piece is fictional and
  that the photo stays on device. Notifications are **not** individually
  announced via `aria-live`; only the identification status and the
  status-change moment are announced.
- Inputs use 16px text to avoid iOS zoom; layout respects `safe-area-inset-*`.

## Determinism / testing

The timeline is a pure function of `(seed)` — `buildTimeline(seed)` in
`simulation.ts` returns the identical, ordered event list every time, so the
whole run is reproducible and unit-testable without React or a DOM. The seed is
fixed in `Experience.tsx` (`useSimulation({ seed: 20260803 })`); replay reuses
it, so replays are identical. This project has no test runner configured; if one
is added later, `simulation.ts` (PRNG, `buildTimeline`, `computePhaseWindows`,
`counterValueAt`, `formatCount`, `corruptText`) is the pure surface to target.

## Analytics

Uses the site's existing provider (Vercel Analytics `track()`). Events:
`elywyd_page_view`, `elywyd_photo_selected`, `elywyd_simulation_started`,
`elywyd_simulation_completed`, `elywyd_simulation_skipped`, `elywyd_replayed`,
`elywyd_presave_clicked`, `elywyd_audio_enabled`, `elywyd_share_clicked`.
No image, name, metadata, or other PII is ever sent — event names only.
