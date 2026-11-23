#!/usr/bin/env bash
# Quick mix test: voice + music(-18 dB rel. voice) + SFX (knock at its cue), loudnorm to -14 LUFS
set -euo pipefail; cd "$(dirname "$0")"
KN=$(python3 -c "import json;w=[x for x in json.load(open('words.json')) if x['word'].lower().startswith('knock')][-1];print(int((w['end']+0.12)*1000))")
ffmpeg -v error -y -i voice_dark.wav -i music.wav -i knock.wav \
 -filter_complex "[0:a]aresample=48000,apad=whole_dur=102.1[v];[1:a]aresample=48000,volume=-18dB[m];[2:a]aresample=48000,volume=-6dB,adelay=${KN}:all=1[k];[v][m][k]amix=inputs=3:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=9" \
 -b:a 192k mix-test.mp3
ffmpeg -hide_banner -i mix-test.mp3 -af ebur128 -f null - 2>&1 | grep -A3 "Integrated" | head -4
