'use server';

import {
  codeStateValidation,
  type CodeStateValidationInput,
} from '@/ai/flows/code-state-validation';
import {
  parseYamlWithFSM,
  type YamlParsingFSMInput,
} from '@/ai/flows/yaml-parsing-fsm';
import {
  automatedWorkflowWithCodeBotFSM,
  type AutomatedWorkflowWithCodeBotFSMInput,
} from '@/ai/flows/automated-workflow-with-code-bot-fsm';

export async function validateCodeStateAction(
  input: CodeStateValidationInput
) {
  try {
    const result = await codeStateValidation(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function parseYamlAction(input: YamlParsingFSMInput) {
  try {
    const result = await parseYamlWithFSM(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function runCodeBotWorkflowAction(
  input: AutomatedWorkflowWithCodeBotFSMInput
) {
  try {
    const result = await automatedWorkflowWithCodeBotFSM(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
