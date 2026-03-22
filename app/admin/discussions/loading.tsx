import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDiscussionsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
