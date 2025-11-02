'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, Shield, Archive, UploadCloud, Loader2, FileScan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { runCloudBackupAction } from '@/app/actions';
import type { CloudBackupFSMOutput, BackupState } from '@/ai/flows/cloud-backup-fsm';

const stateConfig: Record<Exclude<BackupState, 'idle' | 'error'>, { text: string; icon: React.ElementType; progress: number }> = {
  scanning: { text: 'Scanning for high-value files...', icon: FileScan, progress: 20 },
  archiving: { text: 'Compressing files into archive...', icon: Archive, progress: 40 },
  encrypting: { text: 'Encrypting archive with passphrase...', icon: Shield, progress: 60 },
  uploading: { text: 'Uploading to remote storage...', icon: UploadCloud, progress: 80 },
  done: { text: 'Backup complete and secured.', icon: CheckCircle, progress: 100 },
};

export function CloudBackup() {
  const [result, setResult] = useState<CloudBackupFSMOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [remote, setRemote] = useState('b2:my-secure-bucket/backups');
  const { toast } = useToast();

  const runBackup = useCallback(async () => {
    if (!passphrase || !remote) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a passphrase and remote target.',
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    const response = await runCloudBackupAction({ passphrase, remoteTarget: remote });

    if (response.success && response.data) {
      setResult(response.data);
      if (response.data.state === 'done') {
        toast({
          title: 'Backup Successful',
          description: 'Your encrypted snapshot has been securely uploaded.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Backup Failed',
        description: response.error || 'An unknown error occurred.',
      });
      setResult({ state: 'error', logs: [response.error || 'An unknown error occurred.'] });
    }

    setIsLoading(false);
  }, [passphrase, remote, toast]);

  const state = result?.state || 'idle';
  const logs = result?.logs || [];
  const CurrentIcon = state in stateConfig ? stateConfig[state as keyof typeof stateConfig].icon : Play;
  const currentProgress = state in stateConfig ? stateConfig[state as keyof typeof stateConfig].progress : 0;
  
  return (
    <FsmViewWrapper
      title="Cloud Backup & Encryption FSM"
      description="An FSM that automates a multi-step backup workflow: scanning, archiving, encrypting, and uploading project files."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Backup Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Encryption Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter a strong passphrase"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remote">Rclone Remote Target</Label>
              <Input
                id="remote"
                type="text"
                value={remote}
                onChange={(e) => setRemote(e.target.value)}
                placeholder="e.g., b2:my-bucket/snapshots"
                disabled={isLoading}
              />
            </div>
            <Button onClick={runBackup} disabled={isLoading || !passphrase || !remote} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Encrypted Backup
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">FSM State & Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="p-3 bg-primary/10 rounded-full">
                    <CurrentIcon className={cn("h-6 w-6 text-primary", isLoading && state !== 'done' && 'animate-spin')} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary-foreground/90">
                    {state in stateConfig ? stateConfig[state as keyof typeof stateConfig].text : (state === 'error' ? 'Error Occurred' : 'Awaiting command...')}
                  </p>
                  <Progress value={currentProgress} className="mt-2 h-2" />
                </div>
              </div>
              <ScrollArea className="h-64 w-full rounded-md border bg-secondary/30 p-3 font-mono text-xs">
                {logs.length > 0 ? (
                  logs.map((log, i) => <p key={i} className="whitespace-pre-wrap leading-relaxed">{`> ${log}`}</p>)
                ) : (
                  <p className="text-muted-foreground">{isLoading ? "Running..." : "Logs will appear here..."}</p>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </FsmViewWrapper>
  );
}
