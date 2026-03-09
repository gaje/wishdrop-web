'use client'

import { useState, useEffect } from 'react'
import { Link } from 'next-view-transitions'

import api from '@/lib/api'

export default function CommunityGuidelines() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const data = await api.legal.getCommunityGuidelines()
      setContent(data)
    } catch (err) {
      console.error('Failed to load community guidelines:', err)
      setError('Failed to load community guidelines')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero - Teal/Blue gradient for community/people theme */}
      <div className="bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {/* People/group icon */}
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3">Community Guidelines</h1>
          {content && (
            <p className="text-white/80">Last updated: {content.lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadContent}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : content ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
            {content.sections.map((section, index) => (
              <div key={index} className={index > 0 ? 'mt-10' : ''}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
