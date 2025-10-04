'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FsmViewWrapper } from './view-wrapper';
import { Bot, FileCheck2, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: 'Supermax Compliance Agent',
    description: 'Enforces discipline via a tamper-resistant audit vault, scanning all configs and dependencies.',
    icon: ShieldCheck,
  },
  {
    title: 'Policy-Driven Control',
    description: 'Parse YAML/JSON policy files to direct agent behavior and enforce organizational standards.',
    icon: FileCheck2,
  },
  {
    title: 'Agentic FSM Workflows',
    description: 'Build robust, multi-step AI coding assistants with FSMs to guide them from task to completion.',
    icon: Bot,
  },
];

export function Dashboard() {
  return (
    <FsmViewWrapper
      title="Welcome to FSMAssist"
      description="An enterprise-grade toolkit for building disciplined, compliant, and production-ready AI agents using FSMs."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">{feature.title}</CardTitle>
              <feature.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Compliance vs. Quality Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This system operates on the principle of **Compliance through Discipline**. Unlike quality control, which refines output, compliance focuses on enforcing strict, non-negotiable standards. An agent's failure to comply results in a penalty, logged in a tamper-resistant audit vault.
            </p>
            <p>
              FSMs provide the deterministic backbone for this model. Each state represents a compliance checkpoint. By chaining these states, we create a Supermax agent—a system that self-audits, enforces rules across all subsystems, and maintains a verifiable record of its discipline.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Core Design Philosophy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
             <p>
              A clear separation of concerns is critical for building powerful and reliable automated systems.
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong className="text-foreground">FSMs for Structure:</strong>
                Anything with well-documented, strict parameters is handled by a deterministic Finite State Machine. This includes parsing configs, validating schemas, and managing predefined workflows.
              </li>
              <li>
                <strong className="text-foreground">AI for Creativity:</strong>
                Tasks requiring inference, creativity, novel ideas, or code writing are delegated to an AI Agent. The FSM acts as the orchestrator, feeding the agent the structured data it needs.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </FsmViewWrapper>
  );
}
