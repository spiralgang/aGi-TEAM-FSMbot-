'use server';
/**
 * @fileOverview A Policy parsing AI agent implemented as a Finite State Machine (FSM). This agent
 * is designed to deterministically parse and validate structured data formats like YAML,
 * ensuring that policies are well-formed before they are used to direct other AI agents.
 *
 * - parsePolicyWithFSM - A function that parses Policy input using an FSM.
 * - PolicyParsingFSMInput - The input type for the parsePolicyWithFSM function.
 * - PolicyParsingFSMOutput - The return type for the parsePolicyWithFSM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import yaml from 'js-yaml';

const PolicyParsingFSMInputSchema = z
  .string()
  .describe('The Policy input to be parsed.');

export type PolicyParsingFSMInput = z.infer<typeof PolicyParsingFSMInputSchema>;

const PolicyParsingFSMOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the Policy is valid according to the FSM.'),
  parsedPolicy: z.record(z.string(), z.any()).optional().describe('The parsed Policy object if valid, otherwise undefined.'),
  errorMessage: z.string().optional().describe('An error message if the Policy is invalid.'),
});

export type PolicyParsingFSMOutput = z.infer<typeof PolicyParsingFSMOutputSchema>;

export async function parsePolicyWithFSM(input: PolicyParsingFSMInput): Promise<PolicyParsingFSMOutput> {
  return policyParsingFSMFlow(input);
}

const policyParsingFSMFlow = ai.defineFlow(
  {
    name: 'policyParsingFSMFlow',
    inputSchema: PolicyParsingFSMInputSchema,
    outputSchema: PolicyParsingFSMOutputSchema,
  },
  async input => {
    // FSM States: START -> PARSING -> VALIDATING -> DONE/ERROR
    let state = 'START';
    try {
      state = 'PARSING';
      const parsedPolicy = yaml.load(input);

      state = 'VALIDATING';
      if (typeof parsedPolicy !== 'object' || parsedPolicy === null) {
        throw new Error('YAML does not represent a valid object.');
      }
      
      // Add more validation logic here if needed, e.g., schema validation.
      // For now, we just check if it's a non-null object.

      state = 'DONE';
      return {
        isValid: true,
        parsedPolicy: parsedPolicy as Record<string, any>,
      };
    } catch (e: any) {
      state = 'ERROR';
      return {
        isValid: false,
        errorMessage: `Parsing failed in state ${state}: ${e.message}`,
      };
    }
  }
);
