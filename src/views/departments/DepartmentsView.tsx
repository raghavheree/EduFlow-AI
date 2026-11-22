import React, { useState } from 'react';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { DEMO_DEPARTMENTS } from '../../context/mockData';

export const DepartmentsView: React.FC = () => {
  const [departments, setDepartments] = useState(DEMO_DEPARTMENTS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [hodName, setHodName] = useState('');
  const [email, setEmail] = useState('');
  const [desc, setDesc] = useState('');

  const handleAddDept = () => {
    if (!code.trim() || !name.trim()) {
      alert('Please enter department code and name.');
      return;
    }

    const newDept = {
      id: `dept-${Date.now()}`,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      hod_name: hodName.trim() || 'Appointed HOD',
      contact_email: email.trim() || `${code.toLowerCase()}@eduflow.edu`,
      description: desc.trim() || 'Academic faculty and research programs.',
    };

    setDepartments(prev => [...prev, newDept]);
    setAddModalOpen(false);
    setCode('');
    setName('');
    setHodName('');
    setEmail('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="ai" size="sm" className="bg-purple-500/30 text-purple-100 border-purple-400/30">
                Executive Dean Console
              </Badge>
              <span className="text-xs text-blue-200">Institutional Governance</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Academic Departments & Faculty Chairs</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Configure isolated academic departments, Head of Department (HOD) appointments, and cross-departmental curricula.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            Add New Department
          </Button>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {departments.map(dept => (
          <Card key={dept.id} className="border border-slate-200 hover:border-slate-300 transition-all shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  {dept.code}
                </span>
                <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" /> Accredited
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{dept.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{dept.description}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Head of Department (HOD):</span>
                  <span className="font-semibold text-slate-800">{dept.hod_name || 'Dr. Arvind Sharma'}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Contact Email:</span>
                  <span className="font-mono text-slate-700">{dept.contact_email}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Academic Department"
        description="Establish a new institutional department unit with dedicated Row Level Security boundary."
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
              <input
                type="text"
                placeholder="e.g. AI-DS"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Name</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence & Data Science"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD) Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Preeti Deshmukh"
              value={hodName}
              onChange={e => setHodName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Departmental Contact Email</label>
            <input
              type="email"
              placeholder="aids-hod@eduflow.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Curricular Scope & Research Mission</label>
            <textarea
              rows={3}
              placeholder="Describe curriculum focus, degrees offered, and laboratory specializations..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddDept}>
              Create Department
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
