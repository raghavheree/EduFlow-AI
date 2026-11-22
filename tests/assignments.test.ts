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

test('Student Assignment Submission Workflow', async (t) => {
  interface SubmissionRecord {
    id: string;
    assignment_id: string;
    student_id: string;
    student_name: string;
    enrollment_number: string;
    file_name: string;
    repo_url?: string;
    notes?: string;
    status: 'submitted' | 'graded';
    marks_awarded?: number;
    submitted_at: string;
  }

  const submissionsState: SubmissionRecord[] = [];

  const handleStudentSubmit = (
    assignmentId: string,
    studentId: string,
    studentName: string,
    enrollment: string,
    fileName: string,
    repoUrl?: string,
    notes?: string
  ) => {
    const newSubmission: SubmissionRecord = {
      id: `subm-${Date.now()}`,
      assignment_id: assignmentId,
      student_id: studentId,
      student_name: studentName,
      enrollment_number: enrollment,
      file_name: fileName,
      repo_url: repoUrl,
      notes: notes,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };
    submissionsState.push(newSubmission);
    return newSubmission;
  };

  await t.test('student successfully enters submission details and submits solution', () => {
    const sub = handleStudentSubmit(
      'asg-101',
      'std-01',
      'Aarav Sharma',
      'CSE-2024-042',
      'AaravSharma_BTree_Solution.pdf',
      'https://github.com/aarav/btree-engine',
      'Full test suite passed.'
    );

    assert.strictEqual(sub.assignment_id, 'asg-101');
    assert.strictEqual(sub.student_id, 'std-01');
    assert.strictEqual(sub.status, 'submitted');
    assert.strictEqual(sub.file_name, 'AaravSharma_BTree_Solution.pdf');
    assert.strictEqual(sub.repo_url, 'https://github.com/aarav/btree-engine');
    assert.strictEqual(sub.notes, 'Full test suite passed.');
  });

  await t.test('submission updates student status from pending to submitted', () => {
    const status = determineSubmissionStatus('asg-101', 'std-01', submissionsState);
    assert.strictEqual(status, 'submitted');
  });

  await t.test('unsubmitted assignment remains in pending status for student', () => {
    const status = determineSubmissionStatus('asg-102', 'std-01', submissionsState);
    assert.strictEqual(status, 'pending');
  });
});

test('Faculty Submission Review & Evaluation Workflow', async (t) => {
  const cohortSubmissions = [
    {
      id: 'subm-01',
      assignment_id: 'asg-cs301',
      student_id: 'std-01',
      student_name: 'Aarav Sharma',
      file_name: 'CS301_Solution.pdf',
      status: 'submitted' as const,
      marks_awarded: undefined as number | undefined,
      feedback: undefined as string | undefined,
    },
    {
      id: 'subm-02',
      assignment_id: 'asg-cs301',
      student_id: 'std-02',
      student_name: 'Bhavna Patel',
      file_name: 'CS301_Report.pdf',
      status: 'submitted' as const,
      marks_awarded: undefined as number | undefined,
      feedback: undefined as string | undefined,
    },
    {
      id: 'subm-03',
      assignment_id: 'asg-cs302',
      student_id: 'std-03',
      student_name: 'Chetan Verma',
      file_name: 'CS302_HW.pdf',
      status: 'submitted' as const,
      marks_awarded: undefined as number | undefined,
      feedback: undefined as string | undefined,
    },
  ];

  await t.test('faculty filters and reviews submissions strictly for selected assignment', () => {
    const selectedAssignmentId = 'asg-cs301';
    const forAssignment = cohortSubmissions.filter(s => s.assignment_id === selectedAssignmentId);

    assert.strictEqual(forAssignment.length, 2);
    assert.deepStrictEqual(forAssignment.map(s => s.student_name), ['Aarav Sharma', 'Bhavna Patel']);
  });

  await t.test('faculty records rubric marks and feedback for student submission', () => {
    const target = cohortSubmissions.find(s => s.id === 'subm-01')!;
    target.marks_awarded = 94;
    target.feedback = 'Excellent algorithm implementation with optimal asymptotic runtime.';
    (target as any).status = 'graded';

    assert.strictEqual(target.status, 'graded');
    assert.strictEqual(target.marks_awarded, 94);
    assert.ok(target.feedback.includes('optimal'));

    // Check rubric grade conversion
    const grade = computeRubricGrade(target.marks_awarded, 100);
    assert.strictEqual(grade.letterGrade, 'A+');
    assert.strictEqual(grade.percentage, 94.0);
  });

  await t.test('separate assignment submissions remain strictly isolated', () => {
    const cs302Submissions = cohortSubmissions.filter(s => s.assignment_id === 'asg-cs302');
    assert.strictEqual(cs302Submissions.length, 1);
    assert.strictEqual(cs302Submissions[0].student_name, 'Chetan Verma');
  });
});
