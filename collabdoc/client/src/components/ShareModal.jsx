import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function ShareModal({ shareCode, docId, onClose }) {
  const shareUrl = `${window.location.origin}/doc/${docId}`
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Share Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Share Code</p>
            <div className="inline-block bg-blue-50 border border-blue-100 rounded-lg px-6 py-2">
              <span className="text-3xl font-mono font-bold tracking-widest text-blue-700">{shareCode}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Any registered user can join using this code</p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Or share via direct link</p>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none" />
              <button onClick={handleCopy} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors border border-gray-200 whitespace-nowrap min-w-[70px]">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-700 mb-4">Scan QR code</p>
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <QRCodeSVG value={shareUrl} size={150} level="M" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
