#!/bin/bash
# The first step inside the container, before the key exists
# there: a fresh clone, its dependencies, the firewall.
set -uo pipefail
mkdir -p "$HOME/out"

git clone -q /tmp/source "$HOME/app" || exit 3
cd "$HOME/app"
git config user.name "Claude Code (sandbox)"
git config user.email "sandbox@localhost"
git rev-parse HEAD > "$HOME/start"

# Exactly what package-lock.json names, before the firewall:
# some packages fetch binaries from hosts it will not allow.
npm ci --no-audit --no-fund > "$HOME/out/npm-ci.log" 2>&1 \
  || exit 3
sudo /usr/local/bin/firewall.sh > "$HOME/out/firewall.log" \
  2>&1 || exit 3
