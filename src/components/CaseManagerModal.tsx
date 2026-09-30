import React, { useState } from 'react';
import { Case, CaseType, Deadline } from '../types';
import { Briefcase, Plus, Trash2, X, AlertCircle, Building2 } from 'lucide-react';

interface CaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  deadlines: Deadline[];
  onAddCase: (caseData: Omit<Case, 'id' | 'createdAt'>) => void;
  onDeleteCase: (caseId: string) => void;
  onSelectCaseToFilter: (caseId: string) => void;
}

const CASE_TYPES: CaseType[] = [
  'Civil Litigation',
  'Commercial Dispute',
  'Personal Injury',
  'Employment & Labor',
  'Family & Domestic',
  'Estate & Probate',
  'Intellectual Property',
  'Real Estate & Land Use',
  'Criminal Defense',
  'Other',
];

export const CaseManagerModal: React.FC<CaseManagerModalProps> = ({
  isOpen,
  onClose,
  cases,
  deadlines,
  onAddCase,
  onDeleteCase,
  onSelectCaseToFilter,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [caseType, setCaseType] = useState<CaseType>('Civil Litigation');
  const [courtVenue, setCourtVenue] = useState('');
  const [opposingCounsel, setOpposingCounsel] = useState('');
  const [notes, setNotes] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Client name is required.');
      return;
    }
    if (!caseNumber.trim()) {
      setError('Case number / docket number is required.');
      return;
    }

    onAddCase({
      clientName: clientName.trim(),
      caseNumber: caseNumber.trim(),
      caseType,
      courtVenue: courtVenue.trim() || undefined,
      opposingCounsel: opposingCounsel.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setClientName('');
    setCaseNumber('');
    setCaseType('Civil Litigation');
    setCourtVenue('');
    setOpposingCounsel('');
    setNotes('');
    setShowAddForm(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#c4dbca] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#1b432a] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                Case & Matter Registry
              </h3>
              <p className="text-xs text-[#a9d0b5]">
                Manage legal matters, venues, and assign critical court deadlines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top actions */}
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-semibold text-[#143322]">
              Active Matters ({cases.length})
            </h4>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3.5 py-1.5 bg-[#1b432a] text-white hover:bg-[#143320] text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Open New Case</span>
              </button>
            )}
          </div>

          {/* New Case Form */}
          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-[#f4f7f4] rounded-xl border border-[#cad6ca] space-y-3"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-[#143322] uppercase tracking-wider">
                  Create New Matter Record
                </h5>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="client-name-input" className="block text-[11px] font-semibold text-[#1c2e24] mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="client-name-input"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Elena Vargas & Sons Co."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="case-number-input" className="block text-[11px] font-semibold text-[#1c2e24] mb-1">
                    Docket / Case Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="case-number-input"
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. 3:25-cv-04182-EMC"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="case-type-select" className="block text-[11px] font-semibold text-[#1c2e24] mb-1">
                    Case Type / Practice Area
                  </label>
                  <select
                    id="case-type-select"
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value as CaseType)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                  >
                    {CASE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="court-venue-input" className="block text-[11px] font-semibold text-[#1c2e24] mb-1">
                    Court Jurisdiction / Venue
                  </label>
                  <input
                    id="court-venue-input"
                    type="text"
                    value={courtVenue}
                    onChange={(e) => setCourtVenue(e.target.value)}
                    placeholder="e.g. U.S. District Court, N.D. Cal."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="opposing-counsel-input" className="block text-[11px] font-semibold text-[#1c2e24] mb-1">
                  Opposing Counsel & Law Firm
                </label>
                <input
                  id="opposing-counsel-input"
                  type="text"
                  value={opposingCounsel}
                  onChange={(e) => setOpposingCounsel(e.target.value)}
                  placeholder="e.g. Marcus & Albright LLP (Lead: S. Albright)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                />
              </div>

              <div>
                <label htmlFor="matter-notes-textarea" className="block text-[11px] font-semibold text-[#1c2e24] mb-1">
                  Matter Notes / Scope
                </label>
                <textarea
                  id="matter-notes-textarea"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key issues, presiding judge, or scheduling constraints..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1b432a] text-white hover:bg-[#143320] text-xs font-medium rounded-lg shadow-xs cursor-pointer"
                >
                  Save Matter
                </button>
              </div>
            </form>
          )}

          {/* Cases List */}
          <div className="space-y-3">
            {cases.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No active matters in registry. Click "Open New Case" above to add your first case.
              </div>
            ) : (
              cases.map((c) => {
                const caseDeadlines = deadlines.filter((d) => d.caseId === c.id);
                const openCount = caseDeadlines.filter((d) => !d.isCompleted).length;
                const isConfirmingDelete = deleteConfirmId === c.id;

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-[#e1eae2] bg-white hover:border-[#b5cdb8] transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-serif text-base font-bold text-[#143322]">
                            {c.clientName}
                          </h5>
                          <span className="text-xs font-mono font-medium text-[#2d573c] bg-[#eaf2ec] px-2 py-0.5 rounded">
                            {c.caseNumber}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-[#52745a] flex-wrap">
                          <span className="font-medium text-[#1c2e24]">{c.caseType}</span>
                          {c.courtVenue && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {c.courtVenue}
                              </span>
                            </>
                          )}
                        </div>

                        {c.notes && (
                          <p className="mt-1.5 text-xs text-[#556e5a] line-clamp-2">
                            {c.notes}
                          </p>
                        )}
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCaseToFilter(c.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-[#1b432a] bg-[#eaf2ec] hover:bg-[#d6e6d9] rounded-lg transition-colors cursor-pointer"
                        >
                          {openCount} Deadlines
                        </button>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-lg border border-red-200">
                            <span className="text-[11px] text-red-700 font-medium px-1">
                              Delete case?
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteCase(c.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-medium rounded hover:bg-red-700 cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-0.5 text-stone-600 text-[11px] hover:text-stone-900 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete case and its deadlines"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
