export type CaseType =
  | 'Civil Litigation'
  | 'Commercial Dispute'
  | 'Personal Injury'
  | 'Employment & Labor'
  | 'Family & Domestic'
  | 'Estate & Probate'
  | 'Intellectual Property'
  | 'Real Estate & Land Use'
  | 'Criminal Defense'
  | 'Other';

export interface Case {
  id: string;
  caseNumber: string;
  clientName: string;
  caseType: CaseType;
  courtVenue?: string;
  opposingCounsel?: string;
  notes?: string;
  createdAt: string;
}

export type DeadlineType =
  | 'Answer / Responsive Pleading'
  | 'Discovery Response'
  | 'Motion / Brief Filing'
  | 'Statute of Limitations'
  | 'Court Hearing / Conference'
  | 'Notice / Appeal'
  | 'Deposition'
  | 'Other';

export type UrgencyLevel = 'overdue' | 'losing_money' | 'due_soon' | 'upcoming';

export interface Deadline {
  id: string;
  caseId: string;
  title: string;
  type: DeadlineType;
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  calculatedRule?: string;
}

export interface RulePreset {
  id: string;
  name: string;
  ruleCitation: string;
  jurisdiction: string;
  defaultDays: number;
  triggerEvent: string;
  description: string;
  isCalendarDays: boolean;
}
