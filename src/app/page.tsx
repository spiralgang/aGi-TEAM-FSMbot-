'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { Dashboard } from '@/components/fsm/dashboard';
import { EmbedGeminiManager } from '@/components/fsm/embed-gemini-manager';
import { ContinuousAudit } from '@/components/fsm/continuous-audit';
import { PolicyParsing } from '@/components/fsm/policy-parsing';
import { LucideValidator } from '@/components/fsm/lucide-validator';
import { SyntaxChecker } from '@/components/fsm/syntax-checker';
import { DraftSaver } from '@/components/fsm/draft-saver';
import { ContentWhisperer } from '@/components/fsm/content-whisperer';
import { FileTree } from '@/components/fsm/file-tree';
import { CodeStateValidation } from '@/components/fsm/code-state-validation';
import { LintCompliance } from '@/components/fsm/lint-compliance';
import { TodoManager } from '@/components/fsm/todo-manager';
import { LoopPrevention } from '@/components/fsm/loop-prevention';
import { CodeBotFsm } from '@/components/fsm/code-bot-fsm';
import { CloudBackup } from '@/components/fsm/cloud-backup';

const views: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  'embed-gemini-manager': <EmbedGeminiManager />,
  'continuous-audit': <ContinuousAudit />,
  'policy-parsing': <PolicyParsing />,
  'lucide-validator': <LucideValidator />,
  'syntax-checker': <SyntaxChecker />,
  'draft-saver': <DraftSaver />,
  'content-whisperer': <ContentWhisperer />,
  'file-tree': <FileTree />,
  'code-state-validation': <CodeStateValidation />,
  'lint-compliance': <LintCompliance />,
  'todo-manager': <TodoManager />,
  'loop-prevention': <LoopPrevention />,
  'code-bot-fsm': <CodeBotFsm />,
  'cloud-backup': <CloudBackup />,
};

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <SidebarInset>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {views[activeView]}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
