import { Case, Deadline, RulePreset } from '../types';
import { formatISODate } from './dateUtils';

export const RULE_PRESETS: RulePreset[] = [
  {
    id: 'frcp-answer',
    name: 'Answer to Federal Complaint',
    ruleCitation: 'Fed. R. Civ. P. 12(a)(1)(A)(i)',
    jurisdiction: 'Federal District Courts',
    defaultDays: 21,
    triggerEvent: 'Date of Summons & Complaint Service',
    description: 'Defendant must serve an answer within 21 days after being served with the summons and complaint.',
    isCalendarDays: true,
  },
  {
    id: 'frcp-discovery',
    name: 'Federal Discovery Responses (Interrogatories / RFPs)',
    ruleCitation: 'Fed. R. Civ. P. 33(b)(2) & 34(b)(2)(A)',
    jurisdiction: 'Federal District Courts',
    defaultDays: 30,
    triggerEvent: 'Date of Discovery Requests Service',
    description: 'Responding party must serve answers and any objections within 30 days after being served.',
    isCalendarDays: true,
  },
  {
    id: 'msj-opposition',
    name: 'Summary Judgment Opposition Brief',
    ruleCitation: 'Local Rule Standard / Scheduling Order',
    jurisdiction: 'Civil Litigation Standard',
    defaultDays: 21,
    triggerEvent: 'Date of Motion for Summary Judgment Service',
    description: 'Opposing brief and responsive separate statement typically due within 21 days of motion service.',
    isCalendarDays: true,
  },
  {
    id: 'frcp-new-trial',
    name: 'Motion for New Trial / Renewed JMOL',
    ruleCitation: 'Fed. R. Civ. P. 59(b) & 50(b)',
    jurisdiction: 'Federal District Courts',
    defaultDays: 28,
    triggerEvent: 'Date of Entry of Final Judgment',
    description: 'STRICT JURISDICTIONAL: Must be filed no later than 28 days after entry of judgment. Cannot be extended by court.',
    isCalendarDays: true,
  },
  {
    id: 'frap-appeal',
    name: 'Notice of Appeal (Federal Civil)',
    ruleCitation: 'Fed. R. App. P. 4(a)(1)(A)',
    jurisdiction: 'Federal Appellate Courts',
    defaultDays: 30,
    triggerEvent: 'Date of Entry of Judgment or Order Appealed',
    description: 'Notice of appeal must be filed with district clerk within 30 days after entry of judgment.',
    isCalendarDays: true,
  },
  {
    id: 'state-discovery-30',
    name: 'State Discovery Response (CA CCP Standard)',
    ruleCitation: 'Cal. Code Civ. Proc. § 2030.260',
    jurisdiction: 'California Superior Court',
    defaultDays: 30,
    triggerEvent: 'Date of Interrogatories / Demand Service',
    description: 'Responses due within 30 days of service. (Add 2 court days if served electronically, 5 calendar if mail).',
    isCalendarDays: true,
  },
  {
    id: 'motion-dismiss-opp',
    name: 'Motion to Dismiss Opposition Brief',
    ruleCitation: 'Local Rule 7-3 / Federal Standard',
    jurisdiction: 'District Court Civil Rules',
    defaultDays: 14,
    triggerEvent: 'Date of Motion Filing & Service',
    description: 'Opposition papers must be filed and served within 14 days after service of motion.',
    isCalendarDays: true,
  },
];

function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatISODate(d);
}

export const INITIAL_CASES: Case[] = [
  {
    id: 'case-vargas',
    caseNumber: '3:25-cv-04182-EMC',
    clientName: 'Elena Vargas & Sons Co.',
    caseType: 'Commercial Dispute',
    courtVenue: 'U.S. District Court, N.D. Cal. (San Francisco)',
    opposingCounsel: 'Marcus & Albright LLP (Lead: S. Albright)',
    notes: 'Breach of supply contract and delay damages. Judge Chen presiding.',
    createdAt: '2026-08-10',
  },
  {
    id: 'case-chen-tech',
    caseNumber: '2026-CV-01984',
    clientName: 'Chen & Sun Technologies Inc.',
    caseType: 'Intellectual Property',
    courtVenue: 'Delaware Court of Chancery',
    opposingCounsel: 'Venable & Hayes LLP',
    notes: 'Trade secrets misappropriation & preliminary injunction proceeding.',
    createdAt: '2026-08-18',
  },
  {
    id: 'case-miller',
    caseNumber: '26-L-00912',
    clientName: 'David R. Miller',
    caseType: 'Employment & Labor',
    courtVenue: 'Cook County Circuit Court, Illinois',
    opposingCounsel: 'In-House Counsel, Horizon BioMed',
    notes: 'Retaliatory termination under state whistleblower act. Deposition phase.',
    createdAt: '2026-09-01',
  },
  {
    id: 'case-vance-estate',
    caseNumber: 'PR-2026-8812',
    clientName: 'Estate of Eleanor Vance (Exec. Thomas Vance)',
    caseType: 'Estate & Probate',
    courtVenue: 'King County Superior Court, Washington',
    opposingCounsel: 'Pro Se Contestant (Nephew)',
    notes: 'Will contest and creditor claim bar date tracking.',
    createdAt: '2026-09-05',
  },
];

