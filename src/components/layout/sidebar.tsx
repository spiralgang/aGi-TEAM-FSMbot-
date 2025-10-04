'use client';

import {
  Bot,
  ClipboardCheck,
  Code,
  FileCheck2,
  FileCode,
  FolderTree,
  LayoutDashboard,
  ListTodo,
  RefreshCwOff,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'code-state-validation', label: 'Code State Validation', icon: FileCheck2 },
  { id: 'yaml-parsing', label: 'YAML Parser', icon: FileCode },
  { id: 'syntax-checker', label: 'Syntax Checker', icon: ScanLine },
  { id: 'lint-compliance', label: 'Lint Compliance', icon: ClipboardCheck },
  { id: 'lucide-validator', label: 'Lucide Validator', icon: ShieldCheck },
  { id: 'todo-manager', label: 'TODO Manager', icon: ListTodo },
  { id: 'loop-prevention', label: 'Loop Prevention', icon: RefreshCwOff },
  { id: 'code-bot-fsm', label: 'Code Bot Workflow', icon: Bot },
  { id: 'file-tree', label: 'File Tree', icon: FolderTree },
  { id: 'continuous-audit', label: 'Continuous Audit', icon: ShieldCheck },
];

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Code className="size-6 text-primary" />
          <h1 className="text-xl font-semibold font-headline">FSMAssist</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveView(item.id)}
                isActive={activeView === item.id}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
