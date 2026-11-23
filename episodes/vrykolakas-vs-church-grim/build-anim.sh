#!/usr/bin/env bash
# Build the ANIMATED episode (cutout rigs, tools/anim engine): timeline from audio-anim/words.json -> frames -> mp4 + audio + burned captions.
#   bash episodes/vrykolakas-vs-church-grim/build-anim.sh [--scale 1]      (needs: node + playwright chromium, ffmpeg)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; TOOLS="$HERE/../../tools"; B="$HERE/build/anim"; AU="$HERE/audio-anim"
mkdir -p "$B" "$HERE/preview"
node "$HERE/anim/make_timeline.js"
# 1. audio: voice + music(SFX baked in) -> loudnorm 2-pass -14 LUFS (audio-anim/mix_test.sh), trimmed to the video length
[ -f "$AU/mix-test.mp3" ] || bash "$AU/mix_test.sh"
D=$(python3 -c "import json;print(json.load(open('$HERE/anim/timeline.json'))['duration'])")
ffmpeg -v error -y -i "$AU/mix-test.mp3" -t "$D" -af "afade=t=out:st=$(python3 -c "print($D-0.4)"):d=0.4" -ar 48000 "$B/mix.wav"
# 2. frames -> silent video
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline.json" --out "$B/video.mp4" --crf 18 "$@"
# 3. mux + burn captions (captions.ass already placed at 65-80% height)
ffmpeg -v error -y -i "$B/video.mp4" -i "$B/mix.wav" -vf "subtitles='$AU/captions.ass'" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$B/anim-final.mp4"
# 4. preview (<15 MB) + 16-frame chronological sheet (1 frame / ~6.4 s)
ffmpeg -v error -y -i "$B/anim-final.mp4" -vf scale=608:-2 -c:v libx264 -b:v 780k -maxrate 900k -bufsize 1800k -preset medium -c:a aac -b:a 96k -movflags +faststart "$HERE/preview/anim-final.mp4"
ffmpeg -v error -y -i "$B/anim-final.mp4" -vf "fps=16/$D,scale=270:-2,tile=8x2" -frames:v 1 -update 1 -q:v 3 "$HERE/preview/anim-final-sheet.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$B/anim-final.mp4"
ffmpeg -hide_banner -i "$B/anim-final.mp4" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" || true
