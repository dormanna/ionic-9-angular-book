#!/bin/bash
# The second step: the task, with the key in the environment
# of this call only, and the results in ~/out.
set -uo pipefail
cd "$HOME/app"

# After the limit, a request to stop; 30 seconds later, kill.
timeout --kill-after=30s "${TIME_LIMIT:-90m}" claude -p \
  --model claude-opus-5 --effort high \
  --permission-mode bypassPermissions \
  < /tmp/task.txt > "$HOME/out/claude.log" 2>&1
echo $? > "$HOME/out/exit-code"

git format-patch -q "$(cat "$HOME/start")" \
  -o "$HOME/out/patches"
[ -f REPORT.md ] && cp REPORT.md "$HOME/out/"
exit 0
