import { useState, useEffect, useRef } from 'react'

const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export default function PomodoroTimer({ socket, docId }) {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [show, setShow] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    socket.on('pomodoro-sync', ({ timeLeft, isRunning, isBreak }) => {
      setTimeLeft(timeLeft)
      setIsRunning(isRunning)
      setIsBreak(isBreak)
    })

    socket.on('pomodoro-tick', ({ timeLeft }) => {
      setTimeLeft(timeLeft)
    })

    socket.on('pomodoro-done', ({ isBreak }) => {
      setIsRunning(false)
      setIsBreak(isBreak)
      setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME)
      if (Notification.permission === 'granted') {
        new Notification(isBreak ? 'Break time! Rest for 5 minutes.' : 'Focus session done! Take a break.')
      }
    })

    return () => {
      socket.off('pomodoro-sync')
      socket.off('pomodoro-tick')
      socket.off('pomodoro-done')
    }
  }, [socket])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  function handleStart() {
    setIsRunning(true)
    if (socket) {
      socket.emit('pomodoro-start', { docId, timeLeft, isBreak })
    }
    Notification.requestPermission()
  }

  function handlePause() {
    setIsRunning(false)
    if (socket) {
      socket.emit('pomodoro-pause', { docId, timeLeft })
    }
  }

  function handleReset() {
    setIsRunning(false)
    const newTime = isBreak ? BREAK_TIME : WORK_TIME
    setTimeLeft(newTime)
    if (socket) {
      socket.emit('pomodoro-reset', { docId, timeLeft: newTime, isBreak })
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const totalTime = isBreak ? BREAK_TIME : WORK_TIME
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const circumference = 2 * Math.PI * 28

  return (
    <div className="relative">
      <button
        onClick={() => setShow(p => !p)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
          isRunning
            ? 'bg-orange-500 text-white border-orange-500'
            : 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
        }`}
        title="Pomodoro timer"
      >
        {isRunning ? `${formatTime(timeLeft)}` : 'Pomodoro'}
      </button>

      {show && (
        <div className="absolute top-12 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 w-56 z-50 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </span>
            <button
              onClick={() => { setIsBreak(p => !p); handleReset() }}
              className="text-xs text-blue-500 hover:underline"
            >
              {isBreak ? 'Switch to Focus' : 'Switch to Break'}
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={isBreak ? '#10b981' : '#f97316'}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex-1 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg text-sm font-medium"
              >
                Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Reset
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
            Synced with all collaborators
          </p>
        </div>
      )}
    </div>
  )
}
