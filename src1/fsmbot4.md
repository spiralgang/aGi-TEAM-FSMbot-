### FSMBot4: Test Runner

**Purpose:** Executes unit, integration, and end-to-end tests.
**State Structure:** `idle`, `running`, `success`, `error`
**Transition Logic:** Triggered after a successful build.
**Integration Role:** Reports test results to the CI/CD pipeline.
**Unique Features:** Parallel test execution.
