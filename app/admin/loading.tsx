import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Skeleton className="h-10 w-72 mb-2" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
