#!/usr/bin/env bash
#
# FSM Issue Injector
# -------------------
# This script fetches the authoritative Issue brief (default: Issue #1) from the
# aGi-TEAM-FSMbot documentation mirror and dispatches the aggregated content to
# one or more CLI-based AI agents. It includes structured logging, retry logic,
# configurable agent commands, and optional dry-run support so it can operate as
# a production-grade automation helper.
#
# Usage examples:
#   scripts/fsm_issue_injector.sh --issue 1
#   scripts/fsm_issue_injector.sh --owner spiralgang --repo aGi-TEAM-FSMbot- \
#       --issue 1 --output ./tmp/issue-1.md --agents codex-agent,jules-agent
#   scripts/fsm_issue_injector.sh --dry-run   # Validate fetch + file write only
#
# The script avoids GitHub API authentication by reading the repo-hosted copies
# of the issue body and comment digest under docs/. To adapt for another issue,
# override the --body-path/--comments-path flags or provide alternate mirrors.

set -Eeuo pipefail

######################################
# Logging helpers
######################################
LOG_PREFIX="[FSM-INJECTOR]"
log()  { printf '%s %s\n' "${LOG_PREFIX}" "$*"; }
warn() { printf '%s WARNING: %s\n' "${LOG_PREFIX}" "$*" >&2; }
err()  { printf '%s ERROR: %s\n' "${LOG_PREFIX}" "$*" >&2; }

######################################
# Defaults
######################################
GITHUB_OWNER="spiralgang"
GITHUB_REPO="aGi-TEAM-FSMbot-"
ISSUE_NUMBER=1
BODY_PATH="docs/issue_1_full_body.md"
COMMENTS_PATH="docs/issue_1_comments_all.md"
OUTPUT_FILE="issue_1_full_input.md"
DISPATCH_AGENTS=("codex-agent" "jules-agent" "copilot-swe-agent")
DRY_RUN=false
RETRIES=3
BACKOFF_SECONDS=2

######################################
# Usage / help
######################################
usage() {
  cat <<USAGE
${LOG_PREFIX} Ultimate FSM Issue injector

Options:
  -o, --owner OWNER            GitHub repository owner (default: ${GITHUB_OWNER})
  -r, --repo REPO              GitHub repository name (default: ${GITHUB_REPO})
  -i, --issue NUMBER           Issue number to fetch (default: ${ISSUE_NUMBER})
      --body-path PATH         Relative docs path for issue body markdown
                               (default: ${BODY_PATH})
      --comments-path PATH     Relative docs path for comments markdown
                               (default: ${COMMENTS_PATH})
  -a, --agents LIST            Comma-separated CLI agent commands. Each command
                               must accept piped stdin containing the issue
                               payload. Default: ${DISPATCH_AGENTS[*]}
  -O, --output FILE            Destination file for the aggregated transcript
                               (default: ${OUTPUT_FILE})
      --retries N              Number of retries for network fetches (default: ${RETRIES})
      --backoff SECONDS        Base exponential backoff seconds (default: ${BACKOFF_SECONDS})
      --dry-run                Fetch & save content only; skip agent dispatch
  -h, --help                   Display this help and exit

Environment overrides:
  FSM_INJECTOR_TOKEN           Optional GitHub token for private mirrors
  FSM_INJECTOR_VERBOSE         Any value enables `set -x` tracing

Examples:
  FSM_INJECTOR_VERBOSE=1 scripts/fsm_issue_injector.sh --issue 2 \
      --body-path docs/issue_2_body.md --comments-path docs/issue_2_comments.md
USAGE
}

