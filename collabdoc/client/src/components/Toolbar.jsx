import SpeechButton from './SpeechButton'

export default function Toolbar({ editor }) {
  if (!editor) return null

  const btnBase = "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
  const btnActive = "bg-blue-600 text-white border-blue-600"
  const btnInactive = "border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-2 flex items-center gap-2 flex-wrap">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnBase} ${editor.isActive('bold') ? btnActive : btnInactive}`} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnBase} ${editor.isActive('italic') ? btnActive : btnInactive}`} title="Italic (Ctrl+I)">
        <em>I</em>
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnBase} ${editor.isActive('underline') ? btnActive : btnInactive}`} title="Underline (Ctrl+U)">
        <span className="underline">U</span>
      </button>
      <div className="w-px h-5 bg-gray-200 dark:bg-slate-600 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 1 }) ? btnActive : btnInactive}`}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? btnActive : btnInactive}`}>H2</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : btnInactive}`}>List</button>
      <div className="w-px h-5 bg-gray-200 dark:bg-slate-600 mx-1" />
      <SpeechButton editor={editor} />
    </div>
  )
}
