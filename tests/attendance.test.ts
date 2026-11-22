import test from 'node:test';
import assert from 'node:assert';
import {
  calculateAttendancePercentage,
  isAttendanceShortage,
  calculateConsecutiveClassesNeeded,
  generatePresentAllRecords,
} from '../src/lib/attendance';

test('Attendance Percentage Calculation', async (t) => {
  await t.test('calculates correct percentage for standard conducted and attended classes', () => {
    assert.strictEqual(calculateAttendancePercentage(20, 16), 80.0);
    assert.strictEqual(calculateAttendancePercentage(30, 26), 86.7);
    assert.strictEqual(calculateAttendancePercentage(40, 30), 75.0);
  });

  await t.test('handles 0 conducted classes gracefully by returning 100%', () => {
    assert.strictEqual(calculateAttendancePercentage(0, 0), 100.0);
    assert.strictEqual(calculateAttendancePercentage(-5, 0), 100.0);
  });

  await t.test('clamps values between 0.0% and 100.0%', () => {
    assert.strictEqual(calculateAttendancePercentage(20, 0), 0.0);
    assert.strictEqual(calculateAttendancePercentage(20, 25), 100.0);
  });
});

test('Attendance Shortage Detection', async (t) => {
  await t.test('identifies percentages below institutional 75% cutoff as shortage', () => {
    assert.strictEqual(isAttendanceShortage(74.9), true);
    assert.strictEqual(isAttendanceShortage(60.0), true);
    assert.strictEqual(isAttendanceShortage(0.0), true);
  });

  await t.test('confirms 75.0% and above is in good standing', () => {
    assert.strictEqual(isAttendanceShortage(75.0), false);
    assert.strictEqual(isAttendanceShortage(85.5), false);
    assert.strictEqual(isAttendanceShortage(100.0), false);
  });

  await t.test('supports custom institutional cutoff threshold', () => {
    assert.strictEqual(isAttendanceShortage(78.0, 80.0), true);
    assert.strictEqual(isAttendanceShortage(80.0, 80.0), false);
  });
});

test('Consecutive Recovery Classes Calculator', async (t) => {
  await t.test('returns 0 when student already satisfies target percentage', () => {
    // 18 / 20 = 90% (target 75%)
    assert.strictEqual(calculateConsecutiveClassesNeeded(20, 18, 75), 0);
    // 30 / 40 = 75% (target 75%)
    assert.strictEqual(calculateConsecutiveClassesNeeded(40, 30, 75), 0);
  });

  await t.test('calculates mathematically verified consecutive classes to recover from shortage', () => {
    // 10 / 20 = 50% -> Target 75%
    // Formula: (0.75 * 20 - 10) / (1 - 0.75) = 5 / 0.25 = 20 classes
    // Verification: (10 + 20) / (20 + 20) = 30 / 40 = 75.0%
    const needed1 = calculateConsecutiveClassesNeeded(20, 10, 75);
    assert.strictEqual(needed1, 20);
    assert.strictEqual((10 + needed1) / (20 + needed1) >= 0.75, true);

    // 20 / 30 = 66.7% -> Target 75%
    // Formula: (0.75 * 30 - 20) / 0.25 = (22.5 - 20) / 0.25 = 2.5 / 0.25 = 10 classes
    // Verification: (20 + 10) / (30 + 10) = 30 / 40 = 75.0%
    const needed2 = calculateConsecutiveClassesNeeded(30, 20, 75);
    assert.strictEqual(needed2, 10);
    assert.strictEqual((20 + needed2) / (30 + needed2) >= 0.75, true);

    // 14 / 22 = 63.6% -> Target 80%
    // Formula: (0.80 * 22 - 14) / 0.20 = (17.6 - 14) / 0.20 = 3.6 / 0.20 = 18 classes
    const needed3 = calculateConsecutiveClassesNeeded(22, 14, 80);
    assert.strictEqual(needed3, 18);
    assert.strictEqual((14 + needed3) / (22 + needed3) >= 0.80, true);
  });

  await t.test('handles impossible 100% target after missed classes', () => {
    // Once a class is missed (19/20), 100% is mathematically impossible with finite classes
    assert.strictEqual(calculateConsecutiveClassesNeeded(20, 19, 100), 999);
  });

  await t.test('handles zero initial classes conducted', () => {
    assert.strictEqual(calculateConsecutiveClassesNeeded(0, 0, 75), 0);
  });
});

test('Bulk Present All Record Generation', () => {
  const students = ['std-01', 'std-02', 'std-03', 'std-04'];
  const sessionId = 'ses-101';

  const records = generatePresentAllRecords(students, sessionId);

  assert.strictEqual(records.length, 4);
  records.forEach((record, idx) => {
    assert.strictEqual(record.student_id, students[idx]);
    assert.strictEqual(record.session_id, sessionId);
    assert.strictEqual(record.status, 'present');
    assert.strictEqual(record.remarks, 'Marked Present via Present All');
  });
});
