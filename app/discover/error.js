'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

export default function DiscoverError({ error, reset }) {
  useEffect(() => {
    // Capture the error in Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Failed to load discover page
          </h1>

          <p className="text-gray-600 mb-8">
            We've been notified and are looking into it.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              Try again
            </button>

            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
