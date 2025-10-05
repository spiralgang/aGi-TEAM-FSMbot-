'use client';

import React, { useState, useEffect } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Code, Github, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

type TriggerSource = 'user' | 'ci' | 'self';
type TargetAgent = 'validator' | 'parser' | 'creative' | 'audit';

const triggers: { id: TriggerSource; label: string; icon: React.ElementType }[] = [
  { id: 'user', label: 'User Command', icon: Code },
  { id: 'ci', label: 'CI/CD Webhook', icon: Github },
  { id: 'self', label: 'Self-Correction Loop', icon: Bot },
];

const agents: { id: TargetAgent; label: string; icon: React.ElementType }[] = [
  { id: 'validator', label: 'Validator FSM', icon: Cpu },
  { id: 'parser', label: 'Parser FSM', icon: Cpu },
  { id: 'audit', label: 'Audit FSM', icon: Cpu },
  { id: 'creative', label: 'Creative AI', icon: Bot },
];

const routingLogic: Record<TriggerSource, TargetAgent> = {
  user: 'creative',
  ci: 'audit',
  self: 'validator',
};

export function TerminusPrime() {
  const [activeTrigger, setActiveTrigger] = useState<TriggerSource | null>(null);
  const [activeAgent, setActiveAgent] = useState<TargetAgent | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTriggerClick = (triggerId: TriggerSource) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveTrigger(triggerId);
    
    setTimeout(() => {
      const targetAgent = routingLogic[triggerId];
      setActiveAgent(targetAgent);
    }, 500);

    setTimeout(() => {
      setIsAnimating(false);
      setActiveTrigger(null);
      setActiveAgent(null);
    }, 2500);
  };

  return (
    <FsmViewWrapper
      title="Terminus Prime Dispatch"
      description="The master FSM ('Factory Foreman') that triages all incoming events and routes them to the correct agent, turning chaotic inputs into a deterministic assembly line."
    >
      <Card>
        <CardHeader>
          <CardTitle>Master Workflow Dispatch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row items-center justify-around gap-8 p-8 min-h-[400px]">
          {/* Triggers */}
          <div className="space-y-4 flex flex-col items-center">
            <h3 className="font-semibold text-center">INCOMING TRIGGERS</h3>
            {triggers.map((trigger) => (
              <Button
                key={trigger.id}
                variant="outline"
                size="lg"
                className={cn(
                  "w-48 justify-start",
                  activeTrigger === trigger.id && "bg-primary/20 border-primary ring-2 ring-primary"
                )}
                onClick={() => handleTriggerClick(trigger.id)}
                disabled={isAnimating}
              >
                <trigger.icon className="mr-2 h-5 w-5" />
                {trigger.label}
              </Button>
            ))}
          </div>

          {/* Dispatcher FSM */}
          <div className="relative flex flex-col items-center">
             <div className="p-4 bg-primary/10 rounded-full border-2 border-dashed border-primary mb-2">
                <Cpu className="h-12 w-12 text-primary" />
             </div>
             <p className="font-bold font-headline text-primary">TERMINUS PRIME</p>
             <p className="text-sm text-muted-foreground">FSM Dispatcher</p>
          </div>

          {/* Target Agents */}
          <div className="space-y-4 flex flex-col items-center">
            <h3 className="font-semibold text-center">TARGET AGENTS</h3>
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={cn(
                  "flex items-center w-48 p-3 border rounded-lg transition-all duration-300",
                  activeAgent === agent.id ? "bg-accent/20 border-accent ring-2 ring-accent" : "bg-secondary/50"
                )}
              >
                <agent.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{agent.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
