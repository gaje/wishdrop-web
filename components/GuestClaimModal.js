'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { getOrCreateGuestToken } from '@/lib/guestToken'

/**
 * GuestClaimModal
 * Allows unauthenticated guests to claim an item on a shared list by entering their name.
 */
export default function GuestClaimModal({ isOpen, onClose, item, onSuccess }) {
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = guestName.trim()
    if (!name) {
      setError('Please enter your name.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const guestToken = getOrCreateGuestToken()
      await api.items.guestClaim(item._id, guestToken, name)
      onSuccess?.()
      handleClose()
    } catch (err) {
      if (err.status === 409) {
        setError('This item has already been claimed.')
      } else if (err.status === 403) {
        setError('Guest claiming is only available on shared lists.')
      } else {
        setError(err.getUserMessage?.() || 'Failed to claim item. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setGuestName('')
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Claim This Item</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item name preview */}
        {item?.title && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2">
            {item.title}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="guest-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Your name
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              disabled={loading}
              maxLength={100}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-50 disabled:opacity-70 transition-all"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              The list owner will see your name next to this item.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !guestName.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Claiming...' : 'Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
