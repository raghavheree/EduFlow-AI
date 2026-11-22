import test from 'node:test';
import assert from 'node:assert';
import { analyzeNoticeDocument, isGeminiConfigured } from '../src/lib/gemini';
import { isNoticeVisibleToUser, filterNoticesByDepartmentScope } from '../src/lib/notices';

test('Notice Document Processing & NLP Categorization', async (t) => {
  await t.test('correctly identifies Exam category from circular text', async () => {
    const text = 'Office of the Controller of Examinations: End Semester Examination Timetable for November 2026. Hall tickets available.';
    const result = await analyzeNoticeDocument(text, 'exam_circular.pdf');
    assert.strictEqual(result.category, 'Exam');
    assert.strictEqual(result.engineUsed, 'Intelligent Local Edge NLP Engine');
    assert.ok(result.actionItems.some(item => item.toLowerCase().includes('hall ticket')));
  });

  await t.test('correctly identifies Assignment category', async () => {
    const text = 'Data Structures Laboratory Record Submission deadline has been announced. Submit homework via EduFlow.';
    const result = await analyzeNoticeDocument(text, 'lab_submission.pdf');
    assert.strictEqual(result.category, 'Assignment');
  });

  await t.test('correctly identifies Holiday category', async () => {
    const text = 'College campus will remain closed on Friday for University Foundation Day recess.';
    const result = await analyzeNoticeDocument(text, 'holiday_notice.txt');
    assert.strictEqual(result.category, 'Holiday');
  });

  await t.test('correctly identifies Event category for symposium or hackathon', async () => {
    const text = 'Annual Department Technical Symposium and Hackathon 2026. Cash prizes and workshop registrations open.';
    const result = await analyzeNoticeDocument(text, 'symposium.pdf');
    assert.strictEqual(result.category, 'Event');
  });

  await t.test('correctly identifies Registration category', async () => {
    const text = 'Semester enrollment and elective fee payment portal will open tomorrow for all students.';
    const result = await analyzeNoticeDocument(text, 'enrollment_notice.pdf');
    assert.strictEqual(result.category, 'Registration');
  });
});

test('Notice Department Detection & Audience Isolation', async (t) => {
  await t.test('classifies department code correctly from content keywords', async () => {
    const cseNotice = await analyzeNoticeDocument('Department of Computer Science and Engineering CSE coding marathon.');
    assert.strictEqual(cseNotice.targetDepartmentCode, 'CSE');

    const eceNotice = await analyzeNoticeDocument('Department of Electronics & Communication Engineering VLSI chip design workshop.');
    assert.strictEqual(eceNotice.targetDepartmentCode, 'ECE');

    const mechNotice = await analyzeNoticeDocument('Department of Mechanical Engineering thermal fluid lab schedule.');
    assert.strictEqual(mechNotice.targetDepartmentCode, 'MECH');

    const generalNotice = await analyzeNoticeDocument('General Campus Library timing revision for all academic departments.');
    assert.strictEqual(generalNotice.targetDepartmentCode, 'ALL');
  });

  await t.test('enforces strict department-level audience isolation rules', () => {
    const cseNotice = { department_id: 'dept-cse', target_department_code: 'CSE' };
    const mechNotice = { department_id: 'dept-mech', target_department_code: 'MECH' };
    const collegeWideNotice = { department_id: null, target_department_code: 'ALL' };

    // CSE student
    assert.strictEqual(isNoticeVisibleToUser(cseNotice, 'dept-cse', 'CSE', 'student'), true);
    assert.strictEqual(isNoticeVisibleToUser(collegeWideNotice, 'dept-cse', 'CSE', 'student'), true);
    assert.strictEqual(isNoticeVisibleToUser(mechNotice, 'dept-cse', 'CSE', 'student'), false, 'CSE student must not view MECH notices');

    // Admin has institution-wide supervisory visibility
    assert.strictEqual(isNoticeVisibleToUser(mechNotice, 'dept-cse', 'CSE', 'admin'), true, 'Admin should view all notices');
  });

  await t.test('filters notice arrays accurately by department scope', () => {
    const feed = [
      { id: '1', department_id: 'dept-cse', target_department_code: 'CSE' },
      { id: '2', department_id: 'dept-mech', target_department_code: 'MECH' },
      { id: '3', department_id: null, target_department_code: 'ALL' },
    ];

    const cseFeed = filterNoticesByDepartmentScope(feed, 'dept-cse', 'CSE', 'student');
    assert.strictEqual(cseFeed.length, 2);
    assert.deepStrictEqual(cseFeed.map(n => n.id), ['1', '3']);
  });
});

test('Notice Metadata Extraction (Dates, Semester, and Action Items)', async () => {
  const text = `
    Apex Institute of Technology
    Circular for 3rd year Semester 6 students.
    Submission Deadline: 15th Dec 2026.
    Exam Hall Tickets will be issued at the departmental counter.
  `;

  const result = await analyzeNoticeDocument(text);
  assert.strictEqual(result.targetYear, 3);
  assert.strictEqual(result.targetSemester, 6);
  assert.ok(result.extractedDates.length > 0);
  assert.ok(result.actionItems.length > 0);
  assert.ok(result.summary.length > 10);
});
