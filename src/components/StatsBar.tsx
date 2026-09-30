import React from 'react';
import { Case, Deadline } from '../types';
import { getDaysRemaining } from '../utils/dateUtils';
import { Briefcase, Clock, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StatsBarProps {
  cases: Case[];
  deadlines: Deadline[];
  selectedFilter: 'all' | 'overdue' | 'losing_money' | 'due_soon' | 'upcoming' | 'completed';
  onSelectFilter: (filter: 'all' | 'overdue' | 'losing_money' | 'due_soon' | 'upcoming' | 'completed') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  cases,
  deadlines,
  selectedFilter,
  onSelectFilter,
}) => {
  const openDeadlines = deadlines.filter((d) => !d.isCompleted);
  const completedDeadlines = deadlines.filter((d) => d.isCompleted);

  const overdueCount = openDeadlines.filter((d) => getDaysRemaining(d.dueDate) < 0).length;
  const losingMoneyCount = openDeadlines.filter((d) => {
    const days = getDaysRemaining(d.dueDate);
    return days >= 0 && days <= 3;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {/* Total Active Cases */}
      <div className="bg-white rounded-xl p-4 border border-[#e1eae2] shadow-xs flex flex-col justify-between hover:border-[#b5cdb8] transition-colors">
        <div className="flex items-center justify-between text-[#47664f]">
          <span className="text-xs font-medium tracking-tight">Active Matters</span>
          <Briefcase className="h-4 w-4 text-[#5d8164]" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#143322]">
            {cases.length}
          </span>
          <span className="text-xs text-[#52745a]">Cases</span>
        </div>
      </div>

      {/* Total Open Deadlines */}
      <button
        onClick={() => onSelectFilter('all')}
        className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
          selectedFilter === 'all'
            ? 'bg-[#1b432a] text-white border-[#1b432a] shadow-xs'
            : 'bg-white border-[#e1eae2] text-[#143322] hover:border-[#b5cdb8] shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between opacity-80">
          <span className="text-xs font-medium">Open Deadlines</span>
          <Clock className="h-4 w-4" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-bold">
            {openDeadlines.length}
          </span>
          <span className="text-xs opacity-75">Monitored</span>
        </div>
      </button>

      {/* Overdue Count */}
      <button
        onClick={() => onSelectFilter(selectedFilter === 'overdue' ? 'all' : 'overdue')}
        className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
          selectedFilter === 'overdue'
            ? 'bg-[#991b1b] text-white border-[#991b1b] ring-2 ring-[#991b1b]/20 shadow-xs'
            : overdueCount > 0
            ? 'bg-[#fff5f5] border-[#fca5a5] text-[#7f1d1d] hover:bg-[#fee2e2]'
            : 'bg-white border-[#e1eae2] text-[#55695a] opacity-75'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Overdue Filings</span>
          <AlertOctagon className={`h-4 w-4 ${overdueCount > 0 ? 'text-[#b91c1c]' : 'text-stone-400'}`} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-bold">
            {overdueCount}
          </span>
          <span className="text-xs font-medium">
            {overdueCount > 0 ? 'Action required' : 'None overdue'}
          </span>
        </div>
      </button>

      {/* Losing Money Zone: Due <= 3 days */}
      <button
        onClick={() => onSelectFilter(selectedFilter === 'losing_money' ? 'all' : 'losing_money')}
        className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
          selectedFilter === 'losing_money'
            ? 'bg-[#92400e] text-white border-[#92400e] ring-2 ring-[#92400e]/20 shadow-xs'
            : losingMoneyCount > 0
            ? 'bg-[#fffbeb] border-[#fcd34d] text-[#78350f] hover:bg-[#fef3c7]'
            : 'bg-white border-[#e1eae2] text-[#55695a] opacity-75'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Losing-Money Zone</span>
          <AlertTriangle className={`h-4 w-4 ${losingMoneyCount > 0 ? 'text-[#d97706]' : 'text-stone-400'}`} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-bold">
            {losingMoneyCount}
          </span>
          <span className="text-xs font-medium">Due in ≤ 3 days</span>
        </div>
      </button>

      {/* Completed Deadlines */}
      <button
        onClick={() => onSelectFilter(selectedFilter === 'completed' ? 'all' : 'completed')}
        className={`col-span-2 md:col-span-1 text-left rounded-xl p-4 border transition-all cursor-pointer ${
          selectedFilter === 'completed'
            ? 'bg-[#3b5e43] text-white border-[#3b5e43] shadow-xs'
            : 'bg-white border-[#e1eae2] text-[#143322] hover:border-[#b5cdb8] shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between opacity-80">
          <span className="text-xs font-medium">Completed</span>
          <CheckCircle2 className="h-4 w-4 text-[#396d48]" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-bold">
            {completedDeadlines.length}
          </span>
          <span className="text-xs opacity-75">Filed on time</span>
        </div>
      </button>
    </div>
  );
};
