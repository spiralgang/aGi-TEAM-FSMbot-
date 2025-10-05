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

// This represents the "algebraic table function" or state transition table.
// It's a mathematical instance where: Current State + Input => Next State.
const fsmDefinition: Record<FSMState, { description: string, transitions: Partial<Record<string, FSMState>> }> = {
  idle: {
    description: "Waiting for a new statement. Expecting 'start'.",
    transitions: { 'start': 'tokenstart' }
  },
  tokenstart: {
    description: "Expecting a valid identifier (e.g., 'my_var').",
    transitions: { 'identifier': 'validate' }
  },
  validate: {
    description: "Expecting statement end ('End').",
    transitions: { 'end': 'idle' }
  },
  error: {
    description: "Syntax error. An unexpected token was received. Resetting to 'idle'.",
    transitions: {}
  }
};

// This function numerically equates the input token to a known type.
const getTokenType = (token: string): string => {
  if (token === 'start') return 'start';
  if (token === 'End') return 'End';
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) return 'identifier';
  return 'invalid';
};

export function SyntaxChecker() {
  const [token, setToken] = useState('');
  const [currentState, setCurrentState] = useState<FSMState>('idle');
  const [history, setHistory] = useState<string[]>([]);

  // The coroutine simulates the FSM's execution loop.
  const fsmInstance = useMemo(() => {
    return function* () {
      let state: FSMState = 'idle';
      while (true) {
        const receivedToken: string = yield state;
        const previousState = state;
        
        // 1. Numerically equate the input to a token type
        const tokenType = getTokenType(receivedToken);

        // 2. Run the "algebraic function": Look up the transition in the table
        const nextState = fsmDefinition[state].transitions[tokenType] || 'error';
        state = nextState;

        setHistory(h => [...h, `[${previousState}] --'${receivedToken}' (${tokenType})--> [${state}]`]);
        setCurrentState(state);

        // If an error state is reached, it automatically resets.
        if (state === 'error') {
          yield state; // Yield the error state so the UI can show it
          state = 'idle'; // Reset
          setCurrentState('idle');
        }
      }
    }();
  }, []);

  useEffect(() => {
    fsmInstance.next(); // Prime the generator.
  }, [fsmInstance]);

  const handleSendToken = () => {
    if (token.trim()) {
      fsmInstance.next(token.trim());
      setToken('');
    }
  };

  const handleReset = () => {
    // A true reset would require re-creating the generator instance,
    // but for this simulation, we can just reset the state and history.
    setCurrentState('idle');
    setHistory([]);
    setToken('');
    fsmInstance.next(); // Re-prime
    setHistory(h => [...h, `[RESET] --> [idle]`]);
  };

  const stateColors: Record<FSMState, string> = {
    idle: 'bg-blue-200 border-blue-400',
    tokenstart: 'bg-yellow-200 border-yellow-400',
    validate: 'bg-green-200 border-green-400',
    error: 'bg-red-200 border-red-400',
  };

  return (
    <FsmViewWrapper
      title="Syntax Checker FSM (Client-Side)"
      description="A proof of a client-side FSM. This component's logic is compiled directly into the application's JavaScript bundle. It runs entirely in the browser, demonstrating how FSMs can operate in a final product without any backend."
    >
      <Card>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-input">Input Token</Label>
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
               <p className="text-xs text-muted-foreground">This FSM validates the sequence: 'start' -> [identifier] -> 'End'.</p>
            </div>
            
            <div>
              <Label>State Transition History</Label>
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
                    {index < arr.length - 1 && state !== 'error' && <ArrowRight className="mx-2 h-5 w-5 text-muted-foreground" />}
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
