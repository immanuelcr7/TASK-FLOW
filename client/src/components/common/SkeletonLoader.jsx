import React from 'react';

export const TaskSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-slate-200 rounded-full" />
        <div className="h-5 w-16 bg-slate-200 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 rounded" />
        <div className="h-4 w-5/6 bg-slate-100 rounded" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 rounded" />
        <div className="h-7 w-16 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="w-9 h-9 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-8 w-16 bg-slate-300 rounded mb-2" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
};
