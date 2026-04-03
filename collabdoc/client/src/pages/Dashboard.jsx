import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 mb-6">Dashboard coming in Part 3</p>
        <button
          onClick={logout}
          className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
