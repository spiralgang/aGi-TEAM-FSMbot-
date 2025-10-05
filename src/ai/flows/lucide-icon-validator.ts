'use server';
/**
 * @fileOverview A deterministic FSM that validates lucide-react icon imports in a code snippet.
 * This FSM first performs deterministic checks (parsing imports and validating against a known list)
 * and only delegates the fuzzy task of suggesting alternatives to an LLM, perfectly demonstrating the
 * aGi²TEAM³FSMbot¹ principle of using FSMs for structured work and AI for creative/fuzzy tasks.
 *
 * - lucidIconValidator - A function that handles the icon validation process.
 * - LucidIconValidatorInput - The input type for the lucidIconValidator function.
 * - LucidIconValidatorOutput - The return type for the lucidIconValidator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as allIcons from 'lucide-react';

const LucidIconValidatorInputSchema = z.object({
  code: z.string().describe('The code snippet to validate for lucide-react icons.'),
});
export type LucidIconValidatorInput = z.infer<typeof LucidIconValidatorInputSchema>;

const LucidIconValidatorOutputSchema = z.object({
  validIcons: z.array(z.string()).describe('A list of valid lucide-react icons found in the code.'),
  invalidIcons: z.array(z.string()).describe('A list of invalid lucide-react icons found in the code.'),
  recommendations: z.record(z.string(), z.string()).describe('A map of invalid icons to suggested valid alternatives.'),
});
export type LucidIconValidatorOutput = z.infer<typeof LucidIconValidatorOutputSchema>;

export async function lucidIconValidator(input: LucidIconValidatorInput): Promise<LucidIconValidatorOutput> {
  return lucidIconValidatorFlow(input);
}

// FSM-like logic for validation, implemented within a flow.
const lucidIconValidatorFlow = ai.defineFlow(
  {
    name: 'lucidIconValidatorFlow',
    inputSchema: LucidIconValidatorInputSchema,
    outputSchema: LucidIconValidatorOutputSchema,
  },
  async ({ code }) => {
    // State: PARSE_IMPORTS
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g;
    const allImportedIcons: string[] = [];
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const icons = match[1].split(',').map(name => name.trim()).filter(name => name && !name.includes(' '));
      allImportedIcons.push(...icons);
    }

    if (allImportedIcons.length === 0) {
      return { validIcons: [], invalidIcons: [], recommendations: {} };
    }
    
    const validIconSet = new Set(Object.keys(allIcons));
    
    // State: VALIDATE_ICONS
    const validIcons: string[] = [];
    const invalidIcons: string[] = [];

    for (const icon of allImportedIcons) {
      if (validIconSet.has(icon)) {
        validIcons.push(icon);
      } else {
        invalidIcons.push(icon);
      }
    }

    if (invalidIcons.length === 0) {
      return { validIcons, invalidIcons: [], recommendations: {} };
    }

    // State: GENERATE_RECOMMENDATIONS (using an LLM for fuzzy matching)
    const { output } = await ai.generate(`Given a list of invalid lucide-react icon names, suggest valid alternatives from the official list. For each invalid icon, suggest the closest valid icon name.

Invalid Icons: ${invalidIcons.join(', ')}
Valid Icons list (sample): FolderTree, Folder, File, FileCode, Bot, ShieldCheck

Return a JSON object mapping the invalid icon to its recommended replacement. For example: { "FileTreee": "FolderTree", "ClipbordCheck": "ClipboardCheck" }. If no good alternative exists, suggest a reasonable replacement like 'HelpCircle'.`);
    
    const recommendations = output ?? {};

    return { validIcons, invalidIcons, recommendations };
  }
);
