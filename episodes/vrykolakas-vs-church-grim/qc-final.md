# QC final - BATTLE SPIN #001 (battle-final.mp4)
- File: build/final/battle-final.mp4 (1080x1920, 30fps); preview/battle-final.mp4 (720p, 6.7 MB); preview/battle-final-contact-sheet.jpg (4x4)
- Duration: 99.20 s (voice 99.13 s). Target 95-105 s: OK
- Loudness: -14.2 LUFS integrated (loudnorm 2-pass gave -14.5, then +0.5 dB + limiter), LRA 2.3 LU, TP about -0.5 dBFS
- Mix: voice_dark.wav + music.wav at x0.11 (about -19 dB, music ~14 dB under voice); SFX baked in music.wav (none added)
- Captions: build/final/captions.ass regenerated with tools/make_captions.py (chunks never cross sentence/line breaks, no dangling the/to/of), y=1344 (70%)
- HUD: 3 bars per script; K.O. KID 20 / GRIM 75 / VRY 0. Clock 2:00 -> 3:30 AM during fight, 5:40 at dawn.
- tools/render.py additions (backward compatible; ma-da demo10 re-run OK): fg parallax layer, shake_win, flash_at, overlays_timed.
## Scenes
| start s | dur s | image |
|---|---|---|
| 0.00 | 3.20 | b-hook-freeze-grim-stuck_bg.png (+fg parallax) |
| 3.19 | 4.00 | kidcard.png |
| 7.20 | 0.47 | spinblur1.png |
| 7.65 | 0.43 | spinblur1.png |
| 8.10 | 1.30 | fighter1.png |
| 9.40 | 0.50 | spinblur2.png |
| 9.90 | 0.50 | spinblur2.png |
| 10.40 | 1.60 | fighter2.png |
| 11.99 | 0.50 | vs_on0.png |
| 12.50 | 0.50 | vs_off1.png |
| 13.00 | 0.53 | vs_on1.png |
| 13.55 | 0.60 | vs_off1.png |
| 14.14 | 2.67 | b-kid-window-firefly.png |
| 16.80 | 4.90 | b-forest-old-graves.png |
| 21.70 | 2.10 | b-grandma-garlic-flashback.png |
| 23.80 | 5.00 | rule.png |
| 28.80 | 2.80 | b-grandma-garlic-flashback.png |
| 31.60 | 3.60 | b-grave-rises.png |
| 35.20 | 2.20 | b-claw-miss-kid-falls.png |
| 37.40 | 2.00 | b-claw-miss-kid-falls.png |
| 39.39 | 5.50 | b-grim-appears-stance_bg.png (+fg parallax) |
| 44.90 | 1.70 | limit.png |
| 46.59 | 1.00 | round1.png |
| 47.60 | 1.50 | b-round1-grim-slams.png |
| 49.10 | 2.60 | b-round1-grim-slams.png |
| 51.70 | 1.00 | round2.png |
| 52.70 | 2.80 | b-round2-thrown-over-wall.png |
| 55.50 | 1.50 | b-round2-thrown-over-wall.png |
| 57.00 | 1.00 | b-round2-grim-stuck.png |
| 58.00 | 3.30 | b-round2-grim-stuck.png |
| 61.30 | 4.33 | b-round2-grim-stuck.png |
| 65.62 | 1.07 | round3.png |
| 66.70 | 1.30 | b-round2-grim-stuck.png |
| 68.00 | 1.60 | b-round3-garlic-crush.png |
| 69.60 | 1.00 | b-round3-garlic-throw.png |
| 70.60 | 2.60 | b-round3-garlic-throw.png |
| 73.20 | 7.10 | b-round3-flashlight-lure_bg.png (+fg parallax) |
| 80.30 | 3.30 | b-round3-grim-pounce_bg.png (+fg parallax) |
| 83.60 | 1.87 | ko.png |
| 85.48 | 6.00 | b-dawn-peace.png |
| 91.48 | 3.30 | b-cliffhanger-soil-moves_bg.png (+fg parallax) |
| 94.77 | 0.53 | black.png |
| 95.30 | 1.10 | cta1.png |
| 96.40 | 1.40 | cta2.png |
| 97.80 | 1.40 | cta3.png |

## Remaining issues
- No art for "kid crawls" / R2 stuck-to-R3: b-round2-grim-stuck reused (zoomed). Spin = blurred pan of spin art (no reel animation).
- Text on VS names slightly clipped by zoom at screen edges. Final true peak about -0.5 dBFS (AAC).
- Art is all code-drawn (no third-party licences). Voice: edge-tts (no licence needed).
