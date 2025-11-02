'use client';

import { FsmViewWrapper } from './view-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const geminiManagerScript = `
"""
Embed-Gemini AI Integration and FSM Manager for aGi²TEAM³FSMbot¹
Author: AI Assistant
Date: 2025-10-03

Purpose:
- Load and configure a local Embed-Gemini model OR connect to a remote API.
- Initialize FSM (similar to Windows Bot Framework style) within shared working directory.
- Complete comprehensive knowledge assimilation for team-wide standardized FSM configs.
- Establish robust environment and prompt toolchain from the start to avoid config incompatibilities.
- Support multi-step task orchestration, reflection, and minority config adjustments.
- Compatible with Termux or Windows Bot Framework alignment for seamless cross-platform interoperability.

References:
- Windows Bot Framework Design Patterns: https://learn.microsoft.com/en-us/azure/bot-service/bot-service-design-patterns
- Gemini model specs and CLI integrations (custom per your Kaggle release and config)
"""

import os
import subprocess
import json
from pathlib import Path
from typing import Dict, Any

class EmbedGeminiFSMManager:
    def __init__(self, working_dir: str, api_key: str = None, model_path: str = None):
        self.working_dir = Path(working_dir)
        self.fsm_dir = self.working_dir / "aGi²TEAM³FSMbot¹"
        self.fsm_config_file = self.fsm_dir / "fsm_config.yaml"
        self.fsm_library_dir = self.fsm_dir / "library"
        self.gemini_cli_path = self.working_dir / "gemini" / "gemini_cli.py"

        self.api_key = api_key
        self.model_path = model_path
        self.mode = 'api' if self.api_key else 'local'

        print(f"[Init] Working directory set to: {self.working_dir}")
        print(f"[Init] FSM directory set to: {self.fsm_dir}")
        print(f"[Init] Operating in '{self.mode}' mode.")

        self._ensure_directories()
        self._bootstrap_fsm_environment()

    def _ensure_directories(self):
        # Ensure all required directories exist
        if not self.fsm_dir.exists():
            print(f"[Setup] Creating FSM directory: {self.fsm_dir}")
            self.fsm_dir.mkdir(parents=True, exist_ok=True)

        if not self.fsm_library_dir.exists():
            print(f"[Setup] Creating FSM library directory: {self.fsm_library_dir}")
            self.fsm_library_dir.mkdir(exist_ok=True)

    def _bootstrap_fsm_environment(self):
        # Load or create base FSM config
        if not self.fsm_config_file.exists():
            print(f"[Bootstrap] FSM config not found. Creating default template.")
            default_fsm_config = self._default_fsm_config()
            with open(self.fsm_config_file, "w") as f:
                f.write(default_fsm_config)
        else:
            print(f"[Bootstrap] FSM config exists, loading for assimilation.")

        self._load_initial_tools()
        self._initialize_prompt_protocols()

    def _default_fsm_config(self) -> str:
        # Sample YAML FSM config aligned with Microsoft Bot Framework style
        return """
states:
  - name: init
    on_enter: "echo 'Initializing FSM environment...'"
    transitions:
      - event: env_ready
        target: model_setup

  - name: model_setup
    on_enter: "echo 'Setting up AI model based on configuration (local/api)...'"
    transitions:
      - event: model_ready
        target: fsm_operational
      - event: error
        target: error_handler

  - name: fsm_operational
    on_enter:
      - python: |
          print('FSM operational. Starting task orchestration...')
    transitions:
      - event: task_complete
        target: fsm_operational
      - event: shutdown
        target: final

  - name: error_handler
    on_enter: "echo 'Error detected in FSM. Triggering compliance protocols.'"
    transitions:
      - event: recovered
        target: fsm_operational

  - name: final
    on_enter: "echo 'FSM session closed. Cleaning up.'"
"""

    def _load_initial_tools(self):
        # Prepare core FSM tools and libraries
        sample_core_lib = "# Core FSM utilities for state transitions, logging, etc."
        lib_file = self.fsm_library_dir / "core_utils.py"
        if not lib_file.exists():
            lib_file.write_text(sample_core_lib)

    def _initialize_prompt_protocols(self):
        # Initialize prompt templates for Gemini interaction
        prompt_proto_file = self.fsm_dir / "AI_INSTRUCTIONS.md"
        if not prompt_proto_file.exists():
            content = "# Embed-Gemini AI Operational Instructions..."
            prompt_proto_file.write_text(content)

    def run_inference(self, prompt_data: Dict[str, Any]):
        if self.mode == 'local':
            return self._run_local_inference(prompt_data)
        else:
            return self._run_api_inference(prompt_data)

    def _run_local_inference(self, prompt_data: Dict[str, Any]):
        try:
            print(f"[Infer/Local] Running Gemini inference with local model...")
            prompt_file = self.fsm_dir / "temp_prompt.json"
            prompt_file.write_text(json.dumps(prompt_data, indent=2))
            cmd = f"python3 {self.gemini_cli_path} --model_path {self.model_path} --prompt_file {prompt_file}"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
            return result.stdout
        except Exception as e:
            print(f"[Infer/Local][Error] {str(e)}")
            return None

    def _run_api_inference(self, prompt_data: Dict[str, Any]):
        try:
            print(f"[Infer/API] Calling Gemini API...")
            # Placeholder for actual API call using requests or other library
            # headers = {'Authorization': f'Bearer {self.api_key}'}
            # response = requests.post("https://api.gemini.example.com/v1/generate", json=prompt_data, headers=headers)
            # response.raise_for_status()
            # return response.json()
            return f"Simulated API response for prompt: {prompt_data.get('prompt')}"
        except Exception as e:
            print(f"[Infer/API][Error] {str(e)}")
            return None


if __name__ == "__main__":
    # Example usage:
    # To use a local model:
    # manager = EmbedGeminiFSMManager(working_dir=os.getcwd(), model_path="./models/gemini_1.2gb")
    
    # To use the API:
    manager = EmbedGeminiFSMManager(working_dir=os.getcwd(), api_key=os.getenv("GEMINI_API_KEY"))

    print(f"Manager started in {manager.mode} mode.")
    manager.run_inference({"prompt": "Explain the assembly line principle."})
`;

export function EmbedGeminiManager() {
  return (
    <FsmViewWrapper
      title="FSM Manager (Embed-Gemini)"
      description="The 'Factory Foreman' script that bootstraps the aGi²TEAM³FSMbot¹ environment, choosing between local or API models."
    >
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[600px] rounded-md border bg-secondary/50 p-4 font-code text-sm">
            <pre>{geminiManagerScript.trim()}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </FsmViewWrapper>
  );
}
