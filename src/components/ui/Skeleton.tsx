"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "h-4 w-full" }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 border border-white/5 rounded-xl ${className}`}
    />
  );
};

export const SkeletonStatCard: React.FC = () => {
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1 pr-4">
          <div className="h-3 w-28 bg-slate-700/60 rounded-md" />
          <div className="h-7 w-36 bg-slate-700/80 rounded-lg" />
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-700/60 shrink-0" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <div className="h-4 w-16 bg-slate-700/50 rounded-full" />
        <div className="h-3 w-24 bg-slate-700/40 rounded-md" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 animate-pulse">
      <div className="flex justify-between items-center pb-3 border-b border-white/10">
        <div className="h-5 w-48 bg-slate-700/70 rounded-md" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-700/50 rounded-lg" />
          <div className="h-8 w-28 bg-slate-700/50 rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 pb-2 border-b border-white/5">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 bg-slate-700/60 rounded" />
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="grid grid-cols-5 gap-4 py-2.5 border-b border-white/5 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div key={cIdx} className={`h-4 bg-slate-700/40 rounded ${cIdx === 0 ? "w-3/4" : "w-1/2"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 space-y-4 animate-pulse">
          <div className="aspect-square w-full bg-slate-700/50 rounded-xl" />
          <div className="h-4 w-3/4 bg-slate-700/70 rounded-md" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 w-20 bg-slate-700/60 rounded-md" />
            <div className="h-8 w-24 bg-slate-700/60 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonChart: React.FC = () => {
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 w-40 bg-slate-700/70 rounded-md" />
        <div className="h-4 w-24 bg-slate-700/50 rounded-md" />
      </div>
      <div className="h-64 bg-slate-800/40 rounded-xl flex items-end justify-between p-6 gap-3">
        <div className="h-1/3 w-full bg-slate-700/40 rounded-t-md" />
        <div className="h-2/3 w-full bg-slate-700/50 rounded-t-md" />
        <div className="h-1/2 w-full bg-slate-700/40 rounded-t-md" />
        <div className="h-5/6 w-full bg-slate-700/60 rounded-t-md" />
        <div className="h-3/4 w-full bg-slate-700/50 rounded-t-md" />
        <div className="h-2/5 w-full bg-slate-700/40 rounded-t-md" />
      </div>
    </div>
  );
};
