# FAM Auto-Standards Workflow

- Purpose: enforce minimal, professional-grade hygiene (lint + typecheck) for PRs labeled `auto-standards`.
- Runtime: executes inside GitHub-hosted Ubuntu runners using full Node.js environment.
- Script: `scripts/fam/auto-standardize.sh` installs dependencies, runs `npm run lint -- --fix`, and `npm run typecheck`, logging to `logs/auto-standardize-pr<n>.log` and provenance JSONL under `ci-meta/`.
- Outputs: uploads logs/provenance, posts summary comment, and submits an approval when all tasks succeed.
- Commit Behavior: auto-commits fixes only when the PR branch lives in this repository; otherwise instructs maintainers via comment.
- Secrets: requires `AUTO_APPROVE_TOKEN` with repo write + PR review scopes.
- Invocation: apply the `auto-standards` label to a pull request; subsequent pushes re-trigger the workflow.
