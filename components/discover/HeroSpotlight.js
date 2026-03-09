'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

/**
 * HeroSpotlight - Auto-rotating carousel for featured products
 * Displays full-width hero slides with image left, text right
 * Auto-rotates every 5 seconds, manual navigation via arrows
 */
export default function HeroSpotlight({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Return null if no items
  if (!items || items.length === 0) return null

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, items.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentItem = items[currentIndex]

  return (
    <div className="relative w-full bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-3xl overflow-hidden shadow-lg border border-purple-100 group">
      <div className="relative h-[400px] max-h-[400px]">
        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-8 md:py-0">
          {/* Text Content - Left/Top */}
          <div className="flex-1 z-10 text-center md:text-left md:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-xs font-semibold text-violet-700 mb-4">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.56 21a1 1 0 01-.46-.11L12 18.22l-5.1 2.67a1 1 0 01-1.45-1.06l1-5.63-4.12-4a1 1 0 01-.25-1 1 1 0 01.81-.68l5.7-.83 2.51-5.13a1 1 0 011.8 0l2.54 5.12 5.7.83a1 1 0 01.81.68 1 1 0 01-.25 1l-4.12 4 1 5.63a1 1 0 01-.4 1 1 1 0 01-.62.21z"/>
              </svg>
              Featured Product
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 line-clamp-2">
              {currentItem.title}
            </h2>
            {(typeof currentItem.price === 'object' ? currentItem.price.amount : currentItem.price) && (
              <p className="text-2xl md:text-3xl font-bold text-violet-600 mb-4">
                ${typeof currentItem.price === 'object' ? currentItem.price.amount?.toFixed(2) : Number(currentItem.price).toFixed(2)}
              </p>
            )}
            {currentItem.stats && (currentItem.stats.wishlistCount >= 3 || currentItem.stats.videoCount >= 3) && (
              <div className="flex items-center gap-4 justify-center md:justify-start mb-6">
                {currentItem.stats.wishlistCount >= 3 && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                    <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {currentItem.stats.wishlistCount} wishlisted
                  </span>
                )}
                {currentItem.stats.videoCount >= 3 && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                    <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    {currentItem.stats.videoCount} drops
                  </span>
                )}
              </div>
            )}
            <Link
              href={currentItem.slug ? `/product/${currentItem.slug}` : `/product/${encodeURIComponent(currentItem.normalizedUrl)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
            >
              View Details
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Image - Right/Bottom */}
          <div className="relative w-full md:w-1/2 h-64 md:h-80 mt-6 md:mt-0 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            {currentItem.image ? (
              <Image
                src={currentItem.image}
                alt={currentItem.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <img src="/logo-w.png" alt="Wishdrop" className="w-20 opacity-40 object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows - Visible on hover */}
        {items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="Previous"
            >
              <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="Next"
            >
              <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-slate-900'
                  : 'w-2 bg-slate-400 hover:bg-slate-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
