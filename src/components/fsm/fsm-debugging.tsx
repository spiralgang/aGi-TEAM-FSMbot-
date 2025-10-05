'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bug, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { debugFSMAction } from '@/app/actions';
import type { FSMDebuggingOutput } from '@/ai/flows/fsm-debugging';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FSMDebugging() {
  const [fsmCode, setFsmCode] = useState(`class TaskFSM {
  constructor() {
    this.state = 'idle';
    this.validTransitions = {
      idle: ['planning', 'working'],
      planning: ['working', 'idle'],
      working: ['testing', 'planning'],
      testing: ['done', 'working'],
      done: []
    };
  }
  
  transition(newState) {
    if (this.validTransitions[this.state].includes(newState)) {
      this.state = newState;
      return true;
    }
    return false;
  }
}`);
  
  const [stateDefinition, setStateDefinition] = useState(`States: idle, planning, working, testing, done
Initial: idle
Final: done
Transitions:
- idle -> planning, working
- planning -> working, idle
- working -> testing, planning  
- testing -> done, working`);
  
  const [expectedBehavior, setExpectedBehavior] = useState('FSM should progress from idle through planning and working to testing, then reach done state');
  
  const [currentIssue, setCurrentIssue] = useState('');
  
  const [result, setResult] = useState<FSMDebuggingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await debugFSMAction({
      fsmCode,
      stateDefinition: stateDefinition || undefined,
      expectedBehavior: expectedBehavior || undefined,
      currentIssue: currentIssue || undefined,
    });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "FSM Analysis Failed", 
        description: response.error || "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <FsmViewWrapper
      title="FSM Debugging & Analysis"
      description="Comprehensive FSM analysis tool that debugs state machines, validates transitions, and provides visualization and optimization suggestions."
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fsm-code">FSM Code to Analyze</Label>
                  <Textarea
                    id="fsm-code"
                    value={fsmCode}
                    onChange={(e) => setFsmCode(e.target.value)}
                    className="font-code h-48"
                    placeholder="Enter your FSM implementation code..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state-definition">State Definition (Optional)</Label>
                  <Textarea
                    id="state-definition"
                    value={stateDefinition}
                    onChange={(e) => setStateDefinition(e.target.value)}
                    className="font-code h-32"
                    placeholder="Define your states and transitions..."
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expected-behavior">Expected Behavior (Optional)</Label>
                  <Textarea
                    id="expected-behavior"
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    className="h-24"
                    placeholder="Describe how the FSM should behave..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current-issue">Current Issue (Optional)</Label>
                  <Textarea
                    id="current-issue"
                    value={currentIssue}
                    onChange={(e) => setCurrentIssue(e.target.value)}
                    className="h-24"
                    placeholder="Describe any problems or unexpected behavior..."
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Bug className="mr-2 h-4 w-4" />
              Analyze FSM
            </Button>
          </form>
          
          {(isLoading || result) && (
            <div className="mt-8 space-y-6">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span>Analyzing FSM structure and behavior...</span>
                </div>
              )}
              
              {result && (
                <>
                  {/* Analysis Overview */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(result.severity)}
                          <div>
                            <p className="text-sm text-muted-foreground">Severity</p>
                            <Badge className={getSeverityColor(result.severity)}>
                              {result.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Detected States</p>
                        <p className="text-2xl font-bold">{result.stateAnalysis.detectedStates.length}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Valid Transitions</p>
                        <p className="text-2xl font-bold">{result.transitionAnalysis.validTransitions.length}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Issues Found</p>
                        <p className="text-2xl font-bold">
                          {result.transitionAnalysis.invalidTransitions.length + 
                           result.stateAnalysis.unreachableStates.length}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Detailed Analysis */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>State Analysis</Label>
                        <Card>
                          <CardContent className="pt-4 space-y-3">
                            <div>
                              <p className="text-sm font-medium">Detected States ({result.stateAnalysis.detectedStates.length})</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.stateAnalysis.detectedStates.map((state, i) => (
                                  <Badge key={i} variant="outline">{state}</Badge>
                                ))}
                              </div>
                            </div>
                            
                            {result.stateAnalysis.initialState && (
                              <div>
                                <p className="text-sm font-medium">Initial State</p>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {result.stateAnalysis.initialState}
                                </Badge>
                              </div>
                            )}
                            
                            {result.stateAnalysis.finalStates.length > 0 && (
                              <div>
                                <p className="text-sm font-medium">Final States ({result.stateAnalysis.finalStates.length})</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.stateAnalysis.finalStates.map((state, i) => (
                                    <Badge key={i} className="bg-green-100 text-green-800">{state}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {result.stateAnalysis.unreachableStates.length > 0 && (
                              <div>
                                <p className="text-sm font-medium">Unreachable States ({result.stateAnalysis.unreachableStates.length})</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.stateAnalysis.unreachableStates.map((state, i) => (
                                    <Badge key={i} className="bg-red-100 text-red-800">{state}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div>
                        <Label>Transition Analysis</Label>
                        <Card>
                          <CardContent className="pt-4 space-y-3">
                            <div>
                              <p className="text-sm font-medium">Valid Transitions ({result.transitionAnalysis.validTransitions.length})</p>
                              <ScrollArea className="h-24 mt-1">
                                <div className="space-y-1">
                                  {result.transitionAnalysis.validTransitions.map((transition, i) => (
                                    <p key={i} className="text-xs font-code">{transition}</p>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                            
                            {result.transitionAnalysis.invalidTransitions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-red-700">Invalid Transitions ({result.transitionAnalysis.invalidTransitions.length})</p>
                                <ScrollArea className="h-20 mt-1">
                                  <div className="space-y-1">
                                    {result.transitionAnalysis.invalidTransitions.map((transition, i) => (
                                      <p key={i} className="text-xs font-code text-red-600">{transition}</p>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Visual Representation</Label>
                        <Card>
                          <CardContent className="pt-4">
                            <ScrollArea className="h-48">
                              <pre className="text-xs font-code whitespace-pre-wrap">
                                {result.visualRepresentation}
                              </pre>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div>
                        <Label>Suggestions</Label>
                        <Card>
                          <CardContent className="pt-4">
                            <ScrollArea className="h-32">
                              <ul className="space-y-2">
                                {result.suggestions.map((suggestion, i) => (
                                  <li key={i} className="text-sm flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                  
                  {/* Debugging Report */}
                  <div>
                    <Label>Detailed Analysis Report</Label>
                    <Card>
                      <CardContent className="pt-4">
                        <ScrollArea className="h-64">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm">
                              {result.debuggingReport}
                            </pre>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}