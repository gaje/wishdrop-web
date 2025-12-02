'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Button from './ui/Button'

/**
 * FollowButton Component
 * Button to follow/unfollow a user with loading states
 */
export default function FollowButton({
  userId,
  initialIsFollowing = null,
  onFollowChange,
  size = 'sm',
  className = '',
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(initialIsFollowing === null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch initial follow status if not provided
  useEffect(() => {
    if (initialIsFollowing !== null) {
      setIsFollowing(initialIsFollowing)
      setLoading(false)
      return
    }

    const fetchFollowStatus = async () => {
      try {
        const response = await api.follow.getFollowStatus(userId)
        setIsFollowing(response.isFollowing)
      } catch (err) {
        console.error('Failed to fetch follow status:', err)
        setIsFollowing(false)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchFollowStatus()
    }
  }, [userId, initialIsFollowing])

  const handleClick = async () => {
    if (actionLoading || !userId) return

    setActionLoading(true)
    const previousState = isFollowing

    // Optimistic update
    setIsFollowing(!isFollowing)

    try {
      if (previousState) {
        await api.follow.unfollowUser(userId)
      } else {
        await api.follow.followUser(userId)
      }
      onFollowChange?.(!previousState)
    } catch (err) {
      console.error('Failed to update follow status:', err)
      // Revert on error
      setIsFollowing(previousState)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled
        className={className}
      >
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </Button>
    )
  }

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size={size}
      onClick={handleClick}
      disabled={actionLoading}
      className={`transition-all duration-200 ${className}`}
    >
      {actionLoading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : isFollowing ? (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Following
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Follow
        </>
      )}
    </Button>
  )
}
