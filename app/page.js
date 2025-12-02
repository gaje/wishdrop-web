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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      <Header />
      <EmailVerificationBanner />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
            The smarter way to gift
          </span>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          No more guessing.<br />
          <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
            Just perfect gifts.
          </span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Create wishlists, share them instantly, and never worry about duplicate gifts again.
          Your friends will actually know what you want. Revolutionary, right?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/signup" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
            Get Started Free
          </Link>
          <Link href="#features" className="inline-block px-8 py-4 bg-white text-gray-700 rounded-full font-bold text-lg border-2 border-gray-200 hover:border-teal-500 transition-all">
            See How It Works
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span>No ads, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span>100% private lists</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <span>Completely free</span>
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
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Get What You Actually Want</h4>
            <p className="text-gray-600">
              Stop pretending to love that 5th candle set. Share exactly what you want, and your
              friends will thank you for making gift-giving actually easy.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Share the Burden</h4>
            <p className="text-gray-600">
              Tag items as claimed so your friend group doesn't accidentally buy you the same
              thing three times. Been there, done that, got three toasters.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔗</span>
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
                ? 'text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'new'
                ? 'text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'featured'
                ? 'text-teal-600 border-b-2 border-teal-500'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
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
      <section className="bg-gradient-to-r from-cyan-500 to-teal-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to stop getting socks?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of people who are finally getting gifts they actually want.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-teal-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
            Create Your Free List
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent mb-4">
                Wishdrop
              </h4>
              <p className="text-gray-600 text-sm">
                The smarter way to gift. No more guessing, just perfect gifts.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/signup" className="hover:text-teal-600">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-teal-600">Login</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-teal-600">About</Link></li>
                <li><Link href="#" className="hover:text-teal-600">Privacy</Link></li>
                <li><Link href="#" className="hover:text-teal-600">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Follow Us</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-teal-600">Twitter</a></li>
                <li><a href="#" className="hover:text-teal-600">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Wishdrop. Share your wishes with the world.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
