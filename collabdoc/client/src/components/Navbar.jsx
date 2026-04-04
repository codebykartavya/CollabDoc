import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import ReviewModal from './ReviewModal'

export default function Navbar({ saveStatus, connectionStatus, showBack }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [reviewOpen, setReviewOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#2a2a2a] px-6 py-3 flex items-center justify-between transition-colors duration-300 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {showBack && (
          <Link to="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-gray-200 dark:border-[#2a2a2a]">
            <svg className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-[#f5f5f5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
        )}
        <Link to="/dashboard" className="text-xl font-bold text-blue-600 no-underline flex items-center gap-2">
          {!showBack && <span>📝</span>} CollabDoc
        </Link>
      </div>

      {/* Center: Auto-save indicator */}
      {saveStatus && (
        <div className="flex items-center gap-1.5">
          {saveStatus === 'saving' && (
            <>
              <svg className="animate-spin w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-gray-400 dark:text-gray-500">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
            </>
          )}
          {saveStatus === 'offline' && (
            <>
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs text-yellow-600 dark:text-yellow-400">Offline</span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full p-2 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          id="dark-mode-toggle"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>

        {/* Connection status badge */}
        <div className="flex items-center gap-2">
          {connectionStatus && (
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                connectionStatus === 'live'
                  ? 'bg-green-500'
                  : connectionStatus === 'reconnecting'
                  ? 'bg-yellow-400 animate-pulse'
                  : 'bg-red-500'
              }`}
              title={
                connectionStatus === 'live'
                  ? 'Connected'
                  : connectionStatus === 'reconnecting'
                  ? 'Reconnecting...'
                  : 'Offline'
              }
            />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name || 'User'}</span>
        </div>

        <button
          onClick={() => setReviewOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-[#f5f5f5] bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl hover:border-gray-300 dark:hover:border-[#3f3f3f] transition-all duration-150"
          title="Share anonymous feedback"
        >
          💬 Feedback
        </button>

        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      </nav>
      <ReviewModal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} />
    </>
  )
}
