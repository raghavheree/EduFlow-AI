// EduFlow AI - Assignment Deadline & Grading Analytics Engine

export interface AssignmentStatusInfo {
  isOverdue: boolean;
  daysRemaining: number;
  formattedDue: string;
  status: 'pending' | 'submitted' | 'graded';
}

/**
 * Evaluates whether an assignment deadline has passed relative to a reference time.
 */
export function isAssignmentOverdue(dueDateIso: string, referenceTime: number = Date.now()): boolean {
  const dueTimestamp = new Date(dueDateIso).getTime();
  if (isNaN(dueTimestamp)) return false;
  return referenceTime > dueTimestamp;
}

/**
 * Calculates remaining days until deadline.
 * Positive integer = days left; Negative = overdue by N days; 0 = due today.
 */
export function getDaysUntilDeadline(dueDateIso: string, referenceTime: number = Date.now()): number {
  const dueTimestamp = new Date(dueDateIso).getTime();
  if (isNaN(dueTimestamp)) return 0;
  const diffMs = dueTimestamp - referenceTime;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines a student's completion and evaluation status for a given assignment.
 */
export function determineSubmissionStatus(
  assignmentId: string,
  studentId: string,
  submissions: Array<{ assignment_id: string; student_id: string; marks_awarded?: number }>
): 'pending' | 'submitted' | 'graded' {
  const sub = submissions.find(s => s.assignment_id === assignmentId && s.student_id === studentId);
  if (!sub) return 'pending';
  if (typeof sub.marks_awarded === 'number') return 'graded';
  return 'submitted';
}

/**
 * Computes grading percentage and academic grade letter from score and max rubric points.
 */
export function computeRubricGrade(
  marks: number,
  maxPoints: number
): { percentage: number; letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' } {
  if (maxPoints <= 0) return { percentage: 0, letterGrade: 'F' };
  const percentage = parseFloat(((marks / maxPoints) * 100).toFixed(1));

  let letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (percentage >= 90) letterGrade = 'A+';
  else if (percentage >= 80) letterGrade = 'A';
  else if (percentage >= 70) letterGrade = 'B';
  else if (percentage >= 60) letterGrade = 'C';
  else if (percentage >= 50) letterGrade = 'D';

  return { percentage, letterGrade };
}
