'use client';

import React, { useState, useMemo } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, Smile } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const NAUGHTY_LIST = ['fuck', 'shit', 'damn', 'hell', 'bitch', 'crap'];
const NICE_LIST = ['please', 'thank you', 'awesome', 'great', 'wonderful', 'amazing'];

export function ContentWhisperer() {
  const [text, setText] = useState('This is a wonderful test. But damn, this is hard.');
  const [popoverState, setPopoverState] =
    useState<{ targetId: string; content: React.ReactNode } | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setPopoverState(null); // Close popover on text change
  };

  const processedText = useMemo(() => {
    const words = text.split(/(\s+)/); // Split by whitespace but keep separators

    return words.map((word, index) => {
      const lowerWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
      const uniqueId = `word-${index}`;
      let isFlagged = false;
      let whisperContent: React.ReactNode = null;
      let badgeStyle = '';

      if (NAUGHTY_LIST.includes(lowerWord)) {
        isFlagged = true;
        badgeStyle = 'bg-destructive/20 text-destructive-foreground ring-1 ring-destructive/50';
        whisperContent = (
          <div className="p-2 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>This word might be unprofessional.</span>
          </div>
        );
      } else if (NICE_LIST.includes(lowerWord)) {
        isFlagged = true;
        badgeStyle = 'bg-accent/20 text-accent-foreground ring-1 ring-accent/50';
        whisperContent = (
          <div className="p-2 text-sm flex items-center gap-2">
            <Smile className="h-4 w-4 text-accent" />
            <span>This is a positive word! Keep it up.</span>
          </div>
        );
      }

      if (isFlagged) {
        return (
          <Popover key={uniqueId} open={popoverState?.targetId === uniqueId} onOpenChange={(open) => !open && setPopoverState(null)}>
            <PopoverTrigger asChild>
              <span
                id={uniqueId}
                className={`rounded-md cursor-pointer ${badgeStyle}`}
                onClick={() => setPopoverState({ targetId: uniqueId, content: whisperContent })}
              >
                {word}
              </span>
            </PopoverTrigger>
            {popoverState?.targetId === uniqueId && (
              <PopoverContent side="top" align="center" className="w-auto">
                {whisperContent}
              </PopoverContent>
            )}
          </Popover>
        );
      }
      return <span key={uniqueId}>{word}</span>;
    });
  }, [text, popoverState]);

  return (
    <FsmViewWrapper
      title="Stalk-Watch-Listen FSM (Content Whisperer)"
      description="A bot that 'Santa Clauses' your text, checking it for words that might get you noticed and providing subtle 'whispers'."
    >
      <Card>
        <CardHeader>
          <CardTitle>Monitored Text Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div
              className="w-full rounded-md border border-input bg-background p-3 text-base ring-offset-background min-h-[200px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm"
              onClick={() => document.getElementById('hidden-textarea')?.focus()}
            >
              <div className="whitespace-pre-wrap">{processedText}</div>
               <textarea
                id="hidden-textarea"
                value={text}
                onChange={handleTextChange}
                className="absolute opacity-0 w-0 h-0" // Hide textarea but keep it accessible
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Click on a highlighted word to see the 'whisper'. This FSM checks for words like 'damn' (bad) or 'wonderful' (good).
            </p>
          </div>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
