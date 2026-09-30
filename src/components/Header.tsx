import React from 'react';
import { Scale, Calculator, Plus, Briefcase, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenCalculator: () => void;
  onOpenAddDeadline: () => void;
  onOpenCaseManager: () => void;
  onResetData: () => void;
  caseCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalculator,
  onOpenAddDeadline,
  onOpenCaseManager,
  onResetData,
  caseCount,
}) => {
  return (
    <header className="border-b border-[#d8e5db] bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#1b432a] flex items-center justify-center text-white shadow-xs">
              <Scale className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#143322]">
                  Docket Sage
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#2d573c] bg-[#eaf2ec] px-2 py-0.5 rounded">
                  <ShieldCheck className="h-3 w-3 text-[#225334]" />
                  Malpractice Shield
                </span>
              </div>
              <p className="text-xs text-[#52745a] hidden sm:block">
                Deadline-first docketing for solo & small-firm practitioners
              </p>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Case Registry Button */}
            <button
              onClick={onOpenCaseManager}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-[#1c2e24] bg-[#f0f6f1] hover:bg-[#e1eae2] border border-[#cad6ca] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Manage legal matters"
            >
              <Briefcase className="h-4 w-4 text-[#225334]" />
              <span className="hidden md:inline">Cases</span>
              <span className="text-[11px] bg-white border border-[#cad6ca] px-1.5 py-0.2 rounded font-mono text-[#225334]">
                {caseCount}
              </span>
            </button>

            {/* Deadline Calculator Button */}
            <button
              onClick={onOpenCalculator}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-[#1b432a] bg-[#e1ebe3] hover:bg-[#d0dfd3] border border-[#b8ccbe] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Court rule deadline auto-calculator"
            >
              <Calculator className="h-4 w-4 text-[#1b432a]" />
              <span className="hidden sm:inline">Calculator</span>
            </button>

            {/* Primary Action: New Deadline */}
            <button
              onClick={onOpenAddDeadline}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1b432a] hover:bg-[#143320] rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>New Deadline</span>
            </button>

            {/* Reset sample data helper dropdown or icon */}
            <button
              onClick={onResetData}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Reset to sample practice data"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
