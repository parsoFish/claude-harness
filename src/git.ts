import { execSync } from 'node:child_process';

/**
 * Represents a single git commit.
 */
export interface Commit {
  hash: string;
  date: string;
  message: string;
}

/**
 * Parses the JSON array produced by `git log --format='{"hash":"%H","date":"%aI","message":"%s"}'`.
 *
 * @param jsonOutput - A JSON-serialised array of commit objects.
 * @returns An array of Commit objects each with hash, date, and message fields.
 */
export function parseGitLog(jsonOutput: string): Commit[] {
  const parsed = JSON.parse(jsonOutput) as unknown;
  if (!Array.isArray(parsed)) {
    throw new TypeError('parseGitLog: expected a JSON array');
  }
  return parsed.map((item: unknown) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Record<string, unknown>)['hash'] !== 'string' ||
      typeof (item as Record<string, unknown>)['date'] !== 'string' ||
      typeof (item as Record<string, unknown>)['message'] !== 'string'
    ) {
      throw new TypeError('parseGitLog: each commit must have hash, date, and message string fields');
    }
    const commit = item as Record<string, unknown>;
    return {
      hash: commit['hash'] as string,
      date: commit['date'] as string,
      message: commit['message'] as string,
    };
  });
}

/**
 * Spawns `git diff --name-only <sinceRef> <untilRef>` in the given worktree path
 * and returns an array of touched file paths (one per file).
 *
 * @param worktreePath - Absolute path to the git repository root.
 * @param sinceRef - The start ref (exclusive).
 * @param untilRef - The end ref (inclusive).
 * @returns An array of strings, one per touched file.
 */
export function getFilesTouched(
  worktreePath: string,
  sinceRef: string,
  untilRef: string,
): string[] {
  const stdout = execSync(`git diff --name-only ${sinceRef} ${untilRef}`, {
    cwd: worktreePath,
    encoding: 'utf8',
  });
  return stdout
    .split('\n')
    .filter((line) => line.trim().length > 0);
}

/**
 * Renders a '## Files touched' markdown section listing each file path.
 * If the array is empty, emits `_(none)_` instead of a list.
 *
 * @param filePaths - Array of file path strings.
 * @returns A markdown string containing a '## Files touched' heading.
 */
export function renderFilesTouchedSection(filePaths: string[]): string {
  const lines: string[] = ['## Files touched', ''];

  if (filePaths.length === 0) {
    lines.push('_(none)_', '');
  } else {
    for (const filePath of filePaths) {
      lines.push(`- ${filePath}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
