'use server';

/**
 * @fileOverview A workflow to parse, analyze, and extract insights from XML manifest files.
 * This FSM-based flow provides a structured analysis of XML content, similar to the YAML Policy Parser.
 *
 * - xmlParserWorkflow - A function that handles the XML parsing and analysis.
 * - XmlParserWorkflowInput - The input type for the xmlParserWorkflow function.
 * - XmlParserWorkflowOutput - The return type for the xmlParserWorkflow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const XmlParserWorkflowInputSchema = z.object({
  xmlContent: z.string().describe('The XML content to be parsed and analyzed.'),
});
export type XmlParserWorkflowInput = z.infer<typeof XmlParserWorkflowInputSchema>;

export const XmlParserWorkflowOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the parsed XML content.'),
});
export type XmlParserWorkflowOutput = z.infer<typeof XmlParserWorkflowOutputSchema>;

export async function xmlParserWorkflow(input: XmlParserWorkflowInput): Promise<XmlParserWorkflowOutput> {
  return xmlParserFsmFlow(input);
}

const prompt = ai.definePrompt({
  name: 'xmlParserPrompt',
  input: { schema: XmlParserWorkflowInputSchema },
  output: { schema: XmlParserWorkflowOutputSchema },
  prompt: `You are an expert system analyst. You will receive an XML manifest file. Your task is to parse its contents, identify key elements like dependencies, plugins, or project configurations, and provide a concise, structured analysis of its purpose and contents.

XML Content:
\`\`\`xml
{{{xmlContent}}}
\`\`\`

FSM ANALYSIS COMPLETE:
- Identify the root element.
- List any dependencies, including their group, artifact, and version.
- List any declared plugins.
- Provide a final assessment of the project's likely purpose based on the manifest.
Return only the analysis text.`,
});

const xmlParserFsmFlow = ai.defineFlow(
  {
    name: 'xmlParserFsmFlow',
    inputSchema: XmlParserWorkflowInputSchema,
    outputSchema: XmlParserWorkflowOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
