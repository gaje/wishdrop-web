'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from 'next-view-transitions'
import api from '@/lib/api'
import Header from '@/components/Header'
import HeroSpotlight from '@/components/discover/HeroSpotlight'
import CollectionGrid from '@/components/discover/CollectionGrid'
import ProductCard from '@/components/discover/ProductCard'
import SearchBar from '@/components/discover/SearchBar'
import ProductModal from '@/components/discover/ProductModal'

// Category icons and colors - refined palette
const CATEGORY_CONFIG = {
  'Birthday': { icon: '🎂', gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  'Christmas': { icon: '🎄', gradient: 'from-emerald-500 to-cyan-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  'Wedding': { icon: '💒', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  'Baby Shower': { icon: '👶', gradient: 'from-sky-400 to-blue-500', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  'Graduation': { icon: '🎓', gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  'Housewarming': { icon: '🏠', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  'Anniversary': { icon: '💕', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  'Holiday': { icon: '🎉', gradient: 'from-fuchsia-500 to-purple-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700' },
  'Other': { icon: '🎁', gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
}

const getConfig = (category) => CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other']

// Helper to validate image URLs
const isValidImageUrl = (url) => {
  if (!url) return false
  if (url.startsWith('file://')) return false
  if (url.startsWith('data:')) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

function DiscoverPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [feed, setFeed] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Check for category in URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Load feed and categories on mount
  useEffect(() => {
    loadDiscoverData()
  }, [])

  const loadDiscoverData = async () => {
    try {
      setLoading(true)

      // Load feed and categories in parallel
      const [feedData, categoriesData] = await Promise.all([
        api.discover.feed({ heroLimit: 5, trendingLimit: 10, collectionsLimit: 10 }),
        api.discover.categories()
      ])

      setFeed(feedData)
      setCategories(categoriesData.categories || [])
      setError('')
    } catch (err) {
      console.error('Failed to load discover data:', err)
      setError('Failed to load discover content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName)
    router.push(`/discover?category=${encodeURIComponent(categoryName)}`, { scroll: false })
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleRetry = () => {
    loadDiscoverData()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-white border-b border-slate-200/80">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-white to-violet-50/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 lg:pt-16 lg:pb-12">
          {/* Header content */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/60 text-sm text-cyan-700 font-medium mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Explore the community
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              Discover Products
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find trending products and curated collections
            </p>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
                {categories.slice(0, 9).map((category) => {
                  const config = getConfig(category.name)
                  const isActive = selectedCategory === category.name
                  return (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className={`group relative flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-semibold">{category.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white/90' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Bar */}
        <SearchBar />

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 rounded-lg font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            {/* Hero Skeleton */}
            <div className="w-full h-96 bg-slate-200 rounded-3xl animate-pulse" />

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
                  <div className="aspect-square bg-slate-100" />
                  <div className="p-3.5">
                    <div className="h-4 bg-slate-100 rounded-lg w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Spotlight */}
            {feed?.hero && feed.hero.length > 0 && (
              <div className="mb-12 animate-fade-in-up">
                <HeroSpotlight items={feed.hero} />
              </div>
            )}

            {/* Trending Products */}
            {feed?.trending && feed.trending.length > 0 && (
              <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Trending Now</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Most wanted products right now</p>
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.56 21a1 1 0 01-.46-.11L12 18.22l-5.1 2.67a1 1 0 01-1.45-1.06l1-5.63-4.12-4a1 1 0 01-.25-1 1 1 0 01.81-.68l5.7-.83 2.51-5.13a1 1 0 011.8 0l2.54 5.12 5.7.83a1 1 0 01.81.68 1 1 0 01-.25 1l-4.12 4 1 5.63a1 1 0 01-.4 1 1 1 0 01-.62.21z"/>
                    </svg>
                    Updated daily
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {feed.trending.map((product) => (
                    <div key={product._id || product.normalizedUrl}>
                      <ProductCard product={product} onClick={handleProductClick} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collection Sections */}
            {feed?.collections && feed.collections.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                {feed.collections.map((collection, index) => (
                  <CollectionGrid
                    key={collection._id || collection.slug || index}
                    collection={collection}
                    onProductClick={handleProductClick}
                    onSeeAll={null} // Could add collection detail page later
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !feed?.hero?.length && !feed?.trending?.length && !feed?.collections?.length && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No products yet</h3>
                <p className="text-slate-500">Check back soon for trending products and collections</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin" />
      </div>
    }>
      <DiscoverPageContent />
    </Suspense>
  )
}
