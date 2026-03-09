'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'

/**
 * ProductModal - Modal overlay with product details
 * Large image, title, price, merchant, social proof (>= 3)
 * Cross-retailer display ("Also available at...")
 * Actions: Add to List, View Details, Buy
 * User corrections: Report wrong matches, suggest metadata edits
 * Escape key closes, fade+scale animation
 */
export default function ProductModal({ product, isOpen, onClose }) {
  const router = useRouter()
  const { user } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [fullProduct, setFullProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [correctionMessage, setCorrectionMessage] = useState('')

  // Fetch full product data when modal opens
  useEffect(() => {
    if (isOpen && product?.normalizedUrl) {
      setLoading(true)
      setFullProduct(null)
      setImageError(false)
      api.products.getByUrl(product.normalizedUrl)
        .then(data => {
          setFullProduct(data)
        })
        .catch(err => {
          console.error('Failed to fetch full product data:', err)
          // Fallback to basic product data
          setFullProduct(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setFullProduct(null)
      setShowCorrectionForm(false)
      setCorrectionMessage('')
    }
  }, [isOpen, product])

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
    const priceAmount = typeof product.price === 'object' ? product.price.amount : product.price
    if (priceAmount) params.append('price', priceAmount)
    router.push(`/create?${params.toString()}`)
  }

  const handleViewDetails = () => {
    router.push(`/product/${encodeURIComponent(product.normalizedUrl)}`)
  }

  const handleBuy = async (retailer = null) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
    const targetRetailer = retailer || getPrimaryRetailer()
    const url = targetRetailer?.url || product.normalizedUrl
    if (!url) return

    // If we already have an affiliate code, use it directly
    if (targetRetailer?.affiliateCode) {
      window.open(`${API_BASE}/r/${targetRetailer.affiliateCode}`, '_blank', 'noopener,noreferrer')
      return
    }
    if (product.affiliateCode) {
      window.open(`${API_BASE}/r/${product.affiliateCode}`, '_blank', 'noopener,noreferrer')
      return
    }

    // Otherwise, rewrite at click time to get affiliate link + tracking
    try {
      const result = await api.affiliate.rewrite(url)
      if (result.code) {
        window.open(`${API_BASE}/r/${result.code}`, '_blank', 'noopener,noreferrer')
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleReportIssue = async () => {
    if (!user) {
      router.push(`/login?redirect=/discover`)
      return
    }
    setShowCorrectionForm(!showCorrectionForm)
  }

  const handleSuggestMetadata = async (field, value) => {
    if (!user) {
      router.push(`/login?redirect=/discover`)
      return
    }
    try {
      await api.corrections.suggestMetadata(product.normalizedUrl, field, value)
      setCorrectionMessage('Thank you! Your suggestion has been submitted.')
      setTimeout(() => {
        setShowCorrectionForm(false)
        setCorrectionMessage('')
      }, 2000)
    } catch (err) {
      setCorrectionMessage(err.getUserMessage?.() || 'Failed to submit suggestion. Please try again.')
    }
  }

  const handleRejectMatch = async (retailer) => {
    if (!user) {
      router.push(`/login?redirect=/discover`)
      return
    }
    try {
      await api.corrections.rejectMatch(product.normalizedUrl, retailer.normalizedUrl)
      setCorrectionMessage('Match reported. Thank you!')
      setTimeout(() => {
        setCorrectionMessage('')
      }, 2000)
    } catch (err) {
      setCorrectionMessage(err.getUserMessage?.() || 'Failed to report match.')
    }
  }

  const getPrimaryRetailer = () => {
    if (fullProduct?.retailers && fullProduct.retailers.length > 0) {
      // Prioritize retailer with affiliate code
      const affiliateRetailer = fullProduct.retailers.find(r => r.affiliateCode)
      return affiliateRetailer || fullProduct.retailers[0]
    }
    return null
  }

  const getAlternativeRetailers = () => {
    if (!fullProduct?.retailers || fullProduct.retailers.length <= 1) return []
    const primary = getPrimaryRetailer()
    return fullProduct.retailers.filter(r => r.normalizedUrl !== primary?.normalizedUrl)
  }

  const displayProduct = fullProduct?.product || product
  const stats = fullProduct?.stats || product.stats
  const retailers = fullProduct?.retailers || []
  const relatedProducts = fullProduct?.relatedProducts || []
  const primaryRetailer = getPrimaryRetailer()
  const alternativeRetailers = getAlternativeRetailers()

  const hasImage = displayProduct.image && !imageError
  const showSocialProof = stats && stats.showStats && (stats.wishlistCount >= 3 || stats.videoCount >= 3)
  const hasDropsBadge = stats && stats.videoCount > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - fixed above scroll area */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[85vh]">

        {/* Large Product Image */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-t-2xl overflow-hidden">
          {hasImage ? (
            <Image
              src={displayProduct.image}
              alt={displayProduct.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 512px"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50">
              <img src="/logo-w.png" alt="Wishdrop" className="w-20 opacity-40 object-contain" />
            </div>
          )}

          {/* Drops Count Badge */}
          {hasDropsBadge && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              {stats.videoCount}
            </div>
          )}

          {/* Social Proof Overlay */}
          {showSocialProof && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              {stats.wishlistCount >= 3 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-sm font-semibold text-slate-700">
                  <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {stats.wishlistCount}
                </span>
              )}
              {stats.videoCount >= 3 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-sm font-semibold text-slate-700">
                  <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  {stats.videoCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 pt-6 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug mb-3">{displayProduct.title}</h2>

              {/* Price & Merchant */}
              <div className="flex items-baseline justify-between mb-5">
                {displayProduct.price ? (
                  <span className="text-2xl font-bold text-brand-500">${typeof displayProduct.price === 'object' ? displayProduct.price.amount?.toFixed(2) : Number(displayProduct.price).toFixed(2)}</span>
                ) : (
                  <span className="text-sm text-slate-400">Price unavailable</span>
                )}
                {(primaryRetailer?.merchant || displayProduct.merchant) && (
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {primaryRetailer?.merchant || displayProduct.merchant}
                  </span>
                )}
              </div>

              {/* Description (if available) */}
              {displayProduct.description && (
                <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-4">
                  {displayProduct.description}
                </p>
              )}

              {/* Also Available At Section */}
              {alternativeRetailers.length > 0 && (
                <div className="mb-6 pt-5 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Also Available At</h3>
                  <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                    {alternativeRetailers.map((retailer, index) => (
                      <button
                        key={index}
                        onClick={() => handleBuy(retailer)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
                      >
                        <span className="text-gray-700 font-medium">{retailer.merchant}</span>
                        {retailer.price && (
                          <span className="text-gray-900 font-bold">
                            ${typeof retailer.price === 'object' ? retailer.price.amount?.toFixed(2) : Number(retailer.price).toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* You Might Also Like Section */}
              {relatedProducts.length > 0 && (
                <div className="mb-6 pt-5 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">You Might Also Like</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {relatedProducts.slice(0, 4).map((related, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          onClose()
                          // Small delay to allow modal close animation
                          setTimeout(() => {
                            // This would ideally trigger opening the new product modal
                            // For now, navigate to product detail page
                            router.push(`/product/${encodeURIComponent(related.normalizedUrl)}`)
                          }, 100)
                        }}
                        className="cursor-pointer bg-slate-50/70 rounded-xl p-3.5 hover:bg-slate-100 transition-colors"
                      >
                        {related.image && (
                          <div className="relative w-full aspect-square mb-2 bg-white rounded-md overflow-hidden">
                            <Image
                              src={related.image}
                              alt={related.title}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          </div>
                        )}
                        <h4 className="text-xs font-medium text-slate-900 line-clamp-2 mb-1">{related.title}</h4>
                        {related.price && (
                          <p className="text-xs font-bold text-cyan-600">
                            ${typeof related.price === 'object' ? related.price.amount?.toFixed(2) : Number(related.price).toFixed(2)}
                          </p>
                        )}
                        {related.merchant && (
                          <p className="text-xs text-slate-500 mt-0.5">{related.merchant}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-5 border-t border-slate-100">
                <button
                  onClick={handleAddToList}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-all hover:shadow-glow"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add to My List
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleViewDetails}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Details
                  </button>

                  <button
                    onClick={() => handleBuy()}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Buy {primaryRetailer?.merchant ? `on ${primaryRetailer.merchant}` : 'Now'}
                  </button>
                </div>
              </div>

              {/* Report an Issue Link */}
              <div className="mt-6 pt-4 text-center">
                <button
                  onClick={handleReportIssue}
                  className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  Report an issue
                </button>
              </div>

              {/* Correction Form */}
              {showCorrectionForm && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Report an Issue</h4>

                  {correctionMessage && (
                    <div className={`mb-3 p-2 rounded text-sm ${correctionMessage.includes('Thank you') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {correctionMessage}
                    </div>
                  )}

                  <div className="space-y-2">
                    {alternativeRetailers.length > 0 && (
                      <>
                        <p className="text-xs text-slate-600 mb-2">Report wrong match:</p>
                        {alternativeRetailers.map((retailer, index) => (
                          <button
                            key={index}
                            onClick={() => handleRejectMatch(retailer)}
                            className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                          >
                            {retailer.merchant} is not the same product
                          </button>
                        ))}
                      </>
                    )}

                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600 mb-2">Suggest a correction:</p>
                      <button
                        onClick={() => {
                          const newTitle = prompt('Enter correct title:', displayProduct.title)
                          if (newTitle && newTitle !== displayProduct.title) {
                            handleSuggestMetadata('title', newTitle)
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors mb-2"
                      >
                        Correct title
                      </button>
                      <button
                        onClick={() => {
                          const newBrand = prompt('Enter correct brand:', displayProduct.brand || '')
                          if (newBrand) {
                            handleSuggestMetadata('brand', newBrand)
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors mb-2"
                      >
                        Correct brand
                      </button>
                      <button
                        onClick={() => {
                          const priceAmount = typeof displayProduct.price === 'object' ? displayProduct.price.amount : displayProduct.price
                          const newPrice = prompt('Enter correct price:', priceAmount || '')
                          if (newPrice && !isNaN(newPrice)) {
                            handleSuggestMetadata('price', parseFloat(newPrice))
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                      >
                        Correct price
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
