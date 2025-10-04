'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

export function LintCompliance() {
  const [code, setCode] = useState("function greet() {\n  // Missing 'return' statement\n}");
  const [rules, setRules] = useState("return, function");
  const [result, setResult] = useState<{ compliant: boolean, missing: string[] } | null>(null);

  const handleCheck = () => {
    const ruleList = rules.split(',').map(r => r.trim()).filter(r => r);
    const missingRules: string[] = [];

    for (const rule of ruleList) {
      if (!code.includes(rule)) {
        missingRules.push(rule);
      }
    }

    setResult({ compliant: missingRules.length === 0, missing: missingRules });
  };

  return (
    <FsmViewWrapper
      title="Lint Compliance Verification"
      description="Implement an FSM-like check to verify if generated code conforms to a set of rules."
    >
      <Card>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code-input">Code Snippet</Label>
              <Textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-code h-48"
                placeholder="Enter code to check..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rules-input">Compliance Rules (comma-separated)</Label>
              <Input
                id="rules-input"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="font-code"
                placeholder="e.g., const, let, =>"
              />
            </div>
            <Button onClick={handleCheck} className="w-full">Check Compliance</Button>
          </div>
          <div className="flex flex-col">
            <Label className="mb-2">Result</Label>
            <div className="flex-grow p-4 rounded-md border bg-secondary/50 flex items-center justify-center">
              {!result ? (
                <p className="text-muted-foreground">Results will be shown here.</p>
              ) : result.compliant ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <AlertTitle className="text-accent-foreground font-headline">Approved</AlertTitle>
                  <AlertDescription>
                    The code is compliant with all specified rules.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle className="font-headline">Rejected: Non-Compliant</AlertTitle>
                  <AlertDescription>
                    The code is missing the following required keywords:
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.missing.map(rule => (
                        <Badge key={rule} variant="destructive">{rule}</Badge>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
