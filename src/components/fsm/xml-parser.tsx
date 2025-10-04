
'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// TODO: Define the action and types for the XML parser flow
// import { runXmlParserWorkflowAction } from '@/app/actions';
// import type { XmlParserWorkflowOutput } from '@/ai/flows/xml-parser-fsm';

export function XmlParserFsm() {
  const [xmlContent, setXmlContent] = useState('');
  // const [result, setResult] = useState<XmlParserWorkflowOutput | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xmlContent.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "XML content cannot be empty.",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);

    // TODO: Implement the actual workflow action call
    // const response = await runXmlParserWorkflowAction({ xmlContent });

    // Mock response for now
    const response = { success: true, data: { analysis: "This is a mock analysis of the XML." } };

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Workflow Failed",
        // description: response.error || "An unknown error occurred.",
        description: "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  };

  return (
    <FsmViewWrapper
      title="XML Manifest Parser FSM"
      description="An agentic workflow to parse, analyze, and extract insights from XML manifest files."
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xml-content">XML Manifest Content</Label>
              <Textarea
                id="xml-content"
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                className="font-code h-48"
                placeholder="Paste your XML content here..."
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Parse and Analyze XML
            </Button>
          </form>
          
          {(isLoading || result) && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold font-headline">Analysis Result</h3>
              <ScrollArea className="h-72 rounded-md border bg-secondary/50 p-4">
                {isLoading && !result && <p className="text-sm text-muted-foreground animate-pulse">Analyzing XML...</p>}
                <pre className="text-sm whitespace-pre-wrap">{result?.analysis}</pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
