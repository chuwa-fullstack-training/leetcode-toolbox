import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-10">
      {/* LeetCode ID field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>

      {/* Name field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>

      {/* LeetCode Session field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
