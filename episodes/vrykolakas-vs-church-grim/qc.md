# QC · vrykolakas-vs-church-grim · DRAFT v0 (placeholder art + synthetic audio)

Build: `bash episodes/vrykolakas-vs-church-grim/build.sh` (from any directory) -> `build/vrykolakas-vs-church-grim-draft.mp4`
(copy in `preview/`). script.md untouched.

## Technical checks
| Check | Result |
|---|---|
| Duration (ffprobe) | 102.00 s (target 95-105) OK |
| Format | 1080x1920, 30 fps, H.264 + AAC, 13.4 MB |
| Integrated loudness (ebur128) | -14.0 LUFS (LRA 0.5), target -14 OK. Note: no voice yet; bed drone + SFX were compressed/limited to reach it. Must be re-checked with the real voice. |
| Contact sheet | `preview/contact-sheet.png` (4x3, one frame every ~8.5 s) |
| Captions | ASS at y = 70% (1344 px of 1920), font 92: inside 65-80% band, centred, clear of the right column and bottom 15%. Spin name cards sit at 15-36%, choice panels end at 63%. Verified on frames. |

## Timing is ESTIMATED (no voice.mp3)
Captions use a per-section window table inside build.sh ("SECTION WINDOWS", words spread evenly in each window), aligned with
the script timestamps (hook 0.4-2.9, spin1 3.7-5.2, spin2 6.7-8.2 ... CTA 95.2-101.8). When `voice.mp3` is placed in the
episode folder, build.sh automatically switches to voice_fx -> transcribe_words -> real word timings; scene durations
(40 scenes, 102 s) then need a pass to match the real voice length.

## Dual Spin structure (timeline)
0-3 hook card | 3-6 spin 1 (4 blurred reel frames x0.5 s panning up, then lock 1 s with flash + "SUBJECT IDENTIFIED / VRYKOLAKAS / THE GREEK REVENANT") |
6-9 spin 2 (same, "YOUR GUARDIAN / THE CHURCH GRIM / THE BLACK DOG OF THE GRAVEYARD") | HUD "DUAL SPIN · VRYKOLAKAS vs CHURCH GRIM", clock 2:40 AM -> 3:33 AM
(5:30 AM in ending B dawn) | 16-26 grandma + 3 rule cards | 37.5-41 THE TRICK card | 41-58 escalation with GARLIC meter (70% -> 50% -> 20%) |
58-66 choice A/B, countdown 5..0 (1.5 s + 5 x 1.3 s) | 66-77 ending A, stamp "YOU CHOSE A", "COME OUT." | 77-95 ending B, stamp "YOU CHOSE B" | 95-102 CTA "DID YOU CHOOSE RIGHT?".

## Placeholders still to replace
- ALL scene art (flat colour + label) in build/scenes: 19 images of shotlist.md (hook-hand, spin1/spin2 reel + lit cell, island-house, bedroom,
  grandma, door-knock, legend, grim-wall, grim-growls, grim-lunges, nikos-latch, choice split-screen, end-a-latch, end-a-howl,
  end-b-window, end-b-between, end-b-dawn, end-b-grandma, CTA bg). Spin reel is a stacked static image with fake pan (no real slot-wheel animation).
- Spin name cards, GARLIC meter and clock are drawn in build.sh (Pillow), not in tools/ (no make_cards kind for them yet); the GARLIC meter is baked into 3 scene images.
- Audio: all SFX/music are synthetic (ratchet, clunk, bell, knock, whisper, growl, heartbeat, latch, howl, off-note), SFX peak-limited. No voice.
- Hook "rewind" is only a noise whoosh + flash; the "0.7 s flash" and "Rewind to the choice" before ending B are not animated.
- Clock does not flash red at the freeze (3:33); render.py has no such option.
- Choice card (tools/make_cards.py): countdown circle overlaps the A/B panel text slightly (same as ma-da demo layout); not changed.
## Licences
02-assets.md does not exist for this episode: no licensed assets used; fonts from fonts/ or system fallback (see tools/common.py), everything generated. Real art/music/SFX/voice still need licence entries.
