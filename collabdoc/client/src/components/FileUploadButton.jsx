import { useState, useRef } from 'react'

export default function FileUploadButton({ editor }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

  function handleClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const name = file.name
    const ext = name.split('.').pop().toLowerCase()
    setFileName(name)
    setIsProcessing(true)

    try {
      let html = ''

      if (ext === 'txt') {
        html = await handleTxt(file)
      } else if (ext === 'md') {
        html = await handleMd(file)
      } else if (ext === 'docx') {
        html = await handleDocx(file)
      } else if (ext === 'pdf') {
        html = await handlePdf(file)
      } else {
        alert('Unsupported file type. Please upload .txt, .md, .docx, or .pdf')
        return
      }

      if (!html || !editor) return

      const replace = window.confirm(
        `Load "${name}" into editor?\n\nOK = Replace current content\nCancel = Append to end`
      )

      if (replace) {
        editor.commands.setContent(html)
      } else {
        editor.commands.focus('end')
        editor.commands.insertContent(html)
      }

      editor.commands.focus('start')
    } catch (err) {
      console.error('File processing error:', err)
      alert('Failed to process file. Please try again.')
    } finally {
      setIsProcessing(false)
      setFileName('')
      // Reset so same file can be re-uploaded
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleTxt(file) {
    const text = await file.text()
    const lines = text.split('\n')
    return lines.map(line => `<p>${line || ''}</p>`).join('')
  }

  async function handleMd(file) {
    const text = await file.text()
    const lines = text.split('\n')
    const htmlLines = lines.map(line => {
      // Headings
      if (line.startsWith('### ')) return `<h3>${convertInline(line.slice(4))}</h3>`
      if (line.startsWith('## ')) return `<h2>${convertInline(line.slice(3))}</h2>`
      if (line.startsWith('# ')) return `<h1>${convertInline(line.slice(2))}</h1>`
      // Empty line
      if (line.trim() === '') return '<p></p>'
      // Paragraph
      return `<p>${convertInline(line)}</p>`
    })
    return htmlLines.join('')
  }

  function convertInline(text) {
    // Bold: **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code: `text`
    text = text.replace(/`(.+?)`/g, '<code>$1</code>')
    return text
  }

  async function handleDocx(file) {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    return result.value
  }

  async function handlePdf(file) {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const pages = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const text = content.items.map(item => item.str).join(' ')
      pages.push(`<p>${text}</p>`)
    }

    return pages.join('')
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.docx,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={isProcessing}
        title="Upload file to edit (.txt, .md, .docx, .pdf)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 ${
          isProcessing
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 border border-blue-300 dark:border-blue-700 cursor-wait'
            : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:bg-[#111111] dark:border-[#2a2a2a] dark:text-[#a1a1aa] dark:hover:border-[#3f3f3f] dark:hover:text-[#f5f5f5]'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload
          </>
        )}
      </button>
    </>
  )
}
