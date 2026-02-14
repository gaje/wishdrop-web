'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { discover } from '../lib/api'
import { useAuth } from '@/lib/AuthContext'
import Header from '@/components/Header'
import EmailVerificationBanner from './components/EmailVerificationBanner'

export default function Home() {
  const { loading: authLoading } = useAuth()
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trending')

  useEffect(() => {
    if (!authLoading) {
      loadLists()
    }
  }, [activeTab, authLoading])

  const loadLists = async () => {
    try {
      setLoading(true)
      let response
      if (activeTab === 'trending') {
        response = await discover.trending(20, 0)
      } else if (activeTab === 'new') {
        response = await discover.new(20, 0)
      } else {
        response = await discover.featured(20, 0)
      }
      setLists(response.lists || [])
    } catch (error) {
      console.error('Failed to load lists:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50">
      <Header />
      <EmailVerificationBanner />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4">
            The smarter way to gift
          </span>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          No more guessing.<br />
          <span className="bg-gradient-to-r from-cyan-500 to-cyan-500 bg-clip-text text-transparent">
            Just perfect gifts.
          </span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Create wishlists, share them instantly, and never worry about duplicate gifts again.
          Your friends will actually know what you want. Revolutionary, right?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/signup" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
            Get Started Free
          </Link>
          <Link href="#features" className="inline-block px-8 py-4 bg-white text-gray-700 rounded-full font-bold text-lg border-2 border-gray-200 hover:border-cyan-500 transition-all">
            See How It Works
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span>No ads, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>100% private lists</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Completely free</span>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section id="preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-3">
          See It in Action
        </h3>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Simple, beautiful, and built for sharing
        </p>

        {/* Phone Mockups */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {/* Card 1: Create Lists */}
          <div className="flex-shrink-0 w-80 snap-center md:w-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Phone Frame */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                <div className="aspect-[9/16] max-h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 p-6 relative">
                  {/* Status bar mockup */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-white text-xs font-semibold">9:41</div>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                    </div>
                  </div>

                  {/* List view mockup */}
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <div className="h-6 bg-white/40 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-white/30 rounded w-1/2"></div>
                    </div>

                    {/* Item cards */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-3 flex gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-cyan-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Create Lists</h4>
                <p className="text-sm text-gray-600">Add products from any store</p>
              </div>
            </div>
          </div>

          {/* Card 2: Share Instantly */}
          <div className="flex-shrink-0 w-80 snap-center md:w-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Phone Frame */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                <div className="aspect-[9/16] max-h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 p-6 relative">
                  {/* Status bar mockup */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-white text-xs font-semibold">9:41</div>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                    </div>
                  </div>

                  {/* Share sheet mockup */}
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="bg-white rounded-t-3xl w-full p-6 space-y-4">
                      {/* Link preview */}
                      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-4">
                        <div className="h-4 bg-cyan-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-cyan-400 rounded w-1/2"></div>
                      </div>

                      {/* Share buttons */}
                      <div className="flex gap-3 justify-around pt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                            <div className="h-2 bg-gray-200 rounded w-12"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Share Instantly</h4>
                <p className="text-sm text-gray-600">One link to share with everyone</p>
              </div>
            </div>
          </div>

          {/* Card 3: Discover Products */}
          <div className="flex-shrink-0 w-80 snap-center md:w-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Phone Frame */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                <div className="aspect-[9/16] max-h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 p-6 relative">
                  {/* Status bar mockup */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-white text-xs font-semibold">9:41</div>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                      <div className="w-4 h-4 rounded-full bg-white/30"></div>
                    </div>
                  </div>

                  {/* Product grid mockup */}
                  <div className="space-y-3">
                    {/* Search bar */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <div className="h-4 bg-white/40 rounded w-1/2"></div>
                    </div>

                    {/* Product grid (2 rows × 2 cols) */}
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-2">
                          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                          <div className="h-2 bg-cyan-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="p-4 text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Discover Products</h4>
                <p className="text-sm text-gray-600">Explore trending items and lists</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Wishdrop?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a4 4 0 100 8 4 4 0 000-8zm0-4v2m0 12v2m8-8h-2M4 12H2" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Get What You Actually Want</h4>
            <p className="text-gray-600">
              Stop pretending to love that 5th candle set. Share exactly what you want, and your
              friends will thank you for making gift-giving actually easy.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Share the Burden</h4>
            <p className="text-gray-600">
              Tag items as claimed so your friend group doesn't accidentally buy you the same
              thing three times. Been there, done that, got three toasters.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">One Link to Rule Them All</h4>
            <p className="text-gray-600">
              Drop your link in the group chat and you're done. No more "what do you want for your
              birthday?" texts. Your list is your answer.
            </p>
          </div>
        </div>
      </section>

      {/* Discover Section Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Get Inspired
        </h3>
        <p className="text-center text-gray-600 mb-8">
          Check out what others are wishing for
        </p>
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'trending'
                ? 'text-cyan-600 border-b-2 border-cyan-500'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'new'
                ? 'text-cyan-600 border-b-2 border-cyan-500'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'featured'
                ? 'text-cyan-600 border-b-2 border-cyan-500'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Featured
          </button>
        </div>
      </section>

      {/* Lists Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No lists found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Link
                key={list._id}
                href={`/u/${list.owner?.username}/${list.slug}`}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {list.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by @{list.owner?.username || 'unknown'}
                    </p>
                    {list.description && (
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {list.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{list.itemCount || 0} items</span>
                      {list.likeCount > 0 && <span>❤️ {list.likeCount}</span>}
                      {list.viewCount > 0 && <span>👁 {list.viewCount}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-cyan-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to stop getting socks?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of people who are finally getting gifts they actually want.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-cyan-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
            Create Your Free List
          </Link>
        </div>
      </section>

    </div>
  )
}
