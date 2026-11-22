import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicProvider } from './context/AcademicContext';
import { UIProvider, useUI } from './context/UIContext';
import { Layout } from './components/layout/Layout';

// Role Dashboards
import { StudentDashboard } from './views/student/StudentDashboard';
import { TeacherDashboard } from './views/teacher/TeacherDashboard';
import { AdminDashboard } from './views/admin/AdminDashboard';

// Real Functional Academic Modules
import { AttendanceView } from './views/attendance/AttendanceView';
import { NoticeBoardView } from './views/notices/NoticeBoardView';
import { AssignmentsView } from './views/assignments/AssignmentsView';
import { StudyMaterialView } from './views/study/StudyMaterialView';
import { ExamPrepView } from './views/exam/ExamPrepView';
import { EmailAutomationView } from './views/emails/EmailAutomationView';
import { ClassesView } from './views/classes/ClassesView';
import { StudentsDirectoryView } from './views/students/StudentsDirectoryView';
import { DepartmentsView } from './views/departments/DepartmentsView';

// Common Views
import { DatabaseSchemaView } from './views/DatabaseSchemaView';
import { ProfileView } from './views/common/ProfileView';
import { SettingsView } from './views/common/SettingsView';

const MainContent: React.FC = () => {
  const { activeView } = useUI();
  const { currentRole } = useAuth();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        if (currentRole === 'student') return <StudentDashboard />;
        if (currentRole === 'teacher') return <TeacherDashboard />;
        return <AdminDashboard />;

      case 'attendance':
        return <AttendanceView />;

      case 'notices':
        return <NoticeBoardView />;

      case 'assignments':
        return <AssignmentsView />;

      case 'study-hub':
        return <StudyMaterialView />;

      case 'syllabus-prep':
        return <ExamPrepView />;

      case 'emails':
        return <EmailAutomationView />;

      case 'classes':
        return <ClassesView />;

      case 'students':
        return <StudentsDirectoryView />;

      case 'departments':
        return <DepartmentsView />;

      case 'database-schema':
        return <DatabaseSchemaView />;

      case 'profile':
        return <ProfileView />;

      case 'settings':
        return <SettingsView />;

      default:
        if (currentRole === 'student') return <StudentDashboard />;
        if (currentRole === 'teacher') return <TeacherDashboard />;
        return <AdminDashboard />;
    }
  };

  return <Layout>{renderView()}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <AcademicProvider>
        <UIProvider>
          <MainContent />
        </UIProvider>
      </AcademicProvider>
    </AuthProvider>
  );
}

export default App;
