---
on:
  workflow_dispatch:
  push:
    branches: [main, master]
permissions:
  contents: read
  pull-requests: read
network: defaults
safe-outputs:
  create-pull-request:
    max: 1
---

# Build agent for Node.js (npm)

You are a build agent. In the current repo, set up and run the build using:
- Setup: Node.js 24 + npm ci
- Build command: `npm run build || true`

If the build fails, diagnose the error, fix the root cause in source (not by
disabling checks), and open a pull request titled "build: fix build for Node.js (npm)"
with the minimal change. Do not push to main directly. Only modify files needed
for the build to succeed.
