'use client';

import { useState, useMemo, useEffect } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type FSMState = 'idle' | 'tokenstart' | 'validate' | 'error';

const fsmDefinition: Record<FSMState, { description: string, transitions: Partial<Record<string, FSMState>> }> = {
  idle: {
    description: "Waiting for a new statement.",
    transitions: { 'start': 'tokenstart' }
  },
  tokenstart: {
    description: "Expecting an identifier.",
    transitions: { 'identifier': 'validate' }
  },
  validate: {
    description: "Expecting statement end.",
    transitions: { 'End': 'idle' }
  },
  error: {
    description: "Syntax error encountered.",
    transitions: {}
  }
};

export function SyntaxChecker() {
  const [token, setToken] = useState('');
  const [currentState, setCurrentState] = useState<FSMState>('idle');
  const [history, setHistory] = useState<string[]>([]);

  const syntaxCheckerFSM = useMemo(() => {
    return function* () {
      let state: FSMState = 'idle';
      while (true) {
        const receivedToken: string = yield state;
        const previousState = state;
        let transitioned = false;

        if (state === 'idle' && receivedToken === 'start') {
          state = 'tokenstart';
          transitioned = true;
        } else if (state === 'tokenstart') {
          if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(receivedToken)) {
            state = 'validate';
            transitioned = true;
          }
        } else if (state === 'validate') {
          if (receivedToken === 'End') {
            state = 'idle';
            transitioned = true;
          }
        }

        if (!transitioned && state !== 'error') {
          state = 'error';
        }
        
        setHistory(h => [...h, `[${previousState}] --'${receivedToken}'--> [${state}]`]);
        setCurrentState(state);

        if (state === 'error') {
          yield state;
          state = 'idle';
          setCurrentState(state);
        }
      }
    };
  }, []);

  const [fsmInstance, setFsmInstance] = useState(() => syntaxCheckerFSM());

  useEffect(() => {
    fsmInstance.next(); // Prime the generator
  }, [fsmInstance]);

  const handleSendToken = () => {
    if (token.trim()) {
      fsmInstance.next(token.trim());
      setToken('');
    }
  };

  const handleReset = () => {
    setFsmInstance(syntaxCheckerFSM());
    setCurrentState('idle');
    setHistory([]);
    setToken('');
  }

  const stateColors: Record<FSMState, string> = {
    idle: 'bg-blue-200 border-blue-400',
    tokenstart: 'bg-yellow-200 border-yellow-400',
    validate: 'bg-green-200 border-green-400',
    error: 'bg-red-200 border-red-400',
  };

  return (
    <FsmViewWrapper
      title="Syntax Checker FSM"
      description="Utilizes a coroutine FSM to validate syntax, preventing loops and wasted computation."
    >
      <Card>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-input">Token</Label>
              <div className="flex gap-2">
                <Input
                  id="token-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendToken()}
                  placeholder="e.g., start, my_var, End"
                  className="font-code"
                />
                <Button onClick={handleSendToken}>Send</Button>
                <Button onClick={handleReset} variant="outline">Reset</Button>
              </div>
            </div>
            
            <div>
              <Label>Transition History</Label>
              <div className="mt-2 p-3 h-48 rounded-md border bg-secondary/50 font-code text-sm overflow-auto">
                {history.map((h, i) => <p key={i}>{h}</p>)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>FSM Diagram & Current State</Label>
            <div className="p-4 rounded-md border flex flex-col items-center justify-center space-y-4 min-h-[260px]">
              <div className="flex gap-2 items-center flex-wrap justify-center">
                {(Object.keys(fsmDefinition) as FSMState[]).map((state, index, arr) => (
                  <div key={state} className="flex items-center">
                    <Badge
                      className={cn(
                        "p-2 px-4 text-sm transition-all duration-300",
                        stateColors[state],
                        currentState === state ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-70'
                      )}
                    >
                      {state.charAt(0).toUpperCase() + state.slice(1)}
                    </Badge>
                    {index < arr.length - 1 && <ArrowRight className="mx-2 h-5 w-5 text-muted-foreground" />}
                  </div>
                ))}
              </div>
              <p className="text-center text-muted-foreground mt-4">
                Current state: <strong className="text-foreground">{currentState}</strong>. {fsmDefinition[currentState]?.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
