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
});
export type AntiFlailInput = z.infer<typeof AntiFlailInputSchema>;

const AntiFlailOutputSchema = z.object({
  status: z.string().describe('The status of the agent (stable, monitor, correct, halt).'),
  message: z.string().describe('A message indicating the current state and loop count.'),
});
export type AntiFlailOutput = z.infer<typeof AntiFlailOutputSchema>;

export async function antiFlailFlow(input: AntiFlailInput): Promise<AntiFlailOutput> {
  return antiFlailFSM(input);
}

const antiFlailFSMPrompt = ai.definePrompt({
  name: 'antiFlailFSMPrompt',
  input: {
    schema: AntiFlailInputSchema,
  },
  output: {
    schema: AntiFlailOutputSchema,
  },
  prompt: `You are an AI agent that monitors and limits the actions of another AI agent to prevent it from getting stuck in infinite loops or "thrashing". You will maintain a state that reflects the current status of the agent, track the number of loops, and escalate to a halt state if the agent repeats actions too many times.

The current state is: {{{status}}}
The current loop count is: {{{loopCount}}}
The action performed by the agent is: {{{action}}}

Based on this information, determine the next state and provide a message indicating the current state and loop count.

If the loop count exceeds the maximum allowed loops (currently 5), transition to the "halt" state and return a message indicating that thrashing has been detected. If the loop count is between 3 and 5, transition to the "correct" state to signal the need for corrective action. Otherwise, remain in the "stable" state.

Output:
{
  "status": "<next_state>",
  "message": "<status_message>"
}`,
});

const antiFlailFSM = ai.defineFlow(
  {
    name: 'antiFlailFSM',
    inputSchema: AntiFlailInputSchema,
    outputSchema: AntiFlailOutputSchema,
  },
  async input => {
    let loops = 0;
    let state = 'stable';
    const maxLoops = 5;

    loops++;

    if (loops > maxLoops) {
      state = 'halt';
      return {status: state, message: 'Halted: Thrashing detected'};
    }

    if (loops >= 3) {
      state = 'correct';
    }

    const {output} = await antiFlailFSMPrompt({
      ...input,
      status: state,
      loopCount: loops,
    });
    return output!;
  }
);
