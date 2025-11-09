'use client';

import { useMemo, useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, GitBranch, ShieldHalf, Siren, Workflow } from 'lucide-react';

const phaseBlueprint = [
  {
    id: 'signal-intake',
    label: 'Signal Intake',
    summary: 'Triage inbound incidents and normalize their metadata.',
    objective: 'Confirm whether the incoming alert deserves Terminus escalation.',
    progress: 35,
    activities: [
      {
        title: 'Normalize Source Payloads',
        detail: 'Map wildly different detection payloads into a canonical incident contract.',
      },
      {
        title: 'Deterministic Classification',
        detail: 'Tag the incident by regulation, severity, and affected workspace before branching.',
      },
      {
        title: 'Generate Trace Context',
        detail: 'Attach breadcrumbs for downstream humans—links to commits, dashboards, and runbooks.',
      },
    ],
  },
  {
    id: 'policy-resolution',
    label: 'Policy Resolution',
    summary: 'Cross-check the signal against living policy requirements.',
    objective: 'Decide if automated remediation is permitted or human review is mandatory.',
    progress: 52,
    activities: [
      {
        title: 'Policy Graph Walk',
        detail: 'Traverse the compliance knowledge graph to surface relevant controls.',
      },
      {
        title: 'Evidence Correlation',
        detail: 'Link the signal to recent audits, waivers, or compensating controls already on file.',
      },
      {
        title: 'Decision Gate',
        detail: 'Emit a deterministic verdict: auto-remediate, sandbox, or escalate.',
      },
    ],
  },
  {
    id: 'remediation-sync',
    label: 'Remediation Sync',
    summary: 'Orchestrate corrective actions with connected platforms.',
    objective: 'Apply the allowed fix and capture proof for auditors.',
    progress: 78,
    activities: [
      {
        title: 'Dispatch Playbook',
        detail: 'Call the correct automation runbook with guardrailed parameters.',
      },
      {
        title: 'State Synchronization',
        detail: 'Update ticketing, on-call, and chat war rooms in one atomic transition.',
      },
      {
        title: 'Evidence Capture',
        detail: 'Store before/after diffs, approvals, and terminal output in immutable storage.',
      },
    ],
  },
  {
    id: 'verification',
    label: 'Verification & Closure',
    summary: 'Validate remediation and broadcast closure packages.',
    objective: 'Confirm deterministic resolution before returning to stand-by.',
    progress: 100,
    activities: [
      {
        title: 'Signal Re-run',
        detail: 'Replay the originating detector and ensure it now returns a passing state.',
      },
      {
        title: 'Post-Incident Narrative',
        detail: 'Draft a concise play-by-play for leadership and attach to the audit log.',
      },
      {
        title: 'Lifecycle Reset',
        detail: 'Reset state machines, archive artifacts, and ready the mesh for the next alert.',
      },
    ],
  },
] as const;

const crossLinks = [
  {
    title: 'Terminus Validator',
    description: 'Share the policy verdicts with the naming compliance FSM to keep language aligned.',
  },
  {
    title: 'Loop Prevention',
    description: 'Signal back to the runaway loop sentinel whenever remediation repeats twice.',
  },
  {
    title: 'Continuous Audit',
    description: 'Push every artifact into the continuous auditor so certification stays up-to-date.',
  },
];

export function TerminusPrime() {
  const [activePhaseId, setActivePhaseId] = useState<(typeof phaseBlueprint)[number]['id']>('signal-intake');

  const activePhase = useMemo(
    () => phaseBlueprint.find((phase) => phase.id === activePhaseId) ?? phaseBlueprint[0],
    [activePhaseId],
  );

  return (
    <FsmViewWrapper
      title="Terminus Prime FSM"
      description="The flagship compliance orchestrator that coordinates every other FSM when an incident detonates."
    >
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Workflow className="h-5 w-5" /> Phases
            </CardTitle>
            <CardDescription>Trace the canonical path Terminus Prime enforces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {phaseBlueprint.map((phase) => {
              const isActive = phase.id === activePhase.id;
              return (
                <Button
                  key={phase.id}
                  variant={isActive ? 'default' : 'outline'}
                  className="w-full justify-start gap-3"
                  onClick={() => setActivePhaseId(phase.id)}
                >
                  <Badge variant={isActive ? 'secondary' : 'outline'}>{phase.label}</Badge>
                  <span className="text-left text-sm text-muted-foreground">{phase.summary}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GitBranch className="h-5 w-5 text-primary" />
                {activePhase.label}
              </CardTitle>
              <CardDescription>{activePhase.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Objective</span>
                  <span className="text-xs text-muted-foreground">{activePhase.progress}% complete</span>
                </div>
                <p className="font-medium">{activePhase.objective}</p>
                <Progress value={activePhase.progress} className="mt-3" />
              </div>
              <Separator />
              <div className="space-y-4">
                {activePhase.activities.map((activity) => (
                  <div key={activity.title} className="flex items-start gap-3 rounded-md border p-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldHalf className="h-5 w-5 text-primary" />Cross-FSM Handshakes
              </CardTitle>
              <CardDescription>
                Terminus Prime stays synchronized with sibling state machines to avoid drift and duplicated work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 pr-4">
                <div className="space-y-4">
                  {crossLinks.map((link) => (
                    <div key={link.title} className="rounded-md border p-4">
                      <p className="font-semibold">{link.title}</p>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Alert>
            <Siren className="h-4 w-4" />
            <AlertTitle className="font-headline">Immutable Audit Notice</AlertTitle>
            <AlertDescription>
              Every phase emits deterministic breadcrumbs—perfect inputs for the Terminus Validator and Continuous Audit views.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </FsmViewWrapper>
  );
}
