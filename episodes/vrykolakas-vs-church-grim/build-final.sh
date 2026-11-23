#!/usr/bin/env bash
# FINAL build of BATTLE SPIN #001: real art + real voice/music + word-synced captions.
#   bash episodes/vrykolakas-vs-church-grim/build-final.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export HERE TOOLS="$HERE/../../tools" B="$HERE/build/final"
mkdir -p "$B/img" "$HERE/preview"
python3 "$HERE/gen_final.py"            # cards + HUD overlays over real art
python3 "$HERE/gen_final_project.py"    # project-final.json (timings from audio/words.json marks)
python3 "$TOOLS/render.py" "$HERE/project-final.json"
OUT="$B/battle-final.mp4"
# preview (<15 MB) + contact sheet 4x4
ffmpeg -v error -y -i "$OUT" -vf scale=720:-2 -c:v libx264 -crf 27 -preset medium -c:a aac -b:a 96k -movflags +faststart "$HERE/preview/battle-final.mp4"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
ffmpeg -v error -y -i "$OUT" -vf "fps=16/$D,scale=270:-2,tile=4x4" -frames:v 1 -update 1 -q:v 3 "$HERE/preview/battle-final-contact-sheet.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated"
