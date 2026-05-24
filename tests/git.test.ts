import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseGitLog, renderFilesTouchedSection, type Commit } from '../src/git.ts';

// ── AC1: parseGitLog returns array of Commit objects ─────────────────────────

describe('parseGitLog', () => {
  it('AC1: returns array of Commit objects with hash, date, and message fields', () => {
    const fixture: Commit[] = [
      { hash: 'abc123def456abc123def456abc123def456abc12', date: '2026-05-24T10:00:00+00:00', message: 'feat: add git module' },
      { hash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', date: '2026-05-23T08:30:00+00:00', message: 'fix: correct typo in readme' },
    ];
    const jsonOutput = JSON.stringify(fixture);

    const result = parseGitLog(jsonOutput);

    assert.equal(result.length, 2);
    assert.equal(result[0].hash, 'abc123def456abc123def456abc123def456abc12');
    assert.equal(result[0].date, '2026-05-24T10:00:00+00:00');
    assert.equal(result[0].message, 'feat: add git module');
    assert.equal(result[1].hash, 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
    assert.equal(result[1].date, '2026-05-23T08:30:00+00:00');
    assert.equal(result[1].message, 'fix: correct typo in readme');
  });

  it('AC1: returns empty array for empty JSON array', () => {
    const result = parseGitLog('[]');
    assert.deepEqual(result, []);
  });

  it('AC1: each returned object has exactly hash, date, and message string fields', () => {
    const fixture = [
      { hash: 'aaa', date: '2026-01-01T00:00:00Z', message: 'first commit' },
    ];
    const result = parseGitLog(JSON.stringify(fixture));

    assert.equal(result.length, 1);
    const commit = result[0];
    assert.ok(typeof commit.hash === 'string', 'hash should be a string');
    assert.ok(typeof commit.date === 'string', 'date should be a string');
    assert.ok(typeof commit.message === 'string', 'message should be a string');
  });

  it('AC1: throws TypeError when input is not a JSON array', () => {
    assert.throws(
      () => parseGitLog('{"hash":"a","date":"b","message":"c"}'),
      TypeError,
    );
  });
});

// ── AC2: renderFilesTouchedSection with non-empty list ────────────────────────

describe('renderFilesTouchedSection — non-empty list', () => {
  it('AC2: contains ## Files touched heading', () => {
    const result = renderFilesTouchedSection(['src/foo.ts', 'tests/foo.test.ts']);
    assert.ok(
      result.includes('## Files touched'),
      `Expected '## Files touched' heading in:\n${result}`,
    );
  });

  it('AC2: contains one list item per file path', () => {
    const filePaths = ['src/foo.ts', 'tests/foo.test.ts', 'README.md'];
    const result = renderFilesTouchedSection(filePaths);

    for (const filePath of filePaths) {
      assert.ok(
        result.includes(`- ${filePath}`),
        `Expected list item '- ${filePath}' in:\n${result}`,
      );
    }
  });

  it('AC2: returns exactly one list item per file (no duplicates or extras)', () => {
    const filePaths = ['src/a.ts', 'src/b.ts'];
    const result = renderFilesTouchedSection(filePaths);

    const listItems = result
      .split('\n')
      .filter((line) => line.startsWith('- '));
    assert.equal(listItems.length, filePaths.length);
  });
});

// ── AC3: renderFilesTouchedSection with empty list ────────────────────────────

describe('renderFilesTouchedSection — empty list', () => {
  it('AC3: contains ## Files touched heading when given empty array', () => {
    const result = renderFilesTouchedSection([]);
    assert.ok(
      result.includes('## Files touched'),
      `Expected '## Files touched' heading in:\n${result}`,
    );
  });

  it('AC3: contains _(none)_ when given empty array', () => {
    const result = renderFilesTouchedSection([]);
    assert.ok(
      result.includes('_(none)_'),
      `Expected '_(none)_' in:\n${result}`,
    );
  });

  it('AC3: does not contain any list items when given empty array', () => {
    const result = renderFilesTouchedSection([]);
    const listItems = result
      .split('\n')
      .filter((line) => line.startsWith('- '));
    assert.equal(listItems.length, 0, 'Expected no list items for empty input');
  });
});
