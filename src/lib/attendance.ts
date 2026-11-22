// EduFlow AI - Academic Attendance Calculation Engine & Analytics Utilities

export interface AttendanceStats {
  conducted: number;
  attended: number;
  cancelled: number;
  percentage: number;
  is_shortage: boolean;
}

/**
 * Calculates attendance percentage strictly excluding cancelled sessions.
 * Returns a float rounded to 1 decimal place. Defaults to 100.0 if 0 classes conducted.
 */
export function calculateAttendancePercentage(conducted: number, attended: number): number {
  if (conducted <= 0) return 100.0;
  const ratio = (attended / conducted) * 100;
  return parseFloat(Math.min(100.0, Math.max(0.0, ratio)).toFixed(1));
}

/**
 * Checks whether an attendance percentage violates the institutional mandatory cutoff (default 75.0%).
 */
export function isAttendanceShortage(percentage: number, cutoff: number = 75.0): boolean {
  return percentage < cutoff;
}

/**
 * Calculates the exact number of consecutive attended classes required to reach targetPercentage.
 *
 * Mathematical derivation:
 * (attended + X) / (conducted + X) >= target
 * attended + X >= target * conducted + target * X
 * X * (1 - target) >= target * conducted - attended
 * X >= (target * conducted - attended) / (1 - target)
 *
 * @param conducted - Number of conducted classes
 * @param attended - Number of classes the student attended
 * @param targetPercentage - Desired attendance percentage (e.g., 75, 80, 85)
 * @returns Number of consecutive classes needed (0 if already met, 999 if mathematically unreachable)
 */
export function calculateConsecutiveClassesNeeded(
  conducted: number,
  attended: number,
  targetPercentage: number
): number {
  const target = targetPercentage / 100;
  const current = conducted > 0 ? attended / conducted : 1;

  if (current >= target) return 0;
  if (target >= 1) return 999; // Cannot reach 100% if even one class was missed

  const needed = (target * conducted - attended) / (1 - target);
  // Subtract small epsilon (1e-9) to prevent IEEE 754 float precision errors (e.g. 18.00000000000001 -> 18)
  return Math.max(0, Math.ceil(needed - 1e-9));
}

/**
 * Bulk marks all enrolled students present for a classroom session.
 * Used by the one-click "PRESENT ALL" teacher workflow.
 */
export function generatePresentAllRecords(
  studentIds: string[],
  sessionId: string
): Array<{ student_id: string; session_id: string; status: 'present'; remarks: string }> {
  return studentIds.map(studentId => ({
    student_id: studentId,
    session_id: sessionId,
    status: 'present',
    remarks: 'Marked Present via Present All',
  }));
}
