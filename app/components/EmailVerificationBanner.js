'use client'

import { useState, useEffect } from 'react'
import { getAuthToken } from '../../lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export default function EmailVerificationBanner() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setShow(false)
        return
      }

      const response = await fetch(`${API_BASE}/api/auth/verification-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        setShow(false)
        return
      }

      const data = await response.json()

      // Show banner if email is not verified and not dismissed
      if (!data.emailVerified && !dismissed) {
        setShow(true)
      }
    } catch (error) {
      console.error('Failed to check verification status:', error)
      setShow(false)
    }
  }

  const handleResend = async () => {
    try {
      setLoading(true)
      setMessage('')

      const token = getAuthToken()
      if (!token) {
        setMessage('Please sign in to resend verification email')
        return
      }

      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email')
      }

      setMessage(data.message || 'Verification email sent!')
    } catch (error) {
      console.error('Resend verification error:', error)
      setMessage(error.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📧</span>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">
                  Please verify your email address
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Check your inbox for a verification link, or click below to resend.
                </p>
                {message && (
                  <p className={`text-sm mt-2 ${message.includes('sent') || message.includes('Sent') ? 'text-green-700' : 'text-red-700'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={handleResend}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-yellow-800 hover:text-yellow-900"
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
