'use client'

import { useState, useEffect } from 'react'
import { Link } from 'next-view-transitions'

import api from '@/lib/api'

export default function TermsOfService() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const data = await api.legal.getTermsOfService()
      setContent(data)
    } catch (err) {
      console.error('Failed to load terms of service:', err)
      setError('Failed to load terms of service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          {content && (
            <p className="text-white/80">Last updated: {content.lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadContent}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
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
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
