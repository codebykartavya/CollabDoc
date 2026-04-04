import { useState, useEffect } from 'react'
import { EditorContent } from '@tiptap/react'

export default function FocusMode({ editor, onExit, wordCount }) {
  const [goal, setGoal] = useState(500)
  const [showGoalInput, setShowGoalInput] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onExit])

  const progress = Math.min((wordCount / goal) * 100, 100)
  const progressColor = progress >= 100 ? 'bg-green-500' : 'bg-blue-500'

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* Top minimal bar */}
      <div className="flex items-center justify-between px-8 py-3 opacity-30 hover:opacity-100 transition-opacity">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Mode</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {wordCount} / {goal} words
          </span>
          <button
            onClick={() => setShowGoalInput(p => !p)}
            className="text-xs text-blue-500 hover:underline"
          >
            Set goal
          </button>
          <button
            onClick={onExit}
            className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Exit (Esc)
          </button>
        </div>
      </div>

      {/* Word goal progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-slate-700">
        <div
          className={`h-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {showGoalInput && (
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Word goal:</span>
            <input
              type="number"
              value={goal}
              onChange={e => setGoal(Number(e.target.value))}
              className="w-20 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200"
              min={10}
              max={10000}
            />
            <button
              onClick={() => setShowGoalInput(false)}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* Editor centered */}
      <div className="flex-1 overflow-y-auto flex justify-center py-8 px-4">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-screen">
          <EditorContent editor={editor} />
        </div>
      </div>

      {progress >= 100 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg animate-bounce">
          Goal reached! Well done!
        </div>
      )}
    </div>
  )
}
