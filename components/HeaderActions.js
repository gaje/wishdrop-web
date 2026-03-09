'use client'

import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import NotificationsDropdown from './NotificationsDropdown'
import api from '@/lib/api'

export default function HeaderActions({ isLoggedIn, guestSlot, authShell }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Search state
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false)
        setSearchResults(null)
      }
    }

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch])

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await api.search.search(searchQuery.trim(), 'all', 10)
        setSearchResults(response.results || response)
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
      setSearchResults(null)
    }
  }

  const closeSearch = () => {
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults(null)
  }

  // While auth is resolving, show the server-rendered shell (includes
  // nav links, static search pill, and sized placeholders)
  if (loading) {
    return isLoggedIn ? authShell : guestSlot
  }

  if (!user) return guestSlot

  return (
    <nav className="flex items-center gap-4 lg:gap-6">
      {/* Nav links */}
      <div className={`hidden md:flex items-center gap-6 ${showSearch ? 'lg:hidden' : ''}`}>
        <Link href="/dashboard" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
          My Lists
        </Link>
        <Link href="/feed" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
          Following
        </Link>
        <Link href="/discover" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
          Discover
        </Link>
      </div>

      {/* Search */}
      <div className="relative flex items-center" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <div
            className="relative flex items-center h-10"
            style={{
              width: showSearch ? '320px' : '110px',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                showSearch
                  ? 'bg-white border-2 border-cyan-500 shadow-lg shadow-cyan-100/50'
                  : 'bg-slate-100 hover:bg-slate-200 border border-transparent'
              }`}
            />
            <button
              type="button"
              onClick={() => !showSearch && setShowSearch(true)}
              className={`relative z-10 flex items-center gap-2 px-3 h-10 transition-colors duration-300 ${
                showSearch ? 'text-cyan-500' : 'text-slate-500'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span
                className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                  showSearch ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Search
              </span>
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wishlists, people..."
              className={`relative z-10 flex-1 pr-10 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-opacity duration-200 ${
                showSearch ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'
              }`}
              tabIndex={showSearch ? 0 : -1}
            />
            {searchQuery && showSearch && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
        <button
          type="button"
          onClick={closeSearch}
          className={`ml-2 px-2 py-1 text-slate-500 hover:text-slate-700 text-sm font-medium transition-all duration-300 ${
            showSearch
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden'
          }`}
        >
          Cancel
        </button>

        {/* Search Results Dropdown */}
        {showSearch && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 mx-auto border-2 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Users */}
                {searchResults.users?.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      People
                    </div>
                    {searchResults.users.slice(0, 3).map((u) => (
                      <Link
                        key={u._id}
                        href={`/u/${u.username}`}
                        onClick={closeSearch}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                            {u.username?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{u.displayName || u.username}</p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Lists */}
                {searchResults.lists?.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Wishlists
                    </div>
                    {searchResults.lists.slice(0, 3).map((list) => (
                      <Link
                        key={list._id}
                        href={`/u/${list.owner?.username}/${list.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{list.title}</p>
                          <p className="text-xs text-slate-500">by @{list.owner?.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Items */}
                {searchResults.items?.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Items
                    </div>
                    {searchResults.items.slice(0, 3).map((item) => (
                      <Link
                        key={item._id}
                        href={`/product/${encodeURIComponent(item.normalizedUrl || item._id)}`}
                        onClick={closeSearch}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        {item.image ? (
                          <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                          {item.price && (
                            <p className="text-xs text-cyan-600 font-semibold">${(typeof item.price === 'number' ? item.price : item.price?.amount || 0).toFixed(2)}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No results */}
                {!searchResults.users?.length && !searchResults.lists?.length && !searchResults.items?.length && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}

                {/* View all results */}
                {(searchResults.users?.length > 0 || searchResults.lists?.length > 0 || searchResults.items?.length > 0) && (
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full px-3 py-3 bg-slate-50 text-sm font-medium text-cyan-600 hover:bg-slate-100 transition-colors border-t border-slate-200"
                  >
                    View all results
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <NotificationsDropdown />

      {/* User Menu */}
      <div className="relative ml-2 pl-4 border-l border-gray-200" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName || user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
              {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-700 hidden sm:inline">{user.displayName || user.username}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <Link
              href={`/u/${user.username}`}
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>View Profile</span>
              </div>
            </Link>
            <Link
              href="/people"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>My People</span>
              </div>
            </Link>
            <Link
              href="/connections"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Connections</span>
              </div>
            </Link>
            <Link
              href="/settings"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </div>
            </Link>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={() => {
                setShowDropdown(false)
                handleLogout()
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log out</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
