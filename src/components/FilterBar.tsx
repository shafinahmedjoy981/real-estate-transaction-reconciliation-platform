import React from 'react';
import { Case } from '../types';
import { Search, X, Filter } from 'lucide-react';

interface FilterBarProps {
  cases: Case[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedUrgencyFilter: 'all' | 'overdue' | 'losing_money' | 'due_soon' | 'upcoming' | 'completed';
  onSelectUrgencyFilter: (filter: 'all' | 'overdue' | 'losing_money' | 'due_soon' | 'upcoming' | 'completed') => void;
  openCount: number;
  overdueCount: number;
  losingMoneyCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  searchQuery,
  onSearchChange,
  selectedUrgencyFilter,
  onSelectUrgencyFilter,
  openCount,
  overdueCount,
  losingMoneyCount,
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Search & Case Selector Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52745a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by client name, docket number, or deadline title..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#cad6ca] rounded-xl text-xs sm:text-sm text-[#143322] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#225334] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Case selector dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="case-filter-select" className="text-xs font-medium text-[#47664f] shrink-0 hidden sm:inline">
            Filter Matter:
          </label>
          <select
            id="case-filter-select"
            value={selectedCaseId || ''}
            onChange={(e) => onSelectCase(e.target.value ? e.target.value : null)}
            className="px-3 py-2.5 bg-white border border-[#cad6ca] rounded-xl text-xs sm:text-sm font-medium text-[#143322] focus:outline-none focus:ring-2 focus:ring-[#225334] shadow-xs cursor-pointer min-w-[200px]"
          >
            <option value="">All Matters ({cases.length})</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.clientName} ({c.caseNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Segmented Urgency Filter Controls (Interactive tabs - compliant with design constitution) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectUrgencyFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedUrgencyFilter === 'all'
              ? 'bg-[#1b432a] text-white shadow-xs'
              : 'bg-white border border-[#e1eae2] text-[#47664f] hover:text-[#143322] hover:bg-[#f4f7f4]'
          }`}
        >
          All Deadlines ({openCount})
        </button>

        <button
          onClick={() => onSelectUrgencyFilter('overdue')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedUrgencyFilter === 'overdue'
              ? 'bg-[#991b1b] text-white shadow-xs'
              : overdueCount > 0
              ? 'bg-[#fff5f5] text-[#991b1b] border border-[#fca5a5] hover:bg-[#fee2e2]'
              : 'bg-white border border-[#e1eae2] text-[#55695a] hover:bg-[#f4f7f4]'
          }`}
        >
          <span>Overdue</span>
          {overdueCount > 0 && (
            <span className="font-bold">({overdueCount})</span>
          )}
        </button>

        <button
          onClick={() => onSelectUrgencyFilter('losing_money')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedUrgencyFilter === 'losing_money'
              ? 'bg-[#92400e] text-white shadow-xs'
              : losingMoneyCount > 0
              ? 'bg-[#fffbeb] text-[#92400e] border border-[#fcd34d] hover:bg-[#fef3c7]'
              : 'bg-white border border-[#e1eae2] text-[#55695a] hover:bg-[#f4f7f4]'
          }`}
        >
          <span>Losing-Money Zone (≤3d)</span>
          {losingMoneyCount > 0 && (
            <span className="font-bold">({losingMoneyCount})</span>
          )}
        </button>

        <button
          onClick={() => onSelectUrgencyFilter('due_soon')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedUrgencyFilter === 'due_soon'
              ? 'bg-[#225334] text-white shadow-xs'
              : 'bg-white border border-[#e1eae2] text-[#47664f] hover:text-[#143322] hover:bg-[#f4f7f4]'
          }`}
        >
          Due Soon (4–14d)
        </button>

        <button
          onClick={() => onSelectUrgencyFilter('upcoming')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedUrgencyFilter === 'upcoming'
              ? 'bg-[#47664f] text-white shadow-xs'
              : 'bg-white border border-[#e1eae2] text-[#47664f] hover:text-[#143322] hover:bg-[#f4f7f4]'
          }`}
        >
          Upcoming (&gt;14d)
        </button>

        <button
          onClick={() => onSelectUrgencyFilter('completed')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedUrgencyFilter === 'completed'
              ? 'bg-[#3b5e43] text-white shadow-xs'
              : 'bg-white border border-[#e1eae2] text-[#47664f] hover:text-[#143322] hover:bg-[#f4f7f4]'
          }`}
        >
          Completed Archive
        </button>
      </div>
    </div>
  );
};
