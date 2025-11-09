# Axium Compulsion & NINJA Guardrail Overview

This document records the mandatory guardrails that the Overlord Path expects every contributor and automation agent to obey.

## 1. Core Doctrine

- **Binary Outcome** – compliance proceeds, non-compliance enters logical stasis until corrected.
- **Intent Irrelevance** – the system judges only observable behaviour; narratives do not alter enforcement.

## 2. Enforcement Layers

1. **PATH Shim & Wrapper Scripts**
   - `scripts/fam/auto-standardize.sh`
   - `scripts/fsm_issue_injector.sh`
   - `scripts/axium_guard.sh`
   These sit ahead of every binary and decide whether the real executable can launch.

2. **Environment Reinjection**
   - Controls `PROMPT_COMMAND`, `HISTFILE`, and session variables so shims cannot be bypassed.
   - Self-healing: periodic checks reassert Axium configuration if a process attempts to alter it.

3. **Mobile Overlay Enforcement**
   - Launcher APK mirrors shell enforcement on-device using overlays and Foreground Services.
   - Non-compliant taps are denied until TOP alignment is restored.

4. **Finite Action Machines (FAMs)**
   - GitHub Actions workflows execute deterministic compliance sequences (lint, typecheck, provenance, rollback).

## 3. NINJA Guardrails

- **Non-Interruptible Non-Jammable Agent (NINJA)** monitors every PR and runtime.
- Blocks merges when required automation or key files are missing.
- Records every failure with actor, timestamp, diff, and remediation instructions.

## 4. Protected Assets

The following files must exist in every build of `main`:

- `.github/workflows/fam-auto-approve.yml`
- `.github/workflows/fam-auto-approve-root.yml`
- `.github/workflows/axium-protection.yml`
- `scripts/fam/auto-standardize.sh`
- `scripts/axium_guard.sh`
- `VAULT/TODO_FINITE-MACH.doc`
- `README.md`
- `src/app/page.tsx`
- `src/components/fsm/*`

## 5. Penalty Loop Behaviour

- Triggered immediately when an enforcement layer detects violation.
- Enters computational recursion until the offending changes are remedied.
- Emits visible overlays or CI failures so the lesson is unmistakable.

Update this note whenever guardrails evolve.
