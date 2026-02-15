'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import Header from '@/components/Header'

/**
 * Video Player Component with HLS Support
 */
function VideoPlayer({ video, isActive, onLike, onUnlike }) {
  const videoRef = useRef(null)
  const [isLiked, setIsLiked] = useState(video.hasLiked)
  const [likeCount, setLikeCount] = useState(video.likeCount)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !isPlaying) {
        videoRef.current.play().catch(err => console.log('Autoplay prevented:', err))
      } else if (!isActive && isPlaying) {
        videoRef.current.pause()
      }
    }
  }, [isActive, isPlaying])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)

    return () => {
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
    }
  }, [])

  const handleLikePress = async () => {
    try {
      if (isLiked) {
        await onUnlike(video._id)
        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        await onLike(video._id)
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden group" style={{ aspectRatio: '9/16' }}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.playbackUrl}
        loop
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleTogglePlay}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={handleTogglePlay}
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Video Info */}
      <div className="absolute bottom-4 left-4 right-20 text-white">
        <p className="font-bold text-lg mb-2">
          @{video.uploader?.username || 'unknown'}
        </p>
        {video.wishlistItem && (
          <div className="inline-flex items-center gap-2 bg-cyan-500/90 px-3 py-1.5 rounded-full text-sm font-semibold">
            <span>🎁</span>
            <span>{video.wishlistItem.title}</span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-6">
        {/* Like Button */}
        <button
          onClick={handleLikePress}
          className="flex flex-col items-center gap-1 group/btn"
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
            <svg
              className={`w-7 h-7 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white text-sm font-semibold">{likeCount}</span>
        </button>

        {/* View Count */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span className="text-white text-sm font-semibold">{video.viewCount || 0}</span>
        </div>

        {/* Share Button */}
        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Status Badge (for non-ready videos) */}
      {video.status !== 'ready' && (
        <div className="absolute top-4 left-4 bg-yellow-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {video.status === 'processing' ? 'Processing...' : 'Uploading...'}
        </div>
      )}
    </div>
  )
}

/**
 * Drops Feed Page
 */
export default function DropsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadVideos()
    }
  }, [user])

  // Track view when active video changes
  useEffect(() => {
    if (videos[activeIndex]) {
      trackView(videos[activeIndex]._id)
    }
  }, [activeIndex, videos])

  const loadVideos = async (loadMore = false) => {
    try {
      setLoading(true)
      const response = await api.videos.getFeed(loadMore ? cursor : null, 10)

      if (loadMore) {
        setVideos(prev => [...prev, ...response.videos])
      } else {
        setVideos(response.videos)
      }

      setCursor(response.nextCursor)
      setHasMore(!!response.nextCursor)
    } catch (err) {
      console.error('Failed to load videos:', err)
      setError('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const trackView = async (videoId) => {
    try {
      await api.videos.trackView(videoId)
    } catch (error) {
      // Silently fail - view tracking is non-critical
      console.log('View tracking failed:', error)
    }
  }

  const handleLike = async (videoId) => {
    await api.videos.like(videoId)
  }

  const handleUnlike = async (videoId) => {
    await api.videos.unlike(videoId)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Drops</h1>
            <p className="text-gray-600">Watch short videos from the Wishdrop community</p>
          </div>
          <Link
            href="/drops/upload"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Upload Video
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Videos Grid */}
        {loading && videos.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No videos yet</p>
            <p className="text-gray-600 mb-6">Be the first to share a video!</p>
            <Link
              href="/drops/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Video
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <VideoPlayer
                  key={video._id}
                  video={video}
                  isActive={index === activeIndex}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => loadVideos(true)}
                  disabled={loading}
                  className="px-8 py-3 bg-white text-cyan-600 font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-cyan-200"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
