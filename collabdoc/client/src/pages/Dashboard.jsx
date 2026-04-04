import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import TagBadge from '../components/TagBadge'
import TemplatesModal from '../components/TemplatesModal'

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
      setDocuments(res.data)
    } catch (err) {
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
    if (!confirm('Are you sure you want to delete this document?')) return

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

  // Filtering logic
  const filteredDocs = documents.filter(doc => {
    if (filter === 'All') return true
    if (filter === 'Pinned') return doc.isPinned
    return (doc.tags || []).includes(filter)
  })

  const pinnedDocs = documents.filter(d => d.isPinned)
  const unpinnedFilteredDocs = filteredDocs.filter(d => !d.isPinned)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">CollabDoc</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Hello, <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span></span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Documents</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Manage and collaborate on your files in real-time.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <form onSubmit={handleJoinDocument} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Share Code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 uppercase"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={joinLoading || !joinCode}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {joinLoading ? 'Joining...' : 'Join'}
              </button>
            </form>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNewDocument}
                disabled={newDocLoading}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
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
              <button
                onClick={() => setTemplatesModalOpen(true)}
                className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                📋 Template
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab === 'Pinned' ? `📌 ${tab}` : tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6">{error}</div>
        )}
        {joinError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6">{joinError}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No documents yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first document or join an existing one.</p>
            <div className="flex justify-center gap-3">
              <button onClick={handleNewDocument} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Create Document
              </button>
              <button onClick={() => setTemplatesModalOpen(true)} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                📋 From Template
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {filter === 'All' && pinnedDocs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  📌 Pinned Documents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedDocs.map(doc => (
                    <DocumentCard
                      key={doc._id}
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
                  ))}
                </div>
              </div>
            )}

            {/* Main Doc Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(filter === 'All' ? unpinnedFilteredDocs : filteredDocs).map(doc => (
                <DocumentCard
                  key={doc._id}
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
              ))}
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No documents match the "{filter}" filter.
              </div>
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
  const isOwner = doc.owner?._id === user._id || doc.owner === user._id
  const isTagEditorOpen = tagEditorOpen === doc._id

  return (
    <Link
      to={`/doc/${doc._id}`}
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full ${
        isPinnedSection
          ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Top row: share code + action icons */}
      <div className="flex justify-between items-start mb-3">
        <span className="inline-flex px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-md uppercase tracking-wider font-mono">
          {doc.shareCode}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Pin toggle */}
          <button
            onClick={(e) => onTogglePin(e, doc._id)}
            className={`p-1 rounded transition-colors ${doc.isPinned ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
            title={doc.isPinned ? 'Unpin' : 'Pin'}
          >
            📌
          </button>

          {/* Lock toggle (owner only) */}
          {isOwner && (
            <button
              onClick={(e) => onToggleLock(e, doc._id)}
              className={`p-1 rounded transition-colors ${doc.isLocked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
              title={doc.isLocked ? 'Unlock' : 'Lock'}
            >
              {doc.isLocked ? '🔒' : '🔓'}
            </button>
          )}

          {/* Tag editor */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setTagEditorOpen(isTagEditorOpen ? null : doc._id)
              }}
              className="p-1 rounded text-gray-400 hover:text-yellow-600 transition-colors"
              title="Edit tags"
            >
              🏷️
            </button>
            {isTagEditorOpen && (
              <div
                ref={tagEditorRef}
                className="absolute right-0 top-8 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-3 shadow-xl w-44"
                onClick={e => { e.preventDefault(); e.stopPropagation() }}
              >
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Tags</p>
                {ALLOWED_TAGS.map(tag => (
                  <label key={tag} className="flex items-center gap-2 py-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <input
                      type="checkbox"
                      checked={(doc.tags || []).includes(tag)}
                      onChange={e => onTagChange(doc._id, tag, e.target.checked)}
                      className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Delete (owner only) */}
          {isOwner && (
            <button
              onClick={(e) => onDelete(e, doc._id)}
              className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
              title="Delete document"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate flex items-center gap-2">
        {doc.isLocked && <span title="Locked">🔒</span>}
        {doc.title}
      </h3>

      {/* Tags */}
      {doc.tags && doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {doc.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 flex flex-col gap-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">Owner: {doc.owner?.name || 'You'}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Updated {new Date(doc.updatedAt).toLocaleDateString()}</p>
      </div>
    </Link>
  )
}
