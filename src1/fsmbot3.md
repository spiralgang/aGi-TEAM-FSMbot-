### FSMBot3: Build Automation FSM

**Purpose:**
Automates the build process, including compiling, artifact bundling, and pre-deploy verifications.

**State Structure:**
- `idle`
- `building`: Engaged in build steps
- `built`: Success
- `failed`: Error in build process

**Transition Logic:**
- Multi-stage transitions for complex builds (configure → compile → link → package).
- Error recovery branches based on build logs and error types.

**Integration Role:**
- Orchestrates subsequent test FSMs upon successful build.
- Provides build artifact location tokens to deployment orchestration bots.

**Unique Features:**
- Smart cache detection for incremental builds.
- Exposes generated build scripts and Makefile-equivalent DSLs.
