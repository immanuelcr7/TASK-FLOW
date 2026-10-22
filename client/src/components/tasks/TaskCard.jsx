import React from 'react';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Folder,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../common/Badges';

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete, onStatusChange }) => {
  const isCompleted = task.status === 'Completed';

  // Date analysis
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const isOverdue = !isCompleted && dueDate < startOfToday;
  const isDueToday = !isCompleted && dueDate >= startOfToday && dueDate <= endOfToday;

  // Format date readable
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div
      className={`group relative bg-white rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-md ${
        isCompleted
          ? 'border-slate-200/60 bg-slate-50/60 opacity-80'
          : isOverdue
          ? 'border-rose-200 hover:border-rose-300'
          : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      {/* Top Header: Category & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={task.category} />
          <PriorityBadge priority={task.priority} />
        </div>
        <StatusBadge status={task.status} />
      </div>

      {/* Main Body */}
      <div className="flex items-start gap-3 my-2">
        {/* Toggle complete button */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          <CheckCircle className="w-3.5 h-3.5 fill-current" />
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm sm:text-base font-semibold leading-snug break-words ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p
              className={`mt-1 text-xs sm:text-sm line-clamp-2 break-words ${
                isCompleted ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Meta & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        {/* Due Date Indicator */}
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            isCompleted
              ? 'text-slate-400'
              : isOverdue
              ? 'text-rose-600 font-semibold'
              : isDueToday
              ? 'text-amber-600 font-semibold'
              : 'text-slate-500'
          }`}
        >
          {isOverdue ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
          <span>
            {isOverdue ? 'Overdue: ' : isDueToday ? 'Due Today: ' : 'Due: '}
            {formattedDate}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Quick status selector */}
          {onStatusChange && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              aria-label="Change task status"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}

          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Task"
            aria-label="Edit Task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Task"
            aria-label="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
