import React from 'react'

export default function PresenceStrip({ users }) {
  const displayUsers = users.slice(0, 5)
  const remaining = users.length - 5

  return (
    <div className="flex items-center">
      {displayUsers.map((u, i) => (
        <div
          key={u.userId + i}
          className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0 shadow-sm transition-transform hover:z-10 hover:-translate-y-1"
          style={{ backgroundColor: u.color }}
          title={u.userName}
        >
          <span className="text-xs font-semibold text-white uppercase">
            {u.userName ? u.userName.charAt(0) : '?'}
          </span>
        </div>
      ))}
      {remaining > 0 && (
        <div className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white -ml-2 bg-gray-100 shadow-sm z-0">
          <span className="text-xs font-semibold text-gray-600">+{remaining}</span>
        </div>
      )}
    </div>
  )
}
