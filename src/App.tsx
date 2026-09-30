/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Case, Deadline, DeadlineType, UrgencyLevel } from './types';
import {
  loadStoredCases,
  saveStoredCases,
  loadStoredDeadlines,
  saveStoredDeadlines,
  resetToSampleData,
  clearAllLocalData,
} from './utils/storage';
import { getDaysRemaining, getUrgencyLevel } from './utils/dateUtils';
import { Header } from './components/Header';
import { UrgentAlertBanner } from './components/UrgentAlertBanner';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { DeadlineCard } from './components/DeadlineCard';
import { DeadlineCalculatorModal } from './components/DeadlineCalculatorModal';
import { AddDeadlineModal } from './components/AddDeadlineModal';
import { CaseManagerModal } from './components/CaseManagerModal';
import { AlertOctagon, AlertTriangle, Clock, CalendarCheck, Plus, CheckCircle2, FileSpreadsheet, Download, Upload } from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState<Case[]>(() => loadStoredCases());
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => loadStoredDeadlines());

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'overdue' | 'losing_money' | 'due_soon' | 'upcoming' | 'completed'
  >('all');
  const [isUrgentFilterActive, setIsUrgentFilterActive] = useState(false);

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [isCaseManagerOpen, setIsCaseManagerOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  // Synchronize to localStorage
  useEffect(() => {
    saveStoredCases(cases);
  }, [cases]);

  useEffect(() => {
    saveStoredDeadlines(deadlines);
  }, [deadlines]);

  // Case lookup map
  const caseMap = useMemo(() => {
    const map = new Map<string, Case>();
    cases.forEach((c) => map.set(c.id, c));
    return map;
  }, [cases]);

  // Handle Mark Complete / Incomplete
  const handleToggleComplete = (deadlineId: string) => {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id === deadlineId) {
          const nextCompleted = !d.isCompleted;
          return {
            ...d,
            isCompleted: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return d;
      })
    );
  };

  // Handle Delete Deadline
  const handleDeleteDeadline = (deadlineId: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== deadlineId));
  };

  // Handle Edit Deadline
  const handleEditDeadline = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setIsAddDeadlineOpen(true);
  };

  // Handle Save Deadline (Add or Update)
  const handleSaveDeadline = (deadlineData: {
    id?: string;
    caseId: string;
    title: string;
    type: DeadlineType;
    dueDate: string;
    notes?: string;
  }) => {
    if (deadlineData.id) {
      // Update
      setDeadlines((prev) =>
        prev.map((d) =>
          d.id === deadlineData.id
            ? {
                ...d,
                caseId: deadlineData.caseId,
                title: deadlineData.title,
                type: deadlineData.type,
                dueDate: deadlineData.dueDate,
                notes: deadlineData.notes,
              }
            : d
        )
      );
    } else {
      // Create new
      const newDeadline: Deadline = {
        id: `dl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        caseId: deadlineData.caseId,
        title: deadlineData.title,
        type: deadlineData.type,
        dueDate: deadlineData.dueDate,
        notes: deadlineData.notes,
        isCompleted: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDeadlines((prev) => [newDeadline, ...prev]);
    }
  };

  // Handle Apply from Auto-Calculator
  const handleApplyFromCalculator = (data: {
    title: string;
    type: DeadlineType;
    dueDate: string;
    notes: string;
    caseId: string;
    calculatedRule: string;
  }) => {
    const newDeadline: Deadline = {
      id: `dl-calc-${Date.now()}`,
      caseId: data.caseId,
      title: data.title,
      type: data.type,
      dueDate: data.dueDate,
      notes: data.notes,
      calculatedRule: data.calculatedRule,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDeadlines((prev) => [newDeadline, ...prev]);
  };

  // Case Management Handlers
  const handleAddCase = (caseData: Omit<Case, 'id' | 'createdAt'>) => {
    const newCase: Case = {
      id: `case-${Date.now()}`,
      ...caseData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCases((prev) => [newCase, ...prev]);
  };

  const handleDeleteCase = (caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    // Also remove associated deadlines
    setDeadlines((prev) => prev.filter((d) => d.caseId !== caseId));
    if (selectedCaseId === caseId) {
      setSelectedCaseId(null);
    }
  };

  // Reset to Sample Data
  const handleResetData = () => {
    if (window.confirm('Reset all cases and deadlines to Docket Sage demonstration legal data?')) {
      const { cases: newCases, deadlines: newDeadlines } = resetToSampleData();
      setCases(newCases);
      setDeadlines(newDeadlines);
      setSelectedCaseId(null);
      setSelectedFilter('all');
      setIsUrgentFilterActive(false);
      setSearchQuery('');
    }
  };

  // Toggle Urgent Filter from Banner
  const handleToggleUrgentFilter = () => {
    if (isUrgentFilterActive) {
      setIsUrgentFilterActive(false);
      setSelectedFilter('all');
    } else {
      setIsUrgentFilterActive(true);
      setSelectedFilter('losing_money');
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      app: 'Docket Sage',
      exportDate: new Date().toISOString(),
      cases,
      deadlines,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docket-sage-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Deadlines calculation
  const filteredDeadlines = useMemo(() => {
    return deadlines.filter((item) => {
      // Filter by selected case
      if (selectedCaseId && item.caseId !== selectedCaseId) {
        return false;
      }

      // Filter by urgency tab
      if (selectedFilter === 'completed') {
        if (!item.isCompleted) return false;
      } else {
        if (item.isCompleted) return false;

        const urgency = getUrgencyLevel(item.dueDate);
        if (selectedFilter === 'overdue' && urgency !== 'overdue') return false;
        if (selectedFilter === 'losing_money') {
          // If urgent banner button activated, show both overdue and losing_money
          if (isUrgentFilterActive) {
            if (urgency !== 'overdue' && urgency !== 'losing_money') return false;
          } else {
            if (urgency !== 'losing_money') return false;
          }
        }
        if (selectedFilter === 'due_soon' && urgency !== 'due_soon') return false;
        if (selectedFilter === 'upcoming' && urgency !== 'upcoming') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const caseItem = caseMap.get(item.caseId);
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q) || false;
        const matchesClient = caseItem?.clientName.toLowerCase().includes(q) || false;
        const matchesCaseNum = caseItem?.caseNumber.toLowerCase().includes(q) || false;
        const matchesType = item.type.toLowerCase().includes(q);

        if (!matchesTitle && !matchesNotes && !matchesClient && !matchesCaseNum && !matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [deadlines, selectedCaseId, selectedFilter, isUrgentFilterActive, searchQuery, caseMap]);

  // Grouped Open Deadlines (for the default grouped dashboard view)
  const groupedDeadlines = useMemo(() => {
    const overdue: Deadline[] = [];
    const losingMoney: Deadline[] = [];
    const dueSoon: Deadline[] = [];
    const upcoming: Deadline[] = [];

    // Sort by due date ascending
    const sorted = [...filteredDeadlines].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    sorted.forEach((d) => {
      if (d.isCompleted) return;
      const u = getUrgencyLevel(d.dueDate);
      if (u === 'overdue') overdue.push(d);
      else if (u === 'losing_money') losingMoney.push(d);
      else if (u === 'due_soon') dueSoon.push(d);
      else upcoming.push(d);
    });

    return { overdue, losingMoney, dueSoon, upcoming };
  }, [filteredDeadlines]);

  const openCount = deadlines.filter((d) => !d.isCompleted).length;
  const overdueCount = deadlines.filter((d) => !d.isCompleted && getDaysRemaining(d.dueDate) < 0).length;
  const losingMoneyCount = deadlines.filter((d) => {
    if (d.isCompleted) return false;
    const days = getDaysRemaining(d.dueDate);
    return days >= 0 && days <= 3;
  }).length;

  return (
    <div className="min-h-screen bg-[#f7f9f6] flex flex-col font-sans text-[#1c2e24]">
      {/* Header */}
      <Header
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenAddDeadline={() => {
          setEditingDeadline(null);
          setIsAddDeadlineOpen(true);
        }}
        onOpenCaseManager={() => setIsCaseManagerOpen(true)}
        onResetData={handleResetData}
        caseCount={cases.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Core Hook: Prominent "Before-You-Lose-Money" Alert Banner */}
        <UrgentAlertBanner
          deadlines={deadlines}
          cases={cases}
          onFilterUrgent={handleToggleUrgentFilter}
          isUrgentFilterActive={isUrgentFilterActive}
        />

        {/* Stats Bar */}
        <StatsBar
          cases={cases}
          deadlines={deadlines}
          selectedFilter={selectedFilter}
          onSelectFilter={(filter) => {
            setSelectedFilter(filter);
            setIsUrgentFilterActive(false);
          }}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={setSelectedCaseId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedUrgencyFilter={selectedFilter}
          onSelectUrgencyFilter={(filter) => {
            setSelectedFilter(filter);
            setIsUrgentFilterActive(false);
          }}
          openCount={openCount}
          overdueCount={overdueCount}
          losingMoneyCount={losingMoneyCount}
        />

        {/* Case Context Header if a single case is selected */}
        {selectedCaseId && (
          <div className="mb-6 p-4 rounded-xl bg-[#eaf2ec] border border-[#c5d8c8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#225334]">
                  Filtered Matter Docket
                </span>
                <span className="text-xs text-stone-500">·</span>
                <span className="text-xs text-[#47664f] font-mono">
                  {caseMap.get(selectedCaseId)?.caseNumber}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#143322]">
                {caseMap.get(selectedCaseId)?.clientName}
              </h3>
              {caseMap.get(selectedCaseId)?.courtVenue && (
                <p className="text-xs text-[#52745a] mt-0.5">
                  Venue: {caseMap.get(selectedCaseId)?.courtVenue}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingDeadline(null);
                  setIsAddDeadlineOpen(true);
                }}
                className="px-3 py-1.5 bg-[#1b432a] text-white hover:bg-[#143320] text-xs font-medium rounded-lg shadow-xs cursor-pointer"
              >
                + Add Matter Deadline
              </button>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="px-3 py-1.5 bg-white text-stone-700 hover:bg-stone-100 border border-[#cad6ca] text-xs font-medium rounded-lg cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content: Urgency-Sorted Groupings */}
        {selectedFilter === 'completed' ? (
          /* Completed View */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e1eae2] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#2d7a46]" />
                <h3 className="font-serif text-lg font-bold text-[#143322]">
                  Completed & Filed Deadlines
                </h3>
              </div>
              <span className="text-xs text-[#52745a]">
                {filteredDeadlines.length} items logged
              </span>
            </div>

            {filteredDeadlines.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#e1eae2] p-8 text-stone-500">
                <p className="text-sm font-medium">No completed deadlines in this view.</p>
                <p className="text-xs text-stone-400 mt-1">
                  When deadlines are filed, check them off to archive them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeadlines.map((dl) => (
                  <DeadlineCard
                    key={dl.id}
                    deadline={dl}
                    caseItem={caseMap.get(dl.caseId)}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditDeadline}
                    onDelete={handleDeleteDeadline}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedFilter !== 'all' ? (
          /* Specific Filter Selected (e.g. Overdue or Losing Money) */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e1eae2] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#143322] capitalize">
                {selectedFilter.replace('_', ' ')} Filings ({filteredDeadlines.length})
              </h3>
            </div>

            {filteredDeadlines.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#e1eae2] p-8 text-stone-500">
                <p className="text-sm font-medium">No deadlines match this urgency filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeadlines.map((dl) => (
                  <DeadlineCard
                    key={dl.id}
                    deadline={dl}
                    caseItem={caseMap.get(dl.caseId)}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditDeadline}
                    onDelete={handleDeleteDeadline}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default All View: Urgency-Sorted Groupings */
          <div className="space-y-8">
            {/* Section 1: Overdue */}
            {groupedDeadlines.overdue.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 border-b-2 border-[#b91c1c]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fee2e2] text-[#991b1b]">
                      <AlertOctagon className="h-4 w-4" />
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#991b1b]">
                      Overdue Court Deadlines
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-[#991b1b]">
                    {groupedDeadlines.overdue.length} critical {groupedDeadlines.overdue.length === 1 ? 'matter' : 'matters'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedDeadlines.overdue.map((dl) => (
                    <DeadlineCard
                      key={dl.id}
                      deadline={dl}
                      caseItem={caseMap.get(dl.caseId)}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditDeadline}
                      onDelete={handleDeleteDeadline}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: Losing-Money Zone (Due in <= 3 days) */}
            {groupedDeadlines.losingMoney.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 border-b-2 border-[#d97706]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fef3c7] text-[#92400e]">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#92400e]">
                      Losing-Money Zone · Due in ≤ 3 Days
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-[#92400e]">
                    {groupedDeadlines.losingMoney.length} impending
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedDeadlines.losingMoney.map((dl) => (
                    <DeadlineCard
                      key={dl.id}
                      deadline={dl}
                      caseItem={caseMap.get(dl.caseId)}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditDeadline}
                      onDelete={handleDeleteDeadline}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Due Soon (4 to 14 days) */}
            {groupedDeadlines.dueSoon.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 border-b border-[#c4dbca] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e1ebe3] text-[#225334]">
                      <Clock className="h-4 w-4" />
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#143322]">
                      Due Soon · 4 to 14 Days
                    </h3>
                  </div>
                  <span className="text-xs text-[#52745a]">
                    {groupedDeadlines.dueSoon.length} scheduled filings
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedDeadlines.dueSoon.map((dl) => (
                    <DeadlineCard
                      key={dl.id}
                      deadline={dl}
                      caseItem={caseMap.get(dl.caseId)}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditDeadline}
                      onDelete={handleDeleteDeadline}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section 4: Upcoming (> 14 days) */}
            {groupedDeadlines.upcoming.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 border-b border-[#e1eae2] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f7f4] text-[#47664f]">
                      <CalendarCheck className="h-4 w-4" />
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2d4734]">
                      Upcoming Filings · Over 14 Days Ahead
                    </h3>
                  </div>
                  <span className="text-xs text-[#6e8574]">
                    {groupedDeadlines.upcoming.length} active items
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedDeadlines.upcoming.map((dl) => (
                    <DeadlineCard
                      key={dl.id}
                      deadline={dl}
                      caseItem={caseMap.get(dl.caseId)}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditDeadline}
                      onDelete={handleDeleteDeadline}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* If all open sections are empty */}
            {openCount === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#c4dbca] p-8 max-w-xl mx-auto shadow-xs">
                <div className="h-12 w-12 rounded-2xl bg-[#eaf2ec] text-[#225334] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#143322]">
                  Zero Open Deadlines on Docket
                </h3>
                <p className="text-xs text-[#52745a] mt-2 max-w-md mx-auto leading-relaxed">
                  Your active court calendar has no pending deadlines. Add new litigation deadlines or use the statutory calculator to compute responsive pleading dates.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingDeadline(null);
                      setIsAddDeadlineOpen(true);
                    }}
                    className="px-4 py-2 bg-[#1b432a] text-white hover:bg-[#143320] text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                  >
                    + Add New Deadline
                  </button>
                  <button
                    onClick={() => setIsCalculatorOpen(true)}
                    className="px-4 py-2 bg-[#e1ebe3] text-[#1b432a] hover:bg-[#d0dfd3] text-xs font-medium rounded-xl cursor-pointer"
                  >
                    Use Rule Calculator
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Value Proposition Note & Local Data Ownership Footer Bar */}
        <section className="mt-14 pt-8 border-t border-[#d8e5db] text-xs text-[#52745a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#143322]">Docket Sage</span>
            <span>·</span>
            <span>Local Browser Storage (Zero Server Risk)</span>
            <span>·</span>
            <span>Calculations compliant with FRCP 6(a) counting standards</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#cad6ca] text-[#225334] hover:bg-[#f0f6f1] transition-colors cursor-pointer text-xs font-medium"
              title="Download local JSON backup of all cases and deadlines"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Docket JSON</span>
            </button>
            <button
              onClick={handleResetData}
              className="text-stone-400 hover:text-stone-700 transition-colors text-xs"
            >
              Reset Demo Data
            </button>
          </div>
        </section>
      </main>

      {/* Modals */}
      <DeadlineCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        cases={cases}
        onApplyAsDeadline={handleApplyFromCalculator}
      />

      <AddDeadlineModal
        isOpen={isAddDeadlineOpen}
        onClose={() => {
          setIsAddDeadlineOpen(false);
          setEditingDeadline(null);
        }}
        cases={cases}
        initialCaseId={selectedCaseId || undefined}
        editingDeadline={editingDeadline}
        onSave={handleSaveDeadline}
      />

      <CaseManagerModal
        isOpen={isCaseManagerOpen}
        onClose={() => setIsCaseManagerOpen(false)}
        cases={cases}
        deadlines={deadlines}
        onAddCase={handleAddCase}
        onDeleteCase={handleDeleteCase}
        onSelectCaseToFilter={(caseId) => setSelectedCaseId(caseId)}
      />
    </div>
  );
}
