#!/bin/bash
# Hands a task to Claude Code in a container and reports back.
#   sandbox/start.sh <repository> <task file> <output folder>
# Nothing from this machine goes in but a copy of the
# repository, the task and the key; nothing comes out but
# ~/out.
set -euo pipefail

repo=$(cd "$1" && pwd)
task=$2
out=$3
here=$(cd "$(dirname "$0")" && pwd)
name=bob-tours-job

mkdir "$out"
docker build -q -t bob-tours-sandbox "$here" > /dev/null
read -rsp 'Anthropic API key: ' key
echo

docker create --name "$name" \
  --cap-add NET_ADMIN --cap-add NET_RAW \
  bob-tours-sandbox > /dev/null
trap 'docker rm -f "$name" > /dev/null' EXIT
docker cp -q "$repo/." "$name:/tmp/source"
docker cp -q "$task" "$name:/tmp/task.txt"
docker start "$name" > /dev/null
echo "Started. This window reports when the task ends."

# The key enters the container only once the dependencies
# are installed and the firewall is up, and only for the
# assistant's call: not onto a command line, not into a file.
if docker exec "$name" prepare.sh; then
  ANTHROPIC_API_KEY=$key docker exec -e ANTHROPIC_API_KEY \
    -e TIME_LIMIT="${TIME_LIMIT:-90m}" "$name" task.sh || true
fi
unset key
docker cp -q "$name:/home/node/out/." "$out" 2> /dev/null \
  || true

code=$(cat "$out/exit-code" 2> /dev/null || echo none)
if [ "$code" = none ]; then
  result="setup failed, see the logs"
elif [ "$code" = 124 ] || [ "$code" = 137 ]; then
  result="time limit reached"
elif [ "$code" != 0 ]; then
  result="assistant exited with code $code"
elif [ -f "$out/REPORT.md" ]; then
  result="finished, see REPORT.md"
else
  result="ended without a report"
fi
echo "$result" > "$out/RESULT.txt"
osascript -e "display notification \"$result\" \
  with title \"BoB Tours task\"" 2> /dev/null || printf '\a'
echo "$result"
