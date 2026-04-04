import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import TagBadge from '../components/TagBadge'
import TemplatesModal from '../components/TemplatesModal'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import DocumentCardSkeleton from '../components/DocumentCardSkeleton'
import Navbar from '../components/Navbar'

const FILTER_TABS = ['All', 'Pinned', 'Work', 'Personal', 'Project', 'Research', 'Other']
const ALLOWED_TAGS = ['Work', 'Personal', 'Project', 'Research', 'Other']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newDocLoading, setNewDocLoading] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  const [filter, setFilter] = useState('All')
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false)
  const [tagEditorOpen, setTagEditorOpen] = useState(null) // docId or null
  const tagEditorRef = useRef(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Close tag editor on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (tagEditorRef.current && !tagEditorRef.current.contains(e.target)) {
        setTagEditorOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/api/docs')
      setDocuments(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Fetch docs error:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleNewDocument = async () => {
    setNewDocLoading(true)
    try {
      const res = await api.post('/api/docs')
      navigate(`/doc/${res.data._id}`)
    } catch (err) {
      setError('Failed to create document')
      setNewDocLoading(false)
    }
  }

  const handleJoinDocument = async (e) => {
    e.preventDefault()
    setJoinError('')
    if (!joinCode.trim()) return

    setJoinLoading(true)
    try {
      const res = await api.post('/api/docs/join', { shareCode: joinCode.trim().toUpperCase() })
      navigate(`/doc/${res.data._id}`)
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Invalid share code')
      setJoinLoading(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      await api.delete(`/api/docs/${id}`)
      setDocuments(docs => docs.filter(d => d._id !== id))
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  const handleTogglePin = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.patch(`/api/docs/${id}/pin`)
      fetchDocuments()
    } catch (err) {
      console.error('Pin toggle failed', err)
    }
  }

  const handleToggleLock = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.patch(`/api/docs/${id}/lock`)
      fetchDocuments()
    } catch (err) {
      console.error('Lock toggle failed', err)
    }
  }

  const handleTagChange = async (docId, tag, checked) => {
    const doc = documents.find(d => d._id === docId)
    if (!doc) return

    let newTags = [...(doc.tags || [])]
    if (checked) {
      if (!newTags.includes(tag)) newTags.push(tag)
    } else {
      newTags = newTags.filter(t => t !== tag)
    }

    try {
      await api.patch(`/api/docs/${docId}/tags`, { tags: newTags })
      fetchDocuments()
    } catch (err) {
      console.error('Tag update failed', err)
    }
  }

  // Derived state with safety checks
  const filteredDocs = (documents || []).filter(doc => {
    if (!doc) return false
    if (filter === 'All') return true
    if (filter === 'Pinned') return !!doc.isPinned
    return (doc.tags || []).includes(filter)
  })

  const pinnedDocs = filteredDocs.filter(d => d.isPinned)
  const unpinnedFilteredDocs = filteredDocs.filter(d => !d.isPinned)
  const myDocsCount = (documents || []).filter(d => {
    const ownerId = d.owner?._id || d.owner
    return ownerId && user?._id && ownerId === user._id
  }).length

  // Time of day greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  // Dynamic engagement message
  let engagementMsg = ''
  if (documents.length === 0) {
    engagementMsg = "Create your first document and invite someone to write with you!"
  } else if (documents.length === 1) {
    engagementMsg = "You have 1 document. Try sharing it with a teammate!"
  } else if (documents.length >= 2 && documents.length <= 4) {
    engagementMsg = `You have ${documents.length} documents. Keep collaborating!`
  } else if (documents.length >= 5 && documents.length <= 9) {
    engagementMsg = `You're on a roll! ${documents.length} documents and counting.`
  } else {
    engagementMsg = `Power user! 🏆 ${documents.length} documents created.`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        
        {/* Greetings & Stats Row */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f5f5f5] tracking-tight mb-2 transition-colors duration-300">
            Good {greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-[#a1a1aa] text-sm md:text-base transition-colors duration-300">{engagementMsg}</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="bg-blue-500/5 border border-blue-500/20 text-blue-500 dark:text-blue-400 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-blue-500/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] flex items-center gap-2 select-none">
              <span>📄</span> {documents.length} Documents
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-yellow-500/40 hover:shadow-[0_0_12px_rgba(234,179,8,0.15)] flex items-center gap-2 select-none">
              <span>📌</span> {pinnedDocs.length} Pinned
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center gap-2 select-none">
              <span>✍️</span> {myDocsCount} Created by me
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white dark:bg-[#111111] p-4 rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-sm transition-colors duration-300">
          
          {/* Join Document */}
          <form onSubmit={handleJoinDocument} className="flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Enter Share Code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase font-mono text-sm transition-all duration-300"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={joinLoading || !joinCode}
              className="px-5 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-[#f5f5f5] font-medium rounded-xl hover:bg-gray-200 hover:border-gray-300 dark:hover:bg-[#2a2a2a] dark:hover:border-[#3f3f3f] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {joinLoading ? 'Joining...' : 'Join ➔'}
            </button>
          </form>

          {/* Create Document Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTemplatesModalOpen(true)}
              className="px-5 py-2.5 border border-gray-200 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-[#f5f5f5] font-medium rounded-xl hover:bg-gray-200 hover:border-gray-300 dark:hover:bg-[#2a2a2a] dark:hover:border-[#3f3f3f] transition-all flex items-center gap-2 text-sm"
            >
              <span className="text-lg">📋</span> Templates
            </button>
            <button
              onClick={handleNewDocument}
              disabled={newDocLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:scale-100 text-sm"
            >
              {newDocLoading ? 'Creating...' : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Document
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {(documents.length > 0 || filter !== 'All') && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  filter === tab
                    ? 'bg-blue-50 dark:bg-[#1a1a1a] border border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                    : 'bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-[#a1a1aa] hover:border-gray-300 dark:hover:border-[#3f3f3f] hover:text-gray-900 dark:hover:text-[#f5f5f5]'
                }`}
              >
                {tab === 'Pinned' ? `📌 ${tab}` : tab}
              </button>
            ))}
          </div>
        )}

        {/* Global Errors */}
        {error && <ErrorState title="Error Loading Documents" message={error} onRetry={fetchDocuments} />}
        {joinError && <ErrorState title="Join Failed" message={joinError} onRetry={() => setJoinError('')} />}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <DocumentCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty State */}
        {!loading && documents.length === 0 && !error && (
          <EmptyState
            emoji="📄"
            title="No documents yet"
            message="Create your first document or easily join an existing one using a 6-character share code."
            actionLabel="Create Document"
            onAction={handleNewDocument}
          />
        )}

        {/* Content Grids */}
        {!loading && documents.length > 0 && (
          <>
            {/* Pinned Section */}
            {filter === 'All' && pinnedDocs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-[#71717a] uppercase tracking-widest mb-5 flex items-center gap-2 transition-colors duration-300">
                  <span className="text-yellow-500">★</span> Pinned
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {pinnedDocs.map((doc, idx) => (
                    <div key={doc._id} className="animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
                      <DocumentCard
                        doc={doc}
                        user={user}
                        onDelete={handleDelete}
                        onTogglePin={handleTogglePin}
                        onToggleLock={handleToggleLock}
                        tagEditorOpen={tagEditorOpen}
                        setTagEditorOpen={setTagEditorOpen}
                        tagEditorRef={tagEditorRef}
                        onTagChange={handleTagChange}
                        isPinnedSection
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Doc Grid */}
            {(filter !== 'All' || unpinnedFilteredDocs.length > 0) && (
              <div>
                {filter === 'All' && pinnedDocs.length > 0 && (
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-[#71717a] uppercase tracking-widest mb-5 flex items-center gap-2 transition-colors duration-300">
                    All Documents
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(filter === 'All' ? unpinnedFilteredDocs : filteredDocs).map((doc, idx) => (
                    <div key={doc._id} className="animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
                      <DocumentCard
                        doc={doc}
                        user={user}
                        onDelete={handleDelete}
                        onTogglePin={handleTogglePin}
                        onToggleLock={handleToggleLock}
                        tagEditorOpen={tagEditorOpen}
                        setTagEditorOpen={setTagEditorOpen}
                        tagEditorRef={tagEditorRef}
                        onTagChange={handleTagChange}
                      />
                     </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && filteredDocs.length === 0 && documents.length > 0 && filter !== 'All' && (
               <EmptyState
                 emoji="🔍"
                 title={`No ${filter} documents`}
                 message={`You don't have any documents matching the "${filter}" filter.`}
               />
            )}
          </>
        )}
      </main>

      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onCreate={() => {}}
      />
      

    </div>
  )
}

function DocumentCard({ doc, user, onDelete, onTogglePin, onToggleLock, tagEditorOpen, setTagEditorOpen, tagEditorRef, onTagChange, isPinnedSection }) {
  const navigate = useNavigate()
  const isOwner = doc.owner?._id === user?._id || doc.owner === user?._id
  const isTagEditorOpen = tagEditorOpen === doc._id

  return (
    <div
      onClick={() => navigate(`/doc/${doc._id}`)}
      className={`group card-hover relative bg-white dark:bg-[#141414] cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col h-[180px] ${
        isPinnedSection
          ? 'border-yellow-500/30 dark:border-yellow-500/20 shadow-[0_4px_20px_rgba(234,179,8,0.05)] hover:border-yellow-500/50 dark:hover:border-yellow-500/40 hover:shadow-[0_8px_25px_rgba(234,179,8,0.1)]'
          : 'border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:border-gray-300 dark:hover:border-[#3f3f3f] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Top row: share code + action icons */}
      <div className="flex justify-between items-start mb-4">
        <span className="inline-flex px-2 py-1 bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-[#f5f5f5] text-xs font-semibold rounded-md uppercase tracking-wider font-mono border border-gray-200 dark:border-[#3f3f3f] transition-colors duration-300">
          {doc.shareCode}
        </span>
        
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Action icons (Admin only) */}
          {isOwner && (
            <>
              {/* Pin */}
              <button
                onClick={(e) => onTogglePin(e, doc._id)}
                className={`p-1.5 rounded-lg transition-colors bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] ml-1 ${doc.isPinned ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-900 dark:text-[#71717a] dark:hover:text-[#f5f5f5]'}`}
                title={doc.isPinned ? 'Unpin' : 'Pin'}
              >
                📌
              </button>

              {/* Lock */}
              <button
                onClick={(e) => onToggleLock(e, doc._id)}
                className={`p-1.5 rounded-lg transition-colors bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] ml-1 ${doc.isLocked ? 'text-red-500' : 'text-gray-500 hover:text-gray-900 dark:text-[#71717a] dark:hover:text-[#f5f5f5]'}`}
                title={doc.isLocked ? 'Unlock' : 'Lock'}
              >
                {doc.isLocked ? '🔒' : '🔓'}
              </button>
            </>
          )}

          {/* Tag editor */}
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setTagEditorOpen(isTagEditorOpen ? null : doc._id)
              }}
              className="p-1.5 rounded-lg transition-colors bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-[#71717a] hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-[#2a2a2a] dark:hover:text-[#f5f5f5]"
              title="Edit tags"
            >
              🏷️
            </button>
            {isTagEditorOpen && (
              <div
                ref={tagEditorRef}
                className="absolute right-0 top-10 z-50 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-3 shadow-2xl w-48 animate-fade-in transition-colors duration-300"
                onClick={e => { e.preventDefault(); e.stopPropagation() }}
              >
                <p className="text-xs font-semibold text-gray-500 dark:text-[#a1a1aa] mb-3 uppercase tracking-wider transition-colors duration-300">Tags</p>
                <div className="space-y-1">
                  {ALLOWED_TAGS.map(tag => (
                    <label key={tag} className="flex items-center gap-3 py-1.5 px-2 cursor-pointer text-sm text-gray-900 dark:text-[#f5f5f5] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={(doc.tags || []).includes(tag)}
                        onChange={e => onTagChange(doc._id, tag, e.target.checked)}
                        className="rounded border-gray-300 dark:border-[#3f3f3f] bg-white dark:bg-[#0a0a0a] disabled:bg-gray-100 dark:disabled:bg-[#111111] text-blue-500 focus:ring-blue-500/50"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delete */}
          {isOwner && (
            <button
              onClick={(e) => onDelete(e, doc._id)}
              className="p-1.5 rounded-lg transition-colors bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-[#71717a] hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 hover:text-red-500 ml-1"
              title="Delete document"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[1.05rem] font-medium text-gray-900 dark:text-[#f5f5f5] mb-2 truncate flex items-center gap-2 tracking-tight transition-colors duration-300">
        {doc.isLocked && <span title="Locked" className="text-sm">🔒</span>}
        {doc.title || 'Untitled Document'}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-auto">
        {doc.tags && doc.tags.length > 0 ? (
          doc.tags.map(tag => <TagBadge key={tag} tag={tag} />)
        ) : (
          <span className="text-xs text-gray-500 dark:text-[#52525b] border border-gray-200 dark:border-[#2a2a2a] px-2 py-0.5 rounded-full bg-gray-50 dark:bg-[#111111] transition-colors duration-300">No tags</span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1f1f1f] flex flex-col gap-1 transition-colors duration-300">
        <p className="text-xs text-gray-600 dark:text-[#a1a1aa] flex items-center gap-1.5 transition-colors duration-300">
          <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-[#2a2a2a] flex items-center justify-center text-[8px] font-bold text-gray-700 dark:text-[#f5f5f5] transition-colors duration-300">
            {(doc.owner?.name || 'You').charAt(0).toUpperCase()}
          </span>
          {doc.owner?.name || 'You'}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-[#71717a] ml-5.5 transition-colors duration-300">Modified • {new Date(doc.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
