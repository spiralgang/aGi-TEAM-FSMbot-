'use server';

/**
 * @fileOverview Code State Validation AI agent. This FSM-based agent validates a code snippet against a given state machine definition,
 * ensuring that the code adheres to the specified state transitions and logic. It's a core component for ensuring compliance
 * and predictability in an agentic coding ecosystem.
 *
 * - codeStateValidation - A function that handles the code state validation process.
 * - CodeStateValidationInput - The input type for the codeStateValidation function.
 * - CodeStateValidationOutput - The return type for the codeStateValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeStateValidationInputSchema = z.object({
  code: z.string().describe('The code to validate.'),
  fsmDefinition: z
    .string() // Assuming FSM definition is passed as a string, could be JSON or other format
    .describe('The FSM definition in a suitable format (e.g., JSON).'),
});
export type CodeStateValidationInput = z.infer<typeof CodeStateValidationInputSchema>;

const CodeStateValidationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the code is valid according to the FSM.'),
  validationResult: z
    .string()
    .describe('A description of the validation result, including any errors found.'),
});
export type CodeStateValidationOutput = z.infer<typeof CodeStateValidationOutputSchema>;

export async function codeStateValidation(input: CodeStateValidationInput): Promise<CodeStateValidationOutput> {
  return codeStateValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeStateValidationPrompt',
  input: {schema: CodeStateValidationInputSchema},
  output: {schema: CodeStateValidationOutputSchema},
  prompt: `You are a code validation expert. You will receive a code snippet and an FSM definition. Your task is to determine if the code follows the state transitions defined in the FSM and is structurally sound according to it.

Code:

\`\`\`{{{code}}}
\`\`\`

FSM Definition:

{{{fsmDefinition}}}

Based on this, determine if the code is valid, and provide a detailed validation result.  Include specific details on which states it follows and which it violates. Set the 
isValid output field appropriately.`,
});

const codeStateValidationFlow = ai.defineFlow(
  {
    name: 'codeStateValidationFlow',
    inputSchema: CodeStateValidationInputSchema,
    outputSchema: CodeStateValidationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
