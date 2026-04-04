// npm install driver.js
import { useEffect, useState, useRef } from 'react'

export default function OnboardingTour() {
  const [touring, setTouring] = useState(false)
  const driverRef = useRef(null)

  useEffect(() => {
    if (localStorage.getItem('collabdoc_tour_done')) return

    const timeout = setTimeout(async () => {
      try {
        const { driver } = await import('driver.js')
        await import('driver.js/dist/driver.css')

        const driverInstance = driver({
          allowClose: false,
          showButtons: ['next', 'previous', 'close'],
          nextBtnText: 'Next →',
          prevBtnText: '← Back',
          doneBtnText: 'Got it! 🎉',
          steps: [
            {
              element: '#toolbar',
              popover: {
                title: '✏️ Rich Text Toolbar',
                description: 'Format your document with bold, italic, headings, lists and more.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#presence-strip',
              popover: {
                title: '👥 Live Collaborators',
                description: 'See everyone online right now. Their cursors appear in the document.',
                side: 'bottom',
                align: 'center'
              }
            },
            {
              element: '#share-button',
              popover: {
                title: '🔗 Share Instantly',
                description: 'Share with one link or scan the QR code from any device.',
                side: 'bottom',
                align: 'center'
              }
            },
            {
              element: '#pomodoro-timer',
              popover: {
                title: '⏱️ Synced Pomodoro Timer',
                description: 'The timer is synced for all collaborators — stay focused together.',
                side: 'bottom',
                align: 'center'
              }
            },
            {
              element: '#dark-mode-toggle',
              popover: {
                title: '🌙 Dark Mode',
                description: 'Easy on the eyes during long writing sessions.',
                side: 'bottom',
                align: 'center'
              }
            }
          ],
          onDestroyStarted: () => {
            localStorage.setItem('collabdoc_tour_done', 'true')
            setTouring(false)
            driverInstance.destroy()
          },
          onDestroyed: () => {
            localStorage.setItem('collabdoc_tour_done', 'true')
            setTouring(false)
          }
        })

        driverRef.current = driverInstance
        setTouring(true)
        driverInstance.drive()
      } catch (err) {
        console.error('Failed to start onboarding tour:', err)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  function handleSkip() {
    if (driverRef.current) {
      driverRef.current.destroy()
    }
    localStorage.setItem('collabdoc_tour_done', 'true')
    setTouring(false)
  }

  if (!touring) return null

  return (
    <button
      onClick={handleSkip}
      className="fixed bottom-6 right-6 z-[100000] bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
    >
      Skip Tour ✕
    </button>
  )
}
