'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { validateIconsAction } from '@/app/actions';
import type { LucidIconValidatorOutput } from '@/ai/flows/lucide-icon-validator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const exampleCode = `import {
  Bot,
  ClipboardCheck,
  Code,
  FileCheck2,
  FileCode,
  FileTree, // Invalid icon
  FolderTree,
  LayoutDashboard,
  ListTodo,
  RefreshCwOff,
  ScanLine,
  ShieldCheck,
  NonExistentIcon, // Invalid icon
} from 'lucide-react';`;

export function LucideValidator() {
  const [code, setCode] = useState(exampleCode);
  const [result, setResult] = useState<LucidIconValidatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await validateIconsAction({ code });

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
      title="Lucide Icon Validator"
      description="An FSM-based agent to find invalid lucide-react icons in your code and suggest fixes."
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code-input">Code Snippet</Label>
                <Textarea
                  id="code-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-code h-80"
                  placeholder="Paste code with lucide-react imports..."
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Validate Icons
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-headline">Validation Result</h3>
            {isLoading && (
              <div className="flex items-center justify-center rounded-md border h-full bg-secondary/50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {result && (
              <>
                {result.invalidIcons.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>All Good!</AlertTitle>
                    <AlertDescription>
                      All {result.validIcons.length} lucide-react icons are valid.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Invalid Icons Found!</AlertTitle>
                    <AlertDescription>
                      The following icons do not exist in lucide-react:
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.invalidIcons.map(icon => (
                          <Badge key={icon} variant="destructive">{icon}</Badge>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {Object.keys(result.recommendations).length > 0 && (
                   <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Suggestions</AlertTitle>
                    <AlertDescription>
                      The AI agent suggests the following corrections:
                      <ul className="mt-2 list-disc list-inside">
                        {Object.entries(result.recommendations).map(([invalid, valid]) => (
                          <li key={invalid}>
                            Replace <code className="font-code text-red-500">{invalid}</code> with <code className="font-code text-green-500">{valid}</code>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                 <Card>
                  <CardContent className="pt-6">
                    <Label>Valid Icons Detected</Label>
                     <div className="flex flex-wrap gap-2 mt-2">
                      {result.validIcons.map(icon => (
                          <Badge key={icon} variant="secondary">{icon}</Badge>
                        ))}
                    </div>
                  </CardContent>
                 </Card>
              </>
            )}
            {!isLoading && !result && (
              <div className="flex items-center justify-center rounded-md border h-full text-muted-foreground bg-secondary/50">
                <p>Output will be shown here.</p>
              </div>
            )}
        </div>
      </div>
    </FsmViewWrapper>
  );
}
