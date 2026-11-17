#!/usr/bin/env bash
# Promote beta to stable: the root app becomes an exact copy of beta/.
# beta/ itself stays as is, so right after promoting, beta == stable until new beta work lands.
# Run from the repo root, review `git status`, commit, open a PR.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f beta/index.html ] || { echo "no beta/ folder"; exit 1; }
for item in index.html manifest.webmanifest sw.js art cues icons; do
  rm -rf "./$item"
  cp -R "beta/$item" "./$item"
done
echo "Root now matches beta/. Check: diff -r --exclude=beta . beta | head"
