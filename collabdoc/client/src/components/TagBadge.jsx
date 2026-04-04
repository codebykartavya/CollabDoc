import React from 'react'

const TAG_COLORS = {
  Work: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Personal: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Project: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Research: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default function TagBadge({ tag }) {
  const colors = TAG_COLORS[tag] || TAG_COLORS.Other

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {tag}
    </span>
  )
}
