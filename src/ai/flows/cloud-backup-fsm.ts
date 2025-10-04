'use server';
/**
 * @fileOverview An FSM-based Genkit flow that simulates a multi-step cloud backup process.
 * This agent orchestrates scanning, archiving, encrypting, and uploading files, providing
 * step-by-step logging of its progress.
 *
 * - cloudBackupFSM - A function that handles the backup process.
 * - CloudBackupFSMInput - The input type for the cloudBackupFSM function.
 * - CloudBackupFSMOutput - The return type for the cloudBackupFSM function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const hotspots = [
  'README.md',
  'package.json',
  'src/app/page.tsx',
  'src/ai/genkit.ts',
  '.github/workflows/ci.yml',
  'docs/chckpt1-a2.t3.fb1.md',
];

export const CloudBackupFSMInputSchema = z.object({
  passphrase: z.string().describe('The passphrase for encrypting the backup.'),
  remoteTarget: z.string().describe('The rclone remote target for the upload.'),
});
export type CloudBackupFSMInput = z.infer<typeof CloudBackupFSMInputSchema>;

export const backupStateSchema = z.enum(['idle', 'scanning', 'archiving', 'encrypting', 'uploading', 'done', 'error']);
export type BackupState = z.infer<typeof backupStateSchema>;

export const CloudBackupFSMOutputSchema = z.object({
  state: backupStateSchema,
  logs: z.array(z.string()).describe('A log of the backup process.'),
});
export type CloudBackupFSMOutput = z.infer<typeof CloudBackupFSMOutputSchema>;

export async function cloudBackupFSM(input: CloudBackupFSMInput): Promise<CloudBackupFSMOutput> {
  return cloudBackupFSMFlow(input);
}

const cloudBackupFSMFlow = ai.defineFlow(
  {
    name: 'cloudBackupFSMFlow',
    inputSchema: CloudBackupFSMInputSchema,
    outputSchema: CloudBackupFSMOutputSchema,
  },
  async ({ passphrase, remoteTarget }) => {
    
    // This flow simulates the multi-step process. In a real application,
    // you would replace the `sleep` calls with actual file operations,
    // compression, encryption, and upload commands.
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const logs: string[] = [];

    try {
      // State: scanning
      logs.push('Initializing backup sequence...');
      logs.push(`Scanning ${hotspots.length} high-value hotspots...`);
      await sleep(500);
      hotspots.forEach(hp => logs.push(`  [FOUND] ${hp}`));
      
      // State: archiving
      logs.push('Creating TAR.GZ archive...');
      await sleep(1000);

      // State: encrypting
      logs.push('Encrypting with AES-256-CBC using provided passphrase...');
      await sleep(1500);
      
      // State: uploading
      logs.push(`Uploading to rclone remote: ${remoteTarget}`);
      await sleep(2000);

      // State: done
      logs.push('Upload complete. Cleaning up temporary files...');
      return {
        state: 'done',
        logs: logs,
      };

    } catch (error: any) {
      logs.push(`Error during backup: ${error.message}`);
      return {
        state: 'error',
        logs: logs,
      };
    }
  }
);
