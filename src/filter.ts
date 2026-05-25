/**
 * filter.ts — argv filter parsing for `--filter key:value` flags.
 *
 * Exports:
 *   - FilterSpec: { key: string; value: string }
 *   - parseFilters(argv: string[]): FilterSpec[]
 *
 * Does NOT do any matching logic — that lives in FEAT-3's WI.
 */

export interface FilterSpec {
  key: string;
  value: string;
}

/**
 * Walk `argv` collecting every `--filter <token>` or `--filter=<token>` pair.
 *
 * Each token must be in `key:value` form. Throws an `Error` if any token
 * is missing the colon separator.
 *
 * @param argv - Raw argv slice (e.g. process.argv.slice(2))
 * @returns Array of parsed filter specs (empty if no `--filter` flags found)
 */
export function parseFilters(argv: string[]): FilterSpec[] {
  const filters: FilterSpec[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    let token: string | undefined;

    if (arg === '--filter') {
      // Two-arg form: --filter key:value
      if (i + 1 < argv.length) {
        token = argv[i + 1];
        i++; // consume the next arg
      }
    } else if (arg.startsWith('--filter=')) {
      // Equals form: --filter=key:value
      token = arg.slice('--filter='.length);
    }

    if (token !== undefined) {
      const colonIndex = token.indexOf(':');
      if (colonIndex === -1) {
        throw new Error(
          `Malformed --filter token: "${token}" — expected "key:value" format`,
        );
      }
      const key = token.slice(0, colonIndex);
      const value = token.slice(colonIndex + 1);
      filters.push({ key, value });
    }
  }

  return filters;
}
