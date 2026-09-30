import React, { useState, useMemo } from 'react';
import { RulePreset, Case, DeadlineType } from '../types';
import { RULE_PRESETS } from '../utils/storage';
import { calculateCourtDeadline, formatFriendlyDate, formatISODate, getDaysRemaining, getUrgencyLevel } from '../utils/dateUtils';
import { Calculator, X, Calendar, Info, PlusCircle, AlertCircle, ArrowRight, Check } from 'lucide-react';

interface DeadlineCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  onApplyAsDeadline: (data: {
    title: string;
    type: DeadlineType;
    dueDate: string;
    notes: string;
    caseId: string;
    calculatedRule: string;
  }) => void;
}

export const DeadlineCalculatorModal: React.FC<DeadlineCalculatorModalProps> = ({
  isOpen,
  onClose,
  cases,
  onApplyAsDeadline,
}) => {
  const [triggerDate, setTriggerDate] = useState<string>(formatISODate(new Date()));
  const [selectedPresetId, setSelectedPresetId] = useState<string>('frcp-answer');
  const [customDays, setCustomDays] = useState<number>(21);
  const [rollWeekend, setRollWeekend] = useState<boolean>(true);
  const [addMail3Days, setAddMail3Days] = useState<boolean>(false);

  // Selected case to add to directly
  const [targetCaseId, setTargetCaseId] = useState<string>(cases[0]?.id || '');
  const [targetTitle, setTargetTitle] = useState<string>('');

  const currentPreset = useMemo(
    () => RULE_PRESETS.find((p) => p.id === selectedPresetId),
    [selectedPresetId]
  );

  const daysToUse = selectedPresetId === 'custom' ? customDays : (currentPreset?.defaultDays ?? 21);

  const calcResult = useMemo(() => {
    return calculateCourtDeadline(triggerDate, daysToUse, rollWeekend, addMail3Days);
  }, [triggerDate, daysToUse, rollWeekend, addMail3Days]);

  const daysRemaining = useMemo(() => {
    return getDaysRemaining(calcResult.computedDate);
  }, [calcResult.computedDate]);

  const urgency = useMemo(() => {
    return getUrgencyLevel(calcResult.computedDate);
  }, [calcResult.computedDate]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: RulePreset) => {
    setSelectedPresetId(preset.id);
    setCustomDays(preset.defaultDays);
    setTargetTitle(preset.name);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCaseId) return;

    const title = targetTitle.trim() || currentPreset?.name || `Filing Deadline (+${daysToUse} days)`;
    const citation = currentPreset ? `${currentPreset.name} (${currentPreset.ruleCitation})` : `Calculated (+${daysToUse} days)`;
    const notes = `Auto-calculated from trigger date ${formatFriendlyDate(triggerDate)} (+${calcResult.daysAdded} days${
      calcResult.isWeekendRolled ? `, rolled forward from ${calcResult.rolledFromDay}` : ''
    }). Rule basis: ${citation}.`;

    let dlType: DeadlineType = 'Motion / Brief Filing';
    if (title.toLowerCase().includes('answer') || title.toLowerCase().includes('pleading')) {
      dlType = 'Answer / Responsive Pleading';
    } else if (title.toLowerCase().includes('discover')) {
      dlType = 'Discovery Response';
    } else if (title.toLowerCase().includes('appeal')) {
      dlType = 'Notice / Appeal';
    }

    onApplyAsDeadline({
      title,
      type: dlType,
      dueDate: calcResult.computedDate,
      notes,
      caseId: targetCaseId,
      calculatedRule: citation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#c4dbca] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#1b432a] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                Court Deadline Auto-Calculator
              </h3>
              <p className="text-xs text-[#a9d0b5]">
                Compute accurate court deadlines from trigger events with procedural rule presets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Rule Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#1c2e24] mb-2">
              Select Procedural Rule Preset or Custom Days
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RULE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#225334] bg-[#f0f6f1] ring-1 ring-[#225334]'
                        : 'border-[#e4ebe4] bg-white hover:border-[#b5cdb8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[#143322] leading-snug">{preset.name}</span>
                      <span className="shrink-0 font-mono text-[11px] font-bold text-[#225334] bg-[#e1ebe3] px-1.5 py-0.5 rounded">
                        +{preset.defaultDays}d
                      </span>
                    </div>
                    <p className="text-[11px] text-[#556e5a] mt-1 font-mono">
                      {preset.ruleCitation}
                    </p>
                  </button>
                );
              })}

              {/* Custom Preset Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPresetId('custom');
                  setTargetTitle('Custom Deadline');
                }}
                className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  selectedPresetId === 'custom'
                    ? 'border-[#225334] bg-[#f0f6f1] ring-1 ring-[#225334]'
                    : 'border-[#e4ebe4] bg-white hover:border-[#b5cdb8]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[#143322]">Custom Rule / Specific Days</span>
                  <span className="shrink-0 font-mono text-[11px] font-bold text-[#225334] bg-[#e1ebe3] px-1.5 py-0.5 rounded">
                    User defined
                  </span>
                </div>
                <p className="text-[11px] text-[#556e5a] mt-1">
                  Enter any custom duration in days
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Trigger Event & Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8faf8] p-4 rounded-xl border border-[#e4ebe4]">
            <div>
              <label htmlFor="trigger-date-input" className="block text-xs font-semibold text-[#1c2e24] mb-1">
                Trigger Event Date
              </label>
              <div className="relative">
                <input
                  id="trigger-date-input"
                  type="date"
                  value={triggerDate}
                  onChange={(e) => setTriggerDate(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-sm bg-white border border-[#cad6ca] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                />
              </div>
              <p className="text-[11px] text-[#556e5a] mt-1">
                {currentPreset ? currentPreset.triggerEvent : 'Date served, filed, or order entered'}
              </p>
            </div>

            <div>
              <label htmlFor="days-to-add-input" className="block text-xs font-semibold text-[#1c2e24] mb-1">
                Number of Days to Add
              </label>
              <input
                id="days-to-add-input"
                type="number"
                min="1"
                max="3650"
                value={daysToUse}
                onChange={(e) => {
                  setSelectedPresetId('custom');
                  setCustomDays(Math.max(1, parseInt(e.target.value) || 1));
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-[#cad6ca] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
              />
              <p className="text-[11px] text-[#556e5a] mt-1">
                Calendar days per standard court counting rules
              </p>
            </div>
          </div>

          {/* Rule Modifiers */}
          <div className="space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1c2e24]">
              <input
                type="checkbox"
                checked={rollWeekend}
                onChange={(e) => setRollWeekend(e.target.checked)}
                className="mt-0.5 rounded border-[#cad6ca] text-[#1b432a] focus:ring-[#225334]"
              />
              <div>
                <span className="font-semibold text-[#143322]">
                  Court Weekend Roll-Forward (FRCP 6(a)(1)(C))
                </span>
                <span className="block text-[11px] text-[#556e5a]">
                  If the final day is a Saturday or Sunday, roll the deadline to the next business day (Monday).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1c2e24]">
              <input
                type="checkbox"
                checked={addMail3Days}
                onChange={(e) => setAddMail3Days(e.target.checked)}
                className="mt-0.5 rounded border-[#cad6ca] text-[#1b432a] focus:ring-[#225334]"
              />
              <div>
                <span className="font-semibold text-[#143322]">
                  Add 3 Days for Service by Mail (FRCP 6(d) / CCP § 1013)
                </span>
                <span className="block text-[11px] text-[#556e5a]">
                  Add 3 calendar days if paper was served by traditional postal mail rather than electronic filing.
                </span>
              </div>
            </label>
          </div>

          {/* Calculated Output Card */}
          <div className="rounded-xl border-2 border-[#1b432a] bg-[#f0f6f1] p-4 text-[#143322]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#c4dbca]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#225334]">
                  Computed Filing Due Date
                </span>
                <p className="font-serif text-2xl font-bold text-[#143322] mt-0.5">
                  {formatFriendlyDate(calcResult.computedDate)}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                    urgency === 'overdue'
                      ? 'bg-[#fee2e2] text-[#991b1b]'
                      : urgency === 'losing_money'
                      ? 'bg-[#fef3c7] text-[#92400e]'
                      : urgency === 'due_soon'
                      ? 'bg-[#e0f2fe] text-[#0369a1]'
                      : 'bg-[#dcfce7] text-[#15803d]'
                  }`}
                >
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)} Days in Past`
                    : daysRemaining === 0
                    ? 'Due Today!'
                    : `${daysRemaining} Days from Today`}
                </span>
              </div>
            </div>

            {/* Calculation Steps Breakdown */}
            <div className="pt-3 text-xs space-y-1 text-[#305037]">
              <p>
                <strong>Calculation logic:</strong> Trigger date ({formatFriendlyDate(calcResult.triggerDate)}) + {calcResult.daysAdded} calendar days
                {addMail3Days && ' (includes +3d for mail service)'}
              </p>
              {calcResult.isWeekendRolled && (
                <p className="text-[#92400e] font-medium">
                  Notice: Raw target fell on a {calcResult.rolledFromDay} ({calcResult.rawDate}) → automatically rolled to next business day ({calcResult.computedDate}).
                </p>
              )}
            </div>
          </div>

          {/* Prominent Legal Disclaimer (Explicitly required in prompt) */}
          <div className="rounded-xl border border-[#eab308] bg-[#fefce8] p-3.5 text-[#713f12] text-xs leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#ca8a04] mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">
                Notice: Not Legal Advice — Verify Your Jurisdiction
              </strong>
              This auto-calculator provides statutory guidelines. Procedural deadlines, local court rules, judicial standing orders, judge-specific rules, holiday schedules, and service method adjustments (electronic vs. overnight delivery) must be independently calculated and verified by licensed counsel before filing.
            </div>
          </div>

          {/* Step 3: Apply Directly as Deadline */}
          {cases.length > 0 && (
            <div className="pt-2 border-t border-[#e4ebe4] space-y-3">
              <h4 className="text-xs font-semibold text-[#1c2e24]">
                Create Case Deadline From This Calculation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="target-case-select" className="block text-[11px] font-medium text-[#556e5a] mb-1">
                    Assign to Case
                  </label>
                  <select
                    id="target-case-select"
                    value={targetCaseId}
                    onChange={(e) => setTargetCaseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clientName} ({c.caseNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="deadline-title-input" className="block text-[11px] font-medium text-[#556e5a] mb-1">
                    Deadline Title
                  </label>
                  <input
                    id="deadline-title-input"
                    type="text"
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    placeholder={currentPreset?.name || 'Deadline Title'}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#cad6ca] rounded-lg focus:ring-2 focus:ring-[#225334] text-[#1c2e24]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 bg-[#1b432a] text-white hover:bg-[#143320] font-medium text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Save Deadline to Case Docket</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
