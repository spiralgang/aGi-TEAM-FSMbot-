'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FsmViewWrapper } from './view-wrapper';
import { Bot, FileCheck2, ScanLine } from 'lucide-react';

const features = [
  {
    title: 'Code State Validation',
    description: 'Verify code structure and state using a defined FSM, leveraging GenAI for deep validation.',
    icon: FileCheck2,
  },
  {
    title: 'Syntax & Loop Checks',
    description: 'Use FSM-based checkers to prevent syntax errors and infinite loops during code generation.',
    icon: ScanLine,
  },
  {
    title: 'Agentic Workflows',
    description: 'Build robust, multi-step AI coding assistants with FSMs to guide them from task to completion.',
    icon: Bot,
  },
];

export function Dashboard() {
  return (
    <FsmViewWrapper
      title="Welcome to FSMAssist"
      description="Transforming AI coders from basic tools into highly optimized 'hero' assistants with Finite State Machines."
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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Why Finite State Machines?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            FSMs provide a deterministic, structured approach to building AI coding utilities. Instead of relying on unpredictable, conversational AI, FSMs target syntax validation, structure compliance, and error checking with precision.
          </p>
          <p>
            Each state strictly defines its inputs, processes, and outputs. This is perfect for linting, syntax checking, and real-time error correction. With FSMAssist, you can explore how this powerful paradigm prevents common AI failures like redundant loops and helps agents auto-recover from faults.
          </p>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
