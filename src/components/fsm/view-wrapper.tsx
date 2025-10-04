import React from 'react';

interface FsmViewWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function FsmViewWrapper({ title, description, children }: FsmViewWrapperProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight font-headline">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
