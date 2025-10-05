'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { runTerminusValidatorAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { TerminusValidatorOutput } from '@/ai/flows/terminus-validator-fsm';

export function TerminusValidator() {
  const [text, setText] = useState('MyNewAIAgent.tsx');
  const [result, setResult] = useState<TerminusValidatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleValidate = async () => {
    setIsLoading(true);
    setResult(null);

    const response = await runTerminusValidatorAction({ text });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Validation Failed',
        description: response.error || 'An unknown error occurred.',
      });
    }

    setIsLoading(false);
  };

  return (
    <FsmViewWrapper
      title="Terminus Validator FSM"
      description="An FSM that enforces terminology compliance. Alias: FSM = Finite State Machine. This prevents incorrect references to 'AI' or 'agent' for deterministic workflows."
    >
      <Card>
        <CardHeader>
          <CardTitle>Pre-Save Compliance Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Filename or Description to Validate</Label>
            <div className="flex gap-2">
              <Input
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., MyNewComponent.tsx"
                className="font-code"
              />
              <Button onClick={handleValidate} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Validate'}
              </Button>
            </div>
          </div>

          {result && (
            <div className="mt-4">
              {result.isCompliant ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle className="font-headline">Compliance Approved</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-headline">Compliance Violation</AlertTitle>
                  <AlertDescription>
                    <p className="font-bold font-mono">{`"FSM = Finite State Machine, are you sure its an A.I you're working on , there's only 1 , ya know"`}</p>
                    <p className="mt-2 text-sm">{result.message}</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
