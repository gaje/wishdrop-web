'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'

export default function ProductClient({ initialData, slug }) {
  const router = useRouter()
  const { user } = useAuth()

  // Extract initial data
  const { product: initialProduct, stats: initialStats, retailers, videos, relatedProducts, lists, sampleItemId, matchCount } = initialData

  const [product] = useState(initialProduct)
  const [stats] = useState(initialStats)
  const [showListSelector, setShowListSelector] = useState(false)
  const [userLists, setUserLists] = useState([])
  const [addingToList, setAddingToList] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    if (user && showListSelector) {
      loadUserLists()
    }
  }, [user, showListSelector])

  const loadUserLists = async () => {
    try {
      const response = await api.lists.getMine()
      setUserLists(response.lists || response || [])
    } catch (err) {
      console.error('Failed to load user lists:', err)
    }
  }

  const handleAddToList = async (listId) => {
    if (!product || !listId) return

    try {
      setAddingToList(true)

      const itemData = {
        listId,
        url: product.originalUrl || product.normalizedUrl,
        title: product.title,
        price: product.price?.amount,
        image: product.image,
        brand: product.brand,
        description: product.description,
        merchant: product.merchant,
      }

      await api.items.create(itemData)
      setShowListSelector(false)

      // Show success feedback
      alert('Item added to your list!')
    } catch (err) {
      console.error('Failed to add item:', err)
      alert(err.getUserMessage?.() || 'Failed to add item to list')
    } finally {
      setAddingToList(false)
    }
  }

  const handleBuyNow = async (retailer) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
    
    // Use provided retailer or default to primary product
    const targetRetailer = retailer || {
      affiliateCode: product.affiliateCode,
      normalizedUrl: product.normalizedUrl
    }

    if (targetRetailer.affiliateCode) {
      window.open(`${API_BASE}/r/${targetRetailer.affiliateCode}`, '_blank', 'noopener,noreferrer')
      return
    }

    // Rewrite at click time for products without a stored affiliate code
    const targetUrl = targetRetailer.normalizedUrl || targetRetailer.url
    if (!targetUrl) return

    try {
      const result = await api.affiliate.rewrite(targetUrl)
      if (result.code) {
        window.open(`${API_BASE}/r/${result.code}`, '_blank', 'noopener,noreferrer')
      } else {
        window.open(targetUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const decodeHtmlEntities = (text) => {
    if (!text) return ''
    // Safe regex-based HTML entity decoding
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 lg:pt-10 lg:pb-14">
          {/* Breadcrumb */}
          <nav className="mb-6 animate-fade-in">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Discover
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Product Image */}
            <div className="animate-fade-in-up">
              <div className="relative aspect-square w-full max-w-lg mx-auto lg:mx-0 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50">
                    <img src="/logo-w.png" alt="Wishdrop" className="w-24 opacity-30 object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {/* Merchant Badge */}
              {product.merchant && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-600 mb-4">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {decodeHtmlEntities(product.merchant)}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 leading-tight tracking-tight">
                {decodeHtmlEntities(product.title)}
              </h1>

              {/* Brand */}
              {product.brand && (
                <p className="text-base text-slate-500 mb-5">
                  by <span className="font-medium text-slate-700">{decodeHtmlEntities(product.brand)}</span>
                </p>
              )}

              {/* Price */}
              {product.price?.amount && (
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">
                    ${product.price.amount.toFixed(2)}
                  </span>
                  {product.price.currency && product.price.currency !== 'USD' && (
                    <span className="ml-2 text-base text-slate-400">{product.price.currency}</span>
                  )}
                </div>
              )}

              {/* Stats Row */}
              {stats && (stats.wishlistCount > 0 || stats.videoCount > 0) && (
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {stats.wishlistCount > 0 && (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200">
                      <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="font-semibold text-slate-900">{formatNumber(stats.wishlistCount)}</span>
                      <span className="text-sm text-slate-600">want this</span>
                    </div>
                  )}
                  {stats.videoCount > 0 && (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 border border-violet-200">
                      <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span className="font-semibold text-slate-900">{formatNumber(stats.videoCount)}</span>
                      <span className="text-sm text-slate-600">videos</span>
                    </div>
                  )}
                </div>
              )}

              {/* Cross-Retailer Display */}
              {retailers && retailers.length > 1 && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Also available at:</h3>
                  <div className="space-y-2">
                    {retailers.slice(1, 4).map((retailer, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleBuyNow(retailer)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm font-medium text-slate-700 group-hover:text-violet-600">
                            {retailer.merchant}
                          </span>
                        </div>
                        {retailer.price?.amount && (
                          <span className="text-sm font-bold text-slate-900">
                            ${retailer.price.amount.toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {(product.affiliateCode || product.normalizedUrl) && (
                  <button
                    onClick={() => handleBuyNow()}
                    className="group flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Buy Now
                    <svg className="w-4 h-4 opacity-70 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => setShowListSelector(true)}
                    className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add to List
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-fade-in-up">
                <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  About this product
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {decodeHtmlEntities(product.description)}
                </p>
              </div>
            )}

            {/* Videos */}
            {videos && videos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Videos
                  <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold bg-violet-100 text-violet-700 rounded-full">
                    {videos.length}
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {videos.map((video, index) => (
                    <button
                      key={video._id}
                      onClick={() => setSelectedVideo(video)}
                      className="group relative aspect-[9/16] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 hover:border-violet-300 transition-all duration-300 hover:shadow-lg"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {video.thumbnailUrl && (
                        <Image
                          src={video.thumbnailUrl}
                          alt="Video thumbnail"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-violet-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      {video.uploaderId?.username && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/95 shadow-sm text-xs font-medium text-slate-700 truncate max-w-full">
                            @{video.uploaderId.username}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Products */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  You might also like
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {relatedProducts.slice(0, 4).map((related) => (
                    <Link
                      key={related.normalizedUrl}
                      href={`/product/${related.slug || encodeURIComponent(related.normalizedUrl)}`}
                      className="group flex flex-col gap-2 p-3 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-violet-300 transition-all"
                    >
                      {related.image && (
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                          <Image
                            src={related.image}
                            alt={related.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-900 line-clamp-2 group-hover:text-violet-600 transition-colors">
                          {related.title}
                        </p>
                        {related.price?.amount && (
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            ${related.price.amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Lists containing this product */}
            {lists && lists.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Found on {lists.length} {lists.length === 1 ? 'list' : 'lists'}
                </h2>
                <div className="space-y-1.5">
                  {lists.map((list) => (
                    <Link
                      key={list._id}
                      href={`/u/${list.owner?.username}/${list.slug}`}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                        <span className="text-sm text-white font-bold">
                          {list.title?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-cyan-600 transition-colors">
                          {list.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          @{list.owner?.username || 'unknown'}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Details
              </h2>
              <dl className="space-y-3">
                {product.brand && (
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <dt className="text-sm text-slate-500">Brand</dt>
                    <dd className="text-sm font-medium text-slate-900">{decodeHtmlEntities(product.brand)}</dd>
                  </div>
                )}
                {product.merchant && (
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <dt className="text-sm text-slate-500">Retailer</dt>
                    <dd className="text-sm font-medium text-slate-900">{decodeHtmlEntities(product.merchant)}</dd>
                  </div>
                )}
                {product.price?.amount && (
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-sm text-slate-500">Price</dt>
                    <dd className="text-sm font-bold text-slate-900">${product.price.amount.toFixed(2)}</dd>
                  </div>
                )}
              </dl>

              {product.originalUrl && (
                <a
                  href={product.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View original link
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* List Selector Modal */}
      {showListSelector && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Add to List</h3>
                <button
                  onClick={() => setShowListSelector(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {userLists.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-slate-500 mb-3">You don't have any lists yet</p>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create a List
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {userLists.map((list) => (
                    <button
                      key={list._id}
                      onClick={() => handleAddToList(list._id)}
                      disabled={addingToList}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left disabled:opacity-50 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-white font-bold">
                          {list.title?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-violet-600 transition-colors">
                          {list.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {list.itemCount || 0} items
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                        <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <video
            src={selectedVideo.playbackUrl}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-xl"
          />
        </div>
      )}
    </div>
  )
}
