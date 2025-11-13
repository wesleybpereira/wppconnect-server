#!/usr/bin/env bash
set -euo pipefail

if [ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]; then
  if command -v chromium >/dev/null 2>&1; then
    export PUPPETEER_EXECUTABLE_PATH="$(command -v chromium)"
  elif command -v google-chrome-stable >/dev/null 2>&1; then
    export PUPPETEER_EXECUTABLE_PATH="$(command -v google-chrome-stable)"
  fi
fi

exec node ./dist/server.js
