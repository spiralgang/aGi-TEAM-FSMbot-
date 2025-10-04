# **App Name**: FSMAssist

## Core Features:

- Code State Validation: Verifies the code structure and state using a defined FSM. It leverages the 'validate_code' to tool to ascertain structural correctness before further processing.
- YAML Parsing FSM: Applies a YAML parser implemented as an FSM to catch syntax and structural errors in AI-generated configurations.
- Syntax Checker FSM: Utilizes a coroutine FSM to validate syntax during code generation, preventing looping and wasted computation cycles by the LLM.
- Lint Compliance Verification: Implements FSMs for verifying ESLint compliance in generated code, allowing users to ensure conformity to style guides.
- TODO Task Manager: FSM-driven task management for TODO.md files
- Loop Prevention: The is_looping tool tracks and escalates errors when an agent repeats code patterns excessively.
- Automated Workflow using Code Bot FSM: Build an AI FSM agentic workflow assistant

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF) to convey clarity and reliability in the code validation process.
- Background color: Very light gray (#F0F0F0), ensuring a clean and unobtrusive backdrop for code-focused interaction.
- Accent color: Electric green (#7CFC00) to draw attention to successfully validated states and actions.
- Body and headline font: 'Inter', a sans-serif font for clear and modern readability, suited for code-related text.
- Code Font: 'Source Code Pro', monospaced font, ideal for code snippets and YAML examples in UI.
- Simple, monochrome icons representing FSM states (e.g., validation, linting) and status (e.g., success, error) should have line widths of two pixels.
- Clean and minimal layout, maximizing screen space for code and validation outputs.