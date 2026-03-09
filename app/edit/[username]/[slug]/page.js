'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuth } from '@/lib/AuthContext'
import api, { APIError } from '@/lib/api'

const OCCASIONS = [
  'Birthday',
  'Holiday',
  'Wedding',
  'Baby Shower',
  'Anniversary',
  'Graduation',
  'Housewarming',
  'Just Because',
  'Other',
]

export default function EditListPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { username, slug } = params

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    occasion: '',
    privacy: 'public',
  })
  const [listId, setListId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && username && slug) {
      loadList()
    }
  }, [user, authLoading, username, slug, router])

  const loadList = async () => {
    try {
      setLoading(true)
      const response = await api.lists.getPublic(username, slug)

      if (!response || !response.list) {
        throw new Error('List not found')
      }

      // Check if user is the owner
      if (user.username !== username) {
        router.push(`/u/${username}/${slug}`)
        return
      }

      setListId(response.list._id)
      setFormData({
        title: response.list.title || '',
        description: response.list.description || '',
        occasion: response.list.occasion || '',
        privacy: response.list.privacy || 'public',
      })
    } catch (error) {
      console.error('Failed to load list:', error)
      setError('Failed to load list')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Please enter a list title')
      return
    }

    setSaving(true)

    try {
      const updateData = {
        title: formData.title,
        description: formData.description || undefined,
        occasion: formData.occasion || undefined,
        privacy: formData.privacy,
      }

      await api.lists.update(listId, updateData)

      // Redirect back to the list (use new slug if title changed)
      router.push(`/u/${username}/${slug}`)
    } catch (err) {
      console.error('Update list error:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to update list. Please try again.')
      }
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50">
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center">
              <span className="text-3xl">✏️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit List</h1>
            <p className="text-gray-600">Update your wishlist details</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                List Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-gray-900"
                placeholder="e.g., Nick's Birthday Wishlist"
                disabled={saving}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors resize-none text-gray-900"
                placeholder="Tell people what this list is for..."
                disabled={saving}
              />
            </div>

            {/* Occasion */}
            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-1">
                Occasion
              </label>
              <select
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-gray-900"
                disabled={saving}
              >
                <option value="">Select an occasion (optional)</option>
                {OCCASIONS.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {occasion}
                  </option>
                ))}
              </select>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy Settings
              </label>
              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={formData.privacy === 'public'}
                    onChange={handleChange}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                    disabled={saving}
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Public</p>
                    <p className="text-sm text-gray-600">Discoverable by anyone. Only your connections can claim.</p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    value="shared"
                    checked={formData.privacy === 'shared'}
                    onChange={handleChange}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                    disabled={saving}
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Shared</p>
                    <p className="text-sm text-gray-600">Only people you share the link with. Anyone with the link can claim.</p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={formData.privacy === 'private'}
                    onChange={handleChange}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                    disabled={saving}
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Private</p>
                    <p className="text-sm text-gray-600">Only you can see this list.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-3">
              <Link
                href={`/u/${username}/${slug}`}
                className="flex-1 text-center px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
