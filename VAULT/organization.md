# Project Organization & Architecture

This document outlines the structural and architectural principles of the `FSMAssist` project.

## 1. Directory Structure Philosophy

- **`/` (Root)**: The root contains configuration files (`.json`, `.md`, `.xml`) that govern the entire project and workspace. It is the highest level of control.
- **`/src`**: Contains all application source code.
- **`/src/app`**: Core Next.js application logic, routing, and page components.
- **`/src/components`**: Reusable React components.
  - **`/src/components/ui`**: Base UI components from `shadcn/ui`.
  - **`/src/components/fsm`**: Components that *demonstrate* a specific FSM's function. Each file here is a tangible proof of an agent's role.
  - **`/src/components/layout`**: Components that define the overall page structure (e.g., `sidebar.tsx`).
- **`/src/ai`**: All Genkit AI flows and configurations.
  - **`/src/ai/flows`**: The implementation of our FSM agents. Each `*.ts` file represents a "Mop Boy" or a "Master Craftsman," defining their states and transitions.
- **`/docs`**: High-level conceptual documents, manifests, and checksave points (e.g., `chckpt1-a2.t3.fb1.md`).
- **`/VAULT`**: The immutable source of truth. Contains the core principles and instructions that govern the project and its agents.

## 2. The Assembly Line Architecture

Our system is an ecosystem of specialized agents, not a monolith.

- **The Chief Architect (Human)**: You. Provides high-level vision, architectural direction, and acts as the final arbiter.
- **The Factory Foreman (`EmbedGeminiManager`)**: The orchestrator. It parses intent and dispatches the correct FSM worker for the job.
- **The Assembly Line Workers ("Mop Boys")**: These are the deterministic FSMs implemented as Genkit flows in `/src/ai/flows`. Each performs one structured task perfectly (e.g., `LucideValidator`, `PolicyParser`).
- **The Master Craftsman (`CodeBotFsm`)**: The creative AI coder. It receives tasks from the Foreman and writes novel code within the clean, compliant environment maintained by the Mop Boys.
- **The Head of Security (`Supermax` / `ContinuousAudit`)**: Enforces the rules defined in the `VAULT` and other configuration files. It scans, validates, and maintains the `activity.xml` log.
