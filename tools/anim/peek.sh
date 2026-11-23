#!/usr/bin/env bash
# peek.sh TIMELINE OUT.jpg t1,t2,...   quick low-res contact sheet of chosen times (names sorted by time)
set -e
D=$(mktemp -d /tmp/peekXXXX 2>/dev/null || mktemp -d)
node "$(dirname "$0")/render.js" --timeline "$1" --dump "$3" --dump-dir "$D" --scale 0.5 >/dev/null
python3 "$(dirname "$0")/sheet.py" "$D" "$2" ${4:-6}
