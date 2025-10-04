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

const exampleXml = `
<?xml version="1.0" encoding="UTF-8"?>
<project name="FSMAssist">
  <dependencies>
    <dependency>
      <groupId>org.example</groupId>
      <artifactId>fsm-core</artifactId>
      <version>1.2.0</version>
    </dependency>
    <dependency>
      <groupId>com.ai</groupId>
      <artifactId>agent-sdk</artifactId>
      <version>3.0.1</version>
    </dependency>
  </dependencies>
  <plugins>
    <plugin>lint-checker</plugin>
    <plugin>compliance-auditor</plugin>
  </plugins>
</project>
`.trim();

export function XmlParserFsm() {
  const [xmlContent, setXmlContent] = useState(exampleXml);
  // const [result, setResult] = useState<XmlParserWorkflowOutput | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xmlContent.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'XML content cannot be empty.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);

    // TODO: Implement the actual workflow action call
    // const response = await runXmlParserWorkflowAction({ xmlContent });

    // Mock response for now
    await new Promise(res => setTimeout(res, 1500));
    const mockAnalysis = {
      analysis: `FSM ANALYSIS COMPLETE:
- Parsed root element: <project>
- Detected 2 dependencies:
  - fsm-core (v1.2.0)
  - agent-sdk (v3.0.1)
- Found 2 plugins:
  - lint-checker
  - compliance-auditor
- ASSESSMENT: Project appears to be an agentic system with core FSM and AI SDK dependencies. Standard compliance plugins are active.
`
    };
    const response = { success: true, data: mockAnalysis };

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Workflow Failed',
        // description: response.error || "An unknown error occurred.",
        description: 'An unknown error occurred.',
      });
    }

    setIsLoading(false);
  };

  return (
    <FsmViewWrapper
      title="XML Manifest Parser FSM"
      description="An agentic workflow to parse, analyze, and extract insights from XML manifest files, similar to the YAML Policy Parser."
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="xml-content">XML Manifest Content</Label>
                <Textarea
                  id="xml-content"
                  value={xmlContent}
                  onChange={(e) => setXmlContent(e.target.value)}
                  className="font-code h-80"
                  placeholder="Paste your XML content here..."
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Parse and Analyze XML
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 font-headline">Analysis Result</h3>
            <ScrollArea className="h-80 rounded-md border bg-secondary/50 p-4">
              {isLoading && !result ? (
                <p className="text-sm text-muted-foreground animate-pulse">Analyzing XML...</p>
              ) : result ? (
                <pre className="text-sm whitespace-pre-wrap font-code">{result?.analysis}</pre>
              ) : (
                <p className="text-sm text-muted-foreground">Output will be shown here.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </FsmViewWrapper>
  );
}
