import { useState, useEffect } from 'react'

const SHORTCUTS = [
  {
    section: 'Editing',
    items: [
      { keys: ['Ctrl', 'B'], desc: 'Bold' },
      { keys: ['Ctrl', 'I'], desc: 'Italic' },
      { keys: ['Ctrl', 'U'], desc: 'Underline' },
      { keys: ['Ctrl', 'Z'], desc: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo' },
    ]
  },
  {
    section: 'Navigation',
    items: [
      { keys: ['Ctrl', 'S'], desc: 'Save snapshot to history' },
      { keys: ['Ctrl', 'K'], desc: 'Open share modal' },
      { keys: ['Ctrl', 'E'], desc: 'Open export menu' },
      { keys: ['Ctrl', 'F'], desc: 'Enter focus mode' },
    ]
  },
  {
    section: 'App',
    items: [
      { keys: ['?'], desc: 'Show this shortcuts panel' },
      { keys: ['Esc'], desc: 'Exit focus mode / Close modals' },
    ]
  }
]

export default function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      // Close on Escape
      if (e.key === 'Escape' && open) {
        setOpen(false)
        return
      }

      // Open on '?' key, only when not typing in an input
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        // Also skip if contentEditable
        if (document.activeElement?.isContentEditable) return
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-1.5 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SHORTCUTS.map(section => (
            <div key={section.section}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {section.section}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          {ki > 0 && <span className="text-gray-400 dark:text-gray-500 text-xs">+</span>}
                          <kbd className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 font-mono text-xs text-gray-700 dark:text-gray-300 shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            Press <kbd className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 font-mono text-[10px] mx-0.5">?</kbd> anytime to toggle this panel
          </p>
        </div>
      </div>
    </div>
  )
}
