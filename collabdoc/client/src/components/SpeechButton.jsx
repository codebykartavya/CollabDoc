import { useState, useRef, useCallback, useEffect } from 'react'

export default function SpeechButton({ editor }) {
  const [isListening, setIsListening] = useState(false)
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recognitionRef = useRef(null)
  const editorRef = useRef(editor)

  // Keep editorRef always in sync with latest editor instance
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false // Only final results — avoids duplicates
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const ed = editorRef.current
      if (!ed) return

      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      if (transcript.trim()) {
        // Use commands API directly — more reliable with Collaboration extension
        ed.commands.insertContent(transcript + ' ')
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      // Auto-restart if still in listening mode (handles Chrome's auto-stop)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          // Already running or destroyed
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  function stopListening() {
    const recognition = recognitionRef.current
    recognitionRef.current = null // Prevent auto-restart in onend
    if (recognition) {
      recognition.stop()
    }
    setIsListening(false)
  }

  if (!supported) return null

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      title={isListening ? 'Stop recording' : 'Start speech to text'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
      {isListening ? 'Stop' : 'Speak'}
    </button>
  )
}
