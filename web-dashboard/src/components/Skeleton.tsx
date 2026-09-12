import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700/50 ${className}`}
      {...props}
    />
  );
}

// Pre-built skeletons for specific components
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-800/60 backdrop-blur-xl border border-slate-200 dark:border-white/[0.07] rounded-[2rem] p-7 flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-6" />
      
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-12 w-full rounded-2xl mt-4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/[0.04]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </td>
      ))}
    </tr>
  );
}
