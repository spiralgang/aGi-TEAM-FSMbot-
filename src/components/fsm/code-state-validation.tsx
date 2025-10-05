'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
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
      title="Code State Validation FSM"
      description="Verifies code structure and state transitions against a defined FSM, acting as a 'pluggable' entry point for new validation logic."
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
                <Label htmlFor="fsm-input">FSM Definition</Label>
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
            <div className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold font-headline">Validation Result</h3>
              
              {/* Status Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      {result.isValid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={result.isValid ? 'default' : 'destructive'} className={result.isValid ? 'bg-accent text-accent-foreground' : ''}>
                          {result.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Syntax Score</p>
                    <p className="text-2xl font-bold">{result.syntaxScore || 0}/100</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">State Compliance</p>
                    <p className="text-2xl font-bold">{result.stateCompliance || 0}/100</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Detected States</p>
                    <p className="text-2xl font-bold">{result.detectedStates?.length || 0}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Detailed Results */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Validation Details</Label>
                    <div className="mt-2 p-4 rounded-md border bg-secondary/50">
                      <p className="text-sm whitespace-pre-wrap">{result.validationResult}</p>
                    </div>
                  </div>
                  
                  {result.detectedStates && result.detectedStates.length > 0 && (
                    <div>
                      <Label>Detected States</Label>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.detectedStates.map((state, i) => (
                          <Badge key={i} variant="outline">{state}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div>
                      <Label>Improvement Suggestions</Label>
                      <Card>
                        <CardContent className="pt-4">
                          <ul className="space-y-2">
                            {result.suggestions.map((suggestion, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <Lightbulb className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
