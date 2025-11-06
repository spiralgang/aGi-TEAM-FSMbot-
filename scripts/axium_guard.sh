#!/usr/bin/env bash
set -euo pipefail

REQUIRED=(
  ".github/workflows/fam-auto-approve.yml"
  ".github/workflows/fam-auto-approve-root.yml"
  ".github/workflows/axium-protection.yml"
  "scripts/fam/auto-standardize.sh"
  "scripts/axium_guard.sh"
  "VAULT/TODO_FINITE-MACH.doc"
  "README.md"
  "src/app/page.tsx"
)

missing=0
for path in "${REQUIRED[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "::error file=$path::Axium guardrail missing required file: $path"
    missing=1
  fi
done

if [[ $missing -ne 0 ]]; then
  echo "Axium guard detected missing guardrail files." >&2
  exit 1
fi

echo "Axium guard: all required files present."
