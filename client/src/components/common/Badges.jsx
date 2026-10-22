import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    'To Do': {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    'In Progress': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500 animate-pulse',
    },
    'Completed': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  const config = configs[status] || configs['To Do'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const configs = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const style = configs[priority] || configs.Medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {priority} Priority
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const configs = {
    Work: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    Study: 'bg-purple-50 text-purple-700 border-purple-100',
    Personal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Project: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    Other: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const style = configs[category] || configs.Other;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {category}
    </span>
  );
};
