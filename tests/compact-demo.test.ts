import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEMO_PATH = resolve(
  import.meta.dirname ?? process.cwd(),
  '../demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md',
);

describe('compact DEMO.md exists and is valid', () => {
  it('DEMO.md file exists', () => {
    assert.ok(existsSync(DEMO_PATH), `DEMO.md not found at: ${DEMO_PATH}`);
  });

  it('DEMO.md is non-empty', () => {
    const content = readFileSync(DEMO_PATH, 'utf8');
    assert.ok(content.length > 0, 'DEMO.md should not be empty');
  });

  it('DEMO.md contains AC1 heading', () => {
    const content = readFileSync(DEMO_PATH, 'utf8');
    assert.ok(content.includes('AC1'), 'DEMO.md should contain AC1 section');
  });
});
