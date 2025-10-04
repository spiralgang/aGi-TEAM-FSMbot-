'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { validateCodeStateAction } from '@/app/actions';
import type { CodeStateValidationOutput } from '@/ai/flows/code-state-validation';
import { useToast } from '@/hooks/use-toast';

export function CodeStateValidation() {
  const [code, setCode] = useState("fsm.syntax_ok()\nfsm.lint_ok()\nfsm.finish()");
  const [fsm, setFsm] = useState(
`class CodeFSM(StateMachine):
  validating = State('Validating', initial=True)
  linting = State('Linting')
  error = State('Error')
  done = State('Done')
  
  syntax_ok = validating.to(linting)
  lint_ok = linting.to(done)
  error_found = validating.to(error)
`
  );
  const [result, setResult] = useState<CodeStateValidationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await validateCodeStateAction({ code, fsmDefinition: fsm });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: response.error || "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  };

  return (
    <FsmViewWrapper
      title="Code State Validation"
      description="Verifies code structure and state transitions using a defined FSM and GenAI."
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code-input">Code Snippet</Label>
                <Textarea
                  id="code-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-code h-48"
                  placeholder="Enter code to validate..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fsm-input">FSM Definition</Label>♥
                <Textarea
                  id="fsm-input"
                  value={fsm}
                  onChange={(e) => setFsm(e.target.value)}
                  className="font-code h-48"
                  placeholder="Enter FSM definition..."
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate Code
            </Button>
          </form>
          
          {result && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold font-headline">Validation Result</h3>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={result.isValid ? 'default' : 'destructive'} className={result.isValid ? 'bg-accent text-accent-foreground' : ''}>
                  {result.isValid ? 'Valid' : 'Invalid'}
                </Badge>
              </div>
              <div>
                <Label>Details:</Label>
                <div className="mt-2 p-4 rounded-md border bg-secondary/50">
                  <p className="text-sm whitespace-pre-wrap">{result.validationResult}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
