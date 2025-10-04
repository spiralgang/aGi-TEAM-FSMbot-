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
  syntaxScore: z.number().min(0).max(100).describe('Syntax compliance score (0-100).'),
  stateCompliance: z.number().min(0).max(100).describe('FSM state compliance score (0-100).'),
  suggestions: z.array(z.string()).describe('Specific suggestions for improvement.'),
  detectedStates: z.array(z.string()).describe('FSM states detected in the code.'),
});
export type CodeStateValidationOutput = z.infer<typeof CodeStateValidationOutputSchema>;

export async function codeStateValidation(input: CodeStateValidationInput): Promise<CodeStateValidationOutput> {
  return codeStateValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeStateValidationPrompt',
  input: {schema: CodeStateValidationInputSchema},
  output: {schema: CodeStateValidationOutputSchema},
  prompt: `You are an expert FSM-aware code validator. Your role is to analyze code against finite state machine definitions, ensuring both syntactic correctness and adherence to defined state transitions and behaviors.

CODE TO VALIDATE:
\`\`\`
{{{code}}}
\`\`\`

FSM DEFINITION:
{{{fsmDefinition}}}

VALIDATION CRITERIA:
1. **Syntax Compliance**: Check for proper syntax, structure, and basic code quality
2. **State Compliance**: Verify the code follows FSM state definitions and transitions
3. **Logic Flow**: Ensure state transitions are logically sound and deterministic
4. **Error Handling**: Check for proper error state management

ANALYSIS REQUIREMENTS:
- Identify which FSM states are referenced or implemented in the code
- Validate state transition logic matches the FSM definition
- Check for missing states, invalid transitions, or logic errors
- Provide specific, actionable improvement suggestions
- Score syntax compliance (0-100) and state compliance (0-100)

OUTPUT DETAILED VALIDATION:
- Set isValid to true only if code passes both syntax and state compliance checks
- Provide comprehensive validation results with specific line references when possible
- List detected states and explain how they relate to the FSM definition
- Offer concrete suggestions for fixing any identified issues

Focus on helping developers write FSM-compliant code that follows deterministic patterns.`,
});

const codeStateValidationFlow = ai.defineFlow(
  {
    name: 'codeStateValidationFlow',
    inputSchema: CodeStateValidationInputSchema,
    outputSchema: CodeStateValidationOutputSchema,
  },
  async input => {
    // Enhanced validation with pre-processing and fallback handling
    try {
      const {output} = await prompt(input);
      
      if (!output) {
        // Fallback validation if AI prompt fails
        return {
          isValid: false,
          validationResult: 'Validation failed: Unable to process code through AI validator',
          syntaxScore: 0,
          stateCompliance: 0,
          suggestions: ['Retry validation', 'Check code syntax manually', 'Verify FSM definition format'],
          detectedStates: [],
        };
      }

      return output;
    } catch (error) {
      // Error handling with meaningful feedback
      return {
        isValid: false,
        validationResult: `Validation error: ${(error as Error).message}`,
        syntaxScore: 0,
        stateCompliance: 0,
        suggestions: ['Fix syntax errors', 'Simplify code structure', 'Check FSM definition'],
        detectedStates: [],
      };
    }
  }
);
