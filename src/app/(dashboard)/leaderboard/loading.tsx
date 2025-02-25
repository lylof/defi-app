export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="min-w-full">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="w-16">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 