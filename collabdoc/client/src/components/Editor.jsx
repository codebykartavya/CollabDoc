import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import CharacterCount from '@tiptap/extension-character-count'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { io } from 'socket.io-client'
import Toolbar from './Toolbar'
import PresenceStrip from './PresenceStrip'
import HistoryPanel from './HistoryPanel'
import ShareModal from './ShareModal'
import EmojiReactions from './EmojiReactions'
import FocusMode from './FocusMode'
import PomodoroTimer from './PomodoroTimer'

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316']

function getUserColor(userId) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Editor({ docId, user, title, setTitle, shareCode }) {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUser, setTypingUser] = useState('')
  const [connected, setConnected] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const typingTimerRef = useRef(null)
  const socketRef = useRef(null)

  const userColor = useMemo(() => getUserColor(user._id), [user._id])

  // Create stable Y.Doc and providers
  const ydoc = useMemo(() => new Y.Doc(), [docId])

  const wsProvider = useMemo(() => {
    const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
    return new WebsocketProvider(`${wsBase}/ws`, docId, ydoc, { connect: true })
  }, [docId, ydoc])

  // Offline persistence
  const indexeddbProvider = useMemo(() => {
    return new IndexeddbPersistence(docId, ydoc)
  }, [docId, ydoc])

  // Set awareness (cursor + user info)
  useEffect(() => {
    wsProvider.awareness.setLocalStateField('user', {
      name: user.name,
      color: userColor,
      id: user._id
    })
    wsProvider.on('status', ({ status }) => {
      setConnected(status === 'connected')
    })
    return () => {
      wsProvider.awareness.setLocalStateField('user', null)
      wsProvider.destroy()
      indexeddbProvider.destroy()
      ydoc.destroy()
    }
  }, [wsProvider, ydoc, indexeddbProvider, user, userColor])

  // Socket.io for presence
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8080')
    socketRef.current = socket

    socket.emit('join-room', {
      docId,
      userId: user._id,
      userName: user.name,
      color: userColor
    })

    socket.on('room-members', (members) => {
      setOnlineUsers(members)
    })

    socket.on('user-joined', ({ userId, userName, color }) => {
      setOnlineUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev
        return [...prev, { userId, userName, color }]
      })
    })

    socket.on('user-left', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId))
    })

    socket.on('typing', ({ userName }) => {
      setTypingUser(userName)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setTypingUser(''), 2000)
    })

    return () => {
      socket.disconnect()
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [docId, user, userColor])

  // Emit typing indicator
  const handleTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('user-typing', { docId, userName: user.name })
    }
  }, [docId, user.name])

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: ydoc, field: 'document' }),
      CollaborationCursor.configure({
        provider: wsProvider,
        user: { name: user.name, color: userColor }
      }),
      CharacterCount
    ],
    onUpdate: () => {
      handleTyping()
    }
  })

  const wordCount = editor ? editor.storage.characterCount.words() : 0
  const charCount = editor ? editor.storage.characterCount.characters() : 0

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <input
          className="text-lg font-semibold text-gray-800 bg-transparent border-none outline-none flex-1 min-w-0 placeholder-gray-300"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={e => {
            const event = new CustomEvent('save-title', { detail: e.target.value })
            document.dispatchEvent(event)
          }}
          placeholder="Untitled Document"
        />
        <PresenceStrip users={[{ userId: user._id, userName: user.name, color: userColor }, ...onlineUsers]} />
        <EmojiReactions socket={socketRef.current} docId={docId} userName={user.name} />
        <button onClick={() => setShowShare(true)} className="text-sm bg-blue-600 text-white font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Share</button>
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm border border-gray-300 bg-white font-medium text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">History</button>
        <button onClick={() => setFocusMode(true)} className="text-sm border border-gray-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300">Focus</button>
        <PomodoroTimer socket={socketRef.current} docId={docId} />
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${connected ? 'bg-green-500' : 'bg-red-400'}`} title={connected ? 'Connected' : 'Disconnected'} />
      </div>

      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Word count + typing indicator */}
      <div className="bg-white border-b border-gray-100 px-6 py-1.5 flex items-center gap-4 text-xs font-medium text-gray-400">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        {typingUser && <span className="text-blue-500 italic">{typingUser} is typing...</span>}
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-4 pb-12 pt-6">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] overflow-hidden">
            {editor ? <EditorContent editor={editor} /> : null}
          </div>
        </div>
        {showHistory && (
          <HistoryPanel docId={docId} onClose={() => setShowHistory(false)} />
        )}
      </div>

      {showShare && (
        <ShareModal shareCode={shareCode} docId={docId} onClose={() => setShowShare(false)} />
      )}

      {focusMode && (
        <FocusMode
          editor={editor}
          onExit={() => setFocusMode(false)}
          wordCount={wordCount}
        />
      )}
    </div>
  )
}
