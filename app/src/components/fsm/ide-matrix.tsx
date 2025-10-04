'use client';

import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function IDEMatrix() {
  return (
    <FsmViewWrapper
      title="IDE Matrix"
      description="A simulated polyglot IDE inspired by WebLabs-MobIDE, running entirely in the browser with a virtual file system, terminal, and AI agent capabilities."
    >
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This component is under construction.</p>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
