#!/usr/bin/env bash
# Build episode #003 (APEP vs THOR): timeline from audio-anim/words.json -> check -> mix -> captions -> frames -> mp4 + preview + sheet.
#   bash episodes/apep-vs-thor/build-anim.sh [--scale 1]   (needs node + playwright chromium, ffmpeg, python3, fonts-bebas-neue)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; TOOLS="$HERE/../../tools"; B="$HERE/build/anim"; AU="$HERE/audio-anim"; SLUG=apep-vs-thor
mkdir -p "$B" "$HERE/preview"
node "$HERE/anim/make_timeline.js"
D=$(python3 -c "import json;print(json.load(open('$HERE/anim/timeline.json'))['duration'])")
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline.json" --check                 # must print 180-RULE OK (Apep left, Thor right)
bash "$AU/mix_test.sh" >/dev/null
ffmpeg -v error -y -i "$AU/mix-test.mp3" -t "$D" -af "afade=t=out:st=$(python3 -c "print($D-0.5)"):d=0.5" -ar 48000 "$B/mix.wav"
python3 "$TOOLS/make_captions.py" "$AU/words.json" --script "$HERE/script-anim.md" --font "Bebas Neue" --size 92 --max-words 4 --max-chars 22 -o "$B/captions.ass"
python3 "$TOOLS/anim/captions_dyn.py" "$B/captions.ass" "$HERE/anim/timeline.json" "$B/captions-dyn.ass"
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline.json" --out "$B/video.mp4" --crf 18 "$@"
ffmpeg -v error -y -i "$B/video.mp4" -i "$B/mix.wav" -vf "subtitles='$B/captions-dyn.ass'" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$B/$SLUG.mp4"
ffmpeg -v error -y -i "$B/$SLUG.mp4" -vf scale=608:-2 -c:v libx264 -b:v 780k -maxrate 900k -bufsize 1800k -preset medium -c:a aac -b:a 96k -movflags +faststart "$HERE/preview/$SLUG.mp4"
ffmpeg -v error -y -i "$B/$SLUG.mp4" -vf "fps=20/$D,scale=270:-2,tile=5x4" -frames:v 1 -update 1 -q:v 3 "$HERE/preview/$SLUG-sheet.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$B/$SLUG.mp4"
ffmpeg -hide_banner -i "$B/$SLUG.mp4" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" || true
ls -l "$HERE/preview/$SLUG.mp4"
