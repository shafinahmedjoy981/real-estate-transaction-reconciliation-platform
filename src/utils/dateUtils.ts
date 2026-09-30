import { UrgencyLevel } from '../types';

/**
 * Parse YYYY-MM-DD string into a clean Date object at local 00:00:00
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Format Date into YYYY-MM-DD string
 */
export function formatISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate full calendar days difference between today and dueDate.
 * If dueDate is today, returns 0.
 * If dueDate was yesterday, returns -1.
 * If dueDate is tomorrow, returns 1.
 */
export function getDaysRemaining(dueDateStr: string, referenceDate: Date = new Date()): number {
  const target = parseLocalDate(dueDateStr);
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  
  const diffTime = target.getTime() - ref.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Classify deadline urgency according to core product specification:
 * - Overdue: < 0 days
 * - Losing-money zone: <= 3 days (0 to 3 days)
 * - Due soon: 4 to 14 days
 * - Upcoming: > 14 days
 */
export function getUrgencyLevel(dueDateStr: string, referenceDate?: Date): UrgencyLevel {
  const days = getDaysRemaining(dueDateStr, referenceDate);
  if (days < 0) return 'overdue';
  if (days <= 3) return 'losing_money';
  if (days <= 14) return 'due_soon';
  return 'upcoming';
}

export function formatUrgencyLabel(days: number): { label: string; subtext: string } {
  if (days < 0) {
    const abs = Math.abs(days);
    return {
      label: abs === 1 ? '1 Day Overdue' : `${abs} Days Overdue`,
      subtext: 'Immediate client exposure / action required',
    };
  }
  if (days === 0) {
    return {
      label: 'Due Today',
      subtext: 'Losing-money zone: file before court close',
    };
  }
  if (days === 1) {
    return {
      label: 'Due Tomorrow',
      subtext: 'Losing-money zone: 1 day remaining',
    };
  }
  if (days <= 3) {
    return {
      label: `${days} Days Remaining`,
      subtext: 'Losing-money zone: finalize draft today',
    };
  }
  if (days <= 7) {
    return {
      label: `${days} Days Left`,
      subtext: 'Due this upcoming week',
    };
  }
  if (days <= 14) {
    return {
      label: `${days} Days Left`,
      subtext: 'Due within two weeks',
    };
  }
  return {
    label: `${days} Days Left`,
    subtext: 'Upcoming scheduled filing',
  };
}

/**
 * Format date for friendly human reading: "Thu, Oct 15, 2026"
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Legal court deadline calculator helper:
 * - Adds calendar days to trigger date
 * - Checks if resulting day falls on Saturday (rolls to Monday, +2 days) or Sunday (rolls to Monday, +1 day)
 * - Returns details of computation
 */
export interface CalculationResult {
  computedDate: string;
  rawDate: string;
  isWeekendRolled: boolean;
  rolledFromDay?: string;
  daysAdded: number;
  triggerDate: string;
}

export function calculateCourtDeadline(
  triggerDateStr: string,
  daysToAdd: number,
  rollWeekend: boolean = true,
  addMailService3Days: boolean = false
): CalculationResult {
  const trigger = parseLocalDate(triggerDateStr);
  const totalDaysToAdd = daysToAdd + (addMailService3Days ? 3 : 0);

  const raw = new Date(trigger);
  raw.setDate(raw.getDate() + totalDaysToAdd);
  const rawDateStr = formatISODate(raw);

  const computed = new Date(raw);
  let isWeekendRolled = false;
  let rolledFromDay: string | undefined;

  if (rollWeekend) {
    const dayOfWeek = computed.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 6) {
      // Saturday -> roll to Monday (+2 days)
      isWeekendRolled = true;
      rolledFromDay = 'Saturday';
      computed.setDate(computed.getDate() + 2);
    } else if (dayOfWeek === 0) {
      // Sunday -> roll to Monday (+1 day)
      isWeekendRolled = true;
      rolledFromDay = 'Sunday';
      computed.setDate(computed.getDate() + 1);
    }
  }

  return {
    computedDate: formatISODate(computed),
    rawDate: rawDateStr,
    isWeekendRolled,
    rolledFromDay,
    daysAdded: totalDaysToAdd,
    triggerDate: triggerDateStr,
  };
}
