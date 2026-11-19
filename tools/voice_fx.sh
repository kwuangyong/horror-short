#!/usr/bin/env bash
# Make a voice-over deeper and more menacing with ffmpeg (no plugins needed).
#
#   bash tools/voice_fx.sh voice.mp3 voice_dark.wav [preset]
#
# Presets:
#   deep     (default) -2 semitones, warm low end, tight compression, small dark room
#   demon    deep + a -7 semitone "shadow" layer mixed underneath (for the monster's lines)
#   whisper  close, breathy, airy top end, long tail – for hooks and final lines
#   radio    old broken speaker – for flash-forwards / found-footage moments
set -euo pipefail
IN="$1"; OUT="$2"; PRESET="${3:-deep}"

# Pitch shift: rubberband keeps the timing; fall back to asetrate if missing.
if ffmpeg -hide_banner -filters 2>/dev/null | grep -q rubberband; then
  P2="rubberband=pitch=0.8909:formant=preserved"     # -2 st
  P7="rubberband=pitch=0.6674"                       # -7 st
else
  P2="asetrate=44100*0.8909,aresample=44100,atempo=1.1225"
  P7="asetrate=44100*0.6674,aresample=44100,atempo=1.4983"
fi

EQ="highpass=f=55,equalizer=f=110:t=q:w=1:g=4,equalizer=f=350:t=q:w=1.2:g=-3,equalizer=f=3200:t=q:w=1:g=2,lowpass=f=12500"
COMP="acompressor=threshold=-22dB:ratio=4:attack=8:release=120:makeup=4"
ROOM="aecho=0.85:0.6:35|60:0.18|0.10"
LIMIT="alimiter=limit=0.89"

case "$PRESET" in
  deep)
    AF="aresample=44100,$P2,atempo=0.94,$EQ,$COMP,$ROOM,$LIMIT"
    ffmpeg -v error -y -i "$IN" -af "$AF" -ar 48000 "$OUT" ;;
  demon)
    ffmpeg -v error -y -i "$IN" -filter_complex \
      "[0:a]aresample=44100,asplit=2[a][b];\
       [a]$P2,$EQ,$COMP[main];\
       [b]$P7,lowpass=f=2500,volume=0.45[shadow];\
       [main][shadow]amix=inputs=2:normalize=0,aecho=0.8:0.7:60|110:0.25|0.15,$LIMIT" \
      -ar 48000 "$OUT" ;;
  whisper)
    AF="aresample=44100,$P2,highpass=f=120,equalizer=f=6000:t=q:w=1:g=5,$COMP,aecho=0.8:0.8:90|180:0.3|0.2,$LIMIT"
    ffmpeg -v error -y -i "$IN" -af "$AF" -ar 48000 "$OUT" ;;
  radio)
    AF="aresample=44100,$P2,highpass=f=400,lowpass=f=3000,acrusher=bits=8:mix=0.25,$COMP,$LIMIT"
    ffmpeg -v error -y -i "$IN" -af "$AF" -ar 48000 "$OUT" ;;
  *) echo "unknown preset: $PRESET" >&2; exit 1 ;;
esac
echo "-> $OUT ($PRESET)"
