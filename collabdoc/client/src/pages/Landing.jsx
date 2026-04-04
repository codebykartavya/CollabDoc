import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const features = [
  {
    icon: '⚡', color: 'blue',
    title: 'Real-time Sync',
    desc: 'Every keystroke synced instantly. No lag, no conflicts, no data loss.'
  },
  {
    icon: '🖱️', color: 'purple',
    title: 'Live Cursors',
    desc: 'See exactly where each collaborator is with their name and unique color.'
  },
  {
    icon: '🔒', color: 'orange',
    title: 'CRDT Technology',
    desc: 'Two people typing at once? Yjs merges both edits automatically.'
  },
  {
    icon: '📄', color: 'emerald',
    title: 'Rich Export',
    desc: 'Download as PDF, Markdown, or plain text with one click.'
  },
  {
    icon: '🎤', color: 'red',
    title: 'Speech to Text',
    desc: 'Click the mic and speak. Words appear in the document as you talk.'
  },
  {
    icon: '📁', color: 'yellow',
    title: 'File Upload',
    desc: 'Upload .txt, .md, .docx, or .pdf and edit the content directly.'
  },
  {
    icon: '⏱️', color: 'cyan',
    title: 'Synced Pomodoro',
    desc: '25-minute timer synced for all collaborators simultaneously.'
  },
  {
    icon: '🕐', color: 'indigo',
    title: 'Version History',
    desc: 'Every revision saved. Compare changes and restore any version.'
  }
]

const colorMap = {
  blue: 'bg-blue-500/10 text-blue-400',
  purple: 'bg-purple-500/10 text-purple-400',
  orange: 'bg-orange-500/10 text-orange-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  red: 'bg-red-500/10 text-red-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  indigo: 'bg-indigo-500/10 text-indigo-400'
}

