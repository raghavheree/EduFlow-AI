import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Sparkles,
  FileText,
  Download,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';
import { DEMO_SUBJECTS } from '../../context/mockData';
import type { RAGAnswer } from '../../lib/gemini';

export const StudyMaterialView: React.FC = () => {
  const { currentRole, currentProfile, currentDepartment } = useAuth();
  const { studyMaterials, uploadStudyMaterial, askStudyHubAI, isGeminiActive } = useAcademic();

  const [activeTab, setActiveTab] = useState<'ai-search' | 'library'>('ai-search');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [ragResult, setRagResult] = useState<RAGAnswer | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Teacher Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matSubjectId, setMatSubjectId] = useState('sub-01');
  const [matUnit, setMatUnit] = useState<number>(3);
  const [matTopic, setMatTopic] = useState('');
  const [matDescription, setMatDescription] = useState('');

  // Filter department study materials
  const deptMaterials = studyMaterials.filter(m => m.department_id === currentDepartment.id);
  const filteredMaterials = deptMaterials.filter(m =>
    selectedSubjectFilter === 'all' ? true : m.subject_id === selectedSubjectFilter
  );

  const suggestedPrompts = [
    'Explain deadlock with an example.',
    'Find notes about normalization and BCNF.',
    'Give me the important points about CPU scheduling.',
    'Explain B+ Trees indexing and node splitting.',
    'What is quantum time slicing in Round Robin?',
  ];

  const handleAskAI = async (textToAsk?: string) => {
    const question = textToAsk || query;
    if (!question.trim()) return;

    setIsSearching(true);
    setRagResult(null);

    try {
      const response = await askStudyHubAI(question, currentDepartment.id);
      setRagResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUploadMaterial = async () => {
    if (!matTitle.trim() || !matTopic.trim() || !matDescription.trim()) {
      alert('Please fill out title, topic, and notes content.');
      return;
    }

    const sub = DEMO_SUBJECTS.find(s => s.id === matSubjectId);

    await uploadStudyMaterial({
      title: matTitle,
      subject_id: matSubjectId,
      subject_name: sub?.name || 'Subject Course',
      subject_code: sub?.code || 'CS300',
      department_id: currentDepartment.id,
      department_name: currentDepartment.name,
      academic_year: '2026-2027',
      semester: 6,
      unit_number: matUnit,
      topic: matTopic,
      description: matDescription,
      uploader_id: currentProfile.id,
      uploader_name: currentProfile.full_name,
      file_url: '#',
      file_type: 'PDF Document',
      file_size: '2.1 MB',
      chunks: [
        {
          chunk_id: `chk-${Date.now()}`,
          page_number: 1,
          topic_title: matTopic,
          content: matDescription,
        },
      ],
      ai_extracted_topics: [matTopic, 'Key Formulae', 'Unit Review'],
      ai_summary: matDescription.substring(0, 140) + '...',
    });

    setUploadModalOpen(false);
    setMatTitle('');
    setMatTopic('');
    setMatDescription('');
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
              <span className="text-xs text-blue-200">RAG Document Grounding & Discovery</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Study Material Finder</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Retrieval-Augmented Generation across verified faculty notes. Concrete page citations and direct document downloads with zero hallucinated sources.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ai-search')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === 'ai-search' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              AI Study Assistant
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              Notes Repository ({deptMaterials.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'ai-search' ? (
        <div className="space-y-6">
          {/* AI Search & Prompt Card */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Ask the Course Knowledge Graph</span>
                  <Badge variant="ai" size="sm">
                    {isGeminiActive ? 'Gemini 1.5 Flash' : 'Semantic Index'}
                  </Badge>
                </div>
              }
              subtitle="Answers are synthesized strictly from verified department lecture notes with explicit page citations."
            />
            <CardContent className="space-y-4">
              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Explain deadlock with an example, or What is BCNF normalization?"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAskAI();
                  }}
                  className="w-full pl-4 pr-32 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-2xs font-medium"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAskAI()}
                  isLoading={isSearching}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  Ask AI
                </Button>
              </div>

              {/* Sample Prompt Chips */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Suggested Curricular Prompts:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(p);
                        handleAskAI(p);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200/60 text-xs text-slate-700 font-medium transition-all text-left"
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* RAG Answer Display */}
              {ragResult && (
                <div className="mt-6 p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-purple-200/70">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">AI Grounded Synthesis</p>
                        <p className="text-[10px] text-purple-800">{ragResult.engine}</p>
                      </div>
                    </div>

                    {ragResult.found && (
                      <Badge variant="success" size="sm">
                        Verified Citation Available
                      </Badge>
                    )}
                  </div>

                  {/* Synthesized Answer */}
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                    {ragResult.answer}
                  </div>

                  {/* Verified Source Citation Box */}
                  {ragResult.found && (
                    <div className="p-3 rounded-xl bg-white border border-purple-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{ragResult.citedDocument}</p>
                          <p className="text-[11px] text-slate-500">
                            Unit {ragResult.unit} • Topic: <strong>{ragResult.topic}</strong> • Page {ragResult.pageNumber}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => alert(`Opening source material: ${ragResult.citedDocument} (Page ${ragResult.pageNumber})`)}
                        leftIcon={<Download className="w-3 h-3" />}
                      >
                        Open Source PDF
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Notes Repository Browser */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={e => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 shadow-2xs"
              >
                <option value="all">All Department Subjects</option>
                {DEMO_SUBJECTS.filter(s => s.department_id === currentDepartment.id).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            {(currentRole === 'teacher' || currentRole === 'admin') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Lecture Notes / Slides
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map(mat => (
              <Card key={mat.id} className="border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                        {mat.subject_code} • Unit {mat.unit_number}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{mat.file_size}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{mat.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {mat.ai_summary}
                    </p>

                    {/* AI extracted topic tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mat.ai_extracted_topics.map((top, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {top}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">By {mat.uploader_name}</span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => alert(`Downloading verified course material: ${mat.title}`)}
                      leftIcon={<Download className="w-3 h-3" />}
                    >
                      Download Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Upload Study Resource Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Verified Lecture Notes & Syllabus Resources"
        description="Uploaded notes are indexed into the department AI knowledge graph for grounded student retrieval."
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={matSubjectId}
                onChange={e => setMatSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                {DEMO_SUBJECTS.filter(s => s.department_id === currentDepartment.id).map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Number</label>
              <input
                type="number"
                min={1}
                max={10}
                value={matUnit}
                onChange={e => setMatUnit(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Title</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems: Virtual Memory & Page Replacement"
              value={matTitle}
              onChange={e => setMatTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Topic / Unit Concept</label>
            <input
              type="text"
              placeholder="e.g. LRU vs FIFO Paging, Belady Anomaly, Working Set"
              value={matTopic}
              onChange={e => setMatTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lecture Text / Abstract Content for AI Grounding</label>
            <textarea
              rows={4}
              placeholder="Paste lecture excerpts, definitions, theorems, or problem walkthroughs..."
              value={matDescription}
              onChange={e => setMatDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUploadMaterial}>
              Save & Index Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
