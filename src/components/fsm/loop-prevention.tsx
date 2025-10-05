'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkLoopPreventionAction } from '@/app/actions';
import type { AntiFlailOutput } from '@/ai/flows/loop-prevention';
import { useToast } from '@/hooks/use-toast';

type FsmState = 'stable' | 'monitor' | 'correct' | 'halt';

const MAX_LOOPS = 5;

const stateConfig: Record<FsmState, { icon: React.ElementType, title: string, description: string, variant: 'default' | 'destructive' | null, colorClass: string }> = {
  stable: {
    icon: ShieldCheck,
    title: 'Stable',
    description: 'AI is operating normally. Loop count is low.',
    variant: null,
    colorClass: 'text-green-500'
  },
  monitor: {
    icon: Shield,
    title: 'Monitor',
    description: 'AI action is being monitored. Loop count is increasing.',
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
    description: 'Thrashing detected. AI has been halted to prevent infinite loops.',
    variant: 'destructive',
    colorClass: 'text-red-500'
  }
};

export function LoopPrevention() {
  const [currentAction, setCurrentAction] = useState('generate_code');
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [state, setState] = useState<FsmState>('stable');
  const [message, setMessage] = useState('Ready to monitor agent actions.');
  const [result, setResult] = useState<AntiFlailOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [message, setMessage] = useState('Ready to monitor AI actions.');

  const processAction = async () => {
    if (state === 'halt') return;

    setIsLoading(true);
    
    try {
      const response = await checkLoopPreventionAction({
        action: currentAction,
        previousActions: actionHistory,
        contextId: 'demo-session'
      });

      if (response.success && response.data) {
        const newResult = response.data;
        setResult(newResult);
        setState(newResult.status as FsmState);
        setMessage(newResult.message);
        
        // Update action history
        const newHistory = [...actionHistory, currentAction];
        setActionHistory(newHistory.slice(-10)); // Keep last 10 actions
        
        if (newResult.shouldIntervene) {
          toast({
            variant: newResult.status === 'halt' ? "destructive" : "default",
            title: "Loop Detection Alert",
            description: newResult.message,
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Unable to analyze action for loop patterns",
      });
    }
    
    setIsLoading(false);
  };

  const resetFsm = () => {
    setActionHistory([]);
    setState('stable');
    setMessage('Ready to monitor agent actions.');
    setResult(null);
    setMessage('Ready to monitor AI actions.');
  };

  const CurrentIcon = stateConfig[state].icon;

  return (
    <FsmViewWrapper
      title="Anti-Flail FSM (Loop Prevention)"
      description="An FSM that prevents the creative AI from 'thrashing' by escalating to a halt state if it repeats actions too often."
    >
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action-input">Current Action</Label>
                <Input
                  id="action-input"
                  value={currentAction}
                  onChange={(e) => setCurrentAction(e.target.value)}
                  placeholder="e.g., generate_code, validate_syntax, fix_error"
                  className="font-code"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Action History ({actionHistory.length}/10)</Label>
                <div className="flex flex-wrap gap-1 min-h-[40px] p-2 border rounded-md bg-secondary/50">
                  {actionHistory.length > 0 ? actionHistory.map((action, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{action}</Badge>
                  )) : (
                    <span className="text-sm text-muted-foreground">No actions recorded yet</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={processAction} disabled={state === 'halt' || isLoading} className="w-full md:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Process Action
              <Button onClick={processAction} disabled={state === 'halt'} className="w-full">
                Process AI Action
              </Button>
              <Button onClick={resetFsm} variant="outline" className="w-full md:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset FSM
              </Button>
            </div>
          </div>
          
          {/* Status Display */}
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex flex-col items-center justify-center space-y-4 p-6 border rounded-lg bg-secondary/50">
              <CurrentIcon className={cn("h-16 w-16", stateConfig[state].colorClass)} strokeWidth={1.5} />
              <h3 className={cn("text-2xl font-bold font-headline", stateConfig[state].colorClass)}>{stateConfig[state].title}</h3>
              <p className="text-3xl font-mono font-bold">{actionHistory.length}</p>
              <p className="text-sm text-muted-foreground">Total Actions</p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Alert variant={stateConfig[state].variant || undefined}>
                <CurrentIcon className={cn("h-4 w-4", stateConfig[state].colorClass)} />
                <AlertTitle className="font-headline">{stateConfig[state].title}</AlertTitle>
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              
              {result && (
                <div className="space-y-3">
                  {result.shouldIntervene && (
                    <Alert variant={state === 'halt' ? 'destructive' : 'default'}>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Intervention Required</AlertTitle>
                      <AlertDescription>
                        {result.recommendedAction || 'Consider changing approach or adding variety to actions'}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Enhanced loop detection with pattern recognition and alternating sequence detection.</p>
                    <p>Intervention escalates from STABLE → MONITOR → CORRECT → HALT based on repetition patterns.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
