import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-10">
      {/* Name field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
        <Skeleton className="h-4 w-40" /> {/* Description */}
      </div>

      {/* Email field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>

      {/* Password field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input */}
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
