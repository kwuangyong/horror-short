#!/usr/bin/env bash
# Quick mix test: voice + music (-18 dB; knock/SFX are baked into music.wav), loudnorm to -14 LUFS
set -euo pipefail; cd "$(dirname "$0")"
ffmpeg -v error -y -i voice_dark.wav -i music.wav \
 -filter_complex "[0:a]aresample=48000,apad=whole_dur=102.1[v];[1:a]aresample=48000,volume=-18dB[m];[v][m]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=9" \
 -b:a 192k mix-test.mp3
ffmpeg -hide_banner -i mix-test.mp3 -af ebur128 -f null - 2>&1 | grep -A1 "Integrated"
