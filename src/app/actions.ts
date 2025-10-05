'use server';

import {
  automatedWorkflowWithCodeBotFSM,
  type AutomatedWorkflowWithCodeBotFSMInput,
} from '@/ai/flows/automated-workflow-with-code-bot-fsm';
import {
  lucidIconValidator,
  type LucidIconValidatorInput,
} from '@/ai/flows/lucide-icon-validator';
import {
  parsePolicyWithFSM,
  type PolicyParsingFSMInput,
} from '@/ai/flows/policy-parsing-fsm';
import {
  codeStateValidation,
  type CodeStateValidationInput,
} from '@/ai/flows/code-state-validation';
import {
  antiFlailFlow,
  type AntiFlailInput,
} from '@/ai/flows/loop-prevention';
import {
  fsmDebugging,
  type FSMDebuggingInput,
} from '@/ai/flows/fsm-debugging';
  xmlParserWorkflow,
  type XmlParserWorkflowInput,
} from '@/ai/flows/xml-parser-fsm';
import {
  cloudBackupFSM,
  type CloudBackupFSMInput,
} from '@/ai/flows/cloud-backup-fsm';
import {
  terminusValidatorFSM,
  type TerminusValidatorInput,
} from '@/ai/flows/terminus-validator-fsm';

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

export async function validateIconsAction(input: LucidIconValidatorInput) {
  try {
    const result = await lucidIconValidator(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function parsePolicyAction(input: PolicyParsingFSMInput) {
  try {
    const result = await parsePolicyWithFSM(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

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

export async function checkLoopPreventionAction(
  input: AntiFlailInput
) {
  try {
    const result = await antiFlailFlow(input);
export async function runXmlParserWorkflowAction(
  input: XmlParserWorkflowInput
) {
  try {
    const result = await xmlParserWorkflow(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function debugFSMAction(
  input: FSMDebuggingInput
) {
  try {
    const result = await fsmDebugging(input);
export async function runCloudBackupAction(input: CloudBackupFSMInput) {
  try {
    const result = await cloudBackupFSM(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function runTerminusValidatorAction(
  input: TerminusValidatorInput
) {
  try {
    const result = await terminusValidatorFSM(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
