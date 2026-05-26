import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatStatsText } from '../src/stats.ts';

// ---- AC1: two-column table with header, phases in order, total last ----------

test('AC1: returns a two-column table with header row and total on last row', () => {
  const counts: Record<string, number> = {
    architect: 12,
    'project-manager': 8,
    'developer-loop': 47,
    'review-loop': 9,
    closure: 5,
    reflection: 12,
    total: 93,
  };

  const result = formatStatsText(counts);
  const lines = result.split('\n');

  // Header row must start with 'phase:'
  assert.ok(lines[0].startsWith('phase:'), `header row should start with 'phase:', got: ${JSON.stringify(lines[0])}`);
  // Header row must contain 'events'
  assert.ok(lines[0].includes('events'), `header row should contain 'events', got: ${JSON.stringify(lines[0])}`);

  // Phases listed in record insertion order (excluding 'total')
  assert.ok(lines[1].trimStart().startsWith('architect'), `line 1 should be architect, got: ${JSON.stringify(lines[1])}`);
  assert.ok(lines[2].trimStart().startsWith('project-manager'), `line 2 should be project-manager, got: ${JSON.stringify(lines[2])}`);
  assert.ok(lines[3].trimStart().startsWith('developer-loop'), `line 3 should be developer-loop, got: ${JSON.stringify(lines[3])}`);
  assert.ok(lines[4].trimStart().startsWith('review-loop'), `line 4 should be review-loop, got: ${JSON.stringify(lines[4])}`);
  assert.ok(lines[5].trimStart().startsWith('closure'), `line 5 should be closure, got: ${JSON.stringify(lines[5])}`);
  assert.ok(lines[6].trimStart().startsWith('reflection'), `line 6 should be reflection, got: ${JSON.stringify(lines[6])}`);

  // 'total' must be on the last row
  const lastLine = lines[lines.length - 1];
  assert.ok(lastLine.trimStart().startsWith('total'), `last row should start with 'total', got: ${JSON.stringify(lastLine)}`);

  // Last row must contain the total count
  assert.ok(lastLine.includes('93'), `last row should contain 93, got: ${JSON.stringify(lastLine)}`);

  // Correct row count: 1 header + 6 phases + 1 total = 8 lines
  assert.equal(lines.length, 8, `should have 8 lines (header + 6 phases + total), got ${lines.length}`);
});

// ---- AC2: padding alignment with 'developer-loop' as longest phase name ------

test('AC2: left column is padded to align all lines when developer-loop is the longest phase name', () => {
  // Use a record where 'developer-loop' (14 chars) is the longest phase name.
  // 'phase:' header label is 6 chars, so developer-loop wins; colWidth = 14 + 2 = 16.
  const counts: Record<string, number> = {
    architect: 12,
    'developer-loop': 47,
    'review-loop': 9,
    closure: 5,
    reflection: 12,
    total: 85,
  };

  const result = formatStatsText(counts);
  const lines = result.split('\n');

  // Skip the header line (index 0) for digit-alignment check;
  // data rows (phases + total) must all have their number starting at the same column.
  const dataLines = lines.slice(1);

  // All data lines must have a digit (counts are all > 0)
  const firstDigitPositions = dataLines.map((line, i) => {
    const match = line.match(/\d/);
    assert.ok(match, `data line ${i + 1} has no digit: ${JSON.stringify(line)}`);
    return line.indexOf(match![0]);
  });

  // All digit start positions must be identical (alignment check)
  const referencePos = firstDigitPositions[0];
  firstDigitPositions.forEach((pos, i) => {
    assert.equal(pos, referencePos, `data line ${i + 1} digit at col ${pos} doesn't match reference col ${referencePos}: ${JSON.stringify(dataLines[i])}`);
  });

  // 'developer-loop' is 14 chars; colWidth = 14 + 2 = 16
  // So numbers should start at column 16 (0-based index)
  assert.equal(referencePos, 16, `numbers should start at column 16, got ${referencePos}`);

  // Verify header row starts with 'phase:' and contains 'events'
  assert.ok(lines[0].startsWith('phase:'), `header should start with 'phase:', got: ${JSON.stringify(lines[0])}`);
  assert.ok(lines[0].includes('events'), `header should contain 'events', got: ${JSON.stringify(lines[0])}`);

  // Verify 'developer-loop' row is correctly formatted
  const devLine = lines.find(l => l.trimStart().startsWith('developer-loop'));
  assert.ok(devLine, "should have a 'developer-loop' row");
  assert.ok(devLine!.includes('47'), "developer-loop row should contain '47'");
});

// ---- AC3: single phase plus total -------------------------------------------

test('AC3: single phase plus total produces a valid two-row table with correct padding', () => {
  const counts: Record<string, number> = {
    architect: 5,
    total: 5,
  };

  const result = formatStatsText(counts);
  const lines = result.split('\n');

  // Exactly 3 lines: header + 1 phase + total
  assert.equal(lines.length, 3, `should have 3 lines (header + 1 phase + total), got ${lines.length}: ${JSON.stringify(lines)}`);

  // Line 0: header
  assert.ok(lines[0].startsWith('phase:'), `line 0 should start with 'phase:', got: ${JSON.stringify(lines[0])}`);
  assert.ok(lines[0].includes('events'), `line 0 should contain 'events', got: ${JSON.stringify(lines[0])}`);

  // Line 1: the single phase
  assert.ok(lines[1].trimStart().startsWith('architect'), `line 1 should start with 'architect', got: ${JSON.stringify(lines[1])}`);
  assert.ok(lines[1].includes('5'), `line 1 should contain '5', got: ${JSON.stringify(lines[1])}`);

  // Line 2: total
  assert.ok(lines[2].trimStart().startsWith('total'), `line 2 should start with 'total', got: ${JSON.stringify(lines[2])}`);
  assert.ok(lines[2].includes('5'), `line 2 should contain '5', got: ${JSON.stringify(lines[2])}`);

  // Alignment: data lines (skip header) should have digit at same column
  const dataLines = lines.slice(1);
  const firstDigitPositions = dataLines.map((line, i) => {
    const match = line.match(/\d/);
    assert.ok(match, `data line ${i + 1} has no digit: ${JSON.stringify(line)}`);
    return line.indexOf(match![0]);
  });
  const referencePos = firstDigitPositions[0];
  firstDigitPositions.forEach((pos, i) => {
    assert.equal(pos, referencePos, `data line ${i + 1} digit at col ${pos} doesn't align with col ${referencePos}: ${JSON.stringify(dataLines[i])}`);
  });
});
