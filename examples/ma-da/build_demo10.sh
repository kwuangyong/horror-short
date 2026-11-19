#!/usr/bin/env bash
# 10-second preview of "The Ma Da": hook -> setting -> empty mat -> wet kid -> A/B countdown
# -> jumpscare. Uses code-drawn flat art (draw_scenes.py) and synthetic audio, no voice.
#   bash examples/ma-da/build_demo10.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TOOLS="$HERE/../../tools"
B="$HERE/build"
mkdir -p "$B/cards" "$B/audio"
python3 "$HERE/draw_scenes.py" "$B/art"
C="python3 $TOOLS/make_cards.py"
$C hook   "ONLY 4% CHOOSE RIGHT" --bg "$B/art/wet-kid.png" -o "$B/cards/hook10.png"
$C choice "OPEN THE DOOR" "STAY QUIET, FIND TI" --countdown 3 --bg "$B/art/wet-kid.png" -o "$B/cards/choice10.png"
$C word   "YOUR TURN." -o "$B/cards/end10.png"
# synthetic audio (same as build_demo.sh)
ffmpeg -v error -y -f lavfi -i "anoisesrc=c=brown:a=0.25:d=12" -f lavfi -i "sine=f=55:d=12" \
  -filter_complex "[0]lowpass=f=300[n];[1]volume=0.3,tremolo=f=0.15:d=0.6[s];[n][s]amix=inputs=2:normalize=0" "$B/audio/drone.wav"
ffmpeg -v error -y -f lavfi -i "anoisesrc=c=brown:a=1:d=1.2" -af "lowpass=f=180,afade=t=out:st=0.05:d=1.1,volume=4" "$B/audio/impact.wav"
ffmpeg -v error -y -f lavfi -i "sine=f=48:d=0.12" -af "afade=t=out:st=0:d=0.12,volume=6" "$B/audio/beat.wav"
ffmpeg -v error -y -i "$B/audio/beat.wav" -i "$B/audio/beat.wav" -i "$B/audio/beat.wav" -i "$B/audio/beat.wav" -i "$B/audio/beat.wav" -i "$B/audio/beat.wav" \
  -filter_complex "[1]adelay=180|180[b];[2]adelay=550|550[c];[3]adelay=720|720[d];[4]adelay=1050|1050[e];[5]adelay=1200|1200[f];[0][b][c][d][e][f]amix=inputs=6:normalize=0" "$B/audio/heartbeat.wav"
CAPFONT="$(fc-scan --format '%{family[0]}' "$(python3 -c "import sys; sys.path.insert(0,'$TOOLS'); from common import find_font; print(find_font())")")"
python3 "$TOOLS/make_captions.py" "$HERE/demo10_words.json" --font "$CAPFONT" -o "$B/captions10.ass"
python3 "$TOOLS/render.py" "$HERE/demo10.json"
