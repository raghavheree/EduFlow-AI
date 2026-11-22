import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Bell,
  Sparkles,
  FileText,
  Calendar,
  Pin,
  Search,
  CheckCircle2,
  Download,
  Plus,
  Send,
} from 'lucide-react';
import clsx from 'clsx';
import type { Notice } from '../../types';
import { DEMO_DEPARTMENTS } from '../../context/mockData';

export const NoticeBoardView: React.FC = () => {
  const { currentRole, currentProfile, currentDepartment } = useAuth();
  const {
    createNotice,
    markNoticeRead,
    getFilteredNotices,
    analyzeNoticeWithAI,
    isGeminiActive,
  } = useAcademic();

  // Enforce department filtering:
  // CSE students will only see CSE notices + College-Wide notices!
  const visibleNotices = getFilteredNotices(currentRole, currentDepartment.id);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeNoticeModal, setActiveNoticeModal] = useState<Notice | null>(null);

  // Notice Creator Modal states (Teacher / Admin)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResultReady, setAiResultReady] = useState(false);

  // Editable notice form after AI extraction
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'Exam' | 'Assignment' | 'Event' | 'Holiday' | 'Registration' | 'General'>('General');
  const [formDeptId, setFormDeptId] = useState<string>(currentDepartment.id);
  const [formYear, setFormYear] = useState<string>('3');
  const [formSummary, setFormSummary] = useState('');
  const [formDates, setFormDates] = useState<{ label: string; date: string }[]>([]);
  const [formActions, setFormActions] = useState<string[]>([]);
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formTargetAudience] = useState<'all' | 'teachers' | 'students'>('students');
  const [aiConfidence, setAiConfidence] = useState<number>(0.92);
  const [engineUsed, setEngineUsed] = useState<string>('Local Edge NLP Engine');

  // Categories list
  const categories = ['All', 'Exam', 'Assignment', 'Event', 'Holiday', 'Registration', 'General'];

  // Filter notices by search and category
  const filteredNotices = visibleNotices.filter(notice => {
    const matchesCategory =
      selectedCategory === 'All' || notice.ai_category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notice.ai_summary && notice.ai_summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort pinned notices first, then newest
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  // Sample templates for rapid testing in hackathon
  const loadSampleDocument = (type: 'exam' | 'event' | 'holiday') => {
    if (type === 'exam') {
      setUploadedFileName('CSE_EndSem_Exam_Instructions_Nov2026.pdf');
      setRawText(
        `APEX INSTITUTE OF TECHNOLOGY - DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\n` +
        `CIRCULAR REF: AIT/CSE/EXAM/2026/089\n` +
        `DATE: November 22, 2026\n\n` +
        `SUBJECT: End-Semester Theory & Practical Examination Schedule for B.Tech 3rd Year (Semester 6)\n\n` +
        `This is to inform all B.Tech Computer Science 3rd Year students that the End-Semester Final Examinations for the academic year 2026-2027 are scheduled to commence from December 8, 2026.\n\n` +
        `Key Deadlines and Dates:\n` +
        `1. Submission of signed Laboratory Records to HOD: November 30, 2026 by 4:00 PM\n` +
        `2. Hall Ticket Generation & Biometric Verification: December 2 to December 4, 2026\n` +
        `3. Theory Examinations Commencement: December 8, 2026 at 09:30 AM\n\n` +
        `Mandatory Student Requirements:\n` +
        `- Minimum 75% classroom attendance in each theory and lab subject.\n` +
        `- Clearance of all departmental library books and outstanding lab toolkits.\n` +
        `- Strict disciplinary action will be taken for unauthorized electronic gadgets in examination halls.\n\n` +
        `By order of Dr. Arvind Sharma, HOD, Computer Science & Engineering.`
      );
    } else if (type === 'event') {
      setUploadedFileName('National_Hackathon_Brochure_2026.png');
      setRawText(
        `COLLEGE-WIDE ANNOUNCEMENT: APEX INNOVATION HACKATHON 2026\n` +
        `Organized by Apex Institute of Technology Central Innovation Cell\n\n` +
        `Calling all students from Computer Science, Electronics, Mechanical, Civil and Management departments!\n` +
        `Join the 36-hour National Hackathon on December 15, 2026.\n` +
        `Cash prizes worth $10,000 for top 3 AI and sustainability solutions.\n\n` +
        `Important Dates:\n` +
        `Registration Deadline: December 1, 2026\n` +
        `Shortlist Announcement: December 7, 2026\n` +
        `Hackathon Onset: December 15, 2026 at 08:00 AM in University Auditorium\n\n` +
        `Actions Required: Form an interdisciplinary team of 3-4 members and register online.`
      );
    } else {
      setUploadedFileName('Holiday_Notice_Winter_Break.pdf');
      setRawText(
        `OFFICE OF THE REGISTRAR - APEX INSTITUTE OF TECHNOLOGY\n` +
        `NOTICE: Winter Recess and Institutional Maintenance Closure\n\n` +
        `The campus will observe academic recess from December 24, 2026 through January 2, 2027.\n` +
        `All academic departments and student laboratories will reopen on Monday, January 4, 2027.\n` +
        `Emergency administrative services and server infrastructure maintenance will remain operational.`
      );
    }
  };

  // Run AI Document Analysis
  const handleRunAIAnalysis = async () => {
    if (!rawText.trim()) {
      alert('Please enter or paste notice document text, or click a sample template.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeNoticeWithAI(rawText, uploadedFileName || 'notice_document.txt');
      setFormTitle(result.title);
      setFormCategory(result.category);

      // Match department code to ID
      const matchedDept = DEMO_DEPARTMENTS.find(d => d.code === result.targetDepartmentCode);
      setFormDeptId(matchedDept ? matchedDept.id : 'college-wide');

      if (result.targetYear) setFormYear(result.targetYear.toString());
      setFormSummary(result.summary);
      setFormDates(result.extractedDates);
      setFormActions(result.actionItems);
      setAiConfidence(result.confidence);
      setEngineUsed(result.engineUsed);
      setAiResultReady(true);
    } catch (err) {
      console.error(err);
      alert('AI extraction error occurred. You can fill out the form manually.');
      setAiResultReady(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Publish Notice
  const handlePublishNotice = async () => {
    if (!formTitle.trim() || !formSummary.trim()) {
      alert('Please provide title and summary for the notice.');
      return;
    }

    const deptObj = DEMO_DEPARTMENTS.find(d => d.id === formDeptId);
    const departmentName = formDeptId === 'college-wide' ? 'College-Wide (All Departments)' : deptObj?.name || 'Department Notice';

    await createNotice({
      title: formTitle,
      content: rawText,
      department_id: formDeptId === 'college-wide' ? null : formDeptId,
      department_name: departmentName,
      author_id: currentProfile.id,
      author_name: currentProfile.full_name,
      target_audience: formTargetAudience,
      target_year: formYear ? parseInt(formYear, 10) : null,
      attachment_name: uploadedFileName || 'Official_Circular.pdf',
      attachment_url: '#',
      ai_category: formCategory,
      ai_summary: formSummary,
      ai_extracted_dates: formDates,
      ai_action_items: formActions,
      is_pinned: formIsPinned,
    });

    setCreateModalOpen(false);
    setRawText('');
    setUploadedFileName(null);
    setAiResultReady(false);
  };

  const getCategoryBadgeVariant = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'exam':
        return 'danger';
      case 'assignment':
        return 'warning';
      case 'event':
        return 'primary';
      case 'holiday':
        return 'success';
      case 'registration':
        return 'ai';
      default:
        return 'default';
    }
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
              <span className="text-xs text-blue-200">Department & Campus Broadcast System</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Smart Notice Board</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Automatic text extraction, category classification, deadline detection, and strict department-level audience isolation.
            </p>
          </div>

          {(currentRole === 'teacher' || currentRole === 'admin') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCreateModalOpen(true);
                setAiResultReady(false);
                setRawText('');
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-sm hover:shadow shrink-0"
            >
              Upload & Publish Notice
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notices, extracted dates, or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      {sortedNotices.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-800 text-sm">No notices found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching circulars in your department feed for category "{selectedCategory}".
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedNotices.map(notice => {
            const isRead = notice.read_by?.includes(currentProfile.id);

            return (
              <Card
                key={notice.id}
                className={clsx(
                  'transition-all duration-200 hover:shadow-md flex flex-col justify-between cursor-pointer border',
                  notice.is_pinned
                    ? 'border-blue-200 bg-blue-50/20 ring-1 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                )}
                onClick={() => {
                  markNoticeRead(notice.id, currentProfile.id);
                  setActiveNoticeModal(notice);
                }}
              >
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Category Badge, Department & Pin */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getCategoryBadgeVariant(notice.ai_category)} size="sm">
                          {notice.ai_category || 'Notice'}
                        </Badge>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {notice.department_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {notice.is_pinned && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-blue-600" /> Pinned
                          </span>
                        )}
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread Notice" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {notice.title}
                    </h3>

                    {/* AI Summary Highlight */}
                    {notice.ai_summary && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-purple-600" /> AI Executive Summary
                        </div>
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                          {notice.ai_summary}
                        </p>
                      </div>
                    )}

                    {/* Extracted Dates pills */}
                    {notice.ai_extracted_dates && notice.ai_extracted_dates.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {notice.ai_extracted_dates.slice(0, 2).map((d, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3 text-blue-600" />
                            <strong>{d.label}:</strong> {d.date}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">By {notice.author_name}</span>
                    <span>{new Date(notice.published_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Notice Detail Viewer Modal */}
      <Modal
        isOpen={Boolean(activeNoticeModal)}
        onClose={() => setActiveNoticeModal(null)}
        title={activeNoticeModal?.title || 'Notice Details'}
        description={`Published by ${activeNoticeModal?.author_name} on ${
          activeNoticeModal ? new Date(activeNoticeModal.published_at).toLocaleDateString() : ''
        }`}
      >
        {activeNoticeModal && (
          <div className="space-y-4 py-2 text-xs text-slate-800">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getCategoryBadgeVariant(activeNoticeModal.ai_category)} size="sm">
                Category: {activeNoticeModal.ai_category}
              </Badge>
              <Badge variant="default" size="sm">
                Audience: {activeNoticeModal.department_name}
              </Badge>
              {activeNoticeModal.target_year && (
                <Badge variant="primary" size="sm">
                  Target: Year {activeNoticeModal.target_year}
                </Badge>
              )}
            </div>

            {/* AI Summary Box */}
            {activeNoticeModal.ai_summary && (
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Sparkles className="w-4 h-4 text-purple-600" /> AI Document Extraction Insights
                </div>
                <p className="text-xs text-purple-950 leading-relaxed font-normal">
                  {activeNoticeModal.ai_summary}
                </p>
              </div>
            )}

            {/* Extracted Dates & Deadlines */}
            {activeNoticeModal.ai_extracted_dates && activeNoticeModal.ai_extracted_dates.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Extracted Deadlines & Timelines
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeNoticeModal.ai_extracted_dates.map((d, i) => (
                    <div key={i} className="p-2 rounded bg-white border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{d.label}</p>
                      <p className="font-bold text-slate-900 text-xs">{d.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items Required from Student */}
            {activeNoticeModal.ai_action_items && activeNoticeModal.ai_action_items.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Required Student Actions
                </p>
                <ul className="space-y-1 pl-1">
                  {activeNoticeModal.ai_action_items.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Content */}
            <div className="pt-2 border-t border-slate-100">
              <p className="font-semibold text-slate-900 mb-1">Official Circular Body</p>
              <div className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-sans text-xs">
                {activeNoticeModal.content}
              </div>
            </div>

            {/* Attachment preview / download link */}
            {activeNoticeModal.attachment_name && (
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-900">{activeNoticeModal.attachment_name}</span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => alert(`Downloading verified document: ${activeNoticeModal.attachment_name}`)}
                  leftIcon={<Download className="w-3 h-3" />}
                >
                  Download
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Notice Creator & AI Analysis Modal (Teacher / Admin) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Upload & AI Analyze College Notice"
        description="Extract text from notice PDF/image, classify with Gemini AI, verify department isolation, and publish."
      >
        <div className="space-y-4 py-2 text-xs">
          {/* Quick Sample Template Buttons */}
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
            <p className="font-semibold text-blue-950 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Quick Hackathon Sample Documents
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadSampleDocument('exam')}
                className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded font-medium hover:bg-blue-100/50 transition-colors shadow-2xs"
              >
                📄 CSE Lab Exam Circular
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('event')}
                className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded font-medium hover:bg-blue-100/50 transition-colors shadow-2xs"
              >
                📄 College Hackathon 2026
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('holiday')}
                className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded font-medium hover:bg-blue-100/50 transition-colors shadow-2xs"
              >
                📄 Winter Break Circular
              </button>
            </div>
          </div>

          {/* Document Upload or Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">Notice Document Text / OCR Extraction</label>
              {uploadedFileName && (
                <span className="font-mono text-[11px] text-blue-700 font-semibold">{uploadedFileName}</span>
              )}
            </div>
            <textarea
              rows={6}
              placeholder="Paste raw notice circular text or click one of the sample documents above..."
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          {/* Action: Run AI Analysis */}
          {!aiResultReady && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Engine: {isGeminiActive ? 'Gemini 1.5 Flash (Live)' : 'Intelligent Edge NLP Analyzer'}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunAIAnalysis}
                isLoading={isAnalyzing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Analyze Notice with AI
              </Button>
            </div>
          )}

          {/* AI Extracted & Editable Form Before Publishing */}
          {aiResultReady && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Sparkles className="w-4 h-4 text-purple-600" /> AI Classification Verified
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">
                    Confidence: {(aiConfidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-500">{engineUsed}</span>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notice Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Department (CRUCIAL ENFORCEMENT) & Target Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target Department (Audience Isolation)
                  </label>
                  <select
                    value={formDeptId}
                    onChange={e => setFormDeptId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                  >
                    <option value="college-wide">College-Wide (All Departments)</option>
                    {DEMO_DEPARTMENTS.filter(d => d.code !== 'ADMIN').map(d => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select
                    value={formYear}
                    onChange={e => setFormYear(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                  >
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">AI Executive Summary</label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={e => setFormSummary(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>

              {/* Pin notice checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-chk"
                  checked={formIsPinned}
                  onChange={e => setFormIsPinned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="pin-chk" className="text-xs font-medium text-slate-700">
                  Pin this notice to top of student feed
                </label>
              </div>

              {/* Publish Action */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAiResultReady(false)}>
                  Re-analyze
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublishNotice}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Publish & Broadcast Notice
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
