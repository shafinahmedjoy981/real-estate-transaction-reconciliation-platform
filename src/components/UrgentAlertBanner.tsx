import React from 'react';
import { Deadline, Case } from '../types';
import { getDaysRemaining } from '../utils/dateUtils';
import { AlertOctagon, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

interface UrgentAlertBannerProps {
  deadlines: Deadline[];
  cases: Case[];
  onFilterUrgent: () => void;
  isUrgentFilterActive: boolean;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  deadlines,
  cases,
  onFilterUrgent,
  isUrgentFilterActive,
}) => {
  const openDeadlines = deadlines.filter((d) => !d.isCompleted);
  
  const overdueItems = openDeadlines.filter((d) => getDaysRemaining(d.dueDate) < 0);
  const losingMoneyItems = openDeadlines.filter((d) => {
    const days = getDaysRemaining(d.dueDate);
    return days >= 0 && days <= 3;
  });

  const totalCritical = overdueItems.length + losingMoneyItems.length;

  if (totalCritical === 0) {
    return (
      <div className="mb-8 rounded-xl border border-[#c4dbca] bg-[#f0f6f1] p-4 text-[#1b3d2b] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#27593c] text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="font-serif text-base font-semibold text-[#143322]">
                Docket Clear of Immediate Exposure
              </p>
              <p className="text-xs text-[#3a634a]">
                No overdue or ≤3-day filing deadlines detected across your active cases.
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#2d573c]">
            {openDeadlines.length} scheduled future filings monitored
          </span>
        </div>
      </div>
    );
  }

  // Get affected case names
  const affectedCaseIds = new Set([
    ...overdueItems.map((d) => d.caseId),
    ...losingMoneyItems.map((d) => d.caseId),
  ]);
  const affectedCases = cases.filter((c) => affectedCaseIds.has(c.id));

  return (
    <div
      role="alert"
      className="mb-8 overflow-hidden rounded-2xl border-2 border-[#b92c2c] bg-white shadow-md transition-all"
    >
      {/* Top Warning Accent Bar */}
      <div className="bg-[#b92c2c] px-4 py-1.5 text-white flex items-center justify-between text-xs font-semibold tracking-wide">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>CRITICAL RISK RADAR — BEFORE-YOU-LOSE-MONEY MONITOR</span>
        </div>
        <span className="opacity-90">Court Malpractice Protection Active</span>
      </div>

      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#fff5f5] via-white to-[#fff8f0]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#7f1d1d] tracking-tight">
                {totalCritical} Urgent {totalCritical === 1 ? 'Deadline Requires' : 'Deadlines Require'} Immediate Defense
              </h2>
              <div className="flex items-center gap-2 text-xs font-medium">
                {overdueItems.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]">
                    <AlertOctagon className="h-3.5 w-3.5" />
                    {overdueItems.length} Overdue
                  </span>
                )}
                {losingMoneyItems.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {losingMoneyItems.length} in Losing-Money Zone (≤ 3 Days)
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-[#52302e] leading-relaxed">
              Missing these filings risks entry of default judgment, forfeiture of discovery objections, monetary sanctions, or waiver of substantive claims. Check verification and CM/ECF docket queues now.
            </p>

            {affectedCases.length > 0 && (
              <div className="pt-1 flex items-center gap-1.5 flex-wrap text-xs text-[#6b3c37]">
                <span className="font-semibold">Impacted matters:</span>
                {affectedCases.map((c, idx) => (
                  <span key={c.id} className="inline-flex items-center">
                    <span className="font-medium underline decoration-[#b92c2c]/40 underline-offset-2">
                      {c.clientName}
                    </span>
                    <span className="text-[#99635d] ml-1">({c.caseNumber})</span>
                    {idx < affectedCases.length - 1 && <span className="mx-1.5 text-stone-400">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onFilterUrgent}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                isUrgentFilterActive
                  ? 'bg-[#1b432a] text-white hover:bg-[#143320]'
                  : 'bg-[#b92c2c] text-white hover:bg-[#991b1b] ring-2 ring-[#b92c2c]/20'
              }`}
            >
              <span>{isUrgentFilterActive ? 'Show All Deadlines' : 'Isolate Critical Deadlines'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
