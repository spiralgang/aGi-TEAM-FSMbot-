### FSMBot2: Dependency Checker

**Purpose:**
Scans for and validates external library and module dependencies required by code artifacts.

**State Structure:**
- `idle`
- `scanning`: Actively analyzing imports/dependencies
- `clean`: No issues
- `flagged`: Required dependency missing or incompatible

**Transition Logic:**
- Triggered post-syntax validation.
- Parallel scan branches possible for multi-language repos.
- Flags either terminate the pipeline or report detailed error context for remediation.

**Integration Role:**
- Feeds results to FSMBot3 (build) and FSMBot55 (security audit).

**Unique Features:**
- Graph-based dependency traversal; cycle detection actively prevents infinite scan loops.
- Partial syntax validation (checks import/include statements for conformant patterns).
