import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import { taskService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PriorityBadge, CategoryBadge } from '../components/common/Badges';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLUMNS = [
  { id: 'To Do', title: 'To Do', color: 'border-slate-300', dot: 'bg-slate-400' },
  { id: 'In Progress', title: 'In Progress', color: 'border-blue-400', dot: 'bg-blue-500' },
  { id: 'Completed', title: 'Completed', color: 'border-emerald-400', dot: 'bg-emerald-500' },
];

const KanbanPage = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({ all: 'true', sortBy: 'dueDate', sortOrder: 'asc' });
      if (res.success && res.data) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load Kanban tasks');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  // Status transition handler
  const moveTask = async (task, newStatus) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await taskService.updateTask(task._id, { status: newStatus });
      if (res.success) {
        toast.success(`Task moved to ${newStatus}`);
      }
    } catch (err) {
      // Revert optimistic update
      setTasks(previousTasks);
      toast.error(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(deletingTask._id);
      toast.success('Task deleted successfully');
      setDeletingTask(null);
      fetchAllTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Kanban pipeline..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Kanban Board
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize your workflow across status columns and move cards seamlessly
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* 3 Columns Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                  <h3 className="text-sm font-bold text-slate-800">{column.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-2xs border border-slate-200">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No tasks in {column.title}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const dueDate = new Date(task.dueDate);
                    const now = new Date();
                    const isOverdue =
                      task.status !== 'Completed' &&
                      dueDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());

                    return (
                      <div
                        key={task._id}
                        className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* Tags */}
                        <div className="flex items-center justify-between gap-1">
                          <CategoryBadge category={task.category} />
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Due date info */}
                        <div
                          className={`flex items-center gap-1.5 text-xs font-medium ${
                            isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {isOverdue ? 'Overdue: ' : 'Due: '}
                            {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Bottom Actions Row: Status Transitions & Edit/Delete */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* Navigation Buttons */}
                          <div className="flex items-center gap-1">
                            {column.id !== 'To Do' && (
                              <button
                                onClick={() =>
                                  moveTask(
                                    task,
                                    column.id === 'Completed' ? 'In Progress' : 'To Do'
                                  )
                                }
                                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1 transition-colors"
                                title="Move back"
                              >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Back</span>
                              </button>
                            )}

                            {column.id !== 'Completed' && (
                              <button
                                onClick={() =>
                                  moveTask(
                                    task,
                                    column.id === 'To Do' ? 'In Progress' : 'Completed'
                                  )
                                }
                                className="px-2 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 flex items-center gap-1 transition-colors"
                                title="Advance status"
                              >
                                <span>{column.id === 'To Do' ? 'Start' : 'Complete'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Edit / Delete */}
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTask(task)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        initialData={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={fetchAllTasks}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingTask)}
        isLoading={isDeleting}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}" from the pipeline?`}
        confirmText="Delete"
        confirmVariant="danger"
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default KanbanPage;
