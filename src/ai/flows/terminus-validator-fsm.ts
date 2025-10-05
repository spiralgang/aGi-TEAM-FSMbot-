'use server';

/**
 * @fileOverview A deterministic FSM to validate terminology compliance.
 * This workflow prevents the use of forbidden terms like "AI" or "agent" when
 * referring to deterministic FSMs, enforcing the "One AI" principle.
 *
 * - terminusValidatorFSM - A function that handles the terminology validation.
 * - TerminusValidatorInput - The input type for the terminusValidatorFSM function.
 * - TerminusValidatorOutput - The return type for the terminusValidatorFSM function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const TerminusValidatorInputSchema = z.object({
  text: z.string().describe('The text (e.g., filename or description) to validate.'),
});
export type TerminusValidatorInput = z.infer<typeof TerminusValidatorInputSchema>;

export const TerminusValidatorOutputSchema = z.object({
  isCompliant: z.boolean().describe('Whether the text is compliant with terminology rules.'),
  message: z.string().describe('A message explaining the validation result.'),
});
export type TerminusValidatorOutput = z.infer<typeof TerminusValidatorOutputSchema>;

export async function terminusValidatorFSM(input: TerminusValidatorInput): Promise<TerminusValidatorOutput> {
  return terminusValidatorFSMFlow(input);
}

const terminusValidatorFSMFlow = ai.defineFlow(
  {
    name: 'terminusValidatorFSMFlow',
    inputSchema: TerminusValidatorInputSchema,
    outputSchema: TerminusValidatorOutputSchema,
  },
  async ({ text }) => {
    const forbiddenTerms = ['ai', 'agent', 'ai agent'];
    const lowercasedText = text.toLowerCase();

    const foundTerm = forbiddenTerms.find(term => lowercasedText.includes(term));

    if (foundTerm) {
      return {
        isCompliant: false,
        message: `Validation failed: Found forbidden term "${foundTerm}".`,
      };
    }

    return {
      isCompliant: true,
      message: 'Text is compliant with terminology rules.',
    };
  }
);
