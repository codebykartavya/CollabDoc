import { useState, useRef, useEffect } from 'react'

// npm install jspdf html2canvas
export default function ExportMenu({ editor, docTitle }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  function handleExportMarkdown() {
    if (!editor) return
    const content = editor.storage.markdown?.getMarkdown?.() || editor.getText()
    const blob = new Blob([content], { type: 'text/markdown' })
    downloadBlob(blob, `${docTitle || 'document'}.md`)
  }

  function handleExportText() {
    if (!editor) return
    const content = editor.getText()
    const blob = new Blob([content], { type: 'text/plain' })
    downloadBlob(blob, `${docTitle || 'document'}.txt`)
  }

  async function handleExportPDF() {
    if (!editor) return
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const element = document.querySelector('.ProseMirror')
      if (!element) return

      // Save original styles
      const originalBackground = element.style.background
      const originalColor = element.style.color

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.ProseMirror')
          if (clonedElement) {
            clonedElement.style.background = '#ffffff'
            clonedElement.style.color = '#000000'
            clonedElement.style.padding = '40px'

            // Force all child elements to black text
            const allChildren = clonedElement.querySelectorAll('*')
            allChildren.forEach(child => {
              child.style.color = '#000000'
              child.style.background = 'transparent'
            })

            // Fix headings
            clonedDoc.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
              h.style.color = '#000000'
              h.style.fontWeight = 'bold'
            })

            // Fix links
            clonedDoc.querySelectorAll('a').forEach(a => {
              a.style.color = '#0000EE'
            })
          }
        }
      })

      // Restore original styles
      element.style.background = originalBackground
      element.style.color = originalColor

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()   // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight() // 297mm
      const margin = 15

      const contentWidth = pageWidth - margin * 2
      const imgHeight = (canvas.height * contentWidth) / canvas.width

      let heightLeft = imgHeight
      let yPosition = margin

      // First page
      pdf.addImage(imgData, 'PNG', margin, yPosition, contentWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2

      // Extra pages if content is long
      while (heightLeft > 0) {
        pdf.addPage()
        yPosition = margin - (imgHeight - heightLeft)
        pdf.addImage(imgData, 'PNG', margin, yPosition, contentWidth, imgHeight)
        heightLeft -= pageHeight - margin * 2
      }

      pdf.save(`${docTitle || 'document'}.pdf`)
      setOpen(false)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Make sure jspdf and html2canvas are installed.')
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(p => !p)}
        className="text-sm border border-gray-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium transition-colors flex items-center gap-1"
      >
        Export
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-10 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 w-52 py-1 overflow-hidden">
          <button
            onClick={handleExportMarkdown}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            <span className="text-base">📝</span>
            Markdown (.md)
          </button>
          <button
            onClick={handleExportText}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            <span className="text-base">📄</span>
            Plain Text (.txt)
          </button>
          <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
          <button
            onClick={handleExportPDF}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            <span className="text-base">📕</span>
            PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  )
}