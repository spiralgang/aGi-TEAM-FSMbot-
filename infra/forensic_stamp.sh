#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-infra/FORGE_STAMP.txt}"
cat > "$OUT" <<EOF
repo: ${GITHUB_REPOSITORY:-local}
actor: ${GITHUB_ACTOR:-$(whoami)}
runid: ${GITHUB_RUN_ID:-manual}
branch: ${GITHUB_REF:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo manual)}
timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
host: $(hostname)
uid: $(id -u):$(id -g)
note: This file was created by the aGi CI automation run and is owned by repository operators.
EOF
chmod 0644 "$OUT"
