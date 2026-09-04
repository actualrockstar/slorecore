# ELYWYD — audio assets

Drop an optional instrumental here to layer it under the simulation's
synthesized ambience.

## Add the song instrumental

1. Export an instrumental (loopable is ideal) as an MP3.
2. Save it in this folder as:

   ```
   public/elywyd/audio/instrumental.mp3
   ```

That's it. The path is read from `AUDIO.instrumentalSrc` in
`src/app/elywyd/config.ts`. To use a different filename or format, edit that
one value.

## Behavior

- No audio plays until the visitor presses **Begin Simulation** (a user
  gesture, required by mobile browsers).
- If this file is missing or fails to load, the experience falls back to the
  built-in synthesized ambience and still works end to end.
- The audio arc: quiet ambience → sparse notification blips → layered
  distortion → **abrupt silence** right before the ending.
- All synthesized sounds are original — no recognizable platform notification
  sounds are used.

The instrumental (when present) pauses automatically at the collapse so the
ending lands in silence.
