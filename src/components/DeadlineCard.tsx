import React, { useState } from 'react';
import { Deadline, Case } from '../types';
import { getDaysRemaining, getUrgencyLevel, formatFriendlyDate, formatUrgencyLabel } from '../utils/dateUtils';
import { Check, Trash2, Edit3, Calendar, Calculator, Building2 } from 'lucide-react';

interface DeadlineCardProps {
  deadline: Deadline;
  caseItem?: Case;
  onToggleComplete: (deadlineId: string) => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (deadlineId: string) => void;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({
  deadline,
  caseItem,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const daysRemaining = getDaysRemaining(deadline.dueDate);
  const urgency = getUrgencyLevel(deadline.dueDate);
  const urgencyInfo = formatUrgencyLabel(daysRemaining);

  // Border & tone accents based on urgency
  const getUrgencyStyles = () => {
    if (deadline.isCompleted) {
      return {
        cardBorder: 'border-l-4 border-l-[#7b9981] border-[#e4ebe4] bg-[#f9faf9] opacity-75',
        indicatorText: 'text-[#47664f]',
        indicatorLabel: 'Completed & Filed',
      };
    }

    switch (urgency) {
      case 'overdue':
        return {
          cardBorder: 'border-l-4 border-l-[#b91c1c] border-[#f8d7da] bg-[#fffbfb]',
          indicatorText: 'text-[#b91c1c] font-bold',
          indicatorLabel: urgencyInfo.label,
        };
      case 'losing_money':
        return {
          cardBorder: 'border-l-4 border-l-[#d97706] border-[#feebc8] bg-[#fffdfa]',
          indicatorText: 'text-[#b45309] font-bold',
          indicatorLabel: urgencyInfo.label,
        };
      case 'due_soon':
        return {
          cardBorder: 'border-l-4 border-l-[#225334] border-[#d8e5db] bg-white',
          indicatorText: 'text-[#1b432a] font-semibold',
          indicatorLabel: urgencyInfo.label,
        };
      case 'upcoming':
      default:
        return {
          cardBorder: 'border-l-4 border-l-[#849f8b] border-[#e4ebe4] bg-white',
          indicatorText: 'text-[#47664f] font-medium',
          indicatorLabel: urgencyInfo.label,
        };
    }
  };

  const style = getUrgencyStyles();

  return (
    <div
      className={`group relative rounded-xl border p-4 sm:p-5 transition-all shadow-xs hover:shadow-md ${style.cardBorder}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(deadline.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all cursor-pointer ${
            deadline.isCompleted
              ? 'border-[#225334] bg-[#225334] text-white'
              : 'border-[#cad6ca] bg-white hover:border-[#1b432a] focus:ring-2 focus:ring-[#225334]'
          }`}
          aria-label={deadline.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
        >
          {deadline.isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line: Case & Category (Zero-pill clean typography) */}
          <div className="flex items-center gap-2 text-xs text-[#52745a] flex-wrap mb-1">
            {caseItem ? (
              <>
                <span className="font-semibold text-[#143322]">
                  {caseItem.clientName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#39523c]">
                  {caseItem.caseNumber}
                </span>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <span className="text-[#3b5e43]">
              {deadline.type}
            </span>
            {deadline.calculatedRule && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#47664f] font-mono">
                  <Calculator className="h-3 w-3" />
                  {deadline.calculatedRule}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h4
            className={`font-serif text-base sm:text-lg font-bold leading-snug tracking-tight text-[#143322] ${
              deadline.isCompleted ? 'line-through text-stone-400' : ''
            }`}
          >
            {deadline.title}
          </h4>

          {/* Notes */}
          {deadline.notes && (
            <p className="mt-1.5 text-xs text-[#4b6354] leading-relaxed bg-[#f8faf8] p-2.5 rounded-lg border border-[#e4ebe4]">
              {deadline.notes}
            </p>
          )}

          {/* Bottom Info Row: Urgency & Date */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-[#edf2ee]">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#647c6a] flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#52745a]" />
                Due: <strong>{formatFriendlyDate(deadline.dueDate)}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className={style.indicatorText}>
                {style.indicatorLabel}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 self-end sm:self-auto">
              {!deadline.isCompleted && (
                <button
                  type="button"
                  onClick={() => onEdit(deadline)}
                  className="p-1.5 text-stone-400 hover:text-[#1b432a] hover:bg-[#eaf2ec] rounded-md transition-colors cursor-pointer"
                  title="Edit deadline"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}

              {isConfirmingDelete ? (
                <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                  <span className="text-[10px] text-red-700 font-medium">Delete?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(deadline.id)}
                    className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-medium rounded hover:bg-red-700 cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-1 py-0.5 text-stone-600 text-[10px] hover:text-stone-900 cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  title="Delete deadline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
