import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import Editor from '../components/Editor'
import OnboardingTour from '../components/OnboardingTour'

export default function EditorPage() {
  const { id } = useParams()
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [docInfo, setDocInfo] = useState(null)
  const [title, setTitle] = useState('')

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">CollabDoc</Link>
          </div>
        </nav>
        <div className="flex-1 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">CollabDoc</Link>
          </div>
        </nav>
        <div className="flex-1 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link to="/dashboard" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-800">Logout</button>
          </div>
        </div>
      </nav>
      <div className="flex-1 overflow-hidden">
        <Editor docId={id} user={user} title={title} setTitle={setTitle} shareCode={docInfo.shareCode} />
      </div>
      <OnboardingTour />
    </div>
  )
}
