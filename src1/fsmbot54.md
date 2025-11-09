### FSMBot54: Auto-Merge Gate

**Purpose:** Enforces policies before merging pull requests.
**State Structure:** `ready`, `merging`, `merged`, `blocked`
**Transition Logic:** Triggered by successful CI pipeline runs.
**Integration Role:** Final gatekeeper for code changes.
**Unique Features:** PR policy enforcement, back-off mechanisms.
