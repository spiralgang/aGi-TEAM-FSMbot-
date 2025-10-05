'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FsmViewWrapper } from './view-wrapper';
import { Bot, FileCheck2, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: 'Supermax Compliance FSM',
    description: 'Enforces discipline via a tamper-resistant audit vault, scanning all configs and dependencies.',
    icon: ShieldCheck,
  },
  {
    title: 'Policy-Driven Control',
    description: 'Parse YAML/JSON policy files using a deterministic FSM to direct behavior and enforce standards.',
    icon: FileCheck2,
  },
  {
    title: 'Creative AI Workflows',
    description: 'Build robust, multi-step AI coding assistants with FSMs to guide the creative process from task to completion.',
    icon: Bot,
  },
];

export function Dashboard() {
  return (
    <FsmViewWrapper
      title="Welcome to the aGi²TEAM³FSMbot¹ Factory"
      description="This is the factory floor, an enterprise-grade toolkit for building disciplined, compliant, and production-ready applications with a central AI and deterministic FSMs."
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
            <CardTitle className="font-headline">The Assembly Line Principle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="italic">
              "One robot can build a car by itself, but it'll take a long time, and if that super-knowledgeable robot breaks, the entire line comes to a dead halt. That's why Henry Ford made the modern assembly line: breaking tasks down into small instances with clear manuals that anything which can follow exact repetition patterns can replicate continually, forever."
            </p>
            <p>
              This system is built on that truth. A creative AI is a hyper-creative, but fallible, master craftsman. An FSM is a station on the assembly line—a tireless worker that perfectly executes one simple, structured task. This is not a demonstration; it is a factory for producing production-ready code.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Core Design Philosophy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This architecture relies on a clear separation of concerns between a single creative AI and an ecosystem of specialized, deterministic FSMs.
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong className="text-foreground">FSMs for Repetitive Tasks:</strong>
                 Each FSM is a specialist (a "Mop Boy"). One validates icons, another parses YAML, a third enforces file hygiene. They are finite, deterministic, and expert at their one job.
              </li>
              <li>
                <strong className="text-foreground">AI for Creative Tasks:</strong>
                The single AI Coder is freed to do what it does best—write novel code—because its FSM "workflow buddies" handle the validation, compliance, and quality control.
              </li>
              <li>
                <strong className="text-foreground">The Virtuous Cycle:</strong>
                This frees the human designer (the "super knowledgeable entity") to focus on higher-level architecture. These innovations then feed back into improving the FSMs themselves, creating a self-improving system that gets faster and more advanced with every loop.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </FsmViewWrapper>
  );
}
