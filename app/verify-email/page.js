'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setStatus('success')
      setMessage(data.message || 'Email verified successfully!')

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
      setMessage(error.message || 'Failed to verify email')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
          {status === 'verifying' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verifying your email...
              </h1>
              <p className="text-lg text-gray-600">
                Please wait while we confirm your email address
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Email Verified!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you to the home page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-6">❌</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {message}
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                >
                  Log in
                </Link>
                <Link
                  href="/"
                  className="px-8 py-4 border-2 border-teal-500 text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-colors"
                >
                  Go Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
