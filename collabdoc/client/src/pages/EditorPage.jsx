import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import Editor from '../components/Editor'
import OnboardingTour from '../components/OnboardingTour'
import Navbar from '../components/Navbar'

export default function EditorPage() {
  const { id } = useParams()
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [docInfo, setDocInfo] = useState(null)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState({ saveStatus: 'saved', connectionStatus: 'live' })

  useEffect(() => {
    fetchDocInfo()

    const handleSaveTitle = async (e) => {
      const newTitle = e.detail
      try {
        await api.patch(`/api/docs/${id}/title`, { title: newTitle })
      } catch (err) {
        console.error('Failed to update title', err)
      }
    }

    document.addEventListener('save-title', handleSaveTitle)
    return () => document.removeEventListener('save-title', handleSaveTitle)
  }, [id])

  const fetchDocInfo = async () => {
    try {
      const res = await api.get(`/api/docs/${id}`)
      setDocInfo(res.data)
      setTitle(res.data.title)
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied. You do not have permission to view this document.')
      } else if (err.response?.status === 404) {
        setError('Document not found.')
      } else {
        setError('Failed to load document')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-[#141414] p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black border border-gray-200 dark:border-[#2a2a2a] text-center max-w-md w-full animate-fade-up transition-colors duration-300">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2 transition-colors duration-300">Access Error</h2>
            <p className="text-gray-600 dark:text-[#a1a1aa] mb-8 transition-colors duration-300">{error}</p>
            <Link to="/dashboard" className="inline-block px-6 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-[#f5f5f5] font-medium rounded-xl hover:bg-gray-200 hover:border-gray-300 dark:hover:bg-[#2a2a2a] dark:hover:border-[#3f3f3f] transition-all">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a] font-sans transition-colors duration-300">
      <Navbar 
        saveStatus={status.saveStatus} 
        connectionStatus={status.connectionStatus} 
        showBack={true} 
      />

      {docInfo?.isLocked && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-center gap-3 animate-fade-in z-30 shadow-[0_4px_12px_rgba(239,68,68,0.1)]">
          <span className="text-red-500 text-lg">🔒</span>
          <span className="text-red-400 text-sm font-medium tracking-wide">
            This document has been locked by the owner. It is in read-only mode and edits cannot be made at this time.
          </span>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        <Editor 
          docId={id} 
          user={user} 
          title={title} 
          setTitle={setTitle} 
          shareCode={docInfo.shareCode} 
          onStatusChange={setStatus} 
        />
      </div>
      <OnboardingTour />
    </div>
  )
}
