import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Upload,
  Download,
  Plus,
  Award,
  FileCheck,
  Send,
} from 'lucide-react';
import clsx from 'clsx';
import type { Assignment, AssignmentSubmission } from '../../types';
import { DEMO_CLASSES, DEMO_SUBJECTS } from '../../context/mockData';

export const AssignmentsView: React.FC = () => {
  const { currentRole, currentProfile, currentDepartment } = useAuth();
  const {
    assignments,
    submissions,
    createAssignment,
    submitAssignmentWork,
    gradeStudentSubmission,
    generateAssignmentTasksAI,
  } = useAcademic();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [activeSubmissionToGrade, setActiveSubmissionToGrade] = useState<AssignmentSubmission | null>(null);

  // Teacher Creation Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formClassId, setFormClassId] = useState('cls-01');
  const [formSubjectId, setFormSubjectId] = useState('sub-01');
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formMaxPoints, setFormMaxPoints] = useState(100);
  const [formAttachmentName] = useState('Assignment_Specification.pdf');

  // Student Submission State
  const [submissionFileName] = useState('AaravSharma_Solution.pdf');
  const [submissionRepoUrl, setSubmissionRepoUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Teacher Grading State
  const [gradeMarks, setGradeMarks] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Well structured approach. Clean code.');

  // AI Task Decomposition State
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [aiTasksList, setAiTasksList] = useState<any[] | null>(null);

  // Student Filtered Assignments
  const studentAssignments = assignments.filter(asg => {
    const isSubmitted = submissions.some(s => s.assignment_id === asg.id && s.student_id === currentProfile.id);
    if (activeFilter === 'pending') return !isSubmitted;
    if (activeFilter === 'submitted') return isSubmitted;
    return true;
  });

  // Teacher Create Assignment Handler
  const handleCreateAssignment = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please enter an assignment title and description.');
      return;
    }

    const cls = DEMO_CLASSES.find(c => c.id === formClassId);
    const sub = DEMO_SUBJECTS.find(s => s.id === formSubjectId);

    await createAssignment({
      title: formTitle,
      description: formDescription,
      class_id: formClassId,
      class_name: cls?.name || 'Class Section A',
      subject_id: formSubjectId,
      subject_name: sub?.name || 'Subject Course',
      subject_code: sub?.code || 'CS301',
      teacher_id: currentProfile.id,
      teacher_name: currentProfile.full_name,
      department_id: currentDepartment.id,
      due_date: new Date(`${formDueDate}T23:59:59Z`).toISOString(),
      max_points: formMaxPoints,
      attachment_name: formAttachmentName,
    });

    setCreateModalOpen(false);
    setFormTitle('');
    setFormDescription('');
  };

  // Student Submit Work Handler
  const handleSubmitWork = async () => {
    if (!selectedAssignment) return;

    await submitAssignmentWork({
      assignment_id: selectedAssignment.id,
      student_id: currentProfile.id,
      student_name: currentProfile.full_name,
      enrollment_number: currentProfile.enrollment_number || 'CSE-2024-042',
      file_name: submissionFileName,
      file_url: '#',
      repo_url: submissionRepoUrl || undefined,
      notes: submissionNotes,
    });

    setSubmitModalOpen(false);
    setSelectedAssignment(null);
    setSubmissionNotes('');
  };

  // AI Break Down into Tasks
  const handleRunAITaskDecomposition = async (asg: Assignment) => {
    setIsDecomposing(true);
    try {
      const tasks = await generateAssignmentTasksAI(asg.title, asg.description);
      setAiTasksList(tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDecomposing(false);
    }
  };

  // Teacher Grade Submission
  const handleSaveGrade = async () => {
    if (!activeSubmissionToGrade) return;

    await gradeStudentSubmission(activeSubmissionToGrade.id, gradeMarks, gradeFeedback);
    setGradingModalOpen(false);
    setActiveSubmissionToGrade(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm" className="bg-blue-500/30 text-blue-100 border-blue-400/30">
                {currentDepartment.name}
              </Badge>
              <span className="text-xs text-blue-200">
                {currentRole === 'student' ? 'Coursework & Submissions' : 'Faculty Assignment Evaluator'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Smart Assignment Management</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Coursework dispatch, versioned PDF/code submissions, rubric grading, and AI-powered task roadmap decomposition.
            </p>
          </div>

          {(currentRole === 'teacher' || currentRole === 'admin') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-sm hover:shadow shrink-0"
            >
              Create New Assignment
            </Button>
          )}
        </div>
      </div>

      {/* Student View Filter Pills */}
      {currentRole === 'student' && (
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            All Assignments ({assignments.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeFilter === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            Pending Action
          </button>
          <button
            onClick={() => setActiveFilter('submitted')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeFilter === 'submitted' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            Submitted & Graded
          </button>
        </div>
      )}

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(currentRole === 'student' ? studentAssignments : assignments).map(asg => {
          const userSubmission = submissions.find(
            s => s.assignment_id === asg.id && s.student_id === currentProfile.id
          );
          const asgSubmissions = submissions.filter(s => s.assignment_id === asg.id);
          const dueDateObj = new Date(asg.due_date);
          const daysRemaining = Math.ceil((dueDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isOverdue = daysRemaining < 0;

          return (
            <Card key={asg.id} className="border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Subject Tag & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {asg.subject_code} • {asg.class_name}
                    </span>

                    {currentRole === 'student' ? (
                      userSubmission ? (
                        <Badge variant={userSubmission.status === 'graded' ? 'ai' : 'success'} size="sm">
                          {userSubmission.status === 'graded'
                            ? `Graded: ${userSubmission.marks_awarded}/${asg.max_points}`
                            : 'Submitted'}
                        </Badge>
                      ) : (
                        <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                          {isOverdue ? 'Overdue' : `${daysRemaining} days left`}
                        </Badge>
                      )
                    ) : (
                      <Badge variant="primary" size="sm">
                        {asgSubmissions.length} Submissions
                      </Badge>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{asg.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {asg.description}
                  </p>

                  {/* Due Date & Max Marks */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Due: {dueDateObj.toLocaleDateString()} at 11:59 PM
                    </span>
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      Max Score: {asg.max_points} pts
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setSelectedAssignment(asg);
                      setAiTasksList(asg.ai_tasks || null);
                      setRoadmapModalOpen(true);
                    }}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                  >
                    AI Action Roadmap
                  </Button>

                  {currentRole === 'student' ? (
                    userSubmission ? (
                      <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Work Handed In
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => {
                          setSelectedAssignment(asg);
                          setSubmitModalOpen(true);
                        }}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                      >
                        Submit Assignment
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => {
                        setSelectedAssignment(asg);
                        setSubmissionsModalOpen(true);
                      }}
                      leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                    >
                      View Student Submissions
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Task Breakdown & Roadmap Modal */}
      <Modal
        isOpen={roadmapModalOpen && Boolean(selectedAssignment)}
        onClose={() => {
          setRoadmapModalOpen(false);
          setSelectedAssignment(null);
        }}
        title={selectedAssignment?.title || 'Assignment Details'}
        description={`Course: ${selectedAssignment?.subject_code} • Instructor: ${selectedAssignment?.teacher_name}`}
      >
        {selectedAssignment && (
          <div className="space-y-4 py-2 text-xs text-slate-800">
            {/* Full description */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-semibold text-slate-900 mb-1">Assignment Problem Statement</p>
              <p className="text-slate-700 leading-relaxed text-xs">{selectedAssignment.description}</p>
            </div>

            {/* AI Actionable Tasks Roadmap */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                  <Sparkles className="w-4 h-4 text-purple-600" /> AI Pedagogical Task Breakdown
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleRunAITaskDecomposition(selectedAssignment)}
                  isLoading={isDecomposing}
                >
                  Regenerate Tasks
                </Button>
              </div>

              <div className="space-y-2">
                {(aiTasksList || selectedAssignment.ai_tasks || []).map((t: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-purple-100 flex items-start gap-2.5 text-xs shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{t.task}</p>
                      <p className="text-[10px] text-purple-700 mt-0.5">
                        Estimated Effort: {t.estimated_time || '2 hours'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Reference PDF */}
            {selectedAssignment.attachment_name && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-900">{selectedAssignment.attachment_name}</span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => alert(`Downloading specification: ${selectedAssignment.attachment_name}`)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Student Submit Work Modal */}
      <Modal
        isOpen={submitModalOpen && Boolean(selectedAssignment)}
        onClose={() => {
          setSubmitModalOpen(false);
          setSelectedAssignment(null);
        }}
        title={`Submit Solution — ${selectedAssignment?.title || 'Assignment'}`}
        description="Attach your project report PDF or code repository URL for instructor review."
      >
        <div className="space-y-4 py-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Upload Solution Document (PDF)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="font-medium text-slate-800">{submissionFileName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">PDF or ZIP (Max 25 MB)</p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">GitHub / Code Repository URL (Optional)</label>
            <input
              type="text"
              placeholder="https://github.com/student/assignment-repo"
              value={submissionRepoUrl}
              onChange={e => setSubmissionRepoUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions to Faculty</label>
            <textarea
              rows={3}
              placeholder="e.g. Implemented with Python 3.11. Runtime benchmarks included in Section 3."
              value={submissionNotes}
              onChange={e => setSubmissionNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubmitModalOpen(false);
                setSelectedAssignment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitWork}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Hand In Work
            </Button>
          </div>
        </div>
      </Modal>

      {/* Teacher View Student Submissions Modal */}
      <Modal
        isOpen={submissionsModalOpen && Boolean(selectedAssignment)}
        onClose={() => {
          setSubmissionsModalOpen(false);
          setSelectedAssignment(null);
        }}
        title={`Student Submissions — ${selectedAssignment?.title || 'Assignment'}`}
        description="Review student deliverables, inspect source repositories, and record rubric marks."
      >
        <div className="space-y-3 py-2 text-xs">
          {submissions.filter(s => s.assignment_id === selectedAssignment?.id).length === 0 ? (
            <p className="text-slate-500 py-6 text-center">No student submissions received yet.</p>
          ) : (
            submissions
              .filter(s => s.assignment_id === selectedAssignment?.id)
              .map(subm => (
                <div
                  key={subm.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{subm.student_name}</span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                        {subm.enrollment_number}
                      </span>
                      <Badge variant={subm.status === 'graded' ? 'ai' : 'success'} size="sm">
                        {subm.status === 'graded' ? `Graded: ${subm.marks_awarded} pts` : 'Submitted'}
                      </Badge>
                    </div>

                    <p className="text-slate-600">
                      File: <span className="font-medium text-slate-800">{subm.file_name}</span> • Submitted on{' '}
                      {new Date(subm.submitted_at).toLocaleString()}
                    </p>

                    {subm.notes && <p className="text-slate-500 italic text-[11px]">"{subm.notes}"</p>}
                    {subm.feedback && (
                      <p className="text-purple-900 bg-purple-50 p-2 rounded text-[11px] border border-purple-100 font-medium">
                        <strong>Faculty Feedback:</strong> {subm.feedback}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        setActiveSubmissionToGrade(subm);
                        setGradeMarks(subm.marks_awarded || 90);
                        setGradeFeedback(subm.feedback || 'Well formulated solution.');
                        setGradingModalOpen(true);
                      }}
                      leftIcon={<Award className="w-3.5 h-3.5" />}
                    >
                      {subm.status === 'graded' ? 'Edit Marks' : 'Evaluate'}
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      </Modal>

      {/* Teacher Grading Modal */}
      <Modal
        isOpen={gradingModalOpen && Boolean(activeSubmissionToGrade)}
        onClose={() => {
          setGradingModalOpen(false);
          setActiveSubmissionToGrade(null);
        }}
        title={`Grade Submission — ${activeSubmissionToGrade?.student_name || 'Student'}`}
        description="Enter marks and constructive academic feedback for student review."
      >
        <div className="space-y-4 py-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Score Awarded (Max {selectedAssignment?.max_points || 100} points)
            </label>
            <input
              type="number"
              value={gradeMarks}
              onChange={e => setGradeMarks(parseInt(e.target.value, 10))}
              min={0}
              max={selectedAssignment?.max_points || 100}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Evaluator Feedback</label>
            <textarea
              rows={3}
              value={gradeFeedback}
              onChange={e => setGradeFeedback(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGradingModalOpen(false);
                setActiveSubmissionToGrade(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveGrade}>
              Save Grade & Send Feedback
            </Button>
          </div>
        </div>
      </Modal>

      {/* Teacher Create Assignment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Coursework Assignment"
        description="Publish assignment to enrolled students with PDF rubric and due date."
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
              <select
                value={formClassId}
                onChange={e => setFormClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                {DEMO_CLASSES.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={formSubjectId}
                onChange={e => setFormSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                {DEMO_SUBJECTS.filter(s => s.department_id === currentDepartment.id).map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assignment Title</label>
            <input
              type="text"
              placeholder="e.g. Assignment 5: B+ Tree Range Indexing Implementation"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Problem Description & Instructions</label>
            <textarea
              rows={4}
              placeholder="Provide complete specification, benchmark constraints, and expected deliverables..."
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formDueDate}
                onChange={e => setFormDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maximum Points</label>
              <input
                type="number"
                value={formMaxPoints}
                onChange={e => setFormMaxPoints(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateAssignment}>
              Publish Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
