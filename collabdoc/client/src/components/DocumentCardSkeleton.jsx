export default function DocumentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-5 shadow-sm animate-pulse flex flex-col h-[180px]">
      {/* Top row: tags / actions skeleton */}
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 w-16 bg-gray-200 dark:bg-[#1a1a1a] rounded-md"></div>
        <div className="flex gap-2">
          <div className="h-5 w-5 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
          <div className="h-5 w-5 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
        </div>
      </div>

      {/* Title skeleton */}
      <div className="h-5 w-3/4 bg-gray-300 dark:bg-[#2a2a2a] rounded mb-3"></div>

      {/* Tags skeleton */}
      <div className="flex gap-2 mb-auto">
        <div className="h-5 w-14 bg-gray-200 dark:bg-[#1a1a1a] rounded-full"></div>
        <div className="h-5 w-20 bg-gray-200 dark:bg-[#1a1a1a] rounded-full"></div>
      </div>

      {/* Meta skeleton */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1f1f1f] flex flex-col gap-2">
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
        <div className="h-3 w-1/3 bg-gray-100 dark:bg-[#1a1a1a] rounded"></div>
      </div>
    </div>
  )
}
