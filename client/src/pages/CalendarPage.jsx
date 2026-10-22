import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react';
import { taskService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskModal from '../components/tasks/TaskModal';

const CalendarPage = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({ all: 'true', sortBy: 'dueDate', sortOrder: 'asc' });
      if (res.success && res.data) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load deadlines.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      toast.success(newStatus === 'Completed' ? 'Task marked complete! 🎉' : 'Task reopened');
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to update task');
    }
  };

  // Group tasks chronologically
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Completed' && new Date(t.dueDate) < startOfToday
  );
  const dueTodayTasks = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    return d >= startOfToday && d <= endOfToday;
  });
  const upcomingThisWeek = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    return d > endOfToday && d <= endOfWeek;
  });
  const laterTasks = tasks.filter((t) => new Date(t.dueDate) > endOfWeek);

  if (loading) {
    return <LoadingSpinner text="Loading deadline timeline..." />;
  }

  const renderTaskRow = (task, isOverdue = false) => {
    const isCompleted = task.status === 'Completed';
    const dueDate = new Date(task.dueDate);

    return (
      <div
        key={task._id}
        className={`flex items-center justify-between p-4 bg-white rounded-xl border transition-all hover:shadow-xs ${
          isOverdue
            ? 'border-rose-200 bg-rose-50/20'
            : isCompleted
            ? 'border-slate-200 bg-slate-50/60 opacity-75'
            : 'border-slate-200 hover:border-indigo-200'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            onClick={() => handleToggleComplete(task)}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <div className="min-w-0 flex-1">
            <h4
              className={`text-sm font-semibold truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <CategoryBadge category={task.category} />
              <PriorityBadge priority={task.priority} />
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {dueDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-4 shrink-0 flex items-center gap-2">
          <StatusBadge status={task.status} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Deadlines & Calendar View
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Prioritize your agenda chronologically and prevent overdue tasks
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* 1. Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm tracking-wide uppercase">
              <AlertCircle className="w-4 h-4" />
              <span>Overdue Tasks ({overdueTasks.length})</span>
            </div>
            <div className="space-y-2">
              {overdueTasks.map((t) => renderTaskRow(t, true))}
            </div>
          </div>
        )}

        {/* 2. Due Today Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm tracking-wide uppercase">
            <CalendarIcon className="w-4 h-4" />
            <span>Due Today ({dueTodayTasks.length})</span>
          </div>
          {dueTodayTasks.length === 0 ? (
            <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
              No tasks due today. You are all caught up!
            </div>
          ) : (
            <div className="space-y-2">
              {dueTodayTasks.map((t) => renderTaskRow(t, false))}
            </div>
          )}
        </div>

        {/* 3. Upcoming This Week */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm tracking-wide uppercase">
            <Clock className="w-4 h-4" />
            <span>Due This Week ({upcomingThisWeek.length})</span>
          </div>
          {upcomingThisWeek.length === 0 ? (
            <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
              No tasks scheduled for the rest of this week.
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingThisWeek.map((t) => renderTaskRow(t, false))}
            </div>
          )}
        </div>

        {/* 4. Later / Future Deadlines */}
        {laterTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-wide uppercase">
              <ChevronRight className="w-4 h-4" />
              <span>Later Deadlines ({laterTasks.length})</span>
            </div>
            <div className="space-y-2">
              {laterTasks.map((t) => renderTaskRow(t, false))}
            </div>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
      />
    </div>
  );
};

export default CalendarPage;
