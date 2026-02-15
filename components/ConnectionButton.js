'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function ConnectionButton({ userId, onStatusChange }) {
  const [status, setStatus] = useState(null)
  const [connectionId, setConnectionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [userId])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const data = await api.connections.checkStatus(userId)
      setStatus(data.status)
      setConnectionId(data.connectionId || null)
    } catch (err) {
      console.error('Failed to check connection status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    try {
      await api.connections.request(userId)
      setStatus('pending_sent')
      onStatusChange?.('pending_sent')
    } catch (err) {
      console.error('Failed to send connection request:', err)
      alert(err.getUserMessage?.() || 'Failed to send connection request')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    setLoading(true)
    try {
      await api.connections.acceptRequest(connectionId)
      setStatus('connected')
      onStatusChange?.('connected')
    } catch (err) {
      console.error('Failed to accept connection:', err)
      alert(err.getUserMessage?.() || 'Failed to accept connection')
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    try {
      await api.connections.rejectRequest(connectionId)
      setStatus(null)
      setConnectionId(null)
      onStatusChange?.(null)
    } catch (err) {
      console.error('Failed to decline connection:', err)
      alert(err.getUserMessage?.() || 'Failed to decline connection')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Remove connection?')) return

    setLoading(true)
    setShowDropdown(false)
    try {
      await api.connections.remove(userId)
      setStatus(null)
      setConnectionId(null)
      onStatusChange?.(null)
    } catch (err) {
      console.error('Failed to remove connection:', err)
      alert(err.getUserMessage?.() || 'Failed to remove connection')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
      >
        Loading...
      </button>
    )
  }

  if (!status) {
    return (
      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Connect
      </button>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed"
      >
        Requested
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
        >
          Decline
        </button>
      </div>
    )
  }

  if (status === 'connected') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
        >
          Connected
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={handleRemove}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition rounded-lg"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
