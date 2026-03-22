import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMarketingLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-8">
      <div>
        <Skeleton className="h-10 w-56 mb-2" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
