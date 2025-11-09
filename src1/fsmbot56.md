### FSMBot56: Release Manager

**Purpose:** Manages the software release process.
**State Structure:** `ready`, `deploying`, `released`, `error`
**Transition Logic:** Triggered by a successful merge to the main branch.
**Integration Role:** Coordinates with deployment environments.
**Unique Features:** Rollback and canary deployment support.
