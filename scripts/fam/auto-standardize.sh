#!/usr/bin/env bash
# ---
# Title: FAM Auto Standardize
# Owner: FSM-AUTO
# Purpose: Apply minimal, industry-standard hygiene passes (lint/typecheck) for PRs tagged auto-standards.
# Rationale: Ensure all automated approvals leave a forensic trail and produce runnable code.
# ---
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <pr-number>" >&2
  exit 1
fi

PR_NUMBER="$1"
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)"
if [[ -z "${ROOT_DIR}" ]]; then
  echo "Unable to resolve repository root. Aborting." >&2
  exit 2
fi

cd "${ROOT_DIR}"

LOG_DIR="${ROOT_DIR}/logs"
PROVENANCE_DIR="${ROOT_DIR}/ci-meta"
mkdir -p "${LOG_DIR}" "${PROVENANCE_DIR}"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  local message="$1"
  printf '[%s][auto-standardize] %s\n' "$(timestamp)" "${message}" | tee -a "${LOG_DIR}/auto-standardize-pr${PR_NUMBER}.log"
}

append_provenance() {
  local status="$1"
  local command="$2"
  jq -n \
    --arg ts "$(timestamp)" \
    --arg pr "${PR_NUMBER}" \
    --arg cmd "${command}" \
    --arg status "${status}" \
    --arg commit "$(git rev-parse HEAD)" \
    '{timestamp:$ts, pr:$pr, commit:$commit, command:$cmd, status:$status}' \
    >> "${PROVENANCE_DIR}/provenance-pr${PR_NUMBER}.jsonl"
}

log "Starting minimal standards pass for PR #${PR_NUMBER}"

if [[ -f package-lock.json ]]; then
  log "Installing Node dependencies via npm ci"
  if npm ci --ignore-scripts --no-audit --no-fund >> "${LOG_DIR}/auto-standardize-pr${PR_NUMBER}.log" 2>&1; then
    append_provenance "success" "npm ci --ignore-scripts --no-audit --no-fund"
  else
    append_provenance "failure" "npm ci --ignore-scripts --no-audit --no-fund"
    log "Dependency installation failed."
    exit 3
  fi
else
  log "package-lock.json not present; skipping npm ci."
fi

if npm run lint -- --fix >> "${LOG_DIR}/auto-standardize-pr${PR_NUMBER}.log" 2>&1; then
  append_provenance "success" "npm run lint -- --fix"
  log "Linting completed with --fix."
else
  append_provenance "failure" "npm run lint -- --fix"
  log "Linting failed."
  exit 4
fi

if npm run typecheck >> "${LOG_DIR}/auto-standardize-pr${PR_NUMBER}.log" 2>&1; then
  append_provenance "success" "npm run typecheck"
  log "Typecheck completed."
else
  append_provenance "failure" "npm run typecheck"
  log "Typecheck failed."
  exit 5
fi

log "Minimal standards pass complete for PR #${PR_NUMBER}"
