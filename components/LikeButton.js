'use client'

import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'

/**
 * LikeButton Component
 * Animated heart button for liking/unliking lists
 */
export default function LikeButton({
  listId,
  initialIsLiked = null,
  initialLikeCount = 0,
  onLikeChange,
  showCount = true,
  size = 'md',
  className = '',
}) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(initialIsLiked === null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef(null)

  // Validate MongoDB ObjectId format
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id)

  // Fetch initial like status if not provided
  useEffect(() => {
    if (initialIsLiked !== null) {
      setIsLiked(initialIsLiked)
      setLikeCount(initialLikeCount)
      setLoading(false)
      return
    }

    const fetchLikeStatus = async () => {
      if (!listId || !isValidObjectId(listId)) {
        setLoading(false)
        return
      }

      try {
        const response = await api.social.getLikeStatus(listId)
        setIsLiked(response.isLiked)
        setLikeCount(response.likeCount || 0)
      } catch (err) {
        console.error('Failed to fetch like status:', err)
        setIsLiked(false)
      } finally {
        setLoading(false)
      }
    }

    fetchLikeStatus()
  }, [listId, initialIsLiked, initialLikeCount])

  const handleClick = async () => {
    if (actionLoading || !listId || !isValidObjectId(listId)) return

    setActionLoading(true)
    const previousLiked = isLiked
    const previousCount = likeCount

    // Optimistic update with animation
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1)

    // Trigger animation on like
    if (!isLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
    }

    try {
      if (previousLiked) {
        await api.social.unlikeList(listId)
      } else {
        await api.social.likeList(listId)
      }
      onLikeChange?.(!previousLiked, likeCount + (previousLiked ? -1 : 1))
    } catch (err) {
      console.error('Failed to update like status:', err)
      // Revert on error
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
    } finally {
      setActionLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const iconSize = sizeClasses[size] || sizeClasses.md

  if (loading) {
    return (
      <button
        disabled
        className={`flex items-center gap-1.5 text-gray-400 ${className}`}
      >
        <svg className={`${iconSize} animate-pulse`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={actionLoading}
      className={`flex items-center gap-1.5 transition-all duration-200 focus:outline-none disabled:opacity-50 ${className}`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <span
        className={`transition-transform duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}
      >
        {isLiked ? (
          <svg
            className={`${iconSize} text-red-500 transition-colors duration-200`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ) : (
          <svg
            className={`${iconSize} text-gray-400 hover:text-red-400 transition-colors duration-200`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </span>
      {showCount && likeCount > 0 && (
        <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
          {likeCount}
        </span>
      )}
    </button>
  )
}
