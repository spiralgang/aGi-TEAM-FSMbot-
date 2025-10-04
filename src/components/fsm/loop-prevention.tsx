'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type FsmState = 'stable' | 'monitor' | 'correct' | 'halt';

const MAX_LOOPS = 5;

const stateConfig: Record<FsmState, { icon: React.ElementType, title: string, description: string, variant: 'default' | 'destructive' | null, colorClass: string }> = {
  stable: {
    icon: ShieldCheck,
    title: 'Stable',
    description: 'Agent is operating normally. Loop count is low.',
    variant: null,
    colorClass: 'text-green-500'
  },
  monitor: {
    icon: Shield,
    title: 'Monitor',
    description: 'Agent action is being monitored. Loop count is increasing.',
    variant: null,
    colorClass: 'text-blue-500'
  },
  correct: {
    icon: ShieldAlert,
    title: 'Corrective Action',
    description: 'Loop count is high. Corrective action is advised to prevent thrashing.',
    variant: 'destructive',
    colorClass: 'text-yellow-500'
  },
halt: {
    icon: ShieldX,
    title: 'Halted',
    description: 'Thrashing detected. Agent has been halted to prevent infinite loops.',
    variant: 'destructive',
    colorClass: 'text-red-500'
  }
};

export function LoopPrevention() {
  const [loops, setLoops] = useState(0);
  const [state, setState] = useState<FsmState>('stable');
  const [message, setMessage] = useState('Ready to monitor agent actions.');

  const processAction = () => {
    if (state === 'halt') return;

    const newLoops = loops + 1;
    setLoops(newLoops);

    if (newLoops >= MAX_LOOPS) {
      setState('halt');
      setMessage(`Halted: Thrashing detected after ${newLoops} loops.`);
    } else if (newLoops >= 3) {
      setState('correct');
      setMessage(`Corrective action needed. Loop count: ${newLoops}.`);
    } else {
      setState('monitor');
      setMessage(`Monitoring action. Loop count: ${newLoops}.`);
    }
  };

  const resetFsm = () => {
    setLoops(0);
    setState('stable');
    setMessage('Ready to monitor agent actions.');
  };

  const CurrentIcon = stateConfig[state].icon;

  return (
    <FsmViewWrapper
      title="Anti-Flail FSM (Loop Prevention)"
      description="An FSM agent that prevents another AI from 'thrashing' by escalating to a halt state if it repeats actions too often."
    >
      <Card>
        <CardContent className="pt-6 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 flex flex-col items-center justify-center space-y-4 p-6 border rounded-lg bg-secondary/50">
            <CurrentIcon className={cn("h-16 w-16", stateConfig[state].colorClass)} strokeWidth={1.5} />
            <h3 className={cn("text-2xl font-bold font-headline", stateConfig[state].colorClass)}>{stateConfig[state].title}</h3>
            <p className="text-3xl font-mono font-bold">{loops}</p>
            <p className="text-sm text-muted-foreground">Loop Count</p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Alert variant={stateConfig[state].variant || undefined}>
              <CurrentIcon className={cn("h-4 w-4", stateConfig[state].colorClass)} />
              <AlertTitle className="font-headline">{stateConfig[state].title}</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={processAction} disabled={state === 'halt'} className="w-full">
                Process Agent Action
              </Button>
              <Button onClick={resetFsm} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset FSM
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Logic: state becomes 'correct' at 3 loops and 'halt' at 5 loops.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
