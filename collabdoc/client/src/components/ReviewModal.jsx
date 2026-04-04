import { useState, useEffect } from 'react'

export default function ReviewModal({ isOpen, onClose }) {
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitted) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, submitted, onClose])

  if (!isOpen) return null

  const handleBackdropClick = () => {
    if (!submitting) onClose()
  }

  const handleSubmit = async () => {
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters.')
      return
    }

    setSubmitting(true)
    setError('')

    const newReview = {
      comment: comment.trim(),
      timestamp: new Date().toISOString()
    }

    const savedReviews = JSON.parse(localStorage.getItem('collabdoc_reviews') || '[]')
    savedReviews.push(newReview)
    localStorage.setItem('collabdoc_reviews', JSON.stringify(savedReviews))

    await new Promise(r => setTimeout(r, 700))

    setSubmitted(true)
    setSubmitting(false)

    setTimeout(() => {
      onClose()
      setComment('')
      setSubmitted(false)
      setError('')
    }, 2200)
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl w-full max-w-sm mx-4 p-8 shadow-2xl relative transition-colors duration-300"
        onClick={e => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-[#71717a] hover:text-gray-900 dark:hover:text-[#f5f5f5] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <span className="text-3xl mb-3 block text-center">💬</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#f5f5f5] text-center mb-1 transition-colors duration-300">Share Your Feedback</h2>
            <p className="text-xs text-gray-500 dark:text-[#52525b] text-center mb-6 transition-colors duration-300">Anonymous — no login required</p>

            <textarea
              rows={5}
              placeholder="What do you think about CollabDoc? Any bugs, suggestions, or praise..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={500}
              className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#52525b] text-sm leading-relaxed resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
            />

            <div className="flex justify-between items-center mt-2 mb-4">
              <span className="text-xs text-red-400 flex items-center gap-1">
                {error !== '' ? `⚠️ ${error}` : ''}
              </span>
              <span className={`text-xs ${comment.length === 500 ? 'text-red-400' : comment.length >= 450 ? 'text-yellow-500' : 'text-gray-400 dark:text-[#52525b]'}`}>
                {comment.length} / 500
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || comment.trim().length < 10}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-blue-500/50 cursor-wait text-white'
                  : comment.trim().length < 10
                    ? 'bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-400 dark:text-[#52525b] cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 active:scale-[0.98]'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Feedback →'
              )}
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-[#52525b] mt-3 transition-colors duration-300">
              Your feedback is stored locally and never sent to any server.
            </p>
          </>
        ) : (
          <div className="text-center transition-colors duration-300">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <svg className="text-green-500 dark:text-green-400 w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#f5f5f5] text-center mb-2 transition-colors duration-300">Thank you! 🎉</h2>
            <p className="text-sm text-gray-600 dark:text-[#a1a1aa] text-center leading-relaxed max-w-xs mx-auto transition-colors duration-300">
              Your feedback means a lot. We'll use it to make CollabDoc better.
            </p>
            <div className="mt-6 text-xs text-gray-500 dark:text-[#52525b] text-center flex items-center justify-center gap-2 transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-[#52525b] animate-pulse"></span>
              Closing automatically...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
