'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { runCodeBotWorkflowAction } from '@/app/actions';
import type { AutomatedWorkflowWithCodeBotFSMOutput } from '@/ai/flows/automated-workflow-with-code-bot-fsm';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CodeBotFsm() {
  const [task, setTask] = useState('Create a simple python function that returns "hello world"');
  const [result, setResult] = useState<AutomatedWorkflowWithCodeBotFSMOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await runCodeBotWorkflowAction({ taskDescription: task });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Workflow Failed",
        description: response.error || "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  };

  return (
    <FsmViewWrapper
      title="Automated Workflow with Code Bot FSM"
      description="Build and run an AI FSM agentic workflow assistant to perform a coding task."
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-description">Task Description</Label>
              <Textarea
                id="task-description"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="font-code h-24"
                placeholder="Describe the coding task..."
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Workflow
            </Button>
          </form>
          
          {(isLoading || result) && (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold font-headline">Workflow Summary</h3>
                <ScrollArea className="h-72 rounded-md border bg-secondary/50 p-4">
                  {isLoading && !result && <p className="text-sm text-muted-foreground animate-pulse">Workflow running...</p>}
                  {result?.workflowSummary.split('\n').map((line, i) => (
                    line && <p key={i} className="text-sm text-muted-foreground mb-2">{line}</p>
                  ))}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold font-headline">Final Generated Code</h3>
                <ScrollArea className="h-72 rounded-md border bg-secondary/50 p-4 font-code text-sm">
                  {isLoading && !result && <p className="text-sm text-muted-foreground animate-pulse">Generating code...</p>}
                  <pre>{result?.generatedCode}</pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
