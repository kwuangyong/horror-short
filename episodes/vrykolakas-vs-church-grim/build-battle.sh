#!/usr/bin/env bash
# DRAFT build of BATTLE SPIN #001 (script-battle.md v2, THE KID): placeholder art + synthetic audio, no voice.
# Run:  bash episodes/vrykolakas-vs-church-grim/build-battle.sh
# Everything generated goes to build/battle/. Writes project-battle.json, then renders.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export HERE TOOLS="$HERE/../../tools" B="$HERE/build/battle"
mkdir -p "$B/img" "$B/audio"
CAPFONT="$(fc-scan --format '%{family[0]}' "$(python3 -c "import sys; sys.path.insert(0,'$TOOLS'); from common import find_font; print(find_font())")")"
export CAPFONT
python3 "$HERE/battle_gen.py"          # timeline, images, audio, captions words, project-battle.json
python3 "$TOOLS/make_captions.py" "$B/words_est.json" --font "$CAPFONT" --size 80 --max-chars 14 -o "$B/captions.ass"
python3 "$TOOLS/render.py" "$HERE/project-battle.json"
