import test from 'node:test';
import assert from 'node:assert';
import {
  isAssignmentOverdue,
  getDaysUntilDeadline,
  determineSubmissionStatus,
  computeRubricGrade,
} from '../src/lib/assignments';
import { breakDownAssignmentAI } from '../src/lib/gemini';

test('Assignment Deadline Status', async (t) => {
  const fixedNow = new Date('2026-11-22T12:00:00Z').getTime();

  await t.test('detects past dates as overdue', () => {
    const pastDue = '2026-11-20T23:59:59Z';
    assert.strictEqual(isAssignmentOverdue(pastDue, fixedNow), true);
  });

  await t.test('detects future dates as active/not overdue', () => {
    const futureDue = '2026-11-25T23:59:59Z';
    assert.strictEqual(isAssignmentOverdue(futureDue, fixedNow), false);
  });

  await t.test('calculates correct days remaining until deadline', () => {
    const inThreeDays = '2026-11-25T12:00:00Z';
    assert.strictEqual(getDaysUntilDeadline(inThreeDays, fixedNow), 3);

    const pastTwoDays = '2026-11-20T12:00:00Z';
    assert.strictEqual(getDaysUntilDeadline(pastTwoDays, fixedNow), -2);
  });

  await t.test('handles invalid date strings safely', () => {
    assert.strictEqual(isAssignmentOverdue('not-a-valid-date', fixedNow), false);
    assert.strictEqual(getDaysUntilDeadline('invalid', fixedNow), 0);
  });
});

test('Student Submission & Grading Status Logic', async (t) => {
  const sampleSubmissions = [
    { assignment_id: 'asg-01', student_id: 'std-01', marks_awarded: 92 },
    { assignment_id: 'asg-02', student_id: 'std-01' }, // Submitted, unreviewed
  ];

  await t.test('identifies pending assignment when student has not submitted', () => {
    const status = determineSubmissionStatus('asg-03', 'std-01', sampleSubmissions);
    assert.strictEqual(status, 'pending');
  });

  await t.test('identifies submitted status when submitted but not graded', () => {
    const status = determineSubmissionStatus('asg-02', 'std-01', sampleSubmissions);
    assert.strictEqual(status, 'submitted');
  });

  await t.test('identifies graded status when marks are awarded', () => {
    const status = determineSubmissionStatus('asg-01', 'std-01', sampleSubmissions);
    assert.strictEqual(status, 'graded');
  });
});

test('Rubric Grade & Letter Calculation', () => {
  assert.deepStrictEqual(computeRubricGrade(95, 100), { percentage: 95.0, letterGrade: 'A+' });
  assert.deepStrictEqual(computeRubricGrade(82, 100), { percentage: 82.0, letterGrade: 'A' });
  assert.deepStrictEqual(computeRubricGrade(74, 100), { percentage: 74.0, letterGrade: 'B' });
  assert.deepStrictEqual(computeRubricGrade(65, 100), { percentage: 65.0, letterGrade: 'C' });
  assert.deepStrictEqual(computeRubricGrade(52, 100), { percentage: 52.0, letterGrade: 'D' });
  assert.deepStrictEqual(computeRubricGrade(35, 100), { percentage: 35.0, letterGrade: 'F' });
  assert.deepStrictEqual(computeRubricGrade(45, 50), { percentage: 90.0, letterGrade: 'A+' });
  assert.deepStrictEqual(computeRubricGrade(10, 0), { percentage: 0, letterGrade: 'F' });
});

test('Assignment Task Decomposer (Deterministic Fallback)', async () => {
  const tasks = await breakDownAssignmentAI(
    'Implement B-Tree Storage Engine',
    'Write a working C++ implementation of a B+ Tree index with split and merge.'
  );

  assert.ok(Array.isArray(tasks));
  assert.ok(tasks.length >= 3);
  tasks.forEach((task, idx) => {
    assert.ok(task.id.startsWith('task-'));
    assert.strictEqual(task.step, idx + 1);
    assert.ok(typeof task.task === 'string' && task.task.length > 5);
    assert.ok(typeof task.estimated_time === 'string');
    assert.strictEqual(task.completed, false);
  });
});
