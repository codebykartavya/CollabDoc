export default function EmptyState({ emoji, title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-[#f5f5f5] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mb-6 max-w-sm leading-relaxed">{message}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md shadow-blue-500/25"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
