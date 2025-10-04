import { config } from 'dotenv';
config();

import '@/ai/flows/code-state-validation.ts';
import '@/ai/flows/automated-workflow-with-code-bot-fsm.ts';
import '@/ai/flows/yaml-parsing-fsm.ts';
import '@/ai/flows/loop-prevention.ts';