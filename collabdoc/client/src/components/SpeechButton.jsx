import { useState, useRef, useCallback, useEffect } from 'react'

export default function SpeechButton({ editor }) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
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
    recognition.interimResults = true  // ✅ enables live word-by-word
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const ed = editorRef.current
      if (!ed) return

      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript  // ✅ capture live words
        }
      }

      // ✅ Insert final words permanently into editor
      if (final.trim()) {
        ed.commands.insertContent(final + ' ')
        setInterimText('')  // clear preview bubble
      }

      // ✅ Show live preview as user speaks
      if (interim.trim()) {
        setInterimText(interim)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setInterimText('')
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow mic access in browser settings.')
      }
    }

    recognition.onend = () => {
      // Auto-restart if still in listening mode (handles Chrome auto-stop)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          setIsListening(false)
          setInterimText('')
        }
      } else {
        setIsListening(false)
        setInterimText('')
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  function stopListening() {
    const recognition = recognitionRef.current
    recognitionRef.current = null  // prevent auto-restart in onend
    if (recognition) recognition.stop()
    setIsListening(false)
    setInterimText('')
  }

  if (!supported) return null

  return (
    <div className="relative">
      {/* Mic Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Stop recording' : 'Start speech to text'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 ${isListening
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:bg-[#111111] dark:border-[#2a2a2a] dark:text-[#a1a1aa] dark:hover:border-[#3f3f3f] dark:hover:text-[#f5f5f5]'
          }`}
      >
        {isListening ? (
          // ✅ Animated sound wave while listening
          <span className="flex items-center gap-1.5">
            <span className="flex items-end gap-0.5 h-3.5">
              <span className="w-0.5 bg-white rounded animate-bounce" style={{ height: '40%', animationDelay: '0ms' }} />
              <span className="w-0.5 bg-white rounded animate-bounce" style={{ height: '100%', animationDelay: '150ms' }} />
              <span className="w-0.5 bg-white rounded animate-bounce" style={{ height: '60%', animationDelay: '300ms' }} />
              <span className="w-0.5 bg-white rounded animate-bounce" style={{ height: '80%', animationDelay: '450ms' }} />
            </span>
            Stop
          </span>
        ) : (
          // Original mic SVG icon
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Speak
          </span>
        )}
      </button>

      {/* ✅ Live interim text preview bubble */}
      {interimText && (
        <div className="absolute top-10 left-0 z-50 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-3 py-2 shadow-lg min-w-max max-w-xs whitespace-normal transition-colors duration-300">
          <span className="text-xs text-gray-400 dark:text-[#71717a] block mb-1">
            🎤 Hearing...
          </span>
          <span className="text-sm text-gray-500 dark:text-[#a1a1aa] italic">
            {interimText}
          </span>
        </div>
      )}
    </div>
  )
}