'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'


// Helper to validate image URLs
const isValidImageUrl = (url) => {
  if (!url) return false
  if (url.startsWith('file://')) return false
  if (url.startsWith('data:')) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeFilter, setActiveFilter] = useState('all')
  const [results, setResults] = useState({ users: [], lists: [], items: [] })
  const [counts, setCounts] = useState({ users: 0, lists: 0, items: 0, total: 0 })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'users', label: 'People' },
    { key: 'lists', label: 'Wishlists' },
    { key: 'items', label: 'Items' },
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Perform search when query param changes
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  // Re-search when filter changes
  useEffect(() => {
    if (searched && searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }, [activeFilter])

  const performSearch = async (query) => {
    if (!query?.trim()) return

    try {
      setLoading(true)
      setSearched(true)
      const response = await api.search.search(query.trim(), activeFilter, 20)
      setResults(response.results || { users: [], lists: [], items: [] })
      setCounts(response.counts || { users: 0, lists: 0, items: 0, total: 0 })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false })
      performSearch(searchQuery)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setResults({ users: [], lists: [], items: [] })
    setCounts({ users: 0, lists: 0, items: 0, total: 0 })
    setSearched(false)
    router.push('/search', { scroll: false })
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Hero */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Search Wishdrop</h1>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for users, wishlists, or items..."
                className="w-full pl-12 pr-12 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter.key
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-500 text-white shadow-md shadow-cyan-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.key === 'all' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                {filter.key === 'users' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {filter.key === 'lists' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                )}
                {filter.key === 'items' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                <span>{filter.label}</span>
                {searched && counts[filter.key] > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeFilter === filter.key ? 'bg-white/20' : 'bg-slate-200'
                  }`}>
                    {counts[filter.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin mb-4" />
            <p className="text-slate-500">Searching...</p>
          </div>
        ) : !searched ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Search Wishdrop</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Find users, wishlists, and items across the platform
            </p>
          </div>
        ) : counts.total === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Try a different search term or filter
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Users Results */}
            {(activeFilter === 'all' || activeFilter === 'users') && results.users?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  People ({results.users.length})
                </h2>
                <div className="space-y-3">
                  {results.users.map((resultUser) => (
                    <Link
                      key={resultUser._id}
                      href={`/u/${resultUser.username}`}
                      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
                    >
                      {resultUser.avatar ? (
                        <img src={resultUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
                          {resultUser.username?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{resultUser.displayName || resultUser.username}</p>
                        <p className="text-sm text-slate-500">@{resultUser.username}</p>
                        {resultUser.followerCount > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            {resultUser.followerCount} {resultUser.followerCount === 1 ? 'follower' : 'followers'}
                          </p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Lists Results */}
            {(activeFilter === 'all' || activeFilter === 'lists') && results.lists?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  Wishlists ({results.lists.length})
                </h2>
                <div className="space-y-3">
                  {results.lists.map((list) => (
                    <Link
                      key={list._id}
                      href={`/u/${list.owner?.username}/${list.slug}`}
                      className="block p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
                      style={{ viewTransitionName: `list-${list.slug}`, contain: 'layout paint' }}
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900">{list.title}</p>
                          <p className="text-sm text-slate-500">by @{list.owner?.username}</p>
                          {list.occasion && (
                            <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                              {list.occasion}
                            </span>
                          )}
                        </div>
                      </div>
                      {list.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{list.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {list.itemCount || 0} items
                        </span>
                        {list.likeCount > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {list.likeCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Items Results */}
            {(activeFilter === 'all' || activeFilter === 'items') && results.items?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Items ({results.items.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.items.map((item) => (
                    <Link
                      key={item._id}
                      href={`/u/${item.list?.owner?.username}/${item.list?.slug}`}
                      className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
                    >
                      {isValidImageUrl(item.image) ? (
                        <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 line-clamp-2">{item.title}</p>
                        {item.price?.amount && (
                          <p className="text-cyan-600 font-bold mt-1">${item.price.amount.toFixed(2)}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          From {item.list?.title} by @{item.list?.owner?.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
