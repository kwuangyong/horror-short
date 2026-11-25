# audio-anim/ - apep-vs-thor (#003), script-anim v1 + Boss edit (~215 words incl. intros/dialogue). All synthesized, no licences.
Durations: voice_dark.wav 75.07 s, music.wav 76.81 s, **mix-test.mp3 76.85 s, -14.2 LUFS integrated, LRA 4.7, peak -2.7 dBFS (no clipping)**. Hook 0-3 s has no narration (first word 4.40).
Voices (clips/u_NN.wav, one per sentence, placed on shot anchors by post_voice.py; gaps 0.15-0.2 s inside a line, a line never starts before its anchor):
- Narrator: Christopher +40% -10Hz -> tools/voice_fx.sh deep. Story starts 17.40 s.
- Apep (Guy +34% -20Hz): 4 layers = main -3 st, whisper layer +40 ms (breathy, HP 2.2k), hiss/rasp layer (HP 5.2k, crushed, sibilant boost), -7 st shadow; cold echo. Whisper "I always come back." (Guy -12%): dry, close, no reverb, 73.05-74.41 s.
- Thor (Ryan +38% -22Hz): -3 st, boosted lows, hall reverb 90-620 ms + brown-noise thunder rumble under it. Hoarse lines (Ryan -8%): -2 st, light grit, short room, no thunder.
- Kid (Ana -8%, +2 st, whisper EQ): "...Okay." 69.88 s.
Sections (sections.json): hook 0 | split_roll 3.0 | intro_apep 4.40-9.38 | intro_thor 10.90-16.37 | story 17.40 | fight 28.54 | totality 44.91 | beams 48.50 | finale 55.87 | dawn 59.60 | cliffhanger 70.62 | whisper 73.05.
Anchors (make_voice.py ANCH) = shot start - 0.2 s; lines run late (up to ~2 s) at 20-31 s and 62-70 s because narration is denser than the 1.3 s/shot grid there; timeline must cut on words.json.
## Cue table (music.wav, make_music.py; times from words.json or script)
| t (s) | cue |
|---|---|
| 0.0 | hook impact + rumble, sparks crackle on Mjolnir, charge flicker 1.0 |
| 2.0 / 2.55 | WHO SURVIVES slam + thunder / reverse-whoosh rewind |
| 3.0-4.1 | ratchet while split-roll spins; 4.10 lock MONSTER (boom + tick + impact); Apep intro bed hiss/rumble |
| 9.4-10.1 / 10.1 | ratchet; lock GUARDIAN; thunder bed under Thor intro 10.7 |
| 16.1 | VS slam + sub boom |
| 5.2-9.3, 11.2-16.0 | 155 BPM war drums (light) under the intros |
| 17.4 / 19.18 | shatter impact into story / hiss on "hiss" |
| 22.23 "rose" | Apep rises: fire burst + earthquake rumble; drums at full from here (grid 155 BPM, rising intensity) |
| 24.2 "thunder" / 25.65 "caught" | thunder crack + impact; block hit; 27.34 "ran" whoosh |
| 30.02 "doubled" | belt power: charge + impact + thunder; 30.75 "hammer" throw whoosh; 31.2 hit on "misses" |
| 32.35 "roared" | deep earthquake rumble 4.2 s + impact; 33.34 "split" burst; 34.15 "buckled" boom; 34.2 orbs whoosh |
| 36.69 "stare" | hypnotic murky throb 150 Hz; hiss on "coils" |
| 41.70 "Venom" | bite impact; sizzle on "burned"; nine stagger thuds from "staggered" |
| 45.86 "totality" | eclipse: sub drop + rumble, drums OUT for 1 bar (1.55 s), reverse whoosh before; 47.41 impact, drums return |
| 48.67 "roared" | plasma charge both sides (rising whine + fizz) to 49.99 |
| 49.99 "chaos" | plasma fire burst + impact; two detuned beam bodies (clash buzz) to 51.3; 50.6 "pushed" whoosh + hit (Apep wins) |
| 54.4 / 55.34 "bait" | ox-head arc whoosh from 55.1; clamp tick on "hooked" |
| 55.87 "lunged" | hiss + boom |
| 57.23 -> 57.86 "blasted" | Thor's lightning charge; fire + impact + thunder; beam bodies; slow-mo dip then crash boom at 59.0 (after "skyward") |
| 61.0 "sunlight" | triumphant swell (major pad rising, bell notes), drums stop |
| 64.4 "shadow" | low gloom rumble returns; hiss after "Okay" |
| 71.7 "dunes" | three slow heartbeats |
| 72.78 | **HARD MUSIC CUT** (after "breathe", before the whisper); 0.27 s of true silence, then 73.05 whisper |
## Rebuild
cd episodes/apep-vs-thor/audio-anim && export HTTPS_PROXY=...; python3 make_voice.py --rate=+40% && python3 post_voice.py && python3 make_music.py && bash mix_test.sh
cd .. && python3 ../../tools/make_captions.py audio-anim/words.json --script script-anim.md --font "Bebas Neue" --size 104 --max-words 4 --max-chars 24 -o audio-anim/captions.ass
Captions: 71 events, no chunk crosses a sentence; none in the hook. Last chunk of a sentence lingers up to ~1.5 s until the next line (e.g. 14.74-16.89). Speaker colours added to tools/make_captions.py (apep violet, thor blue, kid white).
Needs: edge-tts, numpy, scipy, ffmpeg with rubberband.

## v2 (tempo -20%)
94.22 s mix, -14.2 LUFS. `python3 make_voice.py` (default +12%), `python3 post_voice.py` (needs v1/sections.json for silences), `python3 make_music.py` (125 BPM, v1 word hints mapped via v1/words.json), `bash mix_test.sh`. Cues: see cues.json. v1 files in v1/.
