import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Flame,
  BookOpen,
} from 'lucide-react';
import clsx from 'clsx';
import { DEMO_SUBJECTS } from '../../context/mockData';

export const ExamPrepView: React.FC = () => {
  const { currentProfile, currentDepartment } = useAuth();
  const { examPlans, generateExamPlan, toggleRevisionChecklist, toggleTopicStatus, isGeminiActive } = useAcademic();

  const deptSubjects = DEMO_SUBJECTS.filter(s => s.department_id === currentDepartment.id);

  // Form Inputs
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(
    deptSubjects[0]?.name || 'Design & Analysis of Algorithms'
  );
  const [examDate, setExamDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [studyHours, setStudyHours] = useState<number>(24);
  const [syllabusInput, setSyllabusInput] = useState<string>(
    'Unit 1: Asymptotic Analysis and Divide & Conquer Recurrences.\n' +
    'Unit 2: Greedy Strategies, Huffman Coding, and Minimum Spanning Trees (Prim, Kruskal).\n' +
    'Unit 3: Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, Matrix Chain Multiplication).\n' +
    'Unit 4: Graph Algorithms, All-Pairs Shortest Paths (Floyd-Warshall), and Network Flows.\n' +
    'Unit 5: NP-Completeness, Reductions from 3-SAT to Vertex Cover and Approximation Algorithms.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Find or pick current active plan
  const activePlan = examPlans.find(p => p.subject_name === selectedSubjectName) || examPlans[0];

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      await generateExamPlan(
        selectedSubjectName,
        syllabusInput,
        examDate,
        studyHours,
        currentProfile.id
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculations for current plan
  const totalTopics = activePlan ? activePlan.priority_topics.length : 0;
  const completedTopics = activePlan ? activePlan.priority_topics.filter(t => t.completed).length : 0;
  const topicProgressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const totalChecklist = activePlan ? activePlan.revision_checklist.length : 0;
  const completedChecklist = activePlan ? activePlan.revision_checklist.filter(c => c.checked).length : 0;

  const daysLeft = activePlan
    ? Math.max(1, Math.ceil((new Date(activePlan.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="ai" size="sm" className="bg-purple-500/30 text-purple-100 border-purple-400/30">
                {currentDepartment.name}
              </Badge>
              <span className="text-xs text-purple-200">Intelligent Examination Evaluator</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Smart Exam Preparation & Priority Matrix</h2>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Curricular weightage analysis that ranks topics into High, Medium, and Low priorities with time allocation and interactive revision checklists.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
            <Clock className="w-6 h-6 text-purple-300" />
            <div>
              <p className="text-[10px] uppercase font-bold text-purple-200">Exam Countdown</p>
              <p className="text-xl font-black">{daysLeft} Days Left</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Configuration Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Syllabus AI Analyzer & Study Budgeting</span>
              <Badge variant="ai" size="sm">
                {isGeminiActive ? 'Gemini 1.5 Flash' : 'Pedagogical Weightage Engine'}
              </Badge>
            </div>
          }
          subtitle="Configure your target exam date and total study budget to generate strategic priority rankings."
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Subject</label>
              <select
                value={selectedSubjectName}
                onChange={e => setSelectedSubjectName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
              >
                {deptSubjects.map(sub => (
                  <option key={sub.id} value={sub.name}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Examination Date</label>
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Available Study Hours: <span className="text-purple-700 font-bold">{studyHours} hrs</span>
              </label>
              <input
                type="range"
                min={10}
                max={60}
                step={2}
                value={studyHours}
                onChange={e => setStudyHours(parseInt(e.target.value, 10))}
                className="w-full mt-2 accent-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Curricular Units & Topics (Editable Syllabus Text)
            </label>
            <textarea
              rows={3}
              value={syllabusInput}
              onChange={e => setSyllabusInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Allocates approx. {(studyHours / daysLeft).toFixed(1)} hours/day across {daysLeft} revision days.
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGeneratePlan}
              isLoading={isGenerating}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Analyze Syllabus & Generate Strategic Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Exam Plan Results */}
      {activePlan ? (
        <div className="space-y-6">
          {/* Progress & KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Subject Roster"
              value={activePlan.subject_code}
              subtitle={activePlan.subject_name}
              icon={<BookOpen className="w-5 h-5" />}
              iconColor="blue"
            />
            <StatCard
              title="Daily Study Target"
              value={`${activePlan.daily_hours} hrs`}
              subtitle={`Total: ${activePlan.study_hours_available} hrs budgeted`}
              icon={<Clock className="w-5 h-5" />}
              iconColor="purple"
            />
            <StatCard
              title="High Priority Yield"
              value={`${activePlan.priority_topics.filter(t => t.priority === 'high').length} Units`}
              subtitle="Covers ~60% of exam weightage"
              icon={<Flame className="w-5 h-5" />}
              iconColor="amber"
            />
            <StatCard
              title="Revision Progress"
              value={`${topicProgressPct}%`}
              subtitle={`${completedTopics} of ${totalTopics} topics revised`}
              icon={<Target className="w-5 h-5" />}
              iconColor="emerald"
            />
          </div>

          {/* Academic Disclaimer Alert */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Academic Integrity Notice:</strong> {activePlan.ai_disclaimer}
            </p>
          </div>

          {/* Priority Topic Breakdown Cards */}
          <Card>
            <CardHeader
              title="Syllabus Priority Breakdown & Recommended Study Order"
              subtitle="Prioritized based on historical examination weightage, theoretical depth, and question complexity"
            />
            <CardContent>
              <div className="space-y-4">
                {activePlan.priority_topics.map(topic => (
                  <div
                    key={topic.id}
                    className={clsx(
                      'p-4 rounded-xl border transition-all text-xs space-y-3',
                      topic.completed
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : topic.priority === 'high'
                        ? 'bg-rose-50/30 border-rose-200 ring-1 ring-rose-500/20'
                        : topic.priority === 'medium'
                        ? 'bg-amber-50/30 border-amber-200'
                        : 'bg-emerald-50/20 border-emerald-200'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          #{topic.study_order}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{topic.name}</h4>
                        <Badge variant={getPriorityBadgeVariant(topic.priority)} size="sm">
                          {topic.priority.toUpperCase()} PRIORITY ({topic.weightage_pct}% Weight)
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                          ⏱ {topic.suggested_hours} Hours Suggested
                        </span>
                        <button
                          onClick={() => toggleTopicStatus(activePlan.id, topic.id)}
                          className={clsx(
                            'px-2.5 py-1 rounded-lg font-semibold text-xs transition-all flex items-center gap-1',
                            topic.completed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {topic.completed ? 'Revised' : 'Mark Done'}
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-200/50">
                      <strong>Why prioritize:</strong> {topic.justification}
                    </p>

                    <div>
                      <p className="font-semibold text-slate-900 mb-1">Key Subtopics to Master:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topic.important_subtopics.map((sub, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 shadow-2xs"
                          >
                            • {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Multi-Phase Study Plan & Revision Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Multi-Phase Study Roadmap */}
            <Card>
              <CardHeader
                title="Personalized Study Roadmap"
                subtitle="Chronological phases leading up to exam day"
              />
              <CardContent className="space-y-3 text-xs">
                {activePlan.study_phases.map((phase, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{phase.phase_name}</span>
                      <span className="font-semibold text-purple-700 text-[11px]">{phase.duration}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{phase.focus}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Interactive Revision Checklist */}
            <Card>
              <CardHeader
                title="Interactive Revision Checklist"
                subtitle={`${completedChecklist} of ${totalChecklist} checklist tasks completed`}
              />
              <CardContent className="space-y-2.5 text-xs">
                {activePlan.revision_checklist.map(chk => (
                  <label
                    key={chk.id}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={chk.checked}
                      onChange={() => toggleRevisionChecklist(activePlan.id, chk.id)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span
                      className={clsx(
                        'leading-relaxed transition-all',
                        chk.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      )}
                    >
                      {chk.item}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <Sparkles className="w-10 h-10 text-purple-500 mx-auto" />
            <p className="font-semibold text-slate-800 text-sm">No Active Study Plan</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "Analyze Syllabus & Generate Strategic Plan" above to create an AI-powered examination study schedule.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
