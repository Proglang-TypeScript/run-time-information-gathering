#!/usr/bin/env bash
set -euo pipefail
ROOT_PATH="$(cd "$(dirname "$0")/.." && pwd -P)"
cd "$ROOT_PATH"
npm ci --ignore-scripts
printf "%s\n" "Reviewed Jalangi runtime is included under vendor; no unpinned clone/install is required."
