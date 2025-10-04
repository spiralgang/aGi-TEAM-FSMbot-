'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { Dashboard } from '@/components/fsm/dashboard';
import { CodeStateValidation } from '@/components/fsm/code-state-validation';
import { PolicyParsing } from '@/components/fsm/policy-parsing';
import { SyntaxChecker } from '@/components/fsm/syntax-checker';
import { LintCompliance } from '@/components/fsm/lint-compliance';
import { TodoManager } from '@/components/fsm/todo-manager';
import { LoopPrevention } from '@/components/fsm/loop-prevention';
import { CodeBotFsm } from '@/components/fsm/code-bot-fsm';
import { FileTree } from '@/components/fsm/file-tree';
import { ContinuousAudit } from '@/components/fsm/continuous-audit';
import { LucideValidator } from '@/components/fsm/lucide-validator';

const views: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  'code-state-validation': <CodeStateValidation />,
  'policy-parsing': <PolicyParsing />,
  'syntax-checker': <SyntaxChecker />,
  'lint-compliance': <LintCompliance />,
  'lucide-validator': <LucideValidator />,
  'todo-manager': <TodoManager />,
  'loop-prevention': <LoopPrevention />,
  'code-bot-fsm': <CodeBotFsm />,
  'file-tree': <FileTree />,
  'continuous-audit': <ContinuousAudit />,
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
