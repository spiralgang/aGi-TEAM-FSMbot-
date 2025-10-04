'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { parseYamlAction } from '@/app/actions';
import type { YamlParsingFSMOutput } from '@/ai/flows/yaml-parsing-fsm';
import { useToast } from '@/hooks/use-toast';

export function YamlParsing() {
  const [yamlInput, setYamlInput] = useState(
`config:
  key1: value1
  nested:
    subkey: subvalue`
  );
  const [result, setResult] = useState<YamlParsingFSMOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await parseYamlAction(yamlInput);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Parsing Failed",
        description: response.error || "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  };

  return (
    <FsmViewWrapper
      title="YAML Parsing FSM"
      description="Applies a YAML parser implemented as an FSM to catch syntax and structural errors."
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yaml-input">YAML Input</Label>
                <Textarea
                  id="yaml-input"
                  value={yamlInput}
                  onChange={(e) => setYamlInput(e.target.value)}
                  className="font-code h-64"
                  placeholder="Enter YAML to parse..."
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Parse YAML
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
                  <Label>Output:</Label>
                  <div className="mt-2 p-4 rounded-md border bg-secondary/50 font-code text-sm overflow-auto h-64">
                    <pre>
                      {result.isValid 
                        ? JSON.stringify(result.parsedYaml, null, 2) 
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
