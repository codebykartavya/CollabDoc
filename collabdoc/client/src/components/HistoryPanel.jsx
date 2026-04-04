import React from 'react'
import DiffViewer from './DiffViewer'

export default function HistoryPanel({ docId, editor, onClose }) {
  const currentText = editor ? editor.getText() : ''

  return (
    <div className="w-[560px] border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] absolute right-0 top-0 z-20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/80">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Revision History
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 p-1 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* DiffViewer fills the rest */}
      <div className="flex-1 overflow-hidden">
        <DiffViewer docId={docId} currentText={currentText} onClose={onClose} />
      </div>
    </div>
  )
}
