'use server';

/**
 * @fileOverview FSM Debugging and Visualization Assistant. This specialized AI agent helps developers
 * understand, debug, and optimize their Finite State Machine implementations. It provides detailed
 * state analysis, transition validation, and visual representations of FSM behavior.
 *
 * - fsmDebugging - Main function for FSM analysis and debugging
 * - FSMDebuggingInput - Input schema for FSM debugging requests
 * - FSMDebuggingOutput - Output schema containing analysis results
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FSMDebuggingInputSchema = z.object({
  fsmCode: z.string().describe('The FSM implementation code to analyze.'),
  stateDefinition: z.string().optional().describe('Optional explicit state definition or configuration.'),
  expectedBehavior: z.string().optional().describe('Description of the expected FSM behavior.'),
  currentIssue: z.string().optional().describe('Current problem or unexpected behavior to debug.'),
});
export type FSMDebuggingInput = z.infer<typeof FSMDebuggingInputSchema>;

const FSMDebuggingOutputSchema = z.object({
  analysisComplete: z.boolean().describe('Whether the analysis completed successfully.'),
  stateAnalysis: z.object({
    detectedStates: z.array(z.string()).describe('All states found in the FSM.'),
    initialState: z.string().optional().describe('The identified initial state.'),
    finalStates: z.array(z.string()).describe('Identified terminal/final states.'),
    unreachableStates: z.array(z.string()).describe('States that appear unreachable.'),
  }).describe('Comprehensive state analysis.'),
  transitionAnalysis: z.object({
    validTransitions: z.array(z.string()).describe('Valid state transitions found.'),
    invalidTransitions: z.array(z.string()).describe('Problematic or invalid transitions.'),
    missingTransitions: z.array(z.string()).describe('Expected transitions that are missing.'),
    deadlockStates: z.array(z.string()).describe('States that may cause deadlocks.'),
  }).describe('Transition analysis results.'),
  debuggingReport: z.string().describe('Detailed debugging report with findings and recommendations.'),
  visualRepresentation: z.string().describe('ASCII or textual representation of the FSM structure.'),
  suggestions: z.array(z.string()).describe('Specific suggestions for improving the FSM.'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).describe('Overall issue severity.'),
});
export type FSMDebuggingOutput = z.infer<typeof FSMDebuggingOutputSchema>;

export async function fsmDebugging(input: FSMDebuggingInput): Promise<FSMDebuggingOutput> {
  return fsmDebuggingFlow(input);
}

const fsmDebuggingPrompt = ai.definePrompt({
  name: 'fsmDebuggingPrompt',
  input: {schema: FSMDebuggingInputSchema},
  output: {schema: FSMDebuggingOutputSchema},
  prompt: `You are an expert FSM (Finite State Machine) debugging specialist. Your role is to analyze, debug, and optimize FSM implementations with scientific rigor and practical insight.

FSM CODE TO ANALYZE:
\`\`\`
{{{fsmCode}}}
\`\`\`

STATE DEFINITION (if provided):
{{{stateDefinition}}}

EXPECTED BEHAVIOR (if provided):
{{{expectedBehavior}}}

CURRENT ISSUE (if provided):
{{{currentIssue}}}

ANALYSIS FRAMEWORK:
Perform comprehensive FSM analysis using these dimensions:

1. **STATE ANALYSIS**:
   - Identify all states (explicit and implicit)
   - Determine initial state and final states
   - Find unreachable or orphaned states
   - Check for missing critical states

2. **TRANSITION ANALYSIS**:
   - Map all state transitions and their triggers
   - Identify invalid or problematic transitions
   - Find missing transitions that may cause hangs
   - Detect potential deadlock or livelock conditions

3. **BEHAVIORAL ANALYSIS**:
   - Verify deterministic behavior
   - Check for non-deterministic transitions
   - Validate error handling and recovery paths
   - Assess FSM completeness and robustness

4. **VISUAL REPRESENTATION**:
   - Create ASCII diagram showing state flow
   - Highlight problematic areas clearly
   - Show transition paths and conditions

5. **DEBUGGING REPORT**:
   - Detailed findings with specific line references
   - Root cause analysis of any issues
   - Performance and reliability considerations
   - Compliance with FSM best practices

6. **ACTIONABLE RECOMMENDATIONS**:
   - Specific code improvements
   - Architectural suggestions
   - Error handling enhancements
   - Testing strategies

SEVERITY ASSESSMENT:
- **Critical**: FSM cannot function or has major logic errors
- **High**: Significant issues that affect reliability 
- **Medium**: Minor issues or potential improvements
- **Low**: Cosmetic or optimization opportunities

Provide thorough, actionable analysis that helps developers build more reliable and maintainable FSM systems.`,
});

const fsmDebuggingFlow = ai.defineFlow(
  {
    name: 'fsmDebuggingFlow',
    inputSchema: FSMDebuggingInputSchema,
    outputSchema: FSMDebuggingOutputSchema,
  },
  async input => {
    try {
      const {output} = await fsmDebuggingPrompt(input);
      
      if (!output) {
        // Fallback analysis if AI prompt fails
        return {
          analysisComplete: false,
          stateAnalysis: {
            detectedStates: [],
            initialState: undefined,
            finalStates: [],
            unreachableStates: [],
          },
          transitionAnalysis: {
            validTransitions: [],
            invalidTransitions: [],
            missingTransitions: [],
            deadlockStates: [],
          },
          debuggingReport: 'FSM analysis failed: Unable to process code through AI analyzer. Please check code syntax and try again.',
          visualRepresentation: 'Analysis failed - no visual representation available',
          suggestions: ['Check FSM code syntax', 'Verify state definitions', 'Retry analysis'],
          severity: 'critical',
        };
      }

      return {
        ...output,
        analysisComplete: true,
      };
    } catch (error) {
      return {
        analysisComplete: false,
        stateAnalysis: {
          detectedStates: [],
          initialState: undefined,
          finalStates: [],
          unreachableStates: [],
        },
        transitionAnalysis: {
          validTransitions: [],
          invalidTransitions: [],
          missingTransitions: [],
          deadlockStates: [],
        },
        debuggingReport: `FSM debugging error: ${(error as Error).message}`,
        visualRepresentation: 'Error occurred during analysis',
        suggestions: ['Fix syntax errors', 'Simplify FSM structure', 'Check input format'],
        severity: 'critical',
      };
    }
  }
);