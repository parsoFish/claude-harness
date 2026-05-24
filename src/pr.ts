import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Reads PR metadata from `.forge/_pr-metadata.json` in `cwd`.
 *
 * @param cwd - The working directory to look for `.forge/_pr-metadata.json`.
 * @returns An object with `url`, `title`, and `state` fields if the file exists
 *          and all three fields are present strings; otherwise returns `null`.
 */
export function readPrMetadata(
  cwd: string,
): { url: string; title: string; state: string } | null {
  const filePath = join(cwd, '.forge', '_pr-metadata.json');
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    // File absent or unreadable
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    parsed !== null &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    typeof (parsed as Record<string, unknown>)['url'] === 'string' &&
    typeof (parsed as Record<string, unknown>)['title'] === 'string' &&
    typeof (parsed as Record<string, unknown>)['state'] === 'string'
  ) {
    const meta = parsed as Record<string, string>;
    return { url: meta['url']!, title: meta['title']!, state: meta['state']! };
  }

  return null;
}
