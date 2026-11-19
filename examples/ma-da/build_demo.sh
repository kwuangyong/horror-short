#!/usr/bin/env bash
# Build a full draft of the "Ma Da" short with PLACEHOLDER art and synthetic audio,
# to test the pipeline end to end. Replace build/scenes/*.png with real illustrations and
# the synthetic audio with real SFX for the final video.
# Put your English TTS voice-over at examples/ma-da/voice.mp3 and it will be darkened
# (tools/voice_fx.sh), transcribed and used for perfectly-timed captions.
#
#   bash examples/ma-da/build_demo.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TOOLS="$HERE/../../tools"
B="$HERE/build"
mkdir -p "$B/scenes" "$B/cards" "$B/audio"
FONT="$(python3 -c "import sys; sys.path.insert(0,'$TOOLS'); from common import find_font; print(find_font())")"

# ---------- 1. placeholder scenes (flat colour + label) ----------
ph() {  # name  colour  label
  ffmpeg -v error -y -f lavfi -i "color=c=$2:s=1080x1920" -frames:v 1 \
    -vf "vignette=PI/4,drawtext=fontfile='$FONT':text='$3':fontcolor=white@0.85:fontsize=58:x=(w-tw)/2:y=h*0.35,drawtext=fontfile='$FONT':text='[placeholder - replace with illustration]':fontcolor=white@0.4:fontsize=34:x=(w-tw)/2:y=h*0.35+90" \
    "$B/scenes/$1.png"
}
ph intro        0x2a0d14 "SERIES INTRO · GHOST MAP"
ph house        0x1b2140 "STILT HOUSE · MEKONG · MOON"
ph bedroom      0x2a3159 "WOODEN LOFT · TI ASLEEP"
ph grandpa      0x2a2030 "GRANDPA WITH OIL LAMP"
ph river        0x141a33 "BLACK RIVER · A HEAD RISES"
ph legend       0x3a3f48 "THE LEGEND · HANDS BELOW"
ph water-rising 0x14233a "WATER THROUGH THE FLOOR"
ph footsteps    0x2b1a26 "WET FOOTPRINTS ON THE LADDER"
ph empty-bed    0x3a0f1c "TI’S MAT IS EMPTY"
ph door         0x1d1a20 "KNOCK · KNOCK · KNOCK"
ph wet-child    0x1a2a33 "SOAKING WET KID AT THE DOOR"
ph hug          0x22303a "YOU HOLD HIM TIGHT"
ph drowned-face 0x4a0a12 "SWOLLEN FACE · WHITE EYES"
ph rice-jar     0x2a2418 "TI HIDING IN THE RICE JAR"
ph dawn         0x8a5a2a "SUNRISE · WATER GONE"
ph handprint    0x6a6a70 "WET HANDPRINT · INSIDE"
ph cta          0x111116 "CTA · FOLLOW"

# ---------- 2. infographic cards ----------
C="python3 $TOOLS/make_cards.py"
$C hook  "ONLY 4% CHOOSE RIGHT" --bg "$B/scenes/handprint.png" -o "$B/cards/hook.png"
$C rule  "NEVER ANSWER"       --label "RULE 1" --bg "$B/scenes/grandpa.png" -o "$B/cards/rule1.png"
$C rule  "DON'T OPEN THE DOOR" --label "RULE 2" --bg "$B/scenes/grandpa.png" -o "$B/cards/rule2.png"
$C rule  "TOUCH THEIR HAND"   --label "RULE 3" --bg "$B/scenes/grandpa.png" -o "$B/cards/rule3.png"
$C trick "CALLS YOUR FULL NAME" "IT'S HER" --bg "$B/scenes/legend.png" -o "$B/cards/trick.png"
$C choice "OPEN THE DOOR" "STAY QUIET, FIND TI" --countdown 5 --bg "$B/scenes/door.png" -o "$B/cards/choice.png"
$C stamp "OPEN THE DOOR" "STAY QUIET, FIND TI" --pick A --bg "$B/scenes/door.png" -o "$B/cards/pickA.png"
$C stamp "OPEN THE DOOR" "STAY QUIET, FIND TI" --pick B --bg "$B/scenes/door.png" -o "$B/cards/pickB.png"
$C word  "YOUR TURN." -o "$B/cards/end-a.png"

# ---------- 3. synthetic audio (replace with real music / SFX) ----------
ffmpeg -v error -y -f lavfi -i "anoisesrc=c=brown:a=0.25:d=110" -f lavfi -i "sine=f=55:d=110" \
  -filter_complex "[0]lowpass=f=300[n];[1]volume=0.3,tremolo=f=0.15:d=0.6[s];[n][s]amix=inputs=2:normalize=0" \
  "$B/audio/drone.wav"
ffmpeg -v error -y -f lavfi -i "anoisesrc=c=brown:a=1:d=1.2" \
  -af "lowpass=f=180,afade=t=out:st=0.05:d=1.1,volume=4" "$B/audio/impact.wav"
ffmpeg -v error -y -f lavfi -i "sine=f=48:d=0.12" -af "afade=t=out:st=0:d=0.12,volume=6" "$B/audio/beat.wav"
# heartbeat speeding up over 7 s
python3 - "$B/audio" <<'EOF'
import subprocess, sys
d = sys.argv[1]; t, gap, delays = 0.0, 0.9, []
while t < 7.0:
    delays += [t, t + 0.22]; t += gap; gap = max(0.35, gap * 0.88)
ins = sum((["-i", f"{d}/beat.wav"] for _ in delays), [])
fc = ";".join(f"[{i}]adelay={int(x*1000)}|{int(x*1000)}[b{i}]" for i, x in enumerate(delays))
fc += ";" + "".join(f"[b{i}]" for i in range(len(delays))) + f"amix=inputs={len(delays)}:normalize=0"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, f"{d}/heartbeat.wav"], check=True)
EOF

# ---------- 4. captions ----------
CAPFONT="$(fc-scan --format '%{family[0]}' "$FONT")"
if [ -f "$HERE/voice.mp3" ]; then
  # real voice-over: darken it, transcribe word timings, captions follow the voice exactly
  bash "$TOOLS/voice_fx.sh" "$HERE/voice.mp3" "$B/audio/voice_dark.wav" deep
  python3 "$TOOLS/transcribe_words.py" "$B/audio/voice_dark.wav" --lang en -o "$B/words.json"
  python3 "$TOOLS/make_captions.py" "$B/words.json" --script "$HERE/script.md" --font "$CAPFONT" -o "$B/captions.ass"
  VOICE_ARG=(--voice build/audio/voice_dark.wav)
else
  # no voice yet: spread the narration evenly (draft timing only)
  python3 "$TOOLS/make_captions.py" --script "$HERE/script.md" --duration 100 --offset 0.3 \
    --font "$CAPFONT" -o "$B/captions.ass"
  VOICE_ARG=()
fi

# ---------- 5. render ----------
python3 "$TOOLS/render.py" "$HERE/project.json" "${VOICE_ARG[@]}"
