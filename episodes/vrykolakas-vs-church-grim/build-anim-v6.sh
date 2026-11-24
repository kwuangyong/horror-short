#!/usr/bin/env bash
# Build the v6 cinematic animated episode: timeline from audio-anim/words.json -> frames -> mp4 + mix + dynamic burned captions.
#   bash episodes/vrykolakas-vs-church-grim/build-anim-v6.sh [--scale 1]     (needs node + playwright chromium, ffmpeg, python3, fonts-bebas-neue)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; TOOLS="$HERE/../../tools"; B="$HERE/build/anim"; AU="$HERE/audio-anim"
mkdir -p "$B" "$HERE/preview"
node "$HERE/anim/make_timeline_v6.js"
D=$(python3 -c "import json;print(json.load(open('$HERE/anim/timeline-v6.json'))['duration'])")
# 0. 180-degree rule check (Vrykolakas screen-left / Grim screen-right in every VERSUS shot)
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline-v6.json" --check
# 1. audio: voice + music (SFX baked in) -> loudnorm 2-pass -14 LUFS (audio-anim/mix_test.sh), trimmed to the video length
bash "$AU/mix_test.sh" >/dev/null
ffmpeg -v error -y -i "$AU/mix-test.mp3" -t "$D" -af "afade=t=out:st=$(python3 -c "print($D-0.5)"):d=0.5" -ar 48000 "$B/mix-v6.wav"
# 2. captions: Bebas Neue (condensed bold) from words.json (speaker colours) + dynamic position (lower band on close-ups)
python3 "$TOOLS/make_captions.py" "$AU/words.json" --script "$HERE/script-anim.md" --font "Bebas Neue" --size 104 --max-words 4 --max-chars 24 -o "$B/captions-v6.ass"
python3 "$TOOLS/anim/captions_dyn.py" "$B/captions-v6.ass" "$HERE/anim/timeline-v6.json" "$B/captions-v6-dyn.ass"
# 3. frames -> silent video
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline-v6.json" --out "$B/video-v6.mp4" --crf 18 "$@"
# 4. mux + burn captions
ffmpeg -v error -y -i "$B/video-v6.mp4" -i "$B/mix-v6.wav" -vf "subtitles='$B/captions-v6-dyn.ass'" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$B/anim-v6.mp4"
# 5. preview (<15 MB) + 20-frame chronological sheet
ffmpeg -v error -y -i "$B/anim-v6.mp4" -vf scale=608:-2 -c:v libx264 -b:v 780k -maxrate 900k -bufsize 1800k -preset medium -c:a aac -b:a 96k -movflags +faststart "$HERE/preview/anim-v6.mp4"
ffmpeg -v error -y -i "$B/anim-v6.mp4" -vf "fps=20/$D,scale=270:-2,tile=5x4" -frames:v 1 -update 1 -q:v 3 "$HERE/preview/anim-v6-sheet.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$B/anim-v6.mp4"
ffmpeg -hide_banner -i "$B/anim-v6.mp4" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" || true
