'use client'

import { useState } from 'react'
import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'account', label: 'Account Issue' },
]

const PLACEHOLDERS = {
  general: 'Tell us what\'s on your mind...',
  bug: 'Please describe what happened, what you expected, and any steps to reproduce the issue...',
  feature: 'Describe the feature you\'d like to see and why it would be useful...',
  account: 'Please describe your account issue. Include your username if relevant...',
}

export default function ContactPage() {
  const { user } = useAuth()
  const [category, setCategory] = useState('')
  const [name, setName] = useState(user?.displayName || user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [touched, setTouched] = useState(false)

  // Pre-fill when user loads after auth resolves
  useState(() => {
    if (user) {
      setName(prev => prev || user.displayName || user.username || '')
      setEmail(prev => prev || user.email || '')
    }
  }, [user])

  function validate() {
    const errs = {}
    if (!category) errs.category = 'Please select a category'
    if (!name.trim()) errs.name = 'Please enter your name'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!message.trim()) {
      errs.message = 'Please enter a message'
    } else if (message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setApiError(null)

    try {
      await api.contactForm.send(category, name.trim(), email.trim(), message.trim())
      setSubmittedEmail(email.trim())
      setSubmitted(true)
    } catch (err) {
      setApiError('We couldn\'t send your message. Please try again or email us directly at support@wishdrop.app.')
    } finally {
      setLoading(false)
    }
  }

  function handleBlur(field) {
    if (!touched) return
    const errs = validate()
    setErrors(prev => ({ ...prev, [field]: errs[field] || undefined }))
  }

  function resetForm() {
    setCategory('')
    setName(user?.displayName || user?.username || '')
    setEmail(user?.email || '')
    setMessage('')
    setErrors({})
    setApiError(null)
    setSubmitted(false)
    setTouched(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-600">Get in Touch</h1>
        </div>
        <p className="text-gray-500 text-lg">
          Have a question, found a bug, or want to suggest a feature? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Thanks for reaching out! We&apos;ve received your message and will get back to you at{' '}
                <span className="font-medium text-gray-700">{submittedEmail}</span> within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" onClick={resetForm}>Send Another Message</Button>
                <Link href="/">
                  <Button variant="ghost">Back to Home</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* API Error Banner */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" role="alert">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Something went wrong</p>
                    <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                  What can we help with? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onBlur={() => handleBlur('category')}
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 appearance-none bg-white ${
                      errors.category
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                    } ${!category ? 'text-gray-400' : 'text-gray-900'}`}
                  >
                    <option value="" disabled>Select a category...</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.category && <p className="mt-1.5 text-sm text-red-500">{errors.category}</p>}
              </div>

              {/* Name */}
              <Input
                label="Your name"
                required
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                error={errors.name}
                disabled={loading}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              {/* Email */}
              <Input
                label="Email address"
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                error={errors.email}
                helperText={!errors.email ? "We'll reply to this address. We never share your email." : undefined}
                disabled={loading}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => handleBlur('message')}
                  disabled={loading}
                  placeholder={PLACEHOLDERS[category] || PLACEHOLDERS.general}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 resize-none sm:min-h-[180px] ${
                    errors.message
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
                <div className="flex justify-between mt-1.5">
                  {errors.message ? (
                    <p className="text-sm text-red-500">{errors.message}</p>
                  ) : <span />}
                  <span className={`text-xs ${
                    message.length >= 2000 ? 'text-red-500' : message.length >= 1800 ? 'text-amber-500' : 'text-gray-400'
                  }`}>
                    {message.length} / 2,000
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full sm:w-auto"
                >
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Alternative Contact */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 text-center text-sm text-gray-500">
        <p>
          Prefer email? Reach us directly at{' '}
          <a href="mailto:support@wishdrop.app" className="text-cyan-600 hover:text-cyan-700 font-medium">
            support@wishdrop.app
          </a>
        </p>
        <p className="mt-1">We typically respond within 24 hours.</p>
      </div>
    </div>
  )
}
