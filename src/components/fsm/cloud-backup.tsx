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

type BackupState = 'idle' | 'scanning' | 'archiving' | 'encrypting' | 'uploading' | 'done' | 'error';

const hotspots = [
  'README.md',
  'package.json',
  'src/app/page.tsx',
  'src/ai/genkit.ts',
  '.github/workflows/main.yml',
  'docs/chckpt1-a2.t3.fb1.md',
];

const stateConfig: Record<Exclude<BackupState, 'idle' | 'error'>, { text: string; icon: React.ElementType; progress: number }> = {
  scanning: { text: 'Scanning for high-value files...', icon: FileScan, progress: 20 },
  archiving: { text: 'Compressing files into archive...', icon: Archive, progress: 40 },
  encrypting: { text: 'Encrypting archive with passphrase...', icon: Shield, progress: 60 },
  uploading: { text: 'Uploading to remote storage...', icon: UploadCloud, progress: 80 },
  done: { text: 'Backup complete and secured.', icon: CheckCircle, progress: 100 },
};

export function CloudBackup() {
  const [state, setState] = useState<BackupState>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [passphrase, setPassphrase] = useState('');
  const [remote, setRemote] = useState('b2:my-secure-bucket/backups');
  const { toast } = useToast();

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  };

  const runBackup = useCallback(async () => {
    if (!passphrase || !remote) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a passphrase and remote target.',
      });
      return;
    }

    setState('scanning');
    addLog('Initializing backup sequence...');
    await new Promise(res => setTimeout(res, 500));

    addLog(`Scanning ${hotspots.length} hotspots...`);
    hotspots.forEach(hp => addLog(`  [FOUND] ${hp}`));
    setState('archiving');
    await new Promise(res => setTimeout(res, 1000));

    addLog('Creating TAR.GZ archive...');
    setState('encrypting');
    await new Promise(res => setTimeout(res, 1500));

    addLog('Encrypting with AES-256-CBC...');
    setState('uploading');
    await new Promise(res => setTimeout(res, 2000));

    addLog(`Uploading to rclone remote: ${remote}`);
    await new Promise(res => setTimeout(res, 1500));

    addLog('Upload complete. Cleaning up temporary files...');
    setState('done');
    toast({
      title: 'Backup Successful',
      description: 'Your encrypted snapshot has been securely uploaded.',
    });
  }, [passphrase, remote, toast]);

  const CurrentIcon = state in stateConfig ? stateConfig[state as keyof typeof stateConfig].icon : Play;
  const currentProgress = state in stateConfig ? stateConfig[state as keyof typeof stateConfig].progress : 0;
  const isLoading = state !== 'idle' && state !== 'done' && state !== 'error';

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
                    <CurrentIcon className={cn("h-6 w-6 text-primary", isLoading && 'animate-spin')} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary-foreground/90">
                    {state in stateConfig ? stateConfig[state as keyof typeof stateConfig].text : 'Awaiting command...'}
                  </p>
                  <Progress value={currentProgress} className="mt-2 h-2" />
                </div>
              </div>
              <ScrollArea className="h-64 w-full rounded-md border bg-secondary/30 p-3 font-mono text-xs">
                {logs.length > 0 ? (
                  logs.map((log, i) => <p key={i} className="whitespace-pre-wrap leading-relaxed">{`> ${log}`}</p>)
                ) : (
                  <p className="text-muted-foreground">Logs will appear here...</p>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </FsmViewWrapper>
  );
}
