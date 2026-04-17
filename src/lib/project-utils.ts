import { join } from 'path';
import { mkdir, access } from 'fs/promises';

import { sanitizeDirName } from './file-utils';

/**
 * Generates a unique, non-colliding absolute directory path for a project name.
 * It will append `-1`, `-2`, etc. if the folder already exists.
 *
 * @param baseDir The parent directory where the project should reside
 * @param projectName The requested name of the project
 * @returns A unique absolute path
 */
export async function getUniqueProjectPath(baseDir: string, projectName: string): Promise<string> {
    const sanitized = sanitizeDirName(projectName) || 'untitled-project';

    let currentPath = join(baseDir, sanitized);
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
        try {
            // access throws if file/dir DOES NOT exist, which means it's available
            await access(currentPath);
            // If we get here, it means the folder exists, so we need to increment
            currentPath = join(baseDir, `${sanitized}-${counter}`);
            counter++;
        } catch {
            // The path does not exist, so it's unique
            isUnique = true;
        }
    }

    return currentPath;
}

/**
 * Setup default Claude workspace structures for a new project
 *
 * @param projectPath The absolute path of the new project
 * @param projectId Optional project ID used for hook targetPrefix/PROJECT_ID
 */
export async function setupProjectDefaults(projectPath: string, projectId?: string, workspaceRoot: string = process.cwd()): Promise<void> {
    try {
        // 1. Create .claude/hooks and commands directories
        const claudeDir = join(projectPath, '.claude');
        const hooksDir = join(claudeDir, 'hooks');
        const commandsDir = join(claudeDir, 'commands');

        await mkdir(hooksDir, { recursive: true });
        await mkdir(commandsDir, { recursive: true });


    } catch (e) {
        console.error('[project-utils] Error setting up project defaults:', e);
    }
}
