'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from 'next-view-transitions'
import api from '@/lib/api'

import HeroSpotlight from '@/components/discover/HeroSpotlight'
import CollectionGrid from '@/components/discover/CollectionGrid'
import ProductCard from '@/components/discover/ProductCard'
import SearchBar from '@/components/discover/SearchBar'
import ProductModal from '@/components/discover/ProductModal'

// Category display names and SVG icon paths (Heroicons outline)
const CATEGORY_CONFIG = {
  'tech-electronics': {
    label: 'Tech & Electronics',
    icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z',
  },
  'fashion-apparel': {
    label: 'Fashion & Apparel',
    icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  },
  'home-decor': {
    label: 'Home & Decor',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  'beauty-personal-care': {
    label: 'Beauty & Care',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
  },
  'sports-fitness': {
    label: 'Sports & Fitness',
    icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.27.308 6.023 6.023 0 01-2.27-.308',
  },
  'books-media': {
    label: 'Books & Media',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  'arts-crafts': {
    label: 'Arts & Crafts',
    icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
  },
  'garden-outdoors': {
    label: 'Garden & Outdoors',
    icon: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
  },
  'gifts-novelty': {
    label: 'Gifts & Novelty',
    icon: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  },
  'kitchen-cooking': {
    label: 'Kitchen & Cooking',
    icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z',
  },
}

const getConfig = (category) => CATEGORY_CONFIG[category] || null

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
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || null
  )
  const [categoryLists, setCategoryLists] = useState(null)

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Load feed or category data based on selection
  useEffect(() => {
    if (selectedCategory) {
      loadCategoryData(selectedCategory)
    } else {
      loadFeedData()
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const categoriesData = await api.discover.categories()
      setCategories(categoriesData.categories || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadFeedData = async () => {
    try {
      setLoading(true)
      setCategoryLists(null)
      const feedData = await api.discover.feed({ heroLimit: 5, trendingLimit: 10, collectionsLimit: 10 })
      setFeed(feedData)
      setError('')
    } catch (err) {
      console.error('Failed to load discover data:', err)
      setError('Failed to load discover content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryData = async (category) => {
    try {
      setLoading(true)
      const data = await api.discover.byCategory(category)
      setCategoryLists(data.lists || [])
      setError('')
    } catch (err) {
      console.error('Failed to load category data:', err)
      setError('Failed to load category content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryName) => {
    const newCategory = selectedCategory === categoryName ? null : categoryName
    setSelectedCategory(newCategory)
    if (newCategory) {
      router.push(`/discover?category=${encodeURIComponent(newCategory)}`, { scroll: false })
    } else {
      router.push('/discover', { scroll: false })
    }
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleRetry = () => {
    if (selectedCategory) {
      loadCategoryData(selectedCategory)
    } else {
      loadFeedData()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-slate-200/80">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-white to-violet-50/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 lg:pt-16 lg:pb-12">
          {/* Header content */}
          <div className="text-center mb-10">
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
            <div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible scrollbar-hide">
                {categories.slice(0, 10).map((category) => {
                  const config = getConfig(category.name)
                  if (!config) return null
                  const isActive = selectedCategory === category.name
                  return (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className={`group relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                      </svg>
                      <span className="text-sm font-semibold whitespace-nowrap">{config.label}</span>
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
        ) : selectedCategory && categoryLists !== null ? (
          <>
            {/* Category Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {getConfig(selectedCategory)?.label || selectedCategory}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {categoryLists.length} {categoryLists.length === 1 ? 'list' : 'lists'} found
                </p>
              </div>
              <button
                onClick={() => handleCategoryClick(selectedCategory)}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Clear filter
              </button>
            </div>

            {/* Category List Results */}
            {categoryLists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryLists.map((list) => (
                  <Link
                    key={list._id}
                    href={`/u/${list.owner?.username}/${list.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                  >
                    {/* Preview Images */}
                    {list.previewImages && list.previewImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-0.5 bg-slate-100">
                        {list.previewImages.slice(0, 4).map((image, idx) => (
                          <div key={idx} className="aspect-square overflow-hidden">
                            {isValidImageUrl(image) ? (
                              <img src={image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-100" />
                            )}
                          </div>
                        ))}
                        {list.previewImages.length < 4 &&
                          [...Array(4 - list.previewImages.length)].map((_, idx) => (
                            <div key={`empty-${idx}`} className="aspect-square bg-slate-100" />
                          ))
                        }
                      </div>
                    ) : (
                      <div className="aspect-[2/1] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors truncate">
                        {list.title}
                      </h3>
                      {list.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{list.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
                        <span className="truncate">
                          by {list.owner?.displayName || list.owner?.username || 'Unknown'}
                        </span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {list.itemCount > 0 && (
                            <span>{list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}</span>
                          )}
                          {list.likeCount > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              {list.likeCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={getConfig(selectedCategory)?.icon || 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No lists in this category</h3>
                <p className="text-slate-500">Check back soon or explore other categories</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Hero Spotlight */}
            {feed?.hero && feed.hero.length > 0 && (
              <div className="mb-12">
                <HeroSpotlight items={feed.hero} />
              </div>
            )}

            {/* Trending Products */}
            {feed?.trending && feed.trending.length > 0 && (
              <div className="mb-12">
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
              <div>
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
