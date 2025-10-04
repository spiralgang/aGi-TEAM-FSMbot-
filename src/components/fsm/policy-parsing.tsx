'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { parsePolicyAction } from '@/app/actions';
import type { PolicyParsingFSMOutput } from '@/ai/flows/policy-parsing-fsm';
import { useToast } from '@/hooks/use-toast';

const examplePolicy = `
agent:
  name: "ComplianceEnforcer"
  behaviors:
    - "Normalize files"
    - "Run build checks"
    - "Audit artifacts"
    - "Enforce org policies"
plugins:
  - "copilot"
  - "android"
  - "security"
`.trim();

export function PolicyParsing() {
  const [policyInput, setPolicyInput] = useState(examplePolicy);
  const [result, setResult] = useState<PolicyParsingFSMOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await parsePolicyAction(policyInput);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Parsing Failed",
        description: response.error || "An unknown error occurred.",
      });
      setResult({ isValid: false, errorMessage: response.error || "An unknown error occurred." });
    }

    setIsLoading(false);
  };

  return (
    <FsmViewWrapper
      title="Policy Parsing FSM"
      description="A deterministic FSM agent that interprets structured policy files (like YAML) to direct other AI agents."
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="policy-input">Policy (YAML) Input</Label>
                <Textarea
                  id="policy-input"
                  value={policyInput}
                  onChange={(e) => setPolicyInput(e.target.value)}
                  className="font-code h-96"
                  placeholder="Enter YAML policy to parse..."
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Parse Policy
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 font-headline">Parsing Result</h3>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge variant={result.isValid ? 'default' : 'destructive'} className={result.isValid ? 'bg-accent text-accent-foreground' : ''}>
                    {result.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div>
                  <Label>Output (JSON):</Label>
                  <div className="mt-2 p-4 rounded-md border bg-secondary/50 font-code text-sm overflow-auto h-96">
                    <pre>
                      {result.isValid 
                        ? JSON.stringify(result.parsedPolicy, null, 2) 
                        : result.errorMessage}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Output will be shown here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FsmViewWrapper>
  );
}
