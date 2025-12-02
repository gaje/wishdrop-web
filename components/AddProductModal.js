'use client'

import { useState, useEffect } from 'react'
import api, { APIError } from '@/lib/api'

// Rose accent color for Have It section (matching mobile)
const ACCENT_ROSE = '#f43f5e'

export default function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [error, setError] = useState('')
  const [metadata, setMetadata] = useState(null)

  // Form fields (editable after metadata fetch)
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [price, setPrice] = useState('')
  const [merchant, setMerchant] = useState('')

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrl('')
      setTitle('')
      setImage('')
      setPrice('')
      setMerchant('')
      setMetadata(null)
      setError('')
      setLoading(false)
      setFetchingMetadata(false)
    }
  }, [isOpen])

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    setError('')
  }

  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      setError('Please enter a product URL')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setFetchingMetadata(true)
    setError('')

    try {
      const response = await api.metadata.fetch(url)
      setMetadata(response)
      setTitle(response.title || '')
      setImage(response.image || '')
      setPrice(response.price || '')
      setMerchant(response.merchant || response.siteName || '')
    } catch (err) {
      console.error('Failed to fetch metadata:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to fetch product info. You can enter details manually.')
      }
      // Allow manual entry even if fetch fails
      setMetadata({ url })
    } finally {
      setFetchingMetadata(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a product title')
      return
    }

    setLoading(true)

    try {
      await api.ownedProducts.create({
        url: url.trim() || undefined,
        title: title.trim(),
        image: image.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        merchant: merchant.trim() || undefined,
      })

      onProductAdded?.()
      onClose()
    } catch (err) {
      console.error('Failed to add product:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to add product. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !metadata && url.trim()) {
      e.preventDefault()
      handleFetchMetadata()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: ACCENT_ROSE }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Add Product</h2>
                <p className="text-sm text-slate-500">Add something you own to your collection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* URL Input with Fetch Button */}
            {!metadata && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Product URL <span className="text-slate-400">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={handleUrlChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder="https://amazon.com/product..."
                    disabled={fetchingMetadata}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleFetchMetadata}
                    disabled={fetchingMetadata || !url.trim()}
                    className="px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    style={{ backgroundColor: ACCENT_ROSE }}
                  >
                    {fetchingMetadata ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      'Fetch'
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Paste a link to auto-fill product details, or{' '}
                  <button
                    type="button"
                    onClick={() => setMetadata({ manual: true })}
                    className="font-medium hover:underline"
                    style={{ color: ACCENT_ROSE }}
                  >
                    enter manually
                  </button>
                </p>
              </div>
            )}

            {/* Product Details Form (shown after metadata fetch or manual entry) */}
            {metadata && (
              <>
                {/* Product Preview Card */}
                {(image || title) && (
                  <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {image && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 line-clamp-2">{title || 'Product Name'}</p>
                      {merchant && (
                        <p className="text-sm text-slate-500 mt-1">{merchant}</p>
                      )}
                      {price && (
                        <p className="text-sm font-semibold mt-1" style={{ color: ACCENT_ROSE }}>
                          ${parseFloat(price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Editable Fields */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder="e.g., Sony WH-1000XM5 Headphones"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Image URL <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="image"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder="https://..."
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Price <span className="text-slate-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                        placeholder="0.00"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="merchant" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Store <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="merchant"
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                      placeholder="e.g., Amazon"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Change URL button */}
                <button
                  type="button"
                  onClick={() => {
                    setMetadata(null)
                    setTitle('')
                    setImage('')
                    setPrice('')
                    setMerchant('')
                  }}
                  className="text-sm font-medium hover:underline"
                  style={{ color: ACCENT_ROSE }}
                >
                  ← Change URL or start over
                </button>
              </>
            )}

            {/* Submit Buttons */}
            {metadata && (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ACCENT_ROSE }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    'Add Product'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
