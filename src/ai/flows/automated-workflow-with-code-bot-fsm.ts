'use server';

/**
 * @fileOverview A creative coding workflow using a Finite State Machine (FSM) to guide the central AI.
 * This file exports the `automatedWorkflowWithCodeBotFSM` function, which enables the AI to build code
 * by moving through defined states, transitions, and actions within a Genkit flow.
 *
 * - automatedWorkflowWithCodeBotFSM - The main function to orchestrate the FSM-driven coding workflow.
 * - AutomatedWorkflowWithCodeBotFSMInput - The input type for the automatedWorkflowWithCodeBotFSM function.
 * - AutomatedWorkflowWithCodeBotFSMOutput - The return type for the automatedWorkflowWithCodeBotFSM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedWorkflowWithCodeBotFSMInputSchema = z.object({
  taskDescription: z.string().describe('The description of the coding task to be performed.'),
});
export type AutomatedWorkflowWithCodeBotFSMInput = z.infer<typeof AutomatedWorkflowWithCodeBotFSMInputSchema>;

const AutomatedWorkflowWithCodeBotFSMOutputSchema = z.object({
  generatedCode: z.string().describe('The final generated code from the FSM-driven workflow.'),
  workflowSummary: z.string().describe('A summary of the steps and states traversed during the workflow.'),
});
export type AutomatedWorkflowWithCodeBotFSMOutput = z.infer<typeof AutomatedWorkflowWithCodeBotFSMOutputSchema>;

export async function automatedWorkflowWithCodeBotFSM(input: AutomatedWorkflowWithCodeBotFSMInput): Promise<AutomatedWorkflowWithCodeBotFSMOutput> {
  return automatedWorkflowWithCodeBotFSMFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeBotFSMPrompt',
  input: {
    schema: z.object({
      taskDescription: z.string(),
      currentState: z.string(),
      previousCode: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      nextState: z.string().describe('The next state in the FSM workflow.'),
      agentAction: z.string().describe('The action to be performed by the AI.'),
      generatedCode: z.string().describe('The code generated or modified in this step.'),
      reasoning: z.string().describe('Explanation of the AI action and state transition.'),
    }),
  },
  prompt: `You are a creative AI coder operating within a finite state machine.
Your task is to assist in generating code based on the user provided description, working one state at a time.

You are currently in state: {{{currentState}}}
Task Description: {{{taskDescription}}}

Previous Code (if any):
{{{previousCode}}}

Based on the current state, determine the next appropriate state and the action to take. Ensure that each transition moves toward completion of the overall task.

Possible states: Input, Draft, Correct, Validate, Done

Output the next state, the action, the generated code, and a reasoning for the next state transition.

Example Output Format:
{
  "nextState": "Draft",
  "agentAction": "Generate initial code draft",
  "generatedCode": "",
  "reasoning": "Initial code generation required to begin the task."
}
`,
});

const automatedWorkflowWithCodeBotFSMFlow = ai.defineFlow(
  {
    name: 'automatedWorkflowWithCodeBotFSMFlow',
    inputSchema: AutomatedWorkflowWithCodeBotFSMInputSchema,
    outputSchema: AutomatedWorkflowWithCodeBotFSMOutputSchema,
  },
  async input => {
    let currentState = 'Input';
    let generatedCode = '';
    let workflowSummary = '';
    let stepCount = 0;

    while (currentState !== 'Done' && stepCount < 10) { // Limiting steps to avoid infinite loops
      stepCount++;
      const {output} = await prompt({
        taskDescription: input.taskDescription,
        currentState: currentState,
        previousCode: generatedCode,
      });

      if (!output) {
        throw new Error('Prompt returned no output.');
      }

      currentState = output.nextState;
      generatedCode = output.generatedCode;
      workflowSummary += `Step ${stepCount}: State=${output.nextState}, Action=${output.agentAction}, Reasoning=${output.reasoning}\n`;
    }

    return {
      generatedCode: generatedCode,
      workflowSummary: workflowSummary,
    };
  }
);
