import { useState, useEffect, useCallback } from 'react'

const COLORS = [
  '#111827', // Black
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899'  // Pink
]

export default function ColorPicker({ editor }) {
  const [showPicker, setShowPicker] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    if (!editor || editor.isDestroyed) return

    const { from, to } = editor.state.selection
    const hasSelection = from !== to

    if (!hasSelection) {
      setShowPicker(false)
      return
    }

    setShowPicker(true)

    // Calculate position using midpoint of selection
    const { view } = editor
    const start = view.coordsAtPos(from)
    const end = view.coordsAtPos(to)
    const midX = (start.left + end.right) / 2

    setPosition({
      top: start.top - 55 + window.scrollY,
      left: midX + window.scrollX
    })
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.on('selectionUpdate', updatePosition)
    editor.on('transaction', updatePosition)
    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('transaction', updatePosition)
    }
  }, [editor, updatePosition])

  // ✅ THE FIX — store selection, then apply color
  function applyColor(hex) {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor
      .chain()
      .setTextSelection({ from, to }) // restore selection explicitly
      .setColor(hex)                   // then apply color
      .run()
  }

  function removeColor() {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor
      .chain()
      .setTextSelection({ from, to })
      .unsetColor()
      .run()
  }

  if (!showPicker) return null

  const currentColor = editor.getAttributes('textStyle').color || '#111827'

  return (
    <div
      className="fixed z-50 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-2xl px-3 py-2 flex items-center gap-2 transform -translate-x-1/2 transition-colors duration-300"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="text-sm text-gray-500 dark:text-[#a1a1aa] font-medium mr-1 select-none transition-colors duration-300">
        Color:
      </span>

      {COLORS.map((hexColor) => (
        <button
          key={hexColor}
          onMouseDown={(e) => {
            e.preventDefault() // ✅ prevent focus loss before applyColor
            applyColor(hexColor)
          }}
          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 flex-shrink-0 ${currentColor === hexColor
              ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-[#141414]'
              : ''
            }`}
          style={{ backgroundColor: hexColor }}
          title={hexColor}
        />
      ))}

      <div className="w-px h-5 bg-gray-200 dark:bg-[#2a2a2a] mx-1 transition-colors duration-300" />

      <button
        onMouseDown={(e) => {
          e.preventDefault() // ✅ prevent focus loss before removeColor
          removeColor()
        }}
        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#3f3f3f] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2a2a2a] flex-shrink-0 transition-colors duration-300"
        title="Remove color"
      >
        <span className="text-gray-500 dark:text-[#a1a1aa] text-xs font-bold leading-none select-none transition-colors duration-300">
          ✕
        </span>
      </button>

      {/* Down arrow */}
      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#141414] border-r border-b border-gray-200 dark:border-[#2a2a2a] transform rotate-45 transition-colors duration-300" />
    </div>
  )
}