const pills = [
  'Real-time Sync', 'Live Cursors', 'Colored Cursors', 'Dark Mode',
  'Speech to Text', 'File Upload (.docx .pdf)', 'Export PDF',
  'Version History', 'Diff Viewer', 'Emoji Reactions',
  'Pomodoro Timer', 'Focus Mode', 'QR Code Sharing',
  'Document Tags', 'Pin Documents', 'Lock Documents',
  'Keyboard Shortcuts', 'Onboarding Tour', 'Offline Support'
]

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-white overflow-hidden font-sans transition-colors duration-300">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out px-6 py-4 flex items-center justify-between ${scrolled ? 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5' : 'bg-transparent border-transparent'
        }`}>
        <span className="text-xl font-bold tracking-tight hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-default" style={{ textShadow: '0 0 15px rgba(59,130,246,0.2)' }}>
          📝 CollabDoc
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
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
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md shadow-blue-600/20">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6 lg:flex-row lg:px-20 gap-16">

        {/* Radial Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-blue-600/15 rounded-full blur-[100px] animate-fade-in" style={{ animationDuration: '3s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-col items-center text-center lg:items-start lg:text-left flex-1 max-w-2xl animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] text-sm text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full mb-8 shadow-lg shadow-blue-900/10 transition-colors duration-300" style={{ boxShadow: 'var(--glow-accent)' }}>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            ✨ Built for GUVI Hackathon 2026
          </div>

          <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-extrabold leading-[1.1] tracking-tight mb-6 text-gray-900 dark:text-[#f5f5f5] transition-colors duration-300">
            Write together,<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500" style={{ webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent' }}>
              in real time.
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-[#a1a1aa] mb-10 max-w-lg leading-relaxed transition-colors duration-300">
            Multiple people. One document. Zero conflict. CollabDoc uses Yjs CRDT so every edit merges perfectly — no overwrites, ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
            <Link to="/signup" className="w-full sm:w-auto text-center bg-gradient-to-br from-blue-500 to-blue-700 text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-200 transform hover:scale-105" style={{ boxShadow: 'var(--glow-accent)' }}>
              Start Writing Free →
            </Link>
            <a href="#features" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:underline transition-colors font-medium">
              See features ↓
            </a>
          </div>

          <p className="text-xs text-gray-500 dark:text-[#52525b] font-medium tracking-wide transition-colors duration-300">
            Free forever • No credit card • Works in any browser
          </p>
        </div>

        {/* Hero Visual - Floating Card */}
        <div className="relative z-10 w-full max-w-[420px] lg:flex-1 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 shadow-2xl shadow-gray-200/50 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-colors duration-300" style={{ animation: 'float-card 6s ease-in-out infinite' }}>

            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2a2a2a] pb-4 mb-4 transition-colors duration-300">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Q4 Strategy Doc</span>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white dark:ring-[#141414] transition-all">K</div>
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white dark:ring-[#141414] transition-all">R</div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white dark:ring-[#141414] transition-all">P</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-[#2a2a2a] rounded-sm transition-colors duration-300" />

              <div className="relative h-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-sm flex items-center">
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#2a2a2a] rounded-sm ml-1 transition-colors duration-300" />
                <div className="absolute left-1/4 -top-1 w-0.5 h-6 bg-blue-500">
                  <div className="absolute -top-3 -left-1 bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded font-bold">Kartavya</div>
                </div>
              </div>

              <div className="h-3 w-5/6 bg-gray-200 dark:bg-[#2a2a2a] rounded-sm relative transition-colors duration-300">
                <div className="absolute right-1/4 -top-1 w-0.5 h-5 bg-purple-500 animate-pulse">
                  <div className="absolute -top-3 -left-1 bg-purple-500 text-white text-[8px] px-1 py-0.5 rounded font-bold">Ayush</div>
                </div>
              </div>
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#2a2a2a] rounded-sm transition-colors duration-300" />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-[#71717a] font-medium transition-colors duration-300">
              <span>247 words</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Live</span>
            </div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-200 dark:border-[#1f1f1f] transition-colors duration-300">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-4 block">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-4 transition-colors duration-300">Everything your team needs to write together</h2>
          <p className="text-gray-600 dark:text-[#a1a1aa] max-w-2xl mx-auto text-lg pt-2 transition-colors duration-300">Built on proven CRDT technology — conflict-free by design.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card-hover bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 hover:border-gray-300 dark:hover:border-blue-500/40" style={{ transition: 'all 0.2s ease' }}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-5 ${colorMap[f.color]}`}>
                {f.icon}
              </div>
              <h3 className="text-gray-900 dark:text-[#f5f5f5] font-medium mb-3 transition-colors duration-300">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-[#a1a1aa] leading-relaxed transition-colors duration-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-[#111111] border-y border-gray-200 dark:border-[#1f1f1f] transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-4 block">How it works</span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-16 transition-colors duration-300">From zero to collaborating in 60 seconds</h2>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-6">
            <div className="flex-1 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xl flex items-center justify-center mb-6">1</div>
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] mb-3 transition-colors duration-300">Create a Document</h3>
              <p className="text-sm text-gray-600 dark:text-[#a1a1aa] max-w-xs leading-relaxed transition-colors duration-300">Sign up free and create your first document instantly. No install, no setup — just open and write.</p>
            </div>

            <div className="hidden lg:block text-gray-300 dark:text-[#3f3f3f] text-2xl -mt-10 transition-colors duration-300">→</div>

            <div className="flex-1 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xl flex items-center justify-center mb-6">2</div>
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] mb-3 transition-colors duration-300">Share the Link</h3>
              <p className="text-sm text-gray-600 dark:text-[#a1a1aa] max-w-xs leading-relaxed transition-colors duration-300">Copy the link or 6-character code. Anyone with it can join your document and start collaborating.</p>
            </div>

            <div className="hidden lg:block text-gray-300 dark:text-[#3f3f3f] text-2xl -mt-10 transition-colors duration-300">→</div>

            <div className="flex-1 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xl flex items-center justify-center mb-6">3</div>
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] mb-3 transition-colors duration-300">Write Together</h3>
              <p className="text-sm text-gray-600 dark:text-[#a1a1aa] max-w-xs leading-relaxed transition-colors duration-300">See live cursors, real-time edits, typing indicators, and presence avatars as your whole team writes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Testimonials Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-20 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-3xl p-10 transition-colors duration-300">
          <div>
            <div className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400" style={{ webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent' }}>CRDT</div>
            <p className="text-sm text-gray-600 dark:text-[#a1a1aa] font-medium tracking-wide transition-colors duration-300">Conflict-free technology</p>
          </div>
          <div className="md:border-x border-gray-200 dark:border-[#2a2a2a] px-4 transition-colors duration-300">
            <div className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400" style={{ webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent' }}>∞</div>
            <p className="text-sm text-gray-600 dark:text-[#a1a1aa] font-medium tracking-wide transition-colors duration-300">Simultaneous editors supported</p>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400" style={{ webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent' }}>&lt;100ms</div>
            <p className="text-sm text-gray-600 dark:text-[#a1a1aa] font-medium tracking-wide transition-colors duration-300">Average sync latency</p>
          </div>
        </div>

        <div className="text-center mb-6 text-xs text-gray-400 dark:text-[#52525b] transition-colors duration-300">
          * Illustrative testimonials — not verified reviews
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 text-left hover:border-gray-300 dark:hover:border-[#3f3f3f] transition-all">
            <div className="text-yellow-500 mb-4 tracking-widest text-sm">★★★★★</div>
            <p className="text-gray-600 dark:text-[#a1a1aa] mb-6 leading-relaxed transition-colors duration-300">"CollabDoc made our group project so much easier. No more emailing docs back and forth!"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">PS</div>
              <div className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5] transition-colors duration-300">Priya S.<br /><span className="text-xs text-gray-500 dark:text-[#71717a] font-normal">NIT Trichy</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 text-left hover:border-gray-300 dark:hover:border-[#3f3f3f] transition-all">
            <div className="text-yellow-500 mb-4 tracking-widest text-sm">★★★★★</div>
            <p className="text-gray-600 dark:text-[#a1a1aa] mb-6 leading-relaxed transition-colors duration-300">"The live cursors are so satisfying. You actually feel like you're in the same room."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">RM</div>
              <div className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5] transition-colors duration-300">Rahul M.<br /><span className="text-xs text-gray-500 dark:text-[#71717a] font-normal">VIT Vellore</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 text-left hover:border-gray-300 dark:hover:border-[#3f3f3f] transition-all">
            <div className="text-yellow-500 mb-4 tracking-widest text-sm">★★★★★</div>
            <p className="text-gray-600 dark:text-[#a1a1aa] mb-6 leading-relaxed transition-colors duration-300">"Exported our meeting notes as PDF instantly. This replaced Google Docs for our whole team."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">AK</div>
              <div className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5] transition-colors duration-300">Ananya K.<br /><span className="text-xs text-gray-500 dark:text-[#71717a] font-normal">BITS Pilani</span></div>
            </div>
          </div>
        </div>

      </section>

      {/* Features Pills Section */}
      <section className="py-20 px-6 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#1f1f1f] transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#f5f5f5] mb-10 transition-colors duration-300">All features included, always free</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {pills.map((pill, i) => (
              <span key={i} className="rounded-full border border-gray-200 dark:border-[#2a2a2a] px-4 py-2 text-sm text-gray-600 dark:text-[#a1a1aa] hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/5 transition-all cursor-default">
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#1f1f1f] py-12 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-[#f5f5f5] mb-1 transition-colors duration-300">📝 CollabDoc</span>
            <span className="text-sm text-gray-500 dark:text-[#71717a] transition-colors duration-300">Write together, in real time.</span>
          </div>

          <a href="https://github.com/kartavya/collabdoc" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:text-[#71717a] dark:hover:text-[#f5f5f5] transition-colors" title="View Source">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          <div className="text-sm text-gray-500 dark:text-[#71717a] text-center md:text-right transition-colors duration-300">
            © 2026 CollabDoc<br />
            Built by Kartavya for GUVI Hackathon
          </div>
        </div>
      </footer>
    </div>
  )
}
