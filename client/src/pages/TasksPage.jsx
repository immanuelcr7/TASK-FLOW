import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { taskService } from '../services/api';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { TaskSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

const STATUS_OPTIONS = ['All', 'To Do', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High'];
const CATEGORY_OPTIONS = ['All', 'Work', 'Study', 'Personal', 'Project', 'Other'];
const DUE_DATE_OPTIONS = [
  { label: 'All Dates', value: '' },
  { label: 'Due Today', value: 'today' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Upcoming', value: 'upcoming' },
];

const TasksPage = () => {
  const toast = useToast();
  const outletContext = useOutletContext();

  // State
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    limit: 9,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (status !== 'All') params.status = status;
      if (priority !== 'All') params.priority = priority;
      if (category !== 'All') params.category = category;
      if (dueDateFilter) params.dueDateFilter = dueDateFilter;

      const res = await taskService.getTasks(params);
      if (res.success && res.data) {
        setTasks(res.data.tasks);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status, priority, category, dueDateFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset page when filter changes
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('All');
    setPriority('All');
    setCategory('All');
    setDueDateFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    status !== 'All' ||
    priority !== 'All' ||
    category !== 'All' ||
    dueDateFilter !== '';

  // Task actions
  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      const res = await taskService.updateTask(task._id, { status: newStatus });
      if (res.success) {
        toast.success(
          newStatus === 'Completed'
            ? 'Task completed! Great job! 🎉'
            : 'Task marked as incomplete.'
        );
        fetchTasks();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await taskService.updateTask(task._id, { status: newStatus });
      if (res.success) {
        toast.success(`Task moved to ${newStatus}`);
        fetchTasks();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(deletingTask._id);
      toast.success('Task deleted successfully.');
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & New Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage, filter, search, and track all your assignments and deliverables
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            placeholder="Search tasks by title or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-indigo-600 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => handleFilterChange(setPriority, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleFilterChange(setCategory, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Due date filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Timeline
            </label>
            <select
              value={dueDateFilter}
              onChange={(e) => handleFilterChange(setDueDateFilter, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DUE_DATE_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Sort Order & Reset */}
          <div className="flex items-end gap-1.5">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center justify-center gap-1 transition-colors h-[34px]"
              title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors h-[34px]"
                title="Clear all filters"
                aria-label="Clear all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Grid / Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search keywords or filter criteria.'
              : 'Create your first task to start organizing your workflow!'
          }
          actionLabel={hasActiveFilters ? 'Reset Filters' : 'Create Task'}
          onAction={
            hasActiveFilters
              ? handleResetFilters
              : () => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={(t) => setDeletingTask(t)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 px-2">
              <span className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {(pagination.currentPage - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalTasks)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{pagination.totalTasks}</span> tasks
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700 px-2">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        initialData={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={fetchTasks}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingTask)}
        isLoading={isDeleting}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        confirmVariant="danger"
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default TasksPage;
