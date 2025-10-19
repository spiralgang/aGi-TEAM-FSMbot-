export type Module = {
  slug: string;
  title: string;
  summary: string;
  responsibilities: string[];
  handoffs: string[];
  signals: string[];
  metrics?: { label: string; value: string }[];
};

export const modules: Module[] = [
  {
    slug: 'dashboard',
    title: 'Factory Dashboard',
    summary:
      'The command center that explains how the creative AI partners with deterministic FSMs to ship production-ready code.',
    responsibilities: [
      'Set the tone for the assembly-line style workflow.',
      'Explain how FSM specialists backstop the creative AI.',
      'Showcase the continuous improvement loop across modules.',
    ],
    handoffs: [
      'Routes engineers to the module that matches their immediate objective.',
      'Summarizes the current health of the assembly line.',
    ],
    signals: [
      'Updated design principle documentation.',
      'New or revised FSM specializations that need highlighting.',
    ],
  },
  {
    slug: 'loop-prevention',
    title: 'Anti-Flail FSM',
    summary:
      'Monitors action history to detect thrashing and halts the creative AI before it spirals into infinite loops.',
    responsibilities: [
      'Track the latest 10 AI actions and match against loop patterns.',
      'Escalate from Stable → Monitor → Correct → Halt depending on severity.',
      'Surface actionable guidance for the operator when intervention is needed.',
    ],
    handoffs: [
      'Feeds loop alerts into the Code Bot workflow for contextual recovery.',
      'Provides audit records to the Continuous Audit trail.',
    ],
    signals: [
      'Repeated alternating actions such as generate → validate → generate.',
      'Escalation events triggered by threshold breaches.',
    ],
    metrics: [
      { label: 'Max Actions Tracked', value: '10 recent actions' },
      { label: 'Escalation Window', value: '≤ 5 repeated patterns' },
    ],
  },
  {
    slug: 'code-state-validation',
    title: 'Code State Validation',
    summary:
      'Scores the working tree on syntax quality, dependency hygiene, and FSM compliance to prevent regressions.',
    responsibilities: [
      'Run static analysis passes over the generated files.',
      'Classify findings by severity and attach remediation suggestions.',
      'Export structured reports for both the IDE Matrix and auditors.',
    ],
    handoffs: [
      'Feeds blockers back into the creative AI correction loop.',
      'Publishes pass/fail signals to the Terminus validator.',
    ],
    signals: [
      '0–100 quality score for every validation run.',
      'List of failing files plus recommended fixes.',
    ],
    metrics: [
      { label: 'Quality Baseline', value: 'Target ≥ 85' },
      { label: 'Validation Time', value: '< 15s per module' },
    ],
  },
  {
    slug: 'policy-parsing',
    title: 'Policy Parsing FSM',
    summary:
      'Deterministically parses YAML/JSON policies so every build follows the mandated compliance rules.',
    responsibilities: [
      'Normalize policy documents regardless of source formatting.',
      'Validate required keys and enumerations with Zod schemas.',
      'Emit actionable diffs when a policy change impacts workflows.',
    ],
    handoffs: [
      'Supplies parsed policies to the Continuous Audit process.',
      'Broadcasts breaking-policy changes to the Lint Compliance gate.',
    ],
    signals: [
      'Checksum for the active policy version.',
      'List of modules impacted by policy diffs.',
    ],
  },
  {
    slug: 'cloud-backup',
    title: 'Cloud Backup FSM',
    summary:
      'Maintains an immutable vault of build artifacts, configuration history, and audit proofs.',
    responsibilities: [
      'Snapshot project state on every major transition.',
      'Encrypt and ship bundles to the tamper-resistant vault.',
      'Expose restore points for disaster recovery drills.',
    ],
    handoffs: [
      'Feeds restoration hooks into the Draft Saver FSM.',
      'Shares verification hashes with the Continuous Audit trail.',
    ],
    signals: [
      'Timestamped backup ledger.',
      'Checksum mismatches requiring operator review.',
    ],
  },
];

export const assemblyPrinciples = [
  {
    title: 'Assembly Line Mindset',
    description:
      'Break complex delivery into deterministic stations so the creative AI can focus on novel work while FSMs guarantee quality.',
  },
  {
    title: 'Single Creative AI, Many Specialists',
    description:
      'A lone AI author creates features, while FSM teammates validate, sanitize, and enforce policy without fatigue.',
  },
  {
    title: 'Continuous Improvement Loop',
    description:
      'Human designers evolve the FSM library, improvements cascade into faster, safer delivery cycles for every build.',
  },
];

export const operationalCadence = [
  {
    phase: 'Intake',
    focus:
      'Collect user stories, compliance rules, and environmental constraints into structured briefs.',
    deliverables: ['Policy packets', 'Initial TODO queue', 'Guardrail configuration'],
  },
  {
    phase: 'Execution',
    focus:
      'Creative AI iterates on features while FSMs validate syntax, policy, and operational readiness.',
    deliverables: ['Code patches', 'Validation reports', 'Loop-prevention transcripts'],
  },
  {
    phase: 'Release',
    focus:
      'Terminus validator checks completeness, backups are sealed, and audit packages are exported.',
    deliverables: ['Deployment manifest', 'Vaulted artifacts', 'Post-release checklist'],
  },
];
