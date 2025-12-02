'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import Header from '@/components/Header'
import CreateListModal from '@/components/CreateListModal'
import AddProductModal from '@/components/AddProductModal'

const FAMILY_BANNER_DISMISSED_KEY = 'wishdrop_family_banner_dismissed'

// Rose accent color for Have It section (matching mobile)
const ACCENT_ROSE = '#f43f5e'

// SVG Icon component for occasions
const OccasionIcon = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case 'Birthday':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
      )
    case 'Holiday':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
        </svg>
      )
    case 'Wedding':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'Baby Shower':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'Anniversary':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'Graduation':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
    case 'Housewarming':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'Just Because':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    default: // Other or unknown
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
  }
}

const OCCASION_CONFIG = {
  'Birthday': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconColor: 'text-rose-600' },
  'Holiday': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600' },
  'Wedding': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', iconColor: 'text-violet-600' },
  'Baby Shower': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconColor: 'text-sky-600' },
  'Anniversary': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', iconColor: 'text-pink-600' },
  'Graduation': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconColor: 'text-indigo-600' },
  'Housewarming': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-600' },
  'Just Because': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', iconColor: 'text-teal-600' },
  'Other': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', iconColor: 'text-slate-600' },
}

const getOccasionConfig = (occasion) => OCCASION_CONFIG[occasion] || OCCASION_CONFIG['Other']

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [lists, setLists] = useState([])
  const [sharedLists, setSharedLists] = useState([])
  const [familyMembers, setFamilyMembers] = useState([])
  const [ownedProducts, setOwnedProducts] = useState([])
  const [ownedProductsStats, setOwnedProductsStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [mainTab, setMainTab] = useState('want') // 'want' or 'have'
  const [activeTab, setActiveTab] = useState('mine') // 'mine' or 'shared'
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState(null) // null = all, 'me' = personal
  const [showFamilyBanner, setShowFamilyBanner] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchLists()
      loadBannerState()
    }
  }, [user, authLoading, router])

  const loadBannerState = () => {
    const dismissed = localStorage.getItem(FAMILY_BANNER_DISMISSED_KEY)
    setShowFamilyBanner(dismissed !== 'true')
  }

  const dismissBanner = () => {
    localStorage.setItem(FAMILY_BANNER_DISMISSED_KEY, 'true')
    setShowFamilyBanner(false)
  }

  const fetchLists = async () => {
    try {
      setLoading(true)
      const [myResponse, sharedResponse, familyResponse, ownedResponse, ownedStatsResponse] = await Promise.all([
        api.lists.getMine(),
        api.lists.getSharedWithMe().catch(() => ({ lists: [] })),
        api.family?.getMembers().catch(() => ({ members: [] })) || Promise.resolve({ members: [] }),
        api.ownedProducts?.getMine().catch(() => ({ products: [] })) || Promise.resolve({ products: [] }),
        api.ownedProducts?.getStats().catch(() => ({})) || Promise.resolve({}),
      ])
      setLists(myResponse.lists || [])
      setSharedLists(sharedResponse.lists || sharedResponse || [])
      setFamilyMembers(familyResponse.members || [])
      setOwnedProducts(ownedResponse.products || [])
      setOwnedProductsStats(ownedStatsResponse)
    } catch (err) {
      console.error('Error fetching lists:', err)
      setError('Failed to load your data')
    } finally {
      setLoading(false)
    }
  }

  // Filter lists based on selected family member
  const getFilteredLists = () => {
    if (activeTab !== 'mine') return []
    if (selectedFamilyMemberId === null) return lists
    if (selectedFamilyMemberId === 'me') return lists.filter(list => !list.familyMemberId)
    return lists.filter(list => list.familyMemberId === selectedFamilyMemberId)
  }

  const filteredLists = getFilteredLists()

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleDeleteList = async (username, slug, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return

    try {
      await api.lists.delete(username, slug)
      await fetchLists()
    } catch (err) {
      console.error('Failed to delete list:', err)
      alert('Failed to delete list. Please try again.')
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-teal-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section with Want It / Have It Switcher */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Main Tab Switcher - Want It / Have It */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-2xl p-1.5 bg-slate-100">
              <button
                onClick={() => setMainTab('want')}
                className={`relative px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  mainTab === 'want'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Want It
                </span>
                {mainTab === 'want' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />
                )}
              </button>
              <button
                onClick={() => setMainTab('have')}
                className={`relative px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  mainTab === 'have'
                    ? 'bg-white shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                style={mainTab === 'have' ? { color: ACCENT_ROSE } : {}}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Have It
                </span>
                {ownedProducts.filter(p => !p.hasVideo).length > 0 && (
                  <span
                    className="ml-1.5 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center font-bold"
                    style={{ backgroundColor: ACCENT_ROSE }}
                  >
                    {ownedProducts.filter(p => !p.hasVideo).length > 9 ? '9+' : ownedProducts.filter(p => !p.hasVideo).length}
                  </span>
                )}
                {mainTab === 'have' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: ACCENT_ROSE }} />
                )}
              </button>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                {mainTab === 'want' ? 'My Wishlists' : 'My Collection'}
              </h1>
              <p className="text-slate-500">
                {mainTab === 'want'
                  ? 'Manage and organize your wishlists'
                  : 'Things you own and can review'}
              </p>
            </div>
            {mainTab === 'want' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-200 transition-all duration-300 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New List
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Family Feature Banner - only show on Want It tab */}
        {mainTab === 'want' && showFamilyBanner && familyMembers.length === 0 && !loading && (
          <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500 p-6 shadow-lg">
            <button
              onClick={dismissBanner}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1 pr-8">
                <h3 className="text-lg font-bold text-white mb-1.5">Create Lists for Family</h3>
                <p className="text-white/90 text-sm mb-4">
                  Track gift ideas for your loved ones and never forget their birthdays
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/family/add"
                    onClick={dismissBanner}
                    className="px-4 py-2.5 bg-white rounded-xl text-sm font-semibold text-teal-600 hover:bg-white/90 transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                  <button
                    onClick={dismissBanner}
                    className="px-4 py-2.5 bg-white/25 rounded-xl text-sm font-semibold text-white hover:bg-white/30 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WANT IT TAB CONTENT */}
        {mainTab === 'want' && (
          <>
        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'mine'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Lists
            {activeTab === 'mine' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'shared'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Shared with Me
            {sharedLists.length > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'shared' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {sharedLists.length}
              </span>
            )}
            {activeTab === 'shared' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>
        </div>

        {/* Family Member Filter - Only show on My Lists tab */}
        {activeTab === 'mine' && familyMembers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-600">Filter by person</span>
              <Link href="/family" className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-700">
                Manage
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFamilyMemberId(null)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedFamilyMemberId === null
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFamilyMemberId('me')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedFamilyMemberId === 'me'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                Me
              </button>
              {familyMembers.map((member, index) => {
                const colors = ['bg-rose-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500']
                return (
                  <button
                    key={member._id}
                    onClick={() => setSelectedFamilyMemberId(member._id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedFamilyMemberId === member._id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full ${selectedFamilyMemberId === member._id ? 'bg-white/30' : colors[index % colors.length]} flex items-center justify-center text-[10px] font-bold text-white`}>
                      {getInitials(member.name)}
                    </span>
                    {member.displayName || member.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Lists Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-100 rounded-lg w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-100 rounded-lg w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : activeTab === 'mine' ? (
          // My Lists Tab
          filteredLists.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
                <OccasionIcon type="Just Because" className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {selectedFamilyMemberId === 'me'
                  ? 'No personal lists yet'
                  : selectedFamilyMemberId
                  ? `No lists yet for ${familyMembers.find(m => m._id === selectedFamilyMemberId)?.name || 'this person'}`
                  : 'No lists yet'}
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {selectedFamilyMemberId === 'me'
                  ? 'Create a personal wishlist to get started'
                  : selectedFamilyMemberId
                  ? 'Create a list for them!'
                  : 'Create your first wishlist and start adding items you love'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-200 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First List
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLists.map((list) => (
                  <div
                    key={list._id}
                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden"
                  >
                    <Link
                      href={`/u/${user.username}/${list.slug}`}
                      className="block p-5"
                    >
                      <div
                        className="flex items-start gap-4 mb-4"
                        style={{ viewTransitionName: `list-${list.slug}`, contain: 'layout paint' }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <OccasionIcon type={list.occasion || 'Just Because'} className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-slate-600 transition-colors">
                            {list.title}
                          </h3>
                          {list.occasion && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${getOccasionConfig(list.occasion).bg} ${getOccasionConfig(list.occasion).text} border ${getOccasionConfig(list.occasion).border}`}>
                              {list.occasion}
                            </span>
                          )}
                        </div>
                      </div>

                      {list.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                          {list.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {list.itemCount || 0} items
                        </span>
                        {list.likeCount > 0 && (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {list.likeCount}
                          </span>
                        )}
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                          list.privacy === 'public'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : list.privacy === 'private'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {list.privacy}
                        </span>
                      </div>
                    </Link>

                    <div className="flex border-t border-slate-100">
                      <button
                        onClick={() => router.push(`/edit/${user.username}/${list.slug}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <div className="w-px bg-slate-100" />
                      <button
                        onClick={() => handleDeleteList(user.username, list.slug, list.title)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* New List Button at bottom */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 w-full mt-6 py-4 text-slate-500 font-medium hover:text-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New List
              </button>
            </>
          )
        ) : (
          // Shared with Me Tab
          sharedLists.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-violet-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No shared lists</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                When someone shares a list with you, it will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sharedLists.map((list) => (
                <Link
                  key={list._id}
                  href={`/u/${list.owner?.username}/${list.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden p-5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <OccasionIcon type={list.occasion || 'Just Because'} className="w-6 h-6 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-slate-600 transition-colors">
                        {list.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        by @{list.owner?.username}
                      </p>
                    </div>
                  </div>

                  {list.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {list.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {list.itemCount || 0} items
                    </span>
                    {list.claimedCount > 0 && (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {list.claimedCount} claimed
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
          </>
        )}

        {/* HAVE IT TAB CONTENT */}
        {mainTab === 'have' && (
          <>
            {/* Stats Header - Two cards side by side like mobile */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="text-3xl font-bold text-slate-900">{ownedProducts.length}</div>
                <div className="text-sm text-slate-500 mt-1">Products</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="text-3xl font-bold" style={{ color: ACCENT_ROSE }}>{ownedProducts.filter(p => !p.hasVideo).length}</div>
                <div className="text-sm text-slate-500 mt-1">Need Videos</div>
              </div>
            </div>

            {/* Achievements Banner - Yellow/Amber like mobile */}
            <Link
              href="/achievements"
              className="block mb-6 rounded-2xl p-5 border transition-all hover:shadow-lg"
              style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fbbf24' }}>
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1" style={{ color: '#92400e' }}>Earn Achievements</h3>
                  <p className="text-sm" style={{ color: '#a16207' }}>
                    Record video reviews to unlock badges and help others discover amazing products
                  </p>
                </div>
                <svg className="w-6 h-6 flex-shrink-0" style={{ color: '#d97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {/* Achievement preview icons */}
              <div className="flex mt-4 pt-4 border-t" style={{ borderColor: '#fcd34d' }}>
                <div className="flex-1 text-center">
                  <div className="w-9 h-9 mx-auto mb-1 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-5 h-5" style={{ color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#a16207' }}>First Video</span>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-9 h-9 mx-auto mb-1 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-5 h-5" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#a16207' }}>5 Reviews</span>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-9 h-9 mx-auto mb-1 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-5 h-5" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#a16207' }}>Helpful</span>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-9 h-9 mx-auto mb-1 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-5 h-5" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#a16207' }}>Trending</span>
                </div>
              </div>
            </Link>

            {/* Products List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex gap-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-100 rounded w-3/4 mb-3" />
                      <div className="h-8 bg-slate-100 rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : ownedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: ACCENT_ROSE + '15' }}
                >
                  <svg className="w-8 h-8" style={{ color: ACCENT_ROSE }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No products yet</h3>
                <p className="text-slate-500 text-sm mb-5 max-w-xs mx-auto">
                  Add products you own to record video reviews and share your experiences
                </p>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: ACCENT_ROSE }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
              </div>
            ) : (
              <>
                {/* Products needing videos first */}
                {ownedProducts.filter(p => !p.hasVideo).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Needs Video</h4>
                    <div className="space-y-3">
                      {ownedProducts.filter(p => !p.hasVideo).map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => router.push(`/product/${product._id}`)}
                        >
                          <div className="flex">
                            <div className="w-24 h-24 bg-slate-100 flex-shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-center">
                              <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/product/${product._id}/record`); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold self-start transition-colors"
                                style={{ backgroundColor: ACCENT_ROSE + '15', color: ACCENT_ROSE }}
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Record Video
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products with videos */}
                {ownedProducts.filter(p => p.hasVideo).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Complete</h4>
                    <div className="space-y-3">
                      {ownedProducts.filter(p => p.hasVideo).map((product) => (
                        <Link
                          key={product._id}
                          href={`/product/${product._id}`}
                          className="block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all"
                        >
                          <div className="flex">
                            <div className="w-24 h-24 bg-slate-100 flex-shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-center">
                              <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 self-start">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Has Video
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Product Button */}
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center justify-center gap-2 w-full py-4 font-semibold transition-colors"
                  style={{ color: ACCENT_ROSE }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
              </>
            )}
          </>
        )}
      </main>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          fetchLists() // Refresh lists after modal closes
        }}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={() => {
          fetchLists() // This will also refresh owned products
        }}
      />
    </div>
  )
}
