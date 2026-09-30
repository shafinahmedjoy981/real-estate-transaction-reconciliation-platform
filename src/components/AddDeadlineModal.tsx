import React, { useState, useEffect } from 'react';
import { Case, Deadline, DeadlineType } from '../types';
import { formatISODate, formatFriendlyDate } from '../utils/dateUtils';
import { X, Calendar, Plus, Check } from 'lucide-react';

interface AddDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  initialCaseId?: string;
  editingDeadline?: Deadline | null;
  onSave: (deadlineData: {
    id?: string;
    caseId: string;
    title: string;
    type: DeadlineType;
    dueDate: string;
    notes?: string;
  }) => void;
}

const DEADLINE_TYPES: DeadlineType[] = [
  'Answer / Responsive Pleading',
  'Discovery Response',
  'Motion / Brief Filing',
  'Statute of Limitations',
  'Court Hearing / Conference',
  'Notice / Appeal',
  'Deposition',
  'Other',
];

export const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({
  isOpen,
  onClose,
  cases,
  initialCaseId,
  editingDeadline,
  onSave,
}) => {
  const [caseId, setCaseId] = useState<string>(initialCaseId || cases[0]?.id || '');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<DeadlineType>('Motion / Brief Filing');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return formatISODate(d);
  });
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingDeadline) {
      setCaseId(editingDeadline.caseId);
      setTitle(editingDeadline.title);
      setType(editingDeadline.type);
      setDueDate(editingDeadline.dueDate);
      setNotes(editingDeadline.notes || '');
    } else {
      if (initialCaseId) setCaseId(initialCaseId);
      else if (cases.length > 0 && !caseId) setCaseId(cases[0].id);
      setTitle('');
      setType('Motion / Brief Filing');
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(formatISODate(d));
      setNotes('');
    }
    setError('');
  }, [editingDeadline, initialCaseId, isOpen, cases]);

  if (!isOpen) return null;

  const handleAddDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(formatISODate(d));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId) {
      setError('Please select or create an active case first.');
      return;
    }
    if (!title.trim()) {
      setError('Deadline title is required.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    onSave({
      id: editingDeadline?.id,
      caseId,
      title: title.trim(),
      type,
      dueDate,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#c4dbca] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#1b432a] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold tracking-tight">
              {editingDeadline ? 'Edit Docket Deadline' : 'Add Critical Docket Deadline'}
            </h3>
            <p className="text-xs text-[#a9d0b5]">
              Accurate tracking protects against court sanctions and default judgment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Case Selector */}
          <div>
            <label htmlFor="deadline-case-select" className="block text-xs font-semibold text-[#1c2e24] mb-1">
              Associated Legal Matter <span className="text-red-500">*</span>
            </label>
            <select
              id="deadline-case-select"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
            >
              {cases.length === 0 ? (
                <option value="">No cases available - add a case first</option>
              ) : (
                cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clientName} · {c.caseNumber} ({c.caseType})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="deadline-title-field" className="block text-xs font-semibold text-[#1c2e24] mb-1">
              Deadline Title / Action Required <span className="text-red-500">*</span>
            </label>
            <input
              id="deadline-title-field"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Answer to Complaint, Serve Responses to 1st Interrogatories"
              className="w-full px-3 py-2 text-sm bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
              required
            />
          </div>

          {/* Deadline Type */}
          <div>
            <label htmlFor="deadline-type-select" className="block text-xs font-semibold text-[#1c2e24] mb-1">
              Filing / Action Classification
            </label>
            <select
              id="deadline-type-select"
              value={type}
              onChange={(e) => setType(e.target.value as DeadlineType)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
            >
              {DEADLINE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Quick Offset helpers */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="deadline-due-date-field" className="block text-xs font-semibold text-[#1c2e24]">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-[#47664f]">
                <span>Quick set:</span>
                <button
                  type="button"
                  onClick={() => handleAddDays(7)}
                  className="px-1.5 py-0.5 rounded bg-[#eaf2ec] hover:bg-[#d6e6d9] text-[#1b432a] font-medium transition-colors"
                >
                  +7d
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(14)}
                  className="px-1.5 py-0.5 rounded bg-[#eaf2ec] hover:bg-[#d6e6d9] text-[#1b432a] font-medium transition-colors"
                >
                  +14d
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(21)}
                  className="px-1.5 py-0.5 rounded bg-[#eaf2ec] hover:bg-[#d6e6d9] text-[#1b432a] font-medium transition-colors"
                >
                  +21d
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(30)}
                  className="px-1.5 py-0.5 rounded bg-[#eaf2ec] hover:bg-[#d6e6d9] text-[#1b432a] font-medium transition-colors"
                >
                  +30d
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                id="deadline-due-date-field"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                required
              />
            </div>
            {dueDate && (
              <p className="text-[11px] text-[#556e5a] mt-1">
                Scheduled for {formatFriendlyDate(dueDate)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="deadline-notes-field" className="block text-xs font-semibold text-[#1c2e24] mb-1">
              Practice Notes & Protective Details <span className="text-[#849a88] font-normal">(Optional)</span>
            </label>
            <textarea
              id="deadline-notes-field"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Client signature required on verification; opposing counsel is Albright; file before 5 PM."
              className="w-full px-3 py-2 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e4ebe4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1b432a] text-white hover:bg-[#143320] font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              {editingDeadline ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Update Deadline</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add to Docket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
