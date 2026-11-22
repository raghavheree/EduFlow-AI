import test from 'node:test';
import assert from 'node:assert';
import { askStudyMaterialRAG, analyzeExamSyllabusAI } from '../src/lib/gemini';
import { DEMO_PROFILES, INITIAL_STUDY_MATERIALS } from '../src/context/mockData';

test('Role-Based Profile Structure & Data Integrity', async (t) => {
  await t.test('student profile contains cohort, year, and semester data', () => {
    const student = DEMO_PROFILES.student;
    assert.ok(student, 'Student demo profile exists');
    assert.strictEqual(student.role, 'student');
    assert.ok(typeof student.year === 'number' && student.year >= 1 && student.year <= 4);
    assert.ok(typeof student.semester === 'number' && student.semester >= 1 && student.semester <= 8);
    assert.ok(student.enrollment_number, 'Student has enrollment number');
  });

  await t.test('teacher profile contains designation and employee id', () => {
    const teacher = DEMO_PROFILES.teacher;
    assert.ok(teacher, 'Teacher demo profile exists');
    assert.strictEqual(teacher.role, 'teacher');
    assert.ok(teacher.designation, 'Teacher has designation');
    assert.ok(teacher.employee_id, 'Teacher has employee ID');
  });

  await t.test('admin profile contains institutional designation', () => {
    const admin = DEMO_PROFILES.admin;
    assert.ok(admin, 'Admin demo profile exists');
    assert.strictEqual(admin.role, 'admin');
    assert.ok(admin.designation, 'Admin has designation');
  });
});

test('Study Material Semantic Q&A Grounding', async (t) => {
  await t.test('returns verified lecture notes answer and citation in offline mode', async () => {
    const result = await askStudyMaterialRAG('Explain deadlock prevention and Bankers algorithm', INITIAL_STUDY_MATERIALS);
    assert.strictEqual(result.found, true);
    assert.ok(result.answer.length > 20, 'Answer is populated');
    assert.ok(result.citedDocument.length > 0, 'Document is cited');
    assert.ok(result.unit > 0, 'Unit number is identified');
    assert.ok(result.pageNumber > 0, 'Page number is identified');
    assert.strictEqual(result.engine, 'EduFlow Semantic Knowledge Graph');
  });

  await t.test('returns appropriate fallback message for unknown queries outside lecture scope', async () => {
    const result = await askStudyMaterialRAG('zyxwvu9876543210 nonexistentsubject123', INITIAL_STUDY_MATERIALS);
    assert.strictEqual(result.found, false);
    assert.ok(result.answer.includes('No matching study notes were found'));
  });

  await t.test('handles empty materials repository gracefully', async () => {
    const result = await askStudyMaterialRAG('Any question', []);
    assert.strictEqual(result.found, false);
    assert.ok(result.answer.includes('No matching study notes were found'));
  });
});

test('Strategic Exam Syllabus Prioritization', async (t) => {
  await t.test('generates curriculum priority topics, phases, and revision checklist', async () => {
    const plan = await analyzeExamSyllabusAI(
      'Analysis and Design of Algorithms',
      'Unit 1: Dynamic Programming; Unit 2: Greedy; Unit 3: Graph Algorithms',
      '2026-12-05',
      30
    );

    assert.ok(Array.isArray(plan.priority_topics));
    assert.ok(plan.priority_topics.length >= 3);
    assert.ok(Array.isArray(plan.study_phases));
    assert.ok(Array.isArray(plan.revision_checklist));
    assert.ok(plan.daysUntilExam > 0);
    assert.ok(plan.dailyHours > 0);
    assert.ok(typeof plan.ai_disclaimer === 'string');

    // Confirm topics are prioritized
    const highPriorityTopics = plan.priority_topics.filter((t: any) => t.priority === 'high');
    assert.ok(highPriorityTopics.length > 0, 'Contains high-yield topics');
  });
});
