'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import Avatar from './ui/Avatar'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'

const COMMENT_LIMIT = 20
const MAX_COMMENT_LENGTH = 500

/**
 * CommentsSection Component
 * Displays and manages comments on a list with pagination
 */
export default function CommentsSection({
  listId,
  onCommentCountChange,
  className = '',
}) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState('')

  // Validate MongoDB ObjectId format
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id)

  // Load comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      if (!listId || !isValidObjectId(listId)) {
        setLoading(false)
        return
      }

      try {
        const response = await api.social.getComments(listId, COMMENT_LIMIT, 0)
        setComments(response.comments || [])
        setHasMore(response.hasMore || false)
        setOffset(COMMENT_LIMIT)
      } catch (err) {
        console.error('Failed to fetch comments:', err)
        setError('Failed to load comments')
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [listId])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const response = await api.social.getComments(listId, COMMENT_LIMIT, offset)
      setComments(prev => [...prev, ...(response.comments || [])])
      setHasMore(response.hasMore || false)
      setOffset(prev => prev + COMMENT_LIMIT)
    } catch (err) {
      console.error('Failed to load more comments:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || submitting || !user) return

    if (newComment.length > MAX_COMMENT_LENGTH) {
      setError(`Comment must be ${MAX_COMMENT_LENGTH} characters or less`)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await api.social.addComment(listId, newComment.trim())
      // Add new comment to the top of the list
      setComments(prev => [response.comment, ...prev])
      setNewComment('')
      onCommentCountChange?.(comments.length + 1)
    } catch (err) {
      console.error('Failed to add comment:', err)
      setError(err.getUserMessage?.() || 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await api.social.deleteComment(commentId)
      setComments(prev => prev.filter(c => c._id !== commentId))
      onCommentCountChange?.(comments.length - 1)
    } catch (err) {
      console.error('Failed to delete comment:', err)
      alert('Failed to delete comment. Please try again.')
    }
  }

  // Format relative time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const charactersRemaining = MAX_COMMENT_LENGTH - newComment.length
  const showCharacterWarning = newComment.length > MAX_COMMENT_LENGTH - 100

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <svg className="w-6 h-6 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <Avatar
              src={user.avatarUrl}
              name={user.displayName || user.username}
              size="sm"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                disabled={submitting}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {showCharacterWarning && (
                    <span className={`text-xs ${charactersRemaining < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {charactersRemaining} characters remaining
                    </span>
                  )}
                  {error && (
                    <span className="text-xs text-red-500">{error}</span>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || submitting || charactersRemaining < 0}
                  loading={submitting}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600 text-sm">
            <a href="/login" className="text-cyan-500 hover:text-cyan-600 font-medium">Log in</a>
            {' '}to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          title="No comments yet"
          description="Be the first to share your thoughts!"
        />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar
                src={comment.user?.avatarUrl}
                name={comment.user?.displayName || comment.user?.username}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm truncate">
                    {comment.user?.displayName || comment.user?.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                  {comment.text}
                </p>
                {user && user._id === comment.user?._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="mt-1 text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                loading={loadingMore}
              >
                Load more comments
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
