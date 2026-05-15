import { useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'

export default function ImageUploader({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }

    setUploading(true)
    setError(null)

    // Prepare the file to be sent to FastAPI
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Send to our Python backend
      const response = await fetch('https://hamzacodesforu-exif-engine.hf.space/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image on the server.')
      }

      const data = await response.json()
      
      // Pass the raw file and the extracted metadata back to the parent component
      onUploadSuccess(file, data.metadata)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full">
      <label 
        htmlFor="file-upload" 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-indigo-500 animate-spin" />
              <p className="mb-2 text-sm text-gray-500 font-semibold">Extracting Metadata...</p>
            </>
          ) : (
            <>
              <UploadCloud className={`w-10 h-10 mb-3 ${error ? 'text-red-400' : 'text-gray-400'}`} />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">JPEG, PNG, JPG (Max 10MB)</p>
            </>
          )}
        </div>
        <input 
          id="file-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      
      {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}
    </div>
  )
}