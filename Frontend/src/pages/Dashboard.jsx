import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ImageUploader from '../components/ImageUploader'
import MetadataEditor from '../components/MetadataEditor'

export default function Dashboard({ session }) {
  const [currentFile, setCurrentFile] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [history, setHistory] = useState([]) // New state for history
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleUploadSuccess = (file, extractedData) => {
    setCurrentFile(file)
    setMetadata(extractedData)
  }

  const handleReset = () => {
    setCurrentFile(null)
    setMetadata(null)
    fetchHistory() // Refresh history when they finish an edit
  }

  // --- NEW: Fetch History Function ---
  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/history/${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (err) {
      console.error("Failed to fetch history:", err)
    }
  }

  // Fetch history when the dashboard loads
  useEffect(() => {
    fetchHistory()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600">EXIF Editor</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{session.user.email}</span>
              <button onClick={handleSignOut} className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Editor Section */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
          {!currentFile ? (
            <div className="max-w-2xl mx-auto py-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload an Image</h2>
              <ImageUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">File: {currentFile.name}</h2>
                <button onClick={handleReset} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  ← Back to Upload
                </button>
              </div>
              {/* Pass the session into the editor! */}
              <MetadataEditor file={currentFile} initialMetadata={metadata} session={session} />
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-4 mb-4">Your Edit History</h3>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">You haven't edited any images yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {history.map((record) => (
                <li key={record.id} className="py-4 flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{record.filename}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Moved from: {record.original_lat || 'N/A'}, {record.original_lon || 'N/A'} → {record.modified_lat || 'N/A'}, {record.modified_lon || 'N/A'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}