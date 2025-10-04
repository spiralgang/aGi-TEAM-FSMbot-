'use client';

import React, { useState, useMemo } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, Smile } from 'lucide-react';

const NAUGHTY_LIST = ['fuck', 'shit', 'damn', 'hell', 'bitch'];
const NICE_LIST = ['please', 'thank you', 'awesome', 'great', 'wonderful'];

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
        badgeStyle = 'bg-red-200 text-red-800 ring-1 ring-red-400';
        whisperContent = (
          <div className="p-2 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>This word might be considered unprofessional.</span>
          </div>
        );
      } else if (NICE_LIST.includes(lowerWord)) {
        isFlagged = true;
        badgeStyle = 'bg-green-200 text-green-800 ring-1 ring-green-400';
        whisperContent = (
          <div className="p-2 text-sm flex items-center gap-2">
            <Smile className="h-4 w-4 text-green-500" />
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
      title="Stalk-Walk-Listen FSM (Content Whisperer)"
      description="A bot that 'Santa Clauses' your text, checking it twice for words that might get you noticed and providing subtle 'whispers'."
    >
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="whisper-input">Monitored Text Area</Label>
            <div
              className="w-full rounded-md border border-input bg-background p-3 text-base ring-offset-background min-h-[200px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm"
              onClick={() => document.getElementById('hidden-textarea')?.focus()}
            >
              <div className="whitespace-pre-wrap">{processedText}</div>
               <textarea
                id="hidden-textarea"
                value={text}
                onChange={handleTextChange}
                className="sr-only" // The textarea is visually hidden but focusable
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