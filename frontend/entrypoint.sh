#!/usr/bin/env bash
set -euo pipefail

echo "Publishing built frontend to shared volume..."
mkdir -p /dist
cp -a /app-dist/. /dist/
echo "Publish complete. Sleeping to keep container running (nginx serves the files)."
tail -f /dev/null