######################################
# Argument parsing
######################################
parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -o|--owner)       GITHUB_OWNER="$2"; shift 2 ;;
      -r|--repo)        GITHUB_REPO="$2"; shift 2 ;;
      -i|--issue)       ISSUE_NUMBER="$2"; shift 2 ;;
      --body-path)      BODY_PATH="$2"; shift 2 ;;
      --comments-path)  COMMENTS_PATH="$2"; shift 2 ;;
      -a|--agents)      IFS=',' read -r -a DISPATCH_AGENTS <<< "$2"; shift 2 ;;
      -O|--output)      OUTPUT_FILE="$2"; shift 2 ;;
      --retries)        RETRIES="$2"; shift 2 ;;
      --backoff)        BACKOFF_SECONDS="$2"; shift 2 ;;
      --dry-run)        DRY_RUN=true; shift ;;
      -h|--help)        usage; exit 0 ;;
      *)                err "Unknown argument: $1"; usage; exit 1 ;;
    esac
  done
}

######################################
# Dependency checks
######################################
require_bin() {
  local bin="$1"
  if ! command -v "$bin" >/dev/null 2>&1; then
    err "Required executable '$bin' not found in PATH"
    exit 1
  fi
}

ensure_dependencies() {
  require_bin curl
  require_bin tee
}

######################################
# Fetch helpers with retry/backoff
######################################
fetch_remote_file() {
  local path="$1"
  local description="$2"
  local url="https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}"
  local attempt=1
  local response

  while (( attempt <= RETRIES )); do
    log "Fetching ${description} (attempt ${attempt}/${RETRIES}) from ${url}"
    if response=$(curl -fsSL ${FSM_INJECTOR_TOKEN:+-H "Authorization: token ${FSM_INJECTOR_TOKEN}"} "$url"); then
      printf '%s' "$response"
      return 0
    fi
    warn "Failed to fetch ${description} on attempt ${attempt}"
    if (( attempt == RETRIES )); then
      err "Exhausted retries fetching ${description}"
      return 1
    fi
    local sleep_for=$(( BACKOFF_SECONDS * attempt ))
    log "Sleeping ${sleep_for}s before retry"
    sleep "${sleep_for}"
    (( attempt++ ))
  done
}

######################################
# Agent dispatch
######################################
dispatch_to_agents() {
  local payload="$1"

  if [[ ${#DISPATCH_AGENTS[@]} -eq 0 ]]; then
    warn "No agent commands configured; skipping dispatch"
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log "Dry run enabled; skipping agent dispatch"
    return 0
  fi

  for agent_cmd in "${DISPATCH_AGENTS[@]}"; do
    if [[ -z "$agent_cmd" ]]; then
      continue
    fi
    local executable=${agent_cmd%% *}
    if ! command -v "$executable" >/dev/null 2>&1; then
      warn "Agent command '${agent_cmd}' not available on PATH; skipping"
      continue
    fi
    log "Dispatching issue ${ISSUE_NUMBER} payload to ${agent_cmd}"
    # shellcheck disable=SC2086
    if ! printf '%s\n' "$payload" | ${agent_cmd} --input - --execute --label "Issue #${ISSUE_NUMBER} Full Implementation"; then
      warn "Agent command '${agent_cmd}' returned a non-zero exit code"
    fi
  done
}

######################################
# Main routine
######################################
main() {
  parse_args "$@"

  if [[ -n "${FSM_INJECTOR_VERBOSE:-}" ]]; then
    set -x
  fi

  ensure_dependencies

  local output_dir
  output_dir=$(dirname "${OUTPUT_FILE}")
  if [[ ! -d "${output_dir}" ]]; then
    log "Creating output directory ${output_dir}"
    mkdir -p "${output_dir}"
  fi

  local issue_body
  issue_body=$(fetch_remote_file "${BODY_PATH}" "issue body") || exit 1
  local issue_comments
  issue_comments=$(fetch_remote_file "${COMMENTS_PATH}" "issue comment digest") || exit 1

  local full_content
  full_content="${issue_body}"$'\n'"${issue_comments}"

  if [[ -z "${full_content//[[:space:]]/}" ]]; then
    err "Fetched content is empty; aborting"
    exit 1
  fi

  log "Writing aggregated issue transcript to ${OUTPUT_FILE}"
  printf '%s\n' "${full_content}" | tee "${OUTPUT_FILE}" >/dev/null

  dispatch_to_agents "${full_content}"

  log "Issue ${ISSUE_NUMBER} injection workflow completed"
}

main "$@"
