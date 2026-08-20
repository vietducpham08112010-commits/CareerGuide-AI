import React from 'react';

export const SkeletonCard = ({ count = 3, className = "" }: { count?: number; className?: string }) => {
  return (
    <div className={`space-y-4 w-full ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="p-5 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl animate-pulse space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 sm:w-48 bg-gray-200 dark:bg-white/10 rounded-md" />
                <div className="h-3 w-24 sm:w-32 bg-gray-100 dark:bg-white/5 rounded-md" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded-lg" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-md" />
            <div className="h-3 w-4/5 bg-gray-100 dark:bg-white/5 rounded-md" />
          </div>
          <div className="flex gap-2 pt-1">
            <div className="h-5 w-16 bg-gray-100 dark:bg-white/5 rounded-full" />
            <div className="h-5 w-20 bg-gray-100 dark:bg-white/5 rounded-full" />
            <div className="h-5 w-14 bg-gray-100 dark:bg-white/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonRoadmap = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top Header skeleton */}
      <div className="p-6 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40" />
            <div className="space-y-2">
              <div className="h-5 w-52 bg-gray-200 dark:bg-white/10 rounded-lg" />
              <div className="h-3.5 w-36 bg-gray-100 dark:bg-white/5 rounded-md" />
            </div>
          </div>
          <div className="h-8 w-28 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl" />
        </div>
        <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full" />
      </div>

      {/* 3 Step Nodes Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className="p-5 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-indigo-200 dark:bg-indigo-900/50" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded-md" />
            </div>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded-md" />
            <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-md" />
            <div className="h-3 w-5/6 bg-gray-100 dark:bg-white/5 rounded-md" />
            <div className="pt-2 flex gap-1.5">
              <div className="h-4 w-12 bg-gray-100 dark:bg-white/5 rounded" />
              <div className="h-4 w-14 bg-gray-100 dark:bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonInterviewFeedback = () => {
  return (
    <div className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40" />
          <div className="space-y-1.5">
            <div className="h-4 w-44 bg-gray-200 dark:bg-white/10 rounded-md" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-white/5 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-16 bg-indigo-200 dark:bg-indigo-900/50 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl space-y-2">
            <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="h-5 w-12 bg-gray-300 dark:bg-white/20 rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-2.5 pt-2">
        <div className="h-3.5 w-full bg-gray-100 dark:bg-white/5 rounded-md" />
        <div className="h-3.5 w-11/12 bg-gray-100 dark:bg-white/5 rounded-md" />
        <div className="h-3.5 w-4/5 bg-gray-100 dark:bg-white/5 rounded-md" />
      </div>
    </div>
  );
};
