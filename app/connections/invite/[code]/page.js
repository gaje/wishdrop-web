'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'


export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && code) {
      acceptInvite()
    }
  }, [user, code])

  const checkAuth = async () => {
    try {
      const data = await api.auth.me()
      setUser(data.user)
    } catch (err) {
      // Not authenticated, redirect to login with return URL
      router.push(`/login?redirect=/connections/invite/${code}`)
    }
  }

  const acceptInvite = async () => {
    setLoading(true)
    setError(null)

    try {
      await api.connections.acceptInvite(code)
      setSuccess(true)
      setTimeout(() => {
        router.push('/connections')
      }, 2000)
    } catch (err) {
      setError(err.getUserMessage?.() || 'Failed to accept invite')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {loading && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Accepting Invite...
              </h2>
              <p className="text-gray-600">Please wait</p>
            </>
          )}

          {success && (
            <>
              <div className="text-green-600 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connection Accepted!
              </h2>
              <p className="text-gray-600">
                Redirecting to your connections...
              </p>
            </>
          )}

          {error && (
            <>
              <div className="text-red-600 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Oops!
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/connections')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Connections
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
