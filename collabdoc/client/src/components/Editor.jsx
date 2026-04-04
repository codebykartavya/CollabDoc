import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
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
import ExportMenu from './ExportMenu'
import ColorPicker from './ColorPicker'

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316']

function getUserColor(userId) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Editor({ docId, user, title, setTitle, shareCode, onStatusChange }) {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUser, setTypingUser] = useState('')
  const [connected, setConnected] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  // Save & connection status
  const [saveStatus, setSaveStatus] = useState('saved')
  const [connectionStatus, setConnectionStatus] = useState('live')
  const [isLocked, setIsLocked] = useState(false)
  const [lockedBanner, setLockedBanner] = useState(false)

  const typingTimerRef = useRef(null)
  const socketRef = useRef(null)
  const saveTimerRef = useRef(null)

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

  // Set awareness (cursor + user info) + connection status tracking
  useEffect(() => {
    wsProvider.awareness.setLocalStateField('user', {
      name: user.name,
      color: userColor,
      id: user._id
    })

    wsProvider.on('status', ({ status }) => {
      setConnected(status === 'connected')

      if (status === 'connected') setConnectionStatus('live')
      else if (status === 'connecting') setConnectionStatus('reconnecting')
      else if (status === 'disconnected') {
        setConnectionStatus('offline')
        setSaveStatus('offline')
      }
    })

    return () => {
      wsProvider.awareness.setLocalStateField('user', null)
      wsProvider.destroy()
      indexeddbProvider.destroy()
      ydoc.destroy()
    }
  }, [wsProvider, ydoc, indexeddbProvider, user, userColor])

  // Save status tracking via ydoc updates
  useEffect(() => {
    function handleUpdate() {
      setSaveStatus('saving')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        setSaveStatus('saved')
      }, 1500)
    }

    ydoc.on('update', handleUpdate)
    return () => {
      ydoc.off('update', handleUpdate)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [ydoc])

  // Propagate status changes to parent
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({ saveStatus, connectionStatus })
    }
  }, [saveStatus, connectionStatus, onStatusChange])

  // Socket.io for presence + lock events
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8080')
    socketRef.current = socket

    socket.emit('join-room', {
      docId,
      userId: user._id,
      userName: user.name,
      color: userColor
    })

    // Also join the doc: room for lock events
    socket.emit('join:doc', docId)

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
      if (userName === user.name) return
      setTypingUser(userName)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setTypingUser(''), 2000)
    })

    // Lock event from server
    socket.on('doc:locked', ({ isLocked: locked, lockedBy }) => {
      setIsLocked(locked)
      setLockedBanner(locked)
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
      TextStyle,
      Color,
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

  // Apply lock state to editor
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked)
    }
  }, [isLocked, editor])

  const wordCount = editor ? editor.storage.characterCount.words() : 0
  const charCount = editor ? editor.storage.characterCount.characters() : 0

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Lock banner */}
      {lockedBanner && (
        <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-4 py-2 text-center text-sm text-red-700 dark:text-red-300 font-medium">
          🔒 This document is locked by the owner. Editing is disabled.
        </div>
      )}

      {/* Top bar */}
      <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#2a2a2a] px-4 py-2 flex items-center gap-3 flex-shrink-0 shadow-sm transition-colors duration-300">
        <input
          className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] bg-transparent border-none outline-none flex-1 min-w-0 placeholder-gray-400 dark:placeholder-[#52525b] transition-colors duration-300"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={e => {
            const event = new CustomEvent('save-title', { detail: e.target.value })
            document.dispatchEvent(event)
          }}
          placeholder="Untitled Document"
          disabled={isLocked}
        />
        <div id="presence-strip">
          <PresenceStrip users={[{ userId: user._id, userName: user.name, color: userColor }, ...onlineUsers]} />
        </div>
        <EmojiReactions socket={socketRef.current} docId={docId} userName={user.name} />
        <ExportMenu editor={editor} docTitle={title || 'document'} />
        <button id="share-button" onClick={() => setShowShare(true)} className="text-sm bg-blue-600 text-white font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Share</button>
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] font-medium text-gray-700 dark:text-[#f5f5f5] px-4 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">History</button>
        <button onClick={() => setFocusMode(true)} className="text-sm border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-[#f5f5f5] transition-colors">Focus</button>
        <div id="pomodoro-timer">
          <PomodoroTimer socket={socketRef.current} docId={docId} />
        </div>

        {/* Save status indicator */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {saveStatus === 'saving' && (
            <svg className="animate-spin w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saveStatus === 'saved' && (
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {saveStatus === 'offline' && (
            <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          connectionStatus === 'live' ? 'bg-green-500'
            : connectionStatus === 'reconnecting' ? 'bg-yellow-400 animate-pulse'
            : 'bg-red-500'
        }`} title={connectionStatus === 'live' ? 'Connected' : connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'} />
      </div>

      {/* Toolbar */}
      <div id="toolbar">
        <Toolbar editor={editor} />
      </div>

      {/* Word count + typing indicator */}
      <div className="bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-[#1f1f1f] px-6 py-1.5 flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-[#71717a] transition-colors duration-300">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        {typingUser && <span className="text-blue-500 italic">{typingUser} is typing...</span>}
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden relative">
        <ColorPicker editor={editor} />
        <div className="flex-1 overflow-y-auto px-4 pb-12 pt-6">
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#141414] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-[#2a2a2a] min-h-[600px] overflow-hidden transition-colors duration-300">
            {editor ? <EditorContent editor={editor} /> : null}
          </div>
        </div>
        {showHistory && (
          <HistoryPanel docId={docId} editor={editor} onClose={() => setShowHistory(false)} />
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
