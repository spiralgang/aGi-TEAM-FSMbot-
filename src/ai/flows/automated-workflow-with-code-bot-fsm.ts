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
 git-prompt: `You are an expert code bot operating within a finite state machine designed for reliable, structured code generation.
Your task is to assist in generating code based on the user description, following strict FSM principles for deterministic control.
 src-prompt: `You are a creative AI coder operating within a finite state machine.
Your task is to assist in generating code based on the user provided description, working one state at a time.

CURRENT STATE: {{{currentState}}}
TASK DESCRIPTION: {{{taskDescription}}}

PREVIOUS CODE (if any):
{{{previousCode}}}

STATE DEFINITIONS & TRANSITIONS:
- Input: Analyze the task and plan approach → [Draft, Planning]
- Planning: Break down task into steps → [Draft, Input] 
- Draft: Generate or modify code → [Correct, Validate, Done]
- Correct: Fix errors, improve code → [Draft, Validate, Planning]
- Validate: Check syntax, logic, completeness → [Done, Correct, Draft]
- Done: Task completed successfully → []

STATE-SPECIFIC INSTRUCTIONS:

**Input State**: 
- Analyze the task requirements thoroughly
- Transition to "Planning" for complex tasks, "Draft" for simple ones
- Do NOT generate code yet

**Planning State**:
- Break down the task into specific, actionable steps
- Identify potential challenges and requirements
- Transition to "Draft" to begin implementation

**Draft State**:
- Generate clean, functional code that addresses the task
- Include comments explaining key logic
- Transition to "Validate" for review, "Done" if simple and complete

**Correct State**:
- Fix any identified issues in the code
- Improve code quality, readability, and efficiency
- Transition to "Validate" to check fixes, "Draft" if major changes needed

**Validate State**:
- Review code for syntax errors, logic issues, and completeness
- Check if task requirements are fully met
- Transition to "Done" if validated, "Correct" if issues found

**Done State**:
- Only transition here when task is completely finished
- Provide final, working code

CRITICAL RULES:
1. Follow valid state transitions strictly
2. Provide meaningful code only in Draft/Correct states
3. Give detailed reasoning for state transitions
4. Ensure each step progresses toward task completion

Output JSON format:
{
  "nextState": "<valid_next_state>",
  "agentAction": "<specific_action_description>",
  "generatedCode": "<code_or_empty_if_not_applicable>",
  "reasoning": "<detailed_explanation_of_transition_and_action>"
}`,
});

const automatedWorkflowWithCodeBotFSMFlow = ai.defineFlow(
  {
    name: 'automatedWorkflowWithCodeBotFSMFlow',
    inputSchema: AutomatedWorkflowWithCodeBotFSMInputSchema,
    outputSchema: AutomatedWorkflowWithCodeBotFSMOutputSchema,
  },
  async input => {
    // Enhanced FSM state management with better error handling and loop prevention
    let currentState = 'Input';
    let generatedCode = '';
    let workflowSummary = '';
    let stepCount = 0;
    let stateHistory: string[] = [];
    let errorCount = 0;
    const maxSteps = 15; // Increased for more complex workflows
    const maxErrors = 3; // Allow some retries before failing

    // Define valid state transitions for deterministic control
    const validTransitions: Record<string, string[]> = {
      'Input': ['Draft', 'Planning'],
      'Planning': ['Draft', 'Input'],
      'Draft': ['Correct', 'Validate', 'Done'],
      'Correct': ['Draft', 'Validate', 'Planning'],
      'Validate': ['Done', 'Correct', 'Draft'],
      'Done': []
    };

    workflowSummary += `=== FSM-Driven AI Coding Workflow Started ===\nTask: ${input.taskDescription}\n\n`;

    while (currentState !== 'Done' && stepCount < maxSteps && errorCount < maxErrors) {
      stepCount++;
      
      try {
        const {output} = await prompt({
          taskDescription: input.taskDescription,
          currentState: currentState,
          previousCode: generatedCode,
        });

        if (!output) {
          throw new Error('Prompt returned no output.');
        }

        // Validate state transition
        const proposedNextState = output.nextState;
        if (!validTransitions[currentState]?.includes(proposedNextState)) {
          throw new Error(`Invalid state transition from ${currentState} to ${proposedNextState}`);
        }

        // Update state and track history for loop detection
        const previousState = currentState;
        currentState = proposedNextState;
        stateHistory.push(`${previousState}->${currentState}`);
        
        // Enhanced loop detection
        const recentHistory = stateHistory.slice(-6); // Check last 6 transitions
        const loopDetected = recentHistory.length >= 4 && 
          recentHistory.filter(transition => transition === recentHistory[recentHistory.length - 1]).length >= 3;
        
        if (loopDetected) {
          workflowSummary += `⚠️  LOOP DETECTED: Forcing transition to Validate state\n`;
          currentState = 'Validate';
        }

        // Update code only if it's provided and not empty
        if (output.generatedCode && output.generatedCode.trim()) {
          generatedCode = output.generatedCode;
        }

        workflowSummary += `Step ${stepCount} [${previousState} → ${currentState}]:\n`;
        workflowSummary += `  Action: ${output.agentAction}\n`;
        workflowSummary += `  Reasoning: ${output.reasoning}\n`;
        if (output.generatedCode && output.generatedCode.trim()) {
          workflowSummary += `  Code Generated: ${output.generatedCode.length} characters\n`;
        }
        workflowSummary += `\n`;

      } catch (error) {
        errorCount++;
        workflowSummary += `❌ Error in Step ${stepCount}: ${(error as Error).message}\n`;
        
        if (errorCount >= maxErrors) {
          workflowSummary += `🛑 Maximum error count reached. Terminating workflow.\n`;
          break;
        }
        
        // Recovery: transition to a safe state
        currentState = currentState === 'Input' ? 'Planning' : 'Correct';
        workflowSummary += `🔄 Recovering: Transitioning to ${currentState} state\n\n`;
      }
    }

    // Final workflow summary
    if (stepCount >= maxSteps) {
      workflowSummary += `⚠️  Workflow terminated due to maximum step limit (${maxSteps})\n`;
    }
    if (errorCount >= maxErrors) {
      workflowSummary += `⚠️  Workflow terminated due to maximum error limit (${maxErrors})\n`;
    }
    if (currentState === 'Done') {
      workflowSummary += `✅ Workflow completed successfully in ${stepCount} steps\n`;
    }

    workflowSummary += `\nFinal State: ${currentState}\n`;
    workflowSummary += `State History: ${stateHistory.join(' | ')}\n`;
    workflowSummary += `=== Workflow Summary Complete ===`;

    return {
      generatedCode: generatedCode || '// No code was generated during this workflow',
      workflowSummary: workflowSummary,
    };
  }
);
