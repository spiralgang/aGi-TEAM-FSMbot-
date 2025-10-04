'use client';

import { useState } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Play, Check, X, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskState = 'pending' | 'in_progress' | 'completed' | 'blocked';

interface Task {
  id: number;
  name: string;
  state: TaskState;
}

const stateConfig: Record<TaskState, { color: string; label: string }> = {
  pending: { color: 'bg-gray-200 text-gray-800', label: 'Pending' },
  in_progress: { color: 'bg-blue-200 text-blue-800', label: 'In Progress' },
  completed: { color: 'bg-green-200 text-green-800', label: 'Completed' },
  blocked: { color: 'bg-red-200 text-red-800', label: 'Blocked' },
};

const transitions: Partial<Record<TaskState, TaskState[]>> = {
  pending: ['in_progress'],
  in_progress: ['completed', 'blocked'],
  blocked: ['in_progress'],
};

export function TodoManager() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: 'Implement AI feature', state: 'pending' },
    { id: 2, name: 'Refactor FSM logic', state: 'in_progress' },
    { id: 3, name: 'Write documentation', state: 'blocked' },
  ]);
  const [newTaskName, setNewTaskName] = useState('');

  const handleTransition = (taskId: number, newState: TaskState) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, state: newState } : t));
  };

  const addTask = () => {
    if (newTaskName.trim()) {
      setTasks([...tasks, { id: Date.now(), name: newTaskName, state: 'pending' }]);
      setNewTaskName('');
    }
  };

  const getActions = (task: Task) => {
    const possibleTransitions = transitions[task.state] || [];
    return (
      <>
        {possibleTransitions.includes('in_progress') && (
          <Button size="icon" variant="ghost" onClick={() => handleTransition(task.id, 'in_progress')}><Play className="h-4 w-4" /></Button>
        )}
        {possibleTransitions.includes('completed') && (
          <Button size="icon" variant="ghost" onClick={() => handleTransition(task.id, 'completed')}><Check className="h-4 w-4" /></Button>
        )}
        {possibleTransitions.includes('blocked') && (
          <Button size="icon" variant="ghost" onClick={() => handleTransition(task.id, 'blocked')}><X className="h-4 w-4" /></Button>
        )}
        {task.state === 'blocked' && (
          <Button size="icon" variant="ghost" onClick={() => handleTransition(task.id, 'in_progress')}><Undo2 className="h-4 w-4" /></Button>
        )}
      </>
    );
  };

  return (
    <FsmViewWrapper
      title="TODO Manager FSM"
      description="An FSM-driven task manager to organize and track the state of an AI-assisted coding workflow."
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Tasks</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2 pt-2">
            <Input
              type="text"
              placeholder="New task name..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <Button onClick={addTask}><Plus className="mr-2 h-4 w-4"/>Add Task</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-md border bg-card-foreground/[.02]">
                <div className="flex items-center gap-4">
                  <Badge className={cn("border-transparent", stateConfig[task.state].color)}>{stateConfig[task.state].label}</Badge>
                  <span className="font-medium">{task.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getActions(task)}
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks yet. Add one to get started!</p>}
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
