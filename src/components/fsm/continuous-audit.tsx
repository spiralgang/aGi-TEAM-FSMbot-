'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Loader2, Play, FileScan, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type AuditStatus = 'pending' | 'running' | 'pass' | 'fail';
type PermissionState = 'needed' | 'granted' | 'expired';

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

const SESSION_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

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
  
  const [permissionState, setPermissionState] = useState<PermissionState>('needed');
  const [rememberGrant, setRememberGrant] = useState(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    sessionTimeoutRef.current = setTimeout(() => {
      setPermissionState('expired');
    }, SESSION_TIMEOUT_MS);
  }, []);

  const handleGrantPermission = () => {
    setPermissionState('granted');
    resetSessionTimeout();
  };

  useEffect(() => {
    // Clean up timeout on component unmount
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  const addLog = (message: string, level: AuditLog['level']) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, level }, ...prev]);
    resetSessionTimeout(); // User activity resets the timer
  };

  const runAudit = useCallback(async () => {
    if (permissionState !== 'granted') return;

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
  }, [permissionState, resetSessionTimeout]);

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'pending': default: return <FileScan className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  if (permissionState !== 'granted') {
    return (
       <FsmViewWrapper
        title="Supermax Universal Compliance Agent"
        description="Scans and enforces discipline across all configs, manifests, and dependencies with a tamper-resistant audit vault."
       >
        <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-2xl font-bold font-headline mb-2">
            {permissionState === 'needed' ? 'Full Permissions Required' : 'Session Expired'}
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {permissionState === 'needed' 
              ? 'To function, this utility requires elevated permissions to scan, modify, and enforce compliance across the file system. Access is temporary and recedes after the session ends.'
              : 'Your session has expired due to inactivity. Please grant permissions again to continue.'
            }
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={handleGrantPermission} size="lg">
              Grant Full Permissions for Session
            </Button>
            <div className="flex items-center space-x-2">
              <Switch id="remember-grant" checked={rememberGrant} onCheckedChange={setRememberGrant} />
              <Label htmlFor="remember-grant" className="text-sm text-muted-foreground">Remember my choice for this workflow</Label>
            </div>
          </div>
        </Card>
      </FsmViewWrapper>
    )
  }

  return (
    <FsmViewWrapper
      title="Supermax Universal Compliance Agent"
      description="Scans and enforces discipline across all configs, manifests, and dependencies with a tamper-resistant audit vault."
    >
      <Alert variant="default" className="mb-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <AlertTitle className="font-headline text-green-800 dark:text-green-300">Permissions Granted</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          Full permissions are active for this session. The session will expire after 20 minutes of inactivity.
        </AlertDescription>
      </Alert>
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
