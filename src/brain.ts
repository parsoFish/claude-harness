import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A reference to a brain theme file that mentions a given initiative.
 */
export interface ThemeRef {
  /** Absolute or relative path to the theme .md file. */
  path: string;
  /** One-line description extracted from the file's frontmatter `description:` field. */
  description: string;
}

/**
 * Recursively collects all .md file paths under `dir`.
 * Returns an empty array if `dir` does not exist or cannot be read.
 */
function collectMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  const results: string[] = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Extracts the `description:` value from YAML frontmatter.
 * Returns an empty string if the field is absent.
 */
function extractDescription(content: string): string {
  const match = /^description:\s*['"]?(.+?)['"]?\s*$/m.exec(content);
  return match ? match[1].trim() : '';
}

/**
 * Scans `brainDir` recursively for .md files whose body text contains
 * `initiativeId` as a substring, extracts the `description:` frontmatter
 * value from each match, and returns an array of ThemeRef objects sorted
 * by path.
 *
 * Returns an empty array (without throwing) if `brainDir` does not exist.
 */
export function findThemesForInitiative(
  brainDir: string,
  initiativeId: string,
): ThemeRef[] {
  const files = collectMarkdownFiles(brainDir);
  const themes: ThemeRef[] = [];

  for (const filePath of files) {
    let content: string;
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    if (content.includes(initiativeId)) {
      themes.push({
        path: filePath,
        description: extractDescription(content),
      });
    }
  }

  themes.sort((a, b) => a.path.localeCompare(b.path));
  return themes;
}

/**
 * Renders the "Themes consulted" section of a trail document.
 *
 * @param themes - Array of ThemeRef objects to render.
 * @returns A markdown string with a `## Themes consulted` heading and one
 *          list item per ThemeRef showing path and description. If `themes`
 *          is empty, emits `_(none)_` beneath the heading.
 */
export function renderThemesSection(themes: ThemeRef[]): string {
  const lines: string[] = ['## Themes consulted', ''];

  if (themes.length === 0) {
    lines.push('_(none)_', '');
  } else {
    for (const theme of themes) {
      lines.push(`- \`${theme.path}\` — ${theme.description}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
