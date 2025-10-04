'use client';

import React, { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[];
};

const fileSystemData: FileSystemNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'button.tsx', type: 'file' },
          { name: 'card.tsx', type: 'file' },
        ],
      },
      {
        name: 'lib',
        type: 'folder',
        children: [{ name: 'utils.ts', type: 'file' }],
      },
      { name: 'app.tsx', type: 'file' },
      { name: 'index.css', type: 'file' },
    ],
  },
  {
    name: 'public',
    type: 'folder',
    children: [{ name: 'favicon.ico', type: 'file' }],
  },
  { name: 'package.json', type: 'file' },
  { name: 'README.md', type: 'file' },
];

const TreeNode: React.FC<{ node: FileSystemNode; level?: number }> = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const isFolder = node.type === 'folder';

  if (isFolder) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div
            className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted cursor-pointer"
            style={{ paddingLeft: `${level * 1.5 + 0.375}rem` }}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Folder className="h-4 w-4 text-primary" />
            <span>{node.name}</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {node.children?.map((child) => (
            <TreeNode key={child.name} node={child} level={level + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div
      className="flex items-center space-x-2 p-1.5 rounded-md"
      style={{ paddingLeft: `${level * 1.5 + 0.375}rem` }}
    >
      <File className="h-4 w-4 ml-[1.5rem]" />
      <span>{node.name}</span>
    </div>
  );
};


export function FileTree() {
  return (
    <FsmViewWrapper
      title="File & Folder Management"
      description="Organize and structure folders and layouts for AI and human developers."
    >
      <Card>
        <CardContent className="pt-6">
          <div className="font-code text-sm">
            {fileSystemData.map((node) => (
              <TreeNode key={node.name} node={node} />
            ))}
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
