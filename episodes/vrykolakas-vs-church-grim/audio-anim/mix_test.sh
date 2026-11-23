#!/usr/bin/env bash
# voice + music(-18 dB; SFX baked in) -> loudnorm 2-pass to -14 LUFS
set -euo pipefail; cd "$(dirname "$0")"
PRE="[0:a]aresample=48000,apad=whole_dur=92.7[v];[1:a]aresample=48000,volume=-18dB[m];[v][m]amix=inputs=2:normalize=0:duration=longest,volume=8dB,alimiter=limit=0.7:attack=2:release=60"
J=$(ffmpeg -hide_banner -y -i voice_dark.wav -i music.wav -filter_complex "$PRE,loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i voice_dark.wav -i music.wav -filter_complex "$PRE,loudnorm=I=-14:TP=-1.5:LRA=9:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -b:a 192k mix-test.mp3
ffmpeg -hide_banner -i mix-test.mp3 -af ebur128 -f null - 2>&1 | grep -A1 "Integrated"
ffprobe -v error -show_entries format=duration -of csv=p=0 mix-test.mp3
