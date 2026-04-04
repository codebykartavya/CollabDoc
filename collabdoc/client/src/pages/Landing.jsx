import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Real-time sync',
    desc: 'Multiple users edit simultaneously. Yjs CRDT ensures zero data loss on concurrent edits.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'Coloured cursors',
    desc: 'See exactly where each collaborator is typing with their own coloured cursor and name.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
    title: 'Speech to text',
    desc: 'Speak and watch your words appear. Free browser-native voice recognition, no API key needed.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Pomodoro timer',
    desc: 'Synced focus timer shared with all collaborators. Everyone stays on the same work schedule.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Revision history',
    desc: 'Every save is recorded. Browse past versions and restore any previous state of your document.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
      </svg>
    ),
    title: 'Offline support',
    desc: 'Lose your connection? Keep writing. Changes sync automatically when you reconnect.'
  },
]

export default function Landing() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600">CollabDoc</span>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-1.5">
            Sign In
          </Link>
          <Link to="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-blue-100 dark:border-blue-800">
          Real-time · CRDT-powered · Zero conflicts
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Write together,<br />
          <span className="text-blue-600">instantly.</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
          CollabDoc is a real-time collaborative editor that resolves conflicts automatically.
          No waiting, no overwriting, no data loss.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium text-lg hover:bg-blue-700">
            Start Writing Free
          </Link>
          <Link to="/login" className="border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-medium text-lg hover:bg-gray-100 dark:hover:bg-slate-800">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Everything you need to write together
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-slate-800 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        CollabDoc — Built for Hackathon 2026 · Powered by Yjs CRDT
      </footer>
    </div>
  )
}
