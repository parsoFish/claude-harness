import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { findThemesForInitiative, renderThemesSection } from '../src/brain.ts';
import type { ThemeRef } from '../src/brain.ts';

// ---------------------------------------------------------------------------
// AC1 + AC2 — findThemesForInitiative
// ---------------------------------------------------------------------------

describe('findThemesForInitiative', () => {
  let brainDir: string;
  let matchingFilePath: string;

  before(() => {
    // Create a temporary brain directory with two .md files
    brainDir = mkdtempSync(join(tmpdir(), 'brain-test-'));

    // File that DOES mention INIT-FIXTURE-1
    matchingFilePath = join(brainDir, 'theme-a.md');
    writeFileSync(
      matchingFilePath,
      [
        '---',
        'description: Theme A description',
        '---',
        '',
        'This theme is relevant to INIT-FIXTURE-1 and documents patterns.',
      ].join('\n'),
      'utf8',
    );

    // File that does NOT mention INIT-FIXTURE-1
    writeFileSync(
      join(brainDir, 'theme-b.md'),
      [
        '---',
        'description: Theme B description',
        '---',
        '',
        'This theme covers unrelated subjects.',
      ].join('\n'),
      'utf8',
    );
  });

  after(() => {
    rmSync(brainDir, { recursive: true, force: true });
  });

  it('AC1: returns exactly one ThemeRef for the file that mentions the initiativeId', () => {
    const results = findThemesForInitiative(brainDir, 'INIT-FIXTURE-1');

    assert.equal(results.length, 1, 'should return exactly one ThemeRef');
    assert.equal(results[0].path, matchingFilePath, 'path should match the file mentioning INIT-FIXTURE-1');
    assert.equal(results[0].description, 'Theme A description', 'description should be extracted from frontmatter');
  });

  it('AC2: returns an empty array without throwing for a non-existent brain directory', () => {
    const nonExistentDir = join(tmpdir(), 'brain-does-not-exist-xyz-' + Date.now());
    let result: ThemeRef[] | undefined;
    let threw = false;

    try {
      result = findThemesForInitiative(nonExistentDir, 'INIT-FIXTURE-1');
    } catch {
      threw = true;
    }

    assert.equal(threw, false, 'should not throw for a non-existent directory');
    assert.deepEqual(result, [], 'should return an empty array');
  });
});

// ---------------------------------------------------------------------------
// AC3 — renderThemesSection
// ---------------------------------------------------------------------------

describe('renderThemesSection', () => {
  it('AC3: contains "## Themes consulted" heading and one list item per ThemeRef', () => {
    const themes: ThemeRef[] = [
      { path: 'brain/forge/themes/foo.md', description: 'Foo theme' },
      { path: 'brain/forge/themes/bar.md', description: 'Bar theme' },
    ];

    const output = renderThemesSection(themes);

    assert.ok(
      output.includes('## Themes consulted'),
      'should contain "## Themes consulted" heading',
    );

    assert.ok(
      output.includes('brain/forge/themes/foo.md') && output.includes('Foo theme'),
      'should contain path and description for first ThemeRef',
    );

    assert.ok(
      output.includes('brain/forge/themes/bar.md') && output.includes('Bar theme'),
      'should contain path and description for second ThemeRef',
    );

    // Verify one list item per ThemeRef (count lines starting with '- ')
    const listItems = output.split('\n').filter((line) => line.startsWith('- '));
    assert.equal(listItems.length, 2, 'should have exactly two list items');
  });

  it('renders _(none)_ when themes array is empty', () => {
    const output = renderThemesSection([]);
    assert.ok(output.includes('## Themes consulted'), 'should contain heading even for empty themes');
    assert.ok(output.includes('_(none)_'), 'should render _(none)_ for empty themes');
  });
});