export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'dl-overdue-1',
    caseId: 'case-vargas',
    title: 'Opposition to Motion to Compel Document Production',
    type: 'Discovery Response',
    dueDate: getRelativeDate(-2), // 2 days overdue
    notes: 'Opposing counsel filed Rule 37 motion. Emergency response or stipulation required immediately.',
    isCompleted: false,
    createdAt: '2026-09-08',
  },
  {
    id: 'dl-losing-1',
    caseId: 'case-chen-tech',
    title: 'Answer & Affirmative Defenses to First Amended Complaint',
    type: 'Answer / Responsive Pleading',
    dueDate: getRelativeDate(0), // Due today!
    notes: 'FRCP 12(a)(1) deadline. Final filing must be docketed via CM/ECF before 5:00 PM local court time.',
    isCompleted: false,
    calculatedRule: 'Fed. R. Civ. P. 12(a)(1)(A)(i)',
    createdAt: '2026-09-02',
  },
  {
    id: 'dl-losing-2',
    caseId: 'case-miller',
    title: 'Serve Responses & Objections to Defendant’s 1st Set of Interrogatories',
    type: 'Discovery Response',
    dueDate: getRelativeDate(2), // 2 days left (losing money zone <= 3 days)
    notes: '30-day clock expiring. Client verification signed; review protective order designations.',
    isCompleted: false,
    calculatedRule: 'Fed. R. Civ. P. 33(b)(2)',
    createdAt: '2026-08-25',
  },
  {
    id: 'dl-soon-1',
    caseId: 'case-vance-estate',
    title: 'Filing of Creditor Claim Objection & Inventory Accounting',
    type: 'Notice / Appeal',
    dueDate: getRelativeDate(7), // 7 days left (Due soon)
    notes: 'Statutory 4-month notice window closing for probate claims.',
    isCompleted: false,
    createdAt: '2026-09-12',
  },
  {
    id: 'dl-soon-2',
    caseId: 'case-vargas',
    title: 'Exchange Initial Expert Witness Disclosures & Reports',
    type: 'Motion / Brief Filing',
    dueDate: getRelativeDate(11), // 11 days left (Due soon)
    notes: 'Rule 26(a)(2) damages expert report exchange per court scheduling order.',
    isCompleted: false,
    createdAt: '2026-09-01',
  },
  {
    id: 'dl-upcoming-1',
    caseId: 'case-chen-tech',
    title: 'Brief in Support of Preliminary Injunction Against Trade Secret Disclosure',
    type: 'Motion / Brief Filing',
    dueDate: getRelativeDate(20), // 20 days left (Upcoming)
    notes: 'Key hearing set before Chancellor; attach confidential engineering affidavits.',
    isCompleted: false,
    createdAt: '2026-09-15',
  },
  {
    id: 'dl-upcoming-2',
    caseId: 'case-miller',
    title: 'Pre-Trial Status Conference & Joint Discovery Plan',
    type: 'Court Hearing / Conference',
    dueDate: getRelativeDate(32), // 32 days left (Upcoming)
    notes: 'Courtroom 804 with Magistrate Judge; in-person appearance required.',
    isCompleted: false,
    createdAt: '2026-09-10',
  },
  {
    id: 'dl-completed-1',
    caseId: 'case-vargas',
    title: 'Joint Rule 26(f) Discovery Plan & Conference Report',
    type: 'Court Hearing / Conference',
    dueDate: getRelativeDate(-10),
    notes: 'Filed jointly on ECF. Scheduling order entered by court.',
    isCompleted: true,
    completedAt: getRelativeDate(-11),
    createdAt: '2026-08-20',
  },
];

const STORAGE_KEYS = {
  CASES: 'docket_sage_cases_v1',
  DEADLINES: 'docket_sage_deadlines_v1',
  HAS_INITIALIZED: 'docket_sage_init_v1',
};

export function loadStoredCases(): Case[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASES);
    if (!raw) {
      saveStoredCases(INITIAL_CASES);
      return INITIAL_CASES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load cases from localStorage:', err);
    return INITIAL_CASES;
  }
}

export function saveStoredCases(cases: Case[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases to localStorage:', err);
  }
}

export function loadStoredDeadlines(): Deadline[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    if (!raw) {
      saveStoredDeadlines(INITIAL_DEADLINES);
      return INITIAL_DEADLINES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load deadlines from localStorage:', err);
    return INITIAL_DEADLINES;
  }
}

export function saveStoredDeadlines(deadlines: Deadline[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  } catch (err) {
    console.error('Failed to save deadlines to localStorage:', err);
  }
}

export function resetToSampleData(): { cases: Case[]; deadlines: Deadline[] } {
  saveStoredCases(INITIAL_CASES);
  saveStoredDeadlines(INITIAL_DEADLINES);
  return { cases: INITIAL_CASES, deadlines: INITIAL_DEADLINES };
}

export function clearAllLocalData(): { cases: Case[]; deadlines: Deadline[] } {
  saveStoredCases([]);
  saveStoredDeadlines([]);
  return { cases: [], deadlines: [] };
}
