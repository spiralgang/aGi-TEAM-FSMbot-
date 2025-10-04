'use server';
/**
 * @fileOverview A YAML parsing AI agent implemented as a Finite State Machine (FSM).
 *
 * - parseYamlWithFSM - A function that parses YAML input using an FSM.
 * - YamlParsingFSMInput - The input type for the parseYamlWithFSM function.
 * - YamlParsingFSMOutput - The return type for the parseYamlWithFSM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YamlParsingFSMInputSchema = z
  .string()
  .describe('The YAML input to be parsed.');

export type YamlParsingFSMInput = z.infer<typeof YamlParsingFSMInputSchema>;

const YamlParsingFSMOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the YAML is valid according to the FSM.'),
  parsedYaml: z.record(z.string(), z.any()).optional().describe('The parsed YAML object if valid, otherwise undefined.'),
  errorMessage: z.string().optional().describe('An error message if the YAML is invalid.'),
});

export type YamlParsingFSMOutput = z.infer<typeof YamlParsingFSMOutputSchema>;

export async function parseYamlWithFSM(input: YamlParsingFSMInput): Promise<YamlParsingFSMOutput> {
  return yamlParsingFSMFlow(input);
}

const yamlParsingFSMPrompt = ai.definePrompt({
  name: 'yamlParsingFSMPrompt',
  input: {schema: YamlParsingFSMInputSchema},
  output: {schema: YamlParsingFSMOutputSchema},
  prompt: `You are a YAML parser implemented as a Finite State Machine.
  Your job is to determine if the input YAML is valid and, if so, return a parsed YAML object. If not valid, return an error message.

  Input YAML:\n{{{input}}}`,
});

const yamlParsingFSMFlow = ai.defineFlow(
  {
    name: 'yamlParsingFSMFlow',
    inputSchema: YamlParsingFSMInputSchema,
    outputSchema: YamlParsingFSMOutputSchema,
  },
  async input => {
    try {
      // Basic YAML parsing logic (can be enhanced with FSM-like validation)
      const yaml = require('js-yaml');
      const parsedYaml = yaml.load(input);
      return {
        isValid: true,
        parsedYaml: parsedYaml as any,
      };
    } catch (e: any) {
      return {
        isValid: false,
        errorMessage: e.message,
      };
    }
  }
);

