import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ImageUploader from '../components/ImageUploader'
import MetadataEditor from '../components/MetadataEditor'
import { Trash2, MapPin, Camera } from 'lucide-react' 

export default function Dashboard({ session }) {
  const [currentFile, setCurrentFile] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [history, setHistory] = useState([])
  
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
    fetchHistory() 
  }

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

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/history/${recordId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setHistory(history.filter(record => record.id !== recordId))
      }
    } catch (err) {
      console.error("Failed to delete record:", err)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans selection:bg-indigo-500/30">
      
      {/* The Floating Glass Navigation Bar */}
      <div className="pt-6 px-4 sm:px-6 lg:px-8 flex justify-center">
        <nav className="w-full max-w-5xl rounded-full bg-[#18181B]/80 backdrop-blur-md border border-white/10 shadow-2xl px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/20 rounded-full">
              <Camera className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">EXIF<span className="text-indigo-400">Editor</span></h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-zinc-400 hidden sm:block">
              {session.user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
            >
              Log Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {!currentFile ? (
            <div className="rounded-2xl bg-[#18181B] border border-white/10 p-8 shadow-xl">
              <div className="max-w-2xl mx-auto py-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Initialize Workspace</h2>
                <p className="mt-2 text-zinc-400 mb-8">Drop classified imagery here to extract telemetry data.</p>
                <ImageUploader onUploadSuccess={handleUploadSuccess} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <h2 className="text-lg font-medium text-zinc-200 font-mono text-sm">{currentFile.name}</h2>
                </div>
                <button onClick={handleReset} className="text-sm text-zinc-400 hover:text-indigo-400 font-medium transition-colors">
                  Close Workspace ×
                </button>
              </div>
              <MetadataEditor file={currentFile} initialMetadata={metadata} session={session} />
            </div>
          )}

        {/* The History Section */}
        <div className="rounded-2xl bg-[#18181B] border border-white/10 p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-medium text-white border-b border-white/10 pb-4 mb-4 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
            Telemetry Log
          </h3>
          
          {history.length === 0 ? (
            <p className="text-zinc-500 text-sm py-4 text-center">No classified logs found in the database.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {history.map((record) => (
                <li key={record.id} className="py-4 flex justify-between items-center group hover:bg-white/[0.02] -mx-4 px-4 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-zinc-200">{record.filename}</p>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">
                      <span className="text-indigo-400/70">GPS:</span> {record.original_lat || 'N/A'}, {record.original_lon || 'N/A'} <span className="text-zinc-600">→</span> {record.modified_lat || 'N/A'}, {record.modified_lon || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-zinc-500 font-mono">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Purge record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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