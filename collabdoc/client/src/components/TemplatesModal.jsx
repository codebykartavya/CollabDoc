import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const TEMPLATES = [
  { emoji: '📋', name: 'Meeting Notes', desc: 'Agenda, attendees, action items' },
  { emoji: '🚀', name: 'Project Brief', desc: 'Goals, scope, timeline, team' },
  { emoji: '☀️', name: 'Daily Standup', desc: 'Yesterday / Today / Blockers' },
  { emoji: '💡', name: 'Brainstorm Board', desc: 'Problem + ideas + pros/cons' },
  { emoji: '📄', name: 'PRD', desc: 'User stories, features, out of scope' },
  { emoji: '🔁', name: 'Weekly Retro', desc: 'What went well / didn\'t / improvements' },
  { emoji: '📚', name: 'Research Notes', desc: 'Sources, findings, summary' },
  { emoji: '⬜', name: 'Blank Document', desc: 'Start from scratch' },
]

export default function TemplatesModal({ isOpen, onClose, onCreate }) {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(null)

  if (!isOpen) return null

  async function handleSelect(template) {
    setCreating(template.name)
    try {
      const res = await api.post('/api/docs', { title: template.name, tags: [] })
      if (onCreate) onCreate(template.name)
      onClose()
      navigate(`/doc/${res.data._id}`)
    } catch (err) {
      console.error('Failed to create from template:', err)
      setCreating(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">New from Template</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 p-1.5 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => handleSelect(t)}
              disabled={creating !== null}
              className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all group disabled:opacity-50"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{t.emoji}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                {creating === t.name ? 'Creating...' : t.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
