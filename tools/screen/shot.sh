#!/bin/bash
# Desktop screenshot (X11 root window) via ImageMagick.
# Usage: shot.sh [output.png]
set -e
out="${1:-/tmp/shot-$(date +%s).png}"
import -window root "$out"
echo "$out"