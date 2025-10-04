'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuditStatus = 'pending' | 'running' | 'pass' | 'fail';

type AuditCheck = {
  id: string;
  title: string;
  status: AuditStatus;
  details: string;
};

const initialChecks: AuditCheck[] = [
  { id: 'file-check', title: 'Check for required files (README, package.json)', status: 'pending', details: '' },
  { id: 'lint-check', title: 'TypeScript Linting (Simulated)', status: 'pending', details: '' },
  { id: 'syntax-check', title: 'Next.js Component Syntax (Simulated)', status: 'pending', details: '' },
  { id: 'dependency-check', title: 'Dependency Audit (Simulated)', status: 'pending', details: '' },
  { id: 'prod-build', title: 'Production Build Test (Simulated)', status: 'pending', details: '' },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function ContinuousAudit() {
  const [checks, setChecks] = useState<AuditCheck[]>(initialChecks);
  const [isAuditing, setIsAuditing] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Audit not started.']);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const runAudit = useCallback(async () => {
    setIsAuditing(true);
    setLogs([]);
    addLog('Starting comprehensive code audit...');
    setChecks(initialChecks.map(c => ({...c, status: 'running' })));
    
    let allPassed = true;

    for (const check of initialChecks) {
      await sleep(500); // Simulate network/process time
      addLog(`Phase: ${check.title}`);
      
      // Simulate a successful or failed check
      const isSuccess = Math.random() > 0.3; // 70% chance of success
      
      if (isSuccess) {
        addLog(`[SUCCESS] ${check.title} passed.`);
        setChecks(prev => prev.map(c => c.id === check.id ? {...c, status: 'pass', details: 'Check passed successfully.'} : c));
      } else {
        allPassed = false;
        const errorDetail = `Mock error found in ${check.title}. Please review.`;
        addLog(`[CRITICAL] ${errorDetail}`);
        setChecks(prev => prev.map(c => c.id === check.id ? {...c, status: 'fail', details: errorDetail} : c));
        break; // Stop on first failure
      }
    }
    
    if (allPassed) {
      addLog('Audit completed successfully. NO CRITICAL ISSUES FOUND.');
      setChecks(prev => prev.map(c => c.status === 'running' ? {...c, status: 'pass'} : c));
    } else {
      addLog('Audit failed. Critical issues require attention.');
      // Mark remaining running checks as pending
      setChecks(prev => prev.map(c => c.status === 'running' ? {...c, status: 'pending'} : c));
    }

    setIsAuditing(false);
  }, []);

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'pending':
      default:
        return <div className="h-5 w-5 rounded-full bg-muted-foreground" />;
    }
  };

  return (
    <FsmViewWrapper
      title="Continuous Code Audit"
      description="A simulated CI/CD pipeline inspired by your audit script to ensure code quality."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Audit Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checks.map(check => (
                  <div key={check.id} className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <p className="font-medium">{check.title}</p>
                       <p className={cn("text-xs", check.status === 'fail' ? 'text-red-500' : 'text-muted-foreground')}>
                         {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                         {check.status === 'fail' && `: ${check.details}`}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
           </Card>
           <Button onClick={runAudit} disabled={isAuditing} className="w-full">
            {isAuditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Run Audit
          </Button>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border bg-secondary/50 p-4">
                <div className="font-code text-sm">
                  {logs.map((log, i) => (
                    <p key={i} className={cn(
                      log.includes('CRITICAL') && 'text-red-500',
                      log.includes('SUCCESS') && 'text-green-500',
                    )}>
                      {log}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </FsmViewWrapper>
  );
}
