import { useState } from 'react'
import { Save, Download, Loader2 } from 'lucide-react'

export default function MetadataEditor({ file, initialMetadata, session }) {
  // Initialize state with the extracted data (or empty strings if null)
  const [formData, setFormData] = useState({
    latitude: initialMetadata?.latitude || '',
    longitude: initialMetadata?.longitude || '',
    timestamp: initialMetadata?.timestamp || '',
    description: initialMetadata?.description || ''
  })
  
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSuccess(false) // Reset success message on edit
  }

  const handleSaveAndDownload = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)
    setSuccess(false)

    // Build the payload for FastAPI
    const payload = new FormData()
    payload.append('file', file)
    if (formData.latitude) payload.append('latitude', formData.latitude)
    if (formData.longitude) payload.append('longitude', formData.longitude)
    if (formData.timestamp) payload.append('timestamp', formData.timestamp)
    if (formData.description) payload.append('description', formData.description)
    // --- NEW: Attach Database Tracking Info ---
    if (session?.user) {
      payload.append('user_id', session.user.id)
      payload.append('user_email', session.user.email)
      if (initialMetadata?.latitude) payload.append('original_lat', initialMetadata.latitude)
      if (initialMetadata?.longitude) payload.append('original_lon', initialMetadata.longitude)
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/modify', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        throw new Error('Failed to modify metadata on the server.')
      }

      // Since the API returns a file directly, we process it as a blob
      const blob = await response.blob()
      
      // Create a temporary link to trigger the browser download
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      // Name the new file
      link.download = `modified_${file.name}` 
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      // Cleanup the URL memory
      window.URL.revokeObjectURL(downloadUrl)
      setSuccess(true)

    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Edit EXIF Data</h3>
        <p className="text-sm text-gray-500">Update the coordinates and details, then download your new image.</p>
      </div>
      
      <form onSubmit={handleSaveAndDownload} className="p-6 space-y-6">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
        {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">✅ Success! Your modified image has been downloaded.</div>}

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          {/* Latitude */}
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium leading-6 text-gray-900">Latitude (Decimal)</label>
            <div className="mt-2">
              <input
                type="number"
                step="any"
                name="latitude"
                id="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="e.g. 48.8584"
              />
            </div>
          </div>

          {/* Longitude */}
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium leading-6 text-gray-900">Longitude (Decimal)</label>
            <div className="mt-2">
              <input
                type="number"
                step="any"
                name="longitude"
                id="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="e.g. 2.2945"
              />
            </div>
          </div>

          {/* Timestamp */}
          <div className="sm:col-span-2">
            <label htmlFor="timestamp" className="block text-sm font-medium leading-6 text-gray-900">EXIF Timestamp</label>
            <div className="mt-2">
              <input
                type="text"
                name="timestamp"
                id="timestamp"
                value={formData.timestamp}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 font-mono focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="YYYY:MM:DD HH:MM:SS"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Must follow EXIF exact formatting: YYYY:MM:DD HH:MM:SS</p>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Image Description</label>
            <div className="mt-2">
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Add an internal EXIF description..."
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <><Download className="w-4 h-4" /> Save & Download Image</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}