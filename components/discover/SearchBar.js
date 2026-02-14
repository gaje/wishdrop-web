'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import api from '@/lib/api'

/**
 * SearchBar - Full-width search input with debounced dropdown
 * Searches products and users, shows results dropdown
 * Click outside to close, clear button, loading spinner
 */
export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      setIsOpen(false)
      return
    }

    setLoading(true)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce for 300ms
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.discover.search(query, 20)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('Search failed:', err)
        setResults({ products: [], users: [] })
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleClear = () => {
    setQuery('')
    setResults(null)
    setIsOpen(false)
  }

  const handleProductClick = (product) => {
    setIsOpen(false)
    router.push(`/product/${encodeURIComponent(product.normalizedUrl)}`)
  }

  const handleUserClick = (user) => {
    setIsOpen(false)
    router.push(`/u/${user.username}`)
  }

  const hasResults = results && (results.products?.length > 0 || results.users?.length > 0)
  const showNoResults = results && !hasResults && !loading

  return (
    <div ref={searchRef} className="relative w-full mb-8">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products and users..."
          className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
        />
        {loading && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-teal-500 animate-spin" />
          </div>
        )}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
          {showNoResults && (
            <div className="p-6 text-center">
              <p className="text-slate-500">No results found for "{query}"</p>
            </div>
          )}

          {/* Products Section */}
          {results?.products && results.products.length > 0 && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Products
              </h3>
              <div className="space-y-1">
                {results.products.map((product) => (
                  <button
                    key={product._id || product.normalizedUrl}
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{product.title}</p>
                      <p className="text-xs text-slate-500">
                        {product.price ? `$${product.price.toFixed(2)}` : 'Price unavailable'}
                        {product.merchant && ` · ${product.merchant}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {results?.users && results.users.length > 0 && (
            <div className="p-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Users
              </h3>
              <div className="space-y-1">
                {results.users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-white font-bold">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">@{user.username}</p>
                      {user.displayName && (
                        <p className="text-xs text-slate-500 truncate">{user.displayName}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
