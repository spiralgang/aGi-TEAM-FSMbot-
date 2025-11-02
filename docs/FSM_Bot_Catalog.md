# FSM Bot Catalog

Each FSM bot is designed to handle a specific aspect of the AI coding pipeline. They are modular, deterministic, and integrated into the broader agentic system. Below is a categorized breakdown of all 58 FSM bots.

## 1. Planning & Orchestration FSMs

| FSM Bot | Purpose |
|---|---|
| Code Bot FSM | Manages the full code generation workflow |
| Planning FSM | Breaks down high-level tasks into executable steps |
| Task Decomposer FSM | Converts user intent into structured subtasks |
| Prompt Planner FSM | Optimizes prompt structure for LLM calls |
| Intent Router FSM | Routes user requests to appropriate FSMs |
| FSM Dispatcher | Coordinates FSM handoffs and transitions |
| Terminus Prime FSM | Master dispatch controller for CI/CD |
| Agent Handoff FSM | Manages transitions between AI agents |
| Workflow Builder FSM | Constructs FSMs from job specs or diagrams |
| FSM Compiler FSM | Converts FSM specs into .sm files for SMC |

## 2. Code Validation & Syntax FSMs

| FSM Bot | Purpose |
|---|---|
| Syntax Checker FSM | Validates code syntax and structure |
| ESLint FSM | Applies linting rules to generated code |
| Code State Validator FSM | Scores code quality and compliance |
| Lucide Icon Validator FSM | Validates icon usage in UI components |
| Type Checker FSM | Ensures type safety in TypeScript code |
| Import Resolver FSM | Validates and resolves module imports |
| Dependency Graph FSM | Maps and validates code dependencies |
| AST Validator FSM | Parses and validates abstract syntax trees |
| Code Formatter FSM | Applies formatting rules (e.g., Prettier) |
| Config Validator FSM | Validates YAML/JSON config files |

## 3. Loop Prevention & Error Recovery FSMs

| FSM Bot | Purpose |
|---|---|
| Anti-Flail FSM | Detects and halts repetitive or alternating loops |
| Loop Prevention FSM | Monitors transitions for loop patterns |
| Circuit Breaker FSM | Halts runaway FSM processes |
| Error Recovery FSM | Handles failed transitions and retries |
| Timeout FSM | Enforces step and error limits |
| Retry FSM | Manages controlled retries for failed actions |
| Fallback FSM | Provides backup actions when primary fails |
| Guard FSM | Applies conditional logic to transitions |
| Intervention FSM | Escalates based on severity (STABLE → HALT) |
| FSM Auditor FSM | Logs and audits FSM behavior for debugging |

## 4. Testing & QA FSMs

| FSM Bot | Purpose |
|---|---|
| Unit Test FSM | Runs and validates unit tests |
| Integration Test FSM | Validates multi-module interactions |
| Test Coverage FSM | Tracks and scores test coverage |
| QA Checklist FSM | Applies quality assurance rules |
| Regression Test FSM | Detects regressions in code behavior |
| Snapshot Test FSM | Validates UI snapshots |
| Mock Generator FSM | Creates mocks for test environments |
| Assertion FSM | Validates expected outcomes |
| Test Runner FSM | Orchestrates test execution |
| Test Reporter FSM | Logs and reports test results |

## 5. Compliance & Policy FSMs

| FSM Bot | Purpose |
|---|---|
| Policy Parsing FSM | Parses and applies coding policies |
| License Checker FSM | Validates open-source license compliance |
| Security Scanner FSM | Detects vulnerabilities in code |
| Privacy Validator FSM | Ensures data privacy compliance |
| Accessibility FSM | Validates UI accessibility standards |
| Style Guide FSM | Enforces design and coding style rules |
| Naming Convention FSM | Validates naming patterns |
| Role-Based Access FSM | Validates permission boundaries |
| Audit Trail FSM | Tracks changes for compliance |
| Ethics FSM | Flags bias or unethical code patterns |

## 6. File & Workflow Management FSMs

| FSM Bot | Purpose |
|---|---|
| File Writer FSM | Writes code and config files |
| File Reader FSM | Reads and parses input files |
| File Cleaner FSM | Removes unused or broken files |
| TODO Tracker FSM | Manages TODO.md task states |
| Download Manager FSM | Handles package downloads |
| Package Installer FSM | Manages dependency installation |
| Dry Run FSM | Simulates execution without side effects |
| Reminder FSM | Manages notification states |
| FSM Visualizer FSM | Generates diagrams from FSM specs |
| FSM Debugger FSM | Analyzes FSM structure and transitions |
