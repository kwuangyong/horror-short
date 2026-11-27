#!/usr/bin/env bash
# Build episode #005 (SCP-682 vs PEGASUS): timeline -> check -> validate -> mix -> captions -> 30 FPS render -> mp4 + web-1080p (<20MB) + preview + sheet.
#   bash episodes/scp682-vs-pegasus/build-anim.sh [--scale 1]
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; TOOLS="$HERE/../../tools"; B="$HERE/build/anim"; AU="$HERE/audio-anim"; SLUG=scp682-vs-pegasus
mkdir -p "$B" "$HERE/preview"
node "$HERE/anim/make_timeline.js"
D=$(python3 -c "import json;print(json.load(open('$HERE/anim/timeline.json'))['duration'])")
node "$TOOLS/anim/validate.js" "$HERE/anim/timeline.json" --script "$HERE/script-anim.md"
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline.json" --check
bash "$AU/mix_test.sh" >/dev/null
ffmpeg -v error -y -i "$AU/mix-test.mp3" -t "$D" -af "afade=t=out:st=$(python3 -c "print($D-0.5)"):d=0.5" -ar 48000 "$B/mix.wav"
python3 "$TOOLS/make_captions.py" "$AU/words.json" --script "$HERE/script-anim.md" --font "Bebas Neue" --size 92 --max-words 4 --max-chars 22 -o "$B/captions.ass"
CUTS=$(python3 -c "import json;t=json.load(open('$HERE/anim/timeline.json'))['splits'];print(','.join(str(round(x['emerge']['t0'],2)) for x in t if 'emerge' in x))")
python3 "$TOOLS/anim/captions_dyn.py" "$B/captions.ass" "$HERE/anim/timeline.json" "$B/captions-dyn.ass" --cut "$CUTS"
node "$TOOLS/anim/render.js" --timeline "$HERE/anim/timeline.json" --out "$B/video.mp4" --frames-dir "$B/frames" --resume --workers 2 --scale 0.75 --crf 18 "$@"
ffmpeg -v error -y -i "$B/video.mp4" -i "$B/mix.wav" -vf "subtitles='$B/captions-dyn.ass'" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$B/$SLUG.mp4"
cp "$B/$SLUG.mp4" "$HERE/$SLUG.mp4"
# Web-ready Full HD 1080x1920 strictly under 20 MB (< 19 MB) for instant UI playback/download
WEBBIT=$(python3 -c "d=$D; print(int(max(900, min(1450, (17.8*8192)/d - 128))))")
ffmpeg -v error -y -i "$B/$SLUG.mp4" -c:v libx264 -b:v "${WEBBIT}k" -maxrate "$((WEBBIT + 250))k" -bufsize "$((WEBBIT * 2))k" -preset medium -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$HERE/$SLUG-1080p-web.mp4"
ffmpeg -v error -y -i "$B/$SLUG.mp4" -vf scale=608:-2 -c:v libx264 -b:v 780k -maxrate 900k -bufsize 1800k -preset medium -c:a aac -b:a 96k -movflags +faststart "$HERE/preview/$SLUG.mp4"
ffmpeg -v error -y -i "$B/$SLUG.mp4" -vf "fps=20/$D,scale=270:-2,tile=5x4" -frames:v 1 -update 1 -q:v 3 "$HERE/preview/$SLUG-sheet.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$B/$SLUG.mp4"
ffmpeg -hide_banner -i "$B/$SLUG.mp4" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" || true
ls -lh "$HERE/$SLUG.mp4" "$HERE/$SLUG-1080p-web.mp4" "$HERE/preview/$SLUG.mp4" "$HERE/preview/$SLUG-sheet.jpg"
