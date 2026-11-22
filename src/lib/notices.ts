// EduFlow AI - Department-Level Notice Isolation & Access Control Engine

export interface NoticeAudienceCheck {
  department_id?: string | null;
  target_department_code?: string;
}

/**
 * Enforces departmental audience isolation:
 * - Admin and College-Wide notices are visible to everyone.
 * - Departmental notices are ONLY visible to students/faculty belonging to that department.
 * - CSE students must NEVER see MECH or ECE specific notices.
 */
export function isNoticeVisibleToUser(
  notice: NoticeAudienceCheck,
  userDepartmentId: string | null | undefined,
  userDepartmentCode?: string,
  userRole?: 'student' | 'teacher' | 'admin'
): boolean {
  // Administrators have supervisory institution-wide access
  if (userRole === 'admin') return true;

  // College-wide notices (null department_id or target 'ALL') are visible to all students & teachers
  if (!notice.department_id || notice.department_id === 'dept-all' || notice.target_department_code === 'ALL') {
    return true;
  }

  // If department ID matches
  if (userDepartmentId && notice.department_id === userDepartmentId) {
    return true;
  }

  // If department code matches (e.g. CSE)
  if (userDepartmentCode && notice.target_department_code && userDepartmentCode.toUpperCase() === notice.target_department_code.toUpperCase()) {
    return true;
  }

  return false;
}

/**
 * Filters a list of notices strictly according to the user's authorized department scope.
 */
export function filterNoticesByDepartmentScope<T extends NoticeAudienceCheck>(
  notices: T[],
  userDepartmentId: string | null | undefined,
  userDepartmentCode?: string,
  userRole?: 'student' | 'teacher' | 'admin'
): T[] {
  return notices.filter(n => isNoticeVisibleToUser(n, userDepartmentId, userDepartmentCode, userRole));
}
