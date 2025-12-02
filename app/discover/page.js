'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import Header from '@/components/Header'

// Category icons and colors - refined palette
const CATEGORY_CONFIG = {
  'Birthday': { icon: '🎂', gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  'Christmas': { icon: '🎄', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  'Wedding': { icon: '💒', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  'Baby Shower': { icon: '👶', gradient: 'from-sky-400 to-blue-500', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  'Graduation': { icon: '🎓', gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  'Housewarming': { icon: '🏠', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  'Anniversary': { icon: '💕', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  'Holiday': { icon: '🎉', gradient: 'from-fuchsia-500 to-purple-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700' },
  'Other': { icon: '🎁', gradient: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
}

const getConfig = (category) => CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other']

// Helper to validate image URLs
const isValidImageUrl = (url) => {
  if (!url) return false
  if (url.startsWith('file://')) return false
  if (url.startsWith('data:')) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const [lists, setLists] = useState([])
  const [trendingItems, setTrendingItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trending')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [error, setError] = useState('')

  // Check for category in URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
      setActiveTab('category')
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load categories on mount
  useEffect(() => {
    if (user) {
      loadCategories()
      loadTrendingItems()
    }
  }, [user])

  // Load lists when tab or category changes
  useEffect(() => {
    if (user) {
      loadLists()
    }
  }, [activeTab, selectedCategory, user])

  const loadCategories = async () => {
    try {
      const response = await api.discover.categories()
      setCategories(response.categories || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadTrendingItems = async () => {
    try {
      const response = await api.discover.trendingItems(8)
      setTrendingItems(response.items || [])
    } catch (err) {
      console.error('Failed to load trending items:', err)
    }
  }

  const loadLists = async () => {
    try {
      setLoading(true)
      let response

      if (activeTab === 'category' && selectedCategory) {
        response = await api.discover.byCategory(selectedCategory, 20, 0)
      } else if (activeTab === 'trending') {
        response = await api.discover.trending(20, 0)
      } else if (activeTab === 'new') {
        response = await api.discover.new(20, 0)
      } else {
        response = await api.discover.featured(20, 0)
      }

      setLists(response.lists || [])
    } catch (err) {
      console.error('Failed to load lists:', err)
      setError('Failed to load discover lists')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName)
    setActiveTab('category')
    router.push(`/discover?category=${encodeURIComponent(categoryName)}`, { scroll: false })
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setSelectedCategory(null)
    if (tab !== 'category') {
      router.push('/discover', { scroll: false })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-teal-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-white border-b border-slate-200/80">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-white to-violet-50/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 lg:pt-16 lg:pb-12">
          {/* Header content */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 text-sm text-teal-700 font-medium mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Explore the community
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              Discover Wishlists
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find inspiration from curated collections and trending products
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
        {/* Trending Products Section */}
        {trendingItems.length > 0 && activeTab !== 'category' && (
          <section className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Trending Products</h2>
                <p className="text-sm text-slate-500 mt-0.5">Most wanted items right now</p>
              </div>
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.56 21a1 1 0 01-.46-.11L12 18.22l-5.1 2.67a1 1 0 01-1.45-1.06l1-5.63-4.12-4a1 1 0 01-.25-1 1 1 0 01.81-.68l5.7-.83 2.51-5.13a1 1 0 011.8 0l2.54 5.12 5.7.83a1 1 0 01.81.68 1 1 0 01-.25 1l-4.12 4 1 5.63a1 1 0 01-.4 1 1 1 0 01-.62.21z"/>
                </svg>
                Updated daily
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {trendingItems.map((item, index) => (
                <Link
                  key={item._id}
                  href={`/product/${encodeURIComponent(item.normalizedUrl)}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {isValidImageUrl(item.image) ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}

                    {/* Stats badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {item.stats?.wishlistCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-xs font-semibold text-slate-700">
                          <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {item.stats.wishlistCount}
                        </span>
                      )}
                      {item.stats?.videoCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-xs font-semibold text-slate-700">
                          <svg className="w-3 h-3 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          {item.stats.videoCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3.5">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-teal-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      {item.price ? (
                        <span className="text-base font-bold text-slate-900">${item.price.toFixed(2)}</span>
                      ) : (
                        <span className="text-xs text-slate-400">Price unavailable</span>
                      )}
                      {item.merchant && (
                        <span className="text-xs text-slate-400 truncate max-w-[70px]">{item.merchant}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tabs Navigation */}
        <div className="flex items-center gap-1 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
          {['trending', 'new', 'featured'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab && !selectedCategory
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          {selectedCategory && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold">
              <span>{getConfig(selectedCategory).icon}</span>
              <span>{selectedCategory}</span>
              <button
                onClick={() => handleTabClick('trending')}
                className="ml-1 w-4 h-4 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Section Header */}
        {selectedCategory && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {getConfig(selectedCategory).icon} {selectedCategory} Wishlists
            </h2>
            <p className="text-slate-600">Explore curated collections for {selectedCategory.toLowerCase()}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Lists Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
                <div className="h-32 bg-slate-100" />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-slate-100" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-100 rounded-lg w-3/4 mb-2" />
                      <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-lg w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No wishlists found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {selectedCategory
                ? `No wishlists in ${selectedCategory} yet. Be the first!`
                : 'Check back soon for new wishlists.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lists.map((list, index) => (
              <Link
                key={list._id}
                href={`/u/${list.owner?.username}/${list.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Preview Images */}
                {list.previewImages?.filter(isValidImageUrl).length > 0 ? (
                  <div className="relative h-32 overflow-hidden bg-slate-100">
                    <div className="absolute inset-0 grid grid-cols-4 gap-px">
                      {list.previewImages.filter(isValidImageUrl).slice(0, 4).map((img, idx) => (
                        <div key={idx} className="relative overflow-hidden bg-slate-100">
                          <Image
                            src={img}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="25vw"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                    <span className="text-4xl opacity-40">{list.occasion ? getConfig(list.occasion).icon : '🎁'}</span>
                  </div>
                )}

                <div className="p-5">
                  {/* User & Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                      {list.owner?.avatar ? (
                        <Image
                          src={list.owner.avatar}
                          alt={list.owner.username}
                          width={44}
                          height={44}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-base text-white font-bold">
                          {list.owner?.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                        {list.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        @{list.owner?.username || 'unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Occasion Badge */}
                  {list.occasion && (
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getConfig(list.occasion).bg} ${getConfig(list.occasion).text} border ${getConfig(list.occasion).border}`}>
                        {getConfig(list.occasion).icon} {list.occasion}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {list.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {list.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {list.itemCount || 0} items
                    </span>
                    {list.likeCount > 0 && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {list.likeCount}
                      </span>
                    )}
                    {list.viewCount > 0 && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {list.viewCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
