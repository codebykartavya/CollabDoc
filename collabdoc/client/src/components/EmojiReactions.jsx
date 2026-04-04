import { useState, useEffect, useRef } from 'react'

const EMOJIS = ['👍', '❤️', '🔥', '💡', '😂', '👏', '🎉', '✅']

export default function EmojiReactions({ socket, docId, userName }) {
  const [showPicker, setShowPicker] = useState(false)
  const [floating, setFloating] = useState([])
  const counterRef = useRef(0)

  useEffect(() => {
    if (!socket) return
    socket.on('emoji-reaction', ({ emoji, userName: from, id }) => {
      addFloating(emoji, from, id)
    })
    return () => socket.off('emoji-reaction')
  }, [socket])

  function addFloating(emoji, from, id) {
    const newItem = {
      id: id || Date.now() + Math.random(),
      emoji,
      from,
      x: 20 + Math.random() * 60,
    }
    setFloating(prev => [...prev, newItem])
    setTimeout(() => {
      setFloating(prev => prev.filter(f => f.id !== newItem.id))
    }, 3000)
  }

  function sendReaction(emoji) {
    const id = Date.now() + Math.random()
    addFloating(emoji, userName, id)
    if (socket) {
      socket.emit('emoji-reaction', { docId, emoji, userName, id })
    }
    setShowPicker(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(p => !p)}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
        title="React with emoji"
      >
        React
      </button>

      {showPicker && (
        <div className="absolute top-10 left-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-2 flex gap-1 flex-wrap w-48 z-50 shadow-lg">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-xl"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {floating.map(item => (
        <div
          key={item.id}
          className="fixed bottom-24 pointer-events-none z-50 flex flex-col items-center animate-bounce"
          style={{ left: `${item.x}%` }}
        >
          <span className="text-4xl">{item.emoji}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.from}</span>
        </div>
      ))}
    </div>
  )
}
