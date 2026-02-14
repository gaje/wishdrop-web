'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'

/**
 * ProductModal - Modal overlay with product details
 * Large image, title, price, merchant, social proof (>= 3)
 * Actions: Add to List, View Details, Buy
 * Escape key closes, fade+scale animation
 */
export default function ProductModal({ product, isOpen, onClose }) {
  const router = useRouter()
  const { user } = useAuth()
  const [imageError, setImageError] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const handleImageError = () => {
    setImageError(true)
  }

  const handleAddToList = () => {
    if (!user) {
      router.push(`/login?redirect=/discover`)
      return
    }
    // Navigate to create page with pre-filled product data
    const params = new URLSearchParams({
      url: product.normalizedUrl,
      title: product.title,
    })
    if (product.price) params.append('price', product.price)
    router.push(`/create?${params.toString()}`)
  }

  const handleViewDetails = () => {
    router.push(`/product/${encodeURIComponent(product.normalizedUrl)}`)
  }

  const handleBuy = () => {
    if (product.affiliateCode) {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
      window.open(`${API_BASE}/r/${product.affiliateCode}`, '_blank', 'noopener,noreferrer')
    } else if (product.normalizedUrl) {
      window.open(product.normalizedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const hasImage = product.image && !imageError
  const showSocialProof = product.stats && (product.stats.wishlistCount >= 3 || product.stats.videoCount >= 3)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Large Product Image */}
        <div className="relative w-full aspect-square bg-slate-100 rounded-t-2xl overflow-hidden">
          {hasImage ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 512px"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-20 h-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Social Proof Overlay */}
          {showSocialProof && (
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.stats.wishlistCount >= 3 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-sm font-semibold text-slate-700">
                  <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {product.stats.wishlistCount} wishlisted
                </span>
              )}
              {product.stats.videoCount >= 3 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-sm font-semibold text-slate-700">
                  <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  {product.stats.videoCount} drops
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{product.title}</h2>

          {/* Price & Merchant */}
          <div className="flex items-center justify-between mb-4">
            {product.price ? (
              <span className="text-3xl font-bold text-teal-600">${product.price.toFixed(2)}</span>
            ) : (
              <span className="text-sm text-slate-400">Price unavailable</span>
            )}
            {product.merchant && (
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {product.merchant}
              </span>
            )}
          </div>

          {/* Description (if available) */}
          {product.description && (
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddToList}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add to My List
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleViewDetails}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Details
              </button>

              {(product.affiliateCode || product.normalizedUrl) && (
                <button
                  onClick={handleBuy}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
