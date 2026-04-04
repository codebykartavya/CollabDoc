import SpeechButton from './SpeechButton'
import FileUploadButton from './FileUploadButton'

export default function Toolbar({ editor }) {
  if (!editor) return null

  const btnBase = "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-300"
  const btnActive = "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/50 dark:text-blue-400 shadow-sm dark:shadow-[0_0_10px_rgba(59,130,246,0.15)]"
  const btnInactive = "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:bg-[#111111] dark:border-[#2a2a2a] dark:text-[#a1a1aa] dark:hover:border-[#3f3f3f] dark:hover:text-[#f5f5f5]"

  const Divider = () => <div className="w-[1px] h-6 bg-gray-200 dark:bg-[#2a2a2a] mx-1 transition-colors duration-300" />

  return (
    <div id="toolbar" className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-[#2a2a2a] px-5 py-3 flex items-center flex-wrap gap-2 shadow-sm rounded-t-xl sm:rounded-none transition-colors duration-300">
      
      {/* Text Format Group */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnBase} ${editor.isActive('bold') ? btnActive : btnInactive}`} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnBase} ${editor.isActive('italic') ? btnActive : btnInactive}`} title="Italic (Ctrl+I)">
          <em className="font-serif">I</em>
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnBase} ${editor.isActive('underline') ? btnActive : btnInactive}`} title="Underline (Ctrl+U)">
          <span className="underline decoration-2 underline-offset-2">U</span>
        </button>
      </div>

      <Divider />

      {/* Structure Group */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 1 }) ? btnActive : btnInactive}`}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? btnActive : btnInactive}`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : btnInactive}`}>List</button>
      </div>
      
      <Divider />

      {/* Color Group */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={() => editor.chain().focus().run()}
          title="Select text to change its color"
          className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#3f3f3f] flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: editor?.getAttributes('textStyle')?.color || '#f5f5f5' }}
        >
          <span className="text-[10px] font-extrabold mix-blend-difference text-white">A</span>
        </button>
      </div>

      <Divider />

      {/* Extra Tools Group */}
      <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
        <FileUploadButton editor={editor} />
        <SpeechButton editor={editor} />
      </div>
    </div>
  )
}
