import React, { useEffect, useState } from 'react'
import api from '../utils/api'

export default function HistoryPanel({ docId, onClose }) {
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const res = await api.get(`/api/docs/${docId}/revisions`)
        setRevisions(res.data)
      } catch (err) {
        console.error('Failed to load history', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRevisions()
  }, [docId])

  const handleRestore = (rev) => {
    alert('Restore feature is coming soon! Revisions are being saved to the database.')
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] absolute right-0 top-0 z-20">
      <div className="px-4 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Revision History
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 p-1 rounded transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : revisions.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500">No revisions yet. Start typing to create history snapshots.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {revisions.map((rev, index) => {
              const isLatest = index === 0
              return (
                <div key={rev._id} className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-transparent last:pb-0">
                  <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ring-4 ring-white ${isLatest ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-blue-200 transition-colors group">
                    <p className="text-xs font-semibold text-gray-900 mb-1">{isLatest ? 'Current Version' : 'Saved Snapshot'}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      by <span className="font-medium text-gray-700">{rev.userName || 'Unknown'}</span>
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(rev.timestamp).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <button
                        onClick={() => handleRestore(rev)}
                        className="opacity-0 group-hover:opacity-100 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-opacity bg-blue-50 px-2 py-1 rounded"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
