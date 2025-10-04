'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { HardDriveDownload, Trash2, History } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const DRAFT_SAVE_KEY = 'fsm_draft_saver_bin';
const MIN_CONTENT_LENGTH = 50;
const SAVE_DEBOUNCE_MS = 3000;

type SavedDraft = {
  id: string;
  content: string;
  title: string;
  location: string;
  timestamp: number;
};

export function DraftSaver() {
  const [text, setText] = useState('');
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load drafts from localStorage on component mount
    try {
      const storedDrafts = localStorage.getItem(DRAFT_SAVE_KEY);
      if (storedDrafts) {
        let drafts: SavedDraft[] = JSON.parse(storedDrafts);
        // Filter out drafts older than 24 hours
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        drafts = drafts.filter(d => d.timestamp > twentyFourHoursAgo);
        setSavedDrafts(drafts);
      }
    } catch (error) {
      console.error("Failed to load drafts from localStorage", error);
    }
  }, []);

  const saveDraft = useCallback(() => {
    if (text.length < MIN_CONTENT_LENGTH) return;

    // Generate a summary title (mocking an LLM call)
    const firstLine = text.split('\n')[0];
    const title = firstLine.length > 40 ? firstLine.substring(0, 37) + '...' : firstLine;
    
    const newDraft: SavedDraft = {
      id: `draft-${Date.now()}`,
      content: text,
      title: title || "Untitled Draft",
      location: "Main Editor",
      timestamp: Date.now(),
    };

    try {
      const updatedDrafts = [newDraft, ...savedDrafts].slice(0, 10); // Keep max 10 drafts
      localStorage.setItem(DRAFT_SAVE_KEY, JSON.stringify(updatedDrafts));
      setSavedDrafts(updatedDrafts);
      toast({
        title: "Draft Saved!",
        description: `Your work has been saved to the recycling bin.`,
      });
    } catch (error) {
      console.error("Failed to save draft to localStorage", error);
       toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save draft due to storage limits.",
      });
    }

  }, [text, savedDrafts, toast]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (text.length >= MIN_CONTENT_LENGTH) {
      debounceTimeout.current = setTimeout(saveDraft, SAVE_DEBOUNCE_MS);
    }
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [text, saveDraft]);

  const restoreDraft = (content: string) => {
    setText(content);
    toast({
      title: "Draft Restored",
      description: "The selected draft has been loaded into the editor.",
    });
  };
  
  const deleteDraft = (id: string) => {
     try {
      const updatedDrafts = savedDrafts.filter(d => d.id !== id);
      localStorage.setItem(DRAFT_SAVE_KEY, JSON.stringify(updatedDrafts));
      setSavedDrafts(updatedDrafts);
       toast({
        title: "Draft Deleted",
      });
    } catch (error) {
      console.error("Failed to delete draft from localStorage", error);
    }
  }

  return (
    <FsmViewWrapper
      title="Recycling Bin FSM (Draft Saver)"
      description="Automatically saves long-form content to a temporary 'bin' to prevent work loss from session timeouts."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Input Area</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing your long, well-articulated thoughts here. If you pause after writing a bit, your draft will be auto-saved..."
                className="h-96 font-code"
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><History className="h-5 w-5" /> Draft History (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {savedDrafts.length > 0 ? (
                    savedDrafts.map(draft => (
                      <div key={draft.id} className="p-3 rounded-md border bg-secondary/50 flex flex-col gap-2">
                        <p className="font-semibold truncate text-sm">{draft.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved {formatDistanceToNow(new Date(draft.timestamp), { addSuffix: true })} from {draft.location}
                        </p>
                        <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="w-full" onClick={() => restoreDraft(draft.content)}>
                            <HardDriveDownload className="mr-2 h-4 w-4" /> Restore
                          </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button size="sm" variant="destructive" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the draft. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteDraft(draft.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center p-4">
                      <p>No recent drafts saved. Start typing in the editor to save your work.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </FsmViewWrapper>
  );
}