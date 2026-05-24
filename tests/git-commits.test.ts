/**
 * Tests for getCommits(jsonPath) in src/git.ts
 *
 * Covers:
 *   AC1 — returns {sha, subject}[] matching the file contents
 *   AC2 — returns [] for an empty array without throwing
 *   AC3 — truncates full 40-char SHA to 7 chars
 *   AC4 — throws on missing file or invalid JSON
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getCommits } from '../src/git.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TMP = join(tmpdir(), `git-commits-test-${process.pid}`);

function writeTmp(name: string, content: string): string {
  const p = join(TMP, name);
  writeFileSync(p, content, 'utf8');
  return p;
}

before(() => {
  mkdirSync(TMP, { recursive: true });
});

after(() => {
  rmSync(TMP, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// AC1: normal array with sha + subject fields
// ---------------------------------------------------------------------------

describe('getCommits — AC1: normal array', () => {
  it('returns the array with sha and subject matching the file', () => {
    const filePath = writeTmp(
      'ac1.json',
      JSON.stringify([
        { sha: 'abc1234', subject: 'feat: first commit' },
        { sha: 'def5678', subject: 'fix: second commit' },
      ]),
    );

    const result = getCommits(filePath);

    assert.equal(result.length, 2);
    assert.equal(result[0].sha, 'abc1234');
    assert.equal(result[0].subject, 'feat: first commit');
    assert.equal(result[1].sha, 'def5678');
    assert.equal(result[1].subject, 'fix: second commit');
  });
});

// ---------------------------------------------------------------------------
// AC2: empty array
// ---------------------------------------------------------------------------

describe('getCommits — AC2: empty array', () => {
  it('returns an empty array without throwing', () => {
    const filePath = writeTmp('ac2.json', '[]');
    const result = getCommits(filePath);
    assert.deepEqual(result, []);
  });
});

// ---------------------------------------------------------------------------
// AC3: full 40-char SHA is truncated to 7 chars
// ---------------------------------------------------------------------------

describe('getCommits — AC3: full SHA truncation', () => {
  it('truncates a 40-char sha to 7 chars', () => {
    const fullSha = 'a'.repeat(40);
    const filePath = writeTmp(
      'ac3.json',
      JSON.stringify([{ sha: fullSha, subject: 'chore: test sha truncation' }]),
    );

    const result = getCommits(filePath);

    assert.equal(result.length, 1);
    assert.equal(result[0].sha.length, 7);
    assert.equal(result[0].sha, fullSha.slice(0, 7));
  });

  it('leaves a sha that is already 7 chars unchanged', () => {
    const filePath = writeTmp(
      'ac3b.json',
      JSON.stringify([{ sha: '1234567', subject: 'chore: already short' }]),
    );

    const result = getCommits(filePath);
    assert.equal(result[0].sha, '1234567');
  });

  it('also normalises hash/message field names (alternative schema)', () => {
    const fullHash = 'b'.repeat(40);
    const filePath = writeTmp(
      'ac3c.json',
      JSON.stringify([{ hash: fullHash, message: 'refactor: uses hash+message schema' }]),
    );

    const result = getCommits(filePath);
    assert.equal(result[0].sha.length, 7);
    assert.equal(result[0].sha, fullHash.slice(0, 7));
    assert.equal(result[0].subject, 'refactor: uses hash+message schema');
  });
});

// ---------------------------------------------------------------------------
// AC4: missing file or invalid JSON throws
// ---------------------------------------------------------------------------

describe('getCommits — AC4: error cases', () => {
  it('throws when the file does not exist', () => {
    assert.throws(
      () => getCommits(join(TMP, 'does-not-exist.json')),
      (err: unknown) => err instanceof Error,
    );
  });

  it('throws when the file contains invalid JSON', () => {
    const filePath = writeTmp('ac4-invalid.json', '{ not valid json }');
    assert.throws(
      () => getCommits(filePath),
      (err: unknown) => err instanceof Error,
    );
  });

  it('throws when the file contains a non-array JSON value', () => {
    const filePath = writeTmp('ac4-not-array.json', '{"sha":"abc","subject":"oops"}');
    assert.throws(
      () => getCommits(filePath),
      (err: unknown) => err instanceof TypeError,
    );
  });

  it('throws when an array item is missing sha/hash', () => {
    const filePath = writeTmp(
      'ac4-missing-sha.json',
      JSON.stringify([{ subject: 'no sha here' }]),
    );
    assert.throws(
      () => getCommits(filePath),
      (err: unknown) => err instanceof TypeError,
    );
  });

  it('throws when an array item is missing subject/message', () => {
    const filePath = writeTmp(
      'ac4-missing-subject.json',
      JSON.stringify([{ sha: 'abc1234' }]),
    );
    assert.throws(
      () => getCommits(filePath),
      (err: unknown) => err instanceof TypeError,
    );
  });
});
