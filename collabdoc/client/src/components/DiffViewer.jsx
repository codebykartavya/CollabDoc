// npm install diff
import { useState, useEffect } from 'react'
import { diffWords } from 'diff'
import api from '../utils/api'

export default function DiffViewer({ docId, currentText, onClose }) {
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRev, setSelectedRev] = useState(null)
  const [diffResult, setDiffResult] = useState([])

  useEffect(() => {
    async function fetchRevisions() {
      try {
        const res = await api.get(`/api/docs/${docId}/revisions`)
        setRevisions(res.data)
      } catch (err) {
        console.error('Failed to load revisions', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRevisions()
  }, [docId])

  function handleSelectRevision(rev) {
    setSelectedRev(rev)
    // snapshot is stored as binary/Buffer on the server,
    // but for text diffing we use a string representation
    const snapshotText = typeof rev.snapshot === 'string'
      ? rev.snapshot
      : '(Binary snapshot — text diff not available for this revision)'
    const result = diffWords(snapshotText, currentText || '')
    setDiffResult(result)
  }

  async function handleRestore() {
    if (!selectedRev) return
    const confirmed = confirm('Restore this version? Current changes will be overwritten.')
    if (!confirmed) return

    try {
      await api.patch(`/api/docs/${docId}`, { ydocState: selectedRev.snapshot })
      onClose()
    } catch (err) {
      console.error('Restore failed', err)
      alert('Failed to restore revision.')
    }
  }

  function formatTimestamp(ts) {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="flex h-full">
      {/* LEFT COLUMN — Revision list */}
      <div className="w-1/3 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Revisions
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">No saved revisions yet</p>
            </div>
          ) : (
            revisions.map((rev, idx) => {
              const isSelected = selectedRev?._id === rev._id
              return (
                <button
                  key={rev._id}
                  onClick={() => handleSelectRevision(rev)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600'
                      : 'border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {idx === 0 ? 'Latest' : `Revision ${revisions.length - idx}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    by <span className="font-medium text-gray-700 dark:text-gray-300">{rev.userName || 'Unknown'}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-4 mt-0.5">
                    {formatTimestamp(rev.timestamp)}
                  </p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium ml-4 mt-1">
                    View diff →
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN — Diff view */}
      <div className="w-2/3 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Changes in this revision vs current document
          </h3>
          {selectedRev && (
            <button
              onClick={handleRestore}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Restore this version
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!selectedRev ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a revision from the left to see changes
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 overflow-auto">
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                {diffResult.map((part, i) => {
                  if (part.added) {
                    return (
                      <span key={i} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded px-0.5">
                        {part.value}
                      </span>
                    )
                  }
                  if (part.removed) {
                    return (
                      <span key={i} className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 line-through rounded px-0.5">
                        {part.value}
                      </span>
                    )
                  }
                  return (
                    <span key={i} className="text-gray-800 dark:text-gray-200">
                      {part.value}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
