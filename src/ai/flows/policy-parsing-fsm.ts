'use server';
/**
 * @fileOverview A Policy parsing AI agent implemented as a Finite State Machine (FSM).
 *
 * - parsePolicyWithFSM - A function that parses Policy input using an FSM.
 * - PolicyParsingFSMInput - The input type for the parsePolicyWithFSM function.
 * - PolicyParsingFSMOutput - The return type for the parsePolicyWithFSM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const policyParsingFSMPrompt = ai.definePrompt({
  name: 'policyParsingFSMPrompt',
  input: {schema: PolicyParsingFSMInputSchema},
  output: {schema: PolicyParsingFSMOutputSchema},
  prompt: `You are a Policy parser implemented as a Finite State Machine.
  Your job is to determine if the input Policy is valid and, if so, return a parsed Policy object. If not valid, return an error message.

  Input Policy:\n{{{input}}}`,
});

// A simple regex-based XML to JSON converter for demonstration purposes.
// In a real-world scenario, a more robust library would be used.
function xmlToJson(xml: string) {
  const json: any = {};
  const tagRegex = /<([a-zA-Z0-9]+)>(.*?)<\/\1>/g;
  let match;

  while ((match = tagRegex.exec(xml)) !== null) {
    const tagName = match[1];
    const tagContent = match[2];

    // If the content is just text, store it.
    if (!tagContent.includes('<')) {
      json[tagName] = tagContent;
    } else {
      // If the content contains more tags, recurse.
      json[tagName] = xmlToJson(tagContent);
    }
  }

  // Handle case where xml might be just a value between tags
  if (Object.keys(json).length === 0 && !xml.startsWith('<')) {
    return xml;
  }
  
  return json;
}


const policyParsingFSMFlow = ai.defineFlow(
  {
    name: 'policyParsingFSMFlow',
    inputSchema: PolicyParsingFSMInputSchema,
    outputSchema: PolicyParsingFSMOutputSchema,
  },
  async input => {
    try {
      // Clean up the input XML
      const cleanedInput = input.replace(/<!--.*?-->/gs, "").replace(/\s+/g, ' ').trim();
      const parsedPolicy = xmlToJson(cleanedInput);
      
      // The top-level tag might be the only key, so we'll dive into it.
      const rootKey = Object.keys(parsedPolicy)[0];
      const finalJson = rootKey ? parsedPolicy[rootKey] : parsedPolicy;

      if(Object.keys(finalJson).length === 0) {
        throw new Error("Could not parse XML. The structure might be invalid or unsupported.");
      }

      return {
        isValid: true,
        parsedPolicy: finalJson,
      };
    } catch (e: any) {
      return {
        isValid: false,
        errorMessage: e.message,
      };
    }
  }
);
