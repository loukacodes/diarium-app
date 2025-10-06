import { useState } from 'react'
import './App.css'

function App() {
  const [apiResponse, setApiResponse] = useState<string>('')
  const [diaryEntry, setDiaryEntry] = useState<string>('')
  const [mood, setMood] = useState<string>('')

  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:3000')
      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setApiResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const analyzeMood = () => {
    // Mock mood analysis - in real app this would call the backend
    const moods = ['Happy', 'Sad', 'Excited', 'Calm', 'Stressed', 'Grateful']
    const randomMood = moods[Math.floor(Math.random() * moods.length)]
    setMood(randomMood)
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      style={{
        backgroundColor: '#f0f9ff',
        minHeight: '100vh',
        padding: '1rem',
      }}
    >
      <div
        className="max-w-4xl mx-auto space-y-6"
        style={{
          maxWidth: '56rem',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900" style={{ color: '#1f2937' }}>
            Diarium
          </h1>
          <p className="text-xl text-gray-600" style={{ color: '#4b5563' }}>
            Write – Track – Grow
          </p>
          <p className="text-gray-500" style={{ color: '#6b7280' }}>
            Your personal diary with AI-powered mood analysis
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">✅</span>
              <h3 className="text-lg font-semibold">Backend Status</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">API Server running on port 3000</p>
            <button
              onClick={testAPI}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Test API Connection
            </button>
            {apiResponse && (
              <pre className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {apiResponse}
              </pre>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">✅</span>
              <h3 className="text-lg font-semibold">Frontend Status</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">React + Vite + Tailwind CSS</p>
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
              React 18.3.1
            </span>
          </div>
        </div>

        {/* Diary Entry Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Write Your Diary Entry</h3>
          <p className="text-gray-600 mb-4">
            Express your thoughts and feelings. Our AI will analyze your mood.
          </p>
          <textarea
            placeholder="How was your day? What are you thinking about?"
            value={diaryEntry}
            onChange={(e) => setDiaryEntry(e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={analyzeMood}
              disabled={!diaryEntry.trim()}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
            >
              Analyze Mood
            </button>
            <button
              disabled={!diaryEntry.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
            >
              Save Entry
            </button>
          </div>
          {mood && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Detected Mood:</strong>
                <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                  {mood}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Upcoming Features</h3>
          <p className="text-gray-600 mb-4">
            Here's what we'll build in the next development phases
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Authentication</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User registration and login</li>
                <li>• JWT token authentication</li>
                <li>• Secure password hashing</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Diary Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create, edit, delete entries</li>
                <li>• Search and filter entries</li>
                <li>• Rich text editor</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Mood Analysis</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI-powered mood detection</li>
                <li>• Mood trend charts</li>
                <li>• Emotional insights</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Data & Security</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• MongoDB database integration</li>
                <li>• Data encryption</li>
                <li>• Backup and export</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>🚀 Ready for development! Next: Authentication & Database setup</p>
        </div>
      </div>
    </div>
  );
}

export default App