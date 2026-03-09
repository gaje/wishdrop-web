'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'


const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_DURATION = 20 // seconds
const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/webm']

export default function VideoUploadPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [visibility, setVisibility] = useState('public')

  const validateFile = (file) => {
    // Check file type
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError('Please upload an MP4, MOV, or WebM video file')
      return false
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 100MB')
      return false
    }

    return true
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)

    // Create preview
    const url = URL.createObjectURL(file)
    setFilePreview(url)
  }

  const handleRemoveFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview)
    }
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setError('')
      setUploadProgress(0)

      // Step 1: Initialize upload
      const { uploadUrl, videoId } = await api.videos.initUpload({
        visibility,
      })

      // Step 2: Upload to Cloudflare
      await api.videos.uploadToCloudflare(
        uploadUrl,
        selectedFile,
        (progress) => {
          setUploadProgress(progress)
        }
      )

      // Success! Redirect to drops feed
      router.push('/drops')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.getUserMessage?.() || 'Failed to upload video. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Video</h1>
          <p className="text-gray-600">Share a video with the Wishdrop community</p>
          <p className="text-sm text-gray-500 mt-2">Max {MAX_DURATION} seconds • MP4, MOV, or WebM • Up to 100MB</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* File Upload Area */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-cyan-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Click to upload a video
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop
                </p>
              </label>
            </div>
          ) : (
            <div>
              {/* Video Preview */}
              <div className="mb-6">
                <video
                  src={filePreview}
                  controls
                  className="w-full rounded-xl bg-black"
                  style={{ maxHeight: '400px' }}
                />
              </div>

              {/* File Info */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 font-semibold"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>

              {/* Visibility Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Visibility
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setVisibility('public')}
                    disabled={uploading}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                      visibility === 'public'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setVisibility('shared')}
                    disabled={uploading}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                      visibility === 'shared'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Shared
                  </button>
                  <button
                    onClick={() => setVisibility('private')}
                    disabled={uploading}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                      visibility === 'private'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                    <span className="text-sm font-semibold text-cyan-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          )}
        </div>

        {/* Back to Drops */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/drops')}
            className="text-cyan-600 hover:text-cyan-700 font-semibold"
          >
            ← Back to Drops
          </button>
        </div>
      </main>
    </div>
  )
}
