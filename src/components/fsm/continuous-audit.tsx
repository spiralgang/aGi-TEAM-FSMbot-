'use client';

import React, { useState, useCallback } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Loader2, Play, FileScan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type AuditStatus = 'pending' | 'running' | 'pass' | 'fail';

type ConfigFile = {
  id: string;
  name: string;
  type: string;
  status: AuditStatus;
};

type AuditLog = {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'error';
};

const knownConfigs: Omit<ConfigFile, 'status'>[] = [
  { id: 'npm', name: 'package.json', type: 'Dependency Manager' },
  { id: 'gradle', name: 'build.gradle', type: 'Build System' },
  { id: 'copilot', name: 'copilot.yaml', type: 'Agentic Config' },
  { id: 'agent', name: 'agent.yaml', type: 'Agentic Config' },
  { id: 'pytest', name: 'pyproject.toml', type: 'Testing' },
  { id: 'hygiene', name: 'File System', type: 'Hygiene' },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function ContinuousAudit() {
  const [scannedFiles, setScannedFiles] = useState<ConfigFile[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([{ timestamp: new Date().toLocaleTimeString(), message: 'Supermax Compliance Agent standing by.', level: 'info' }]);
  const [vaultHash, setVaultHash] = useState<string | null>(null);

  const addLog = (message: string, level: AuditLog['level']) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, level }, ...prev]);
  };

  const runAudit = useCallback(async () => {
    setIsAuditing(true);
    setLogs([]);
    setVaultHash(null);
    addLog('Initializing Supermax Universal Compliance Agent...', 'info');
    await sleep(300);
    addLog('Ensuring hardened audit vault...', 'info');
    await sleep(200);

    // 1. Scan for configs
    addLog('Scanning for all known config, dependency, and manifest files...', 'info');
    setScannedFiles(knownConfigs.map(c => ({...c, status: 'pending' })));
    await sleep(500);

    // 2. Enforce hygiene
    const hygieneIndex = knownConfigs.findIndex(c => c.id === 'hygiene');
    setScannedFiles(prev => prev.map((file, index) => index === hygieneIndex ? { ...file, status: 'running' } : file));
    addLog('[ENFORCE] File Hygiene: Normalizing names, removing empty dirs...', 'info');
    await sleep(400);
    addLog('[PASS] File hygiene enforced.', 'success');
    setScannedFiles(prev => prev.map((file, index) => index === hygieneIndex ? { ...file, status: 'pass' } : file));

    // 3. Enforce subsystems
    let allPassed = true;
    for (let i = 0; i < knownConfigs.length; i++) {
      if (knownConfigs[i].id === 'hygiene') continue;

      setScannedFiles(prev => prev.map((file, index) => index === i ? { ...file, status: 'running' } : file));
      addLog(`[ENFORCE] Subsystem: ${knownConfigs[i].name}`, 'info');
      await sleep(350);

      const isSuccess = Math.random() > 0.2; // 80% chance of compliance
      if (isSuccess) {
        addLog(`[PASS] ${knownConfigs[i].name} is compliant.`, 'success');
        setScannedFiles(prev => prev.map((file, index) => index === i ? { ...file, status: 'pass' } : file));
      } else {
        allPassed = false;
        const errorDetail = `Compliance violation in ${knownConfigs[i].name}. PENALTY APPLIED.`;
        addLog(`[FAIL] ${errorDetail}`, 'error');
        setScannedFiles(prev => prev.map((file, index) => index === i ? { ...file, status: 'fail' } : file));
        break;
      }
    }
    
    // 4. Finalize
    if (allPassed) {
      addLog('SUPERMAX AUDIT: FULL COMPLIANCE ACHIEVED.', 'success');
    } else {
      addLog('SUPERMAX AUDIT: COMPLIANCE FAILURE. AGENT DISCIPLINED.', 'error');
    }
    
    const finalHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    setVaultHash(finalHash);
    addLog(`State update committed. Vault signed with key: ${finalHash.substring(0, 24)}...`, 'info');

    setIsAuditing(false);
  }, []);

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'pending': default: return <FileScan className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <FsmViewWrapper
      title="Supermax Universal Compliance Agent"
      description="Scans and enforces discipline across all configs, manifests, and dependencies with a tamper-resistant audit vault."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Compliance Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scannedFiles.length === 0 && <p className="text-muted-foreground text-sm">Awaiting scan...</p>}
                {scannedFiles.map(file => (
                  <div key={file.id} className="flex items-start gap-3">
                    {getStatusIcon(file.status)}
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                       <p className="text-xs text-muted-foreground">{file.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
           </Card>
           <Button onClick={runAudit} disabled={isAuditing} className="w-full">
            {isAuditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Enforce Compliance
          </Button>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tamper-Resistant Audit Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border bg-secondary/50 p-4">
                <div className="font-code text-sm">
                  {logs.map((log, i) => (
                    <p key={i} className="flex gap-2">
                      <span className="text-muted-foreground/50">{log.timestamp}</span>
                      <span className={cn(
                        log.level === 'error' && 'text-red-500',
                        log.level === 'success' && 'text-green-500',
                      )}>
                        {log.message}
                      </span>
                    </p>
                  ))}
                </div>
              </ScrollArea>
              {vaultHash && (
                <div className="mt-4 p-2 border rounded-md bg-secondary/80">
                  <p className="text-xs font-mono text-muted-foreground">VAULT SIGNATURE: <span className="text-foreground">{vaultHash}</span></p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FsmViewWrapper>
  );
}
