#!/usr/bin/env bash
# Build the CINEMATIC animated episode (script v5.1): shots + cues from audio-anim/words.json -> frames -> mp4 + mix + burned captions.
#   bash episodes/vrykolakas-vs-church-grim/build-anim-v5.sh [--scale 1]      (needs: node + playwright chromium, ffmpeg)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; TOOLS="$HERE/../../tools"; B="$HERE/build/anim"; AU="$HERE/audio-anim"
mkdir -p "$B" "$HERE/preview"
node "$HERE/anim/make_timeline_v5.js"
# 1. audio: voice + music (SFX baked in), loudnorm 2-pass -14 LUFS (audio-anim/mix_test.sh), trimmed to the video length
bash "$AU/mix_test.sh" >/dev/null
D=$(python3 -c "import json;print(json.load(open('$HERE/anim/timeline-v5.json'))['duration'])")
ffmpeg -v error -y -i "$AU/mix-test.mp3" -t "$D" -af "afade=t=out:st=$(python3 -c "print($D-0.4)"):d=0.4" -ar 48000 "$B/mix-v5.wav"
# 2. frames -> silent video
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline-v5.json" --out "$B/video-v5.mp4" --crf 18 "$@"
# 3. mux + burn captions (audio-anim/captions.ass, centre y=1344 = 70 % height)
ffmpeg -v error -y -i "$B/video-v5.mp4" -i "$B/mix-v5.wav" -vf "subtitles='$AU/captions.ass'" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$B/anim-v5.mp4"
# 4. preview (<15 MB) + 20-frame chronological sheet
ffmpeg -v error -y -i "$B/anim-v5.mp4" -vf scale=608:-2 -c:v libx264 -b:v 780k -maxrate 900k -bufsize 1800k -preset medium -c:a aac -b:a 96k -movflags +faststart "$HERE/preview/anim-v5.mp4"
ffmpeg -v error -y -i "$B/anim-v5.mp4" -vf "fps=20/$D,scale=270:-2,tile=5x4" -frames:v 1 -update 1 -q:v 3 "$HERE/preview/anim-v5-sheet.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$B/anim-v5.mp4"
ffmpeg -hide_banner -i "$B/anim-v5.mp4" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" || true
