# FSM Accessibility Agent – Production Operations Playbook

This playbook equips human maintainers and automated agents with the full
context needed to extend, validate, and operate the FSM Accessibility Service
stack that powers Android accessibility bridging inside the aGi-TEAM-FSMbot
universe. Treat this as the canonical field manual when collaborating on Issue
#1 deliverables or related follow-up work.

---

## 1. Mission Overview

- **Objective:** Deliver a hardened Android AccessibilityService that relays
  accessibility telemetry into the React Native FSM client so the assistant can
  reason about focus changes, surfaced windows, and user interactions in
  real-time.
- **Scope:** Kotlin native service implementation, React Native module bridge,
  Expo config plugin, onboarding UX, typed interfaces, and documentation.
- **Out of scope:** iOS VoiceOver integration, binary asset additions, or any
  features requiring elevated Android permissions beyond the accessibility stack
  defined here.

---

## 2. Subsystems & Source Topology

| Subsystem | Key Path(s) | Description |
|-----------|-------------|-------------|
| Native Accessibility Service | `android/app/src/main/java/com/fsmbot/accessibility/FSMAccessibilityService.kt` | Extends `AccessibilityService`, captures event metadata, and emits it through a shared emitter singleton. |
| React Native Bridge | `android/app/src/main/java/com/fsmbot/accessibility/FSMAccessibilityModule.kt` and `FSMAccessibilityPackage.kt` | Exposes `isAccessibilityServiceEnabled`, registers state listeners, and forwards native events to JS. |
| Expo Config Plugin | `mobile-app/plugins/fsmbot-accessibility-service.js` | Injects manifest `<service>` and permission declarations on every `expo prebuild`. |
| XML Metadata | `android/app/src/main/res/xml/fsmbot_accessibility_config.xml` | Describes event filters, feedback types, and runtime flags consumed by Android. |
| Onboarding UX | `mobile-app/app/accessibility/onboarding.tsx` | React Native screen that communicates status, rationale, and quick links to system settings. |
| Automation Script | `scripts/fsm_issue_injector.sh` | Fetches Issue #1 body & comments mirror, writes an aggregate transcript, and optionally dispatches to AI agents for execution. |

> **Tip:** Run `npx expo prebuild --platform android` before editing native
> sources to guarantee Gradle scaffolding is present.

---

## 3. Development Protocols

1. **Type Safety:** Run `npx tsc --noEmit` after modifying TS/TSX files.
2. **Linting:** Execute `npm run lint` (web) or `npx expo lint` (mobile) to catch
   JSX and React Native issues early.
3. **Native Builds:** Use Android Studio or Gradle wrapper commands after
   prebuild to validate Kotlin compilation.
4. **No Binary Assets:** GitHub policies reject Codex PRs containing binaries.
   Prefer vector drawables, JSON, or code-driven UI components.
5. **Security Posture:** Keep the accessibility service `android:exported="false"`
   and do not request additional permissions without explicit review.
6. **Documentation:** Update this playbook alongside code changes to keep human
   reviewers and AI agents synchronized.

---

## 4. Automation Script Deep Dive (`scripts/fsm_issue_injector.sh`)

- Aggregates Issue documentation via the public raw GitHub URLs:
  - `docs/issue_1_full_body.md`
  - `docs/issue_1_comments_all.md`
- Provides CLI switches for repository owner/name, issue number, output
  location, custom agent commands, and dry-run mode.
- Implements retry/backoff for transient network failures and surfaces precise
  logging suitable for CI logs.
- Dispatches the merged transcript to each configured agent command via stdin,
  tagging executions with the label `Issue #<n> Full Implementation`.
- Example invocation:

  ```bash
  scripts/fsm_issue_injector.sh --issue 1 --output ./tmp/issue-1.md \
    --agents codex-agent,jules-agent --dry-run
  ```

---

## 5. Testing Checklist

| Layer | Command | Purpose |
|-------|---------|---------|
| Web / TS | `npm run lint` | Verifies lint + formatting gates. |
| Web / TS | `npx tsc --noEmit` | Ensures TypeScript definitions remain sound. |
| Expo Prebuild | `npx expo prebuild --platform android` | Materializes native android/ directories with plugin patches. |
| Native Build | `cd android && ./gradlew assembleDebug` | Confirms Kotlin + manifest integrations compile. |
| Automation Script | `./scripts/fsm_issue_injector.sh --dry-run` | Validates documentation fetch and file generation without dispatch. |

Execute relevant rows before shipping significant changes to guarantee parity
with CI expectations.

---

## 6. Collaboration Notes

- **AI Agents:** When invoking automation, prefer the injector script so every
  agent receives the same canonical instruction payload.
- **Human Reviewers:** Reference this file for architectural context when
  reviewing PRs or debugging manifest issues.
- **Issue Synchronization:** Any updates to Issue #1 docs should be mirrored in
  the repository `docs/` directory; the injector depends on those resources.
- **Follow-up Work:** Track derivative enhancements (e.g., analytics or advanced
  telemetry) under new issues to keep the accessibility baseline focused and
  stable.

---

## 7. Quick Reference

- Accessibility service enabled? → `AccessibilityInfo.isAccessibilityServiceEnabled()`
- Launch Android accessibility settings? → `IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.ACCESSIBILITY_SETTINGS)`
- Ensure manifest entries? → Run `npx expo prebuild --platform android` and
  inspect `android/app/src/main/AndroidManifest.xml`.
- Need a fresh issue transcript? → `./scripts/fsm_issue_injector.sh --dry-run`

---

*Maintained by the FSM accessibility task force. Update responsibly.*
