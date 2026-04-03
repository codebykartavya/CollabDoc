import { useParams, Link } from 'react-router-dom'

export default function EditorPage() {
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Editor</h1>
        <p className="text-gray-500 mb-4">Document: {id}</p>
        <p className="text-gray-400 mb-6">Full editor coming in Part 3</p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
