import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatsSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';

const DashboardPage = () => {
  const { user } = useAuth();
  const outletContext = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Listen to custom refresh event from layout when a task is created or updated
    const handleRefresh = () => fetchStats();
    window.addEventListener('taskflow:refresh', handleRefresh);
    return () => window.removeEventListener('taskflow:refresh', handleRefresh);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-rose-900">Failed to load statistics</h3>
        <p className="text-sm text-rose-600 mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = data?.stats || {
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    dueTodayTasks: 0,
    completionRate: 0,
  };

  const statusData = data?.charts?.statusDistribution || [];
  const priorityData = data?.charts?.priorityDistribution || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const recentTasks = data?.recentTasks || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Productivity Pulse
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Explorer'} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-300 max-w-xl">
            You have <span className="font-semibold text-white">{stats.todoTasks + stats.inProgressTasks} active tasks</span> in your pipeline today. Stay focused and meet your deadlines!
          </p>
        </div>

        <button
          onClick={() => outletContext?.openCreateTask?.()}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalTasks}</div>
          <div className="mt-2 text-xs text-slate-500">All registered workspace tasks</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.inProgressTasks}</div>
          <div className="mt-2 text-xs text-blue-600 font-medium">Currently active execution</div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overdue Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{stats.overdueTasks}</div>
          <div className="mt-2 text-xs text-slate-500">Requires urgent attention</div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.completedTasks}</div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">{stats.completionRate}% completion rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-800">Overall Progress</span>
          <span className="text-sm font-extrabold text-indigo-600">{stats.completionRate}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, stats.completionRate))}%` }}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Tasks by Status
          </h3>
          {stats.totalTasks === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-12">
              No task data recorded yet
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} tasks`, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Status Legends */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> To Do ({stats.todoTasks})
            </span>
            <span className="flex items-center gap-1.5 font-medium text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Progress ({stats.inProgressTasks})
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done ({stats.completedTasks})
            </span>
          </div>
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Tasks by Priority
          </h3>
          {stats.totalTasks === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-12">
              No task data recorded yet
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(val) => [`${val} tasks`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-400">
            Workload distribution across priority tiers
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Deadlines & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Upcoming Deadlines
            </h3>
            <Link to="/calendar" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
              <Calendar className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
              No pending deadlines approaching soon.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {upcomingDeadlines.map((t) => (
                <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Due: {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Tasks
            </h3>
            <Link to="/tasks" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
              <ListTodo className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
              Your task list is empty. Create your first task to get started!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {recentTasks.map((t) => (
                <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">{t.category}</span>
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
