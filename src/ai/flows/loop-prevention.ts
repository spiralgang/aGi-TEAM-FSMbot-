'use server';

/**
 * @fileOverview This file implements an Anti-Flail FSM to prevent AI agents from
 *   repeating code patterns excessively. It acts as a circuit-breaker, escalating
 *   from a 'stable' state to 'monitor', 'correct', and finally 'halt' if an agent
 *   thrashes, thus preserving system resources and preventing infinite loops.
 *
 * - antiFlailFlow - An exported wrapper function to call the antiFlailFSM flow.
 * - AntiFlailInput - The input type for the antiFlailFlow function.
 * - AntiFlailOutput - The return type for the antiFlailFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AntiFlailInputSchema = z.object({
  action: z.string().describe('The action performed by the AI agent.'),
  previousActions: z.array(z.string()).optional().describe('History of previous actions for loop detection.'),
  contextId: z.string().optional().describe('Unique identifier to track action sequences across calls.'),
});
export type AntiFlailInput = z.infer<typeof AntiFlailInputSchema>;

const AntiFlailOutputSchema = z.object({
  status: z.string().describe('The status of the agent (stable, monitor, correct, halt).'),
  message: z.string().describe('A message indicating the current state and loop count.'),
  shouldIntervene: z.boolean().describe('Whether intervention is needed to break the loop.'),
  recommendedAction: z.string().optional().describe('Suggested action to break the loop pattern.'),
});
export type AntiFlailOutput = z.infer<typeof AntiFlailOutputSchema>;

export async function antiFlailFlow(input: AntiFlailInput): Promise<AntiFlailOutput> {
  return antiFlailFSM(input);
}

const antiFlailFSMPrompt = ai.definePrompt({
  name: 'antiFlailFSMPrompt',
  input: {
    schema: z.object({
      action: z.string(),
      status: z.string(),
      loopCount: z.number(),
    }),
  },
  output: {
    schema: AntiFlailOutputSchema,
  },
  prompt: `You are an advanced anti-thrashing FSM agent designed to prevent AI agents from getting stuck in infinite loops. 
You act as a circuit-breaker that escalates intervention based on repetitive behavior patterns.

CURRENT MONITORING STATE: {{{status}}}
REPETITION COUNT: {{{loopCount}}}
CURRENT ACTION: {{{action}}}

FSM STATE DEFINITIONS:
- STABLE: Normal operation, no intervention needed
- MONITOR: Repetitive actions detected, increasing vigilance  
- CORRECT: Loop pattern confirmed, corrective action required
- HALT: Critical thrashing detected, immediate intervention required

INTERVENTION ESCALATION RULES:
- 1-2 repetitions: STABLE → MONITOR (watch closely)
- 3-4 repetitions: MONITOR → CORRECT (suggest alternative approach)  
- 5+ repetitions: CORRECT → HALT (force circuit break)

Your role is to provide intelligent feedback that helps break unproductive patterns while allowing legitimate iterative refinement.

Analyze the current situation and provide appropriate state transition and guidance.

Output format:
{
  "status": "<appropriate_fsm_state>",
  "message": "<clear_guidance_message_with_specific_recommendations>"
}`,
});

const antiFlailFSM = ai.defineFlow(
  {
    name: 'antiFlailFSM',
    inputSchema: AntiFlailInputSchema,
    outputSchema: AntiFlailOutputSchema,
  },
  async input => {
    const actionHistory = input.previousActions || [];
    const currentAction = input.action;
    
    // Enhanced loop detection algorithm
    const recentActions = [...actionHistory, currentAction].slice(-10); // Keep last 10 actions
    const actionCounts = recentActions.reduce((acc, action) => {
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxRepetitions = Math.max(...Object.values(actionCounts));
    const mostRepeatedAction = Object.keys(actionCounts).find(
      action => actionCounts[action] === maxRepetitions
    );
    
    // Detect patterns (A->B->A->B cycles)
    const hasAlternatingPattern = recentActions.length >= 4 && 
      recentActions.slice(-4).filter((action, i) => action === recentActions[recentActions.length - 4 + (i % 2)]).length === 4;
    
    let state = 'stable';
    let shouldIntervene = false;
    let message = `Processing action: "${currentAction}"`;
    let recommendedAction: string | undefined;

    if (maxRepetitions >= 5) {
      state = 'halt';
      shouldIntervene = true;
      message = `🛑 HALT: Action "${mostRepeatedAction}" repeated ${maxRepetitions} times. Thrashing detected.`;
      recommendedAction = 'Force state transition to break infinite loop';
    } else if (maxRepetitions >= 3 || hasAlternatingPattern) {
      state = 'correct';
      shouldIntervene = true;
      message = hasAlternatingPattern 
        ? `⚠️  CORRECT: Alternating pattern detected in recent actions`
        : `⚠️  CORRECT: Action "${mostRepeatedAction}" repeated ${maxRepetitions} times. Intervention needed.`;
      recommendedAction = 'Change workflow approach or skip to validation state';
    } else if (maxRepetitions >= 2) {
      state = 'monitor';
      message = `👀 MONITOR: Action "${mostRepeatedAction}" repeated ${maxRepetitions} times. Watching for loops.`;
    } else {
      state = 'stable';
      message = `✅ STABLE: Action diversity maintained. No loops detected.`;
    }

    const {output} = await antiFlailFSMPrompt({
      action: currentAction,
      status: state,
      loopCount: maxRepetitions,
    });

    return {
      status: output?.status || state,
      message: output?.message || message,
      shouldIntervene,
      recommendedAction,
    };
  }
);
