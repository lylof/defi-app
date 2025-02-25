import { Skeleton } from "@/components/ui/skeleton";

export default function ChallengesLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      {/* Filtres et recherche skeleton */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Liste des défis skeleton */}
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 mt-1" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}