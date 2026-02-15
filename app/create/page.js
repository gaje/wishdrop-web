'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/lib/AuthContext'
import api, { APIError } from '@/lib/api'

const OCCASIONS = [
  'Birthday',
  'Holiday',
  'Wedding',
  'Baby Shower',
  'Anniversary',
  'Graduation',
  'Housewarming',
  'Just Because',
  'Other',
]

// SVG Icon component for categories
const CategoryIcon = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case 'tech-electronics':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case 'fashion-apparel':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 'home-decor':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'beauty-personal-care':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    case 'sports-fitness':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'books-media':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'arts-crafts':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    case 'garden-outdoors':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'gifts-novelty':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    case 'kitchen-cooking':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
  }
}

const INTEREST_CATEGORIES = [
  { id: 'tech-electronics', label: 'Tech & Electronics' },
  { id: 'fashion-apparel', label: 'Fashion & Apparel' },
  { id: 'home-decor', label: 'Home & Decor' },
  { id: 'beauty-personal-care', label: 'Beauty & Personal Care' },
  { id: 'sports-fitness', label: 'Sports & Fitness' },
  { id: 'books-media', label: 'Books & Media' },
  { id: 'arts-crafts', label: 'Arts & Crafts' },
  { id: 'garden-outdoors', label: 'Garden & Outdoors' },
  { id: 'gifts-novelty', label: 'Gifts & Novelty' },
  { id: 'kitchen-cooking', label: 'Kitchen & Cooking' },
]

function CreateListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    occasion: '',
    privacy: 'public',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Family member selection
  const [familyMembers, setFamilyMembers] = useState([])
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState(null)
  const [showFamilySelector, setShowFamilySelector] = useState(false)

  // Category selection
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)

  // Surprise settings
  const [surpriseSettings, setSurpriseSettings] = useState({
    notifyOnClaim: true,
    revealClaimer: false,
  })
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load family member from URL params and fetch family members
  useEffect(() => {
    const familyMemberId = searchParams.get('familyMemberId')
    if (familyMemberId) {
      setSelectedFamilyMemberId(familyMemberId)
    }

    if (user) {
      loadFamilyMembers()
      loadDefaultSurpriseSettings()
    }
  }, [user, searchParams])

  const loadFamilyMembers = async () => {
    try {
      const response = await api.family.getMembers()
      setFamilyMembers(response.members || [])
    } catch (err) {
      console.log('No family members:', err)
    }
  }

  const loadDefaultSurpriseSettings = async () => {
    try {
      const response = await api.users.getNotificationPreferences()
      if (response?.preferences?.defaultSurpriseSettings) {
        setSurpriseSettings(response.preferences.defaultSurpriseSettings)
      }
    } catch (err) {
      console.log('No notification preferences set yet')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSurpriseToggle = (key, value) => {
    const updates = { [key]: value }
    // When turning off notifications, also turn off revealClaimer
    if (key === 'notifyOnClaim' && !value) {
      updates.revealClaimer = false
    }
    setSurpriseSettings(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Please enter a list title')
      return
    }

    setLoading(true)

    try {
      const response = await api.lists.create({
        ...formData,
        categories: selectedCategories,
        familyMemberId: selectedFamilyMemberId || undefined,
        surpriseSettings,
      })
      // Redirect to the new list
      router.push(`/u/${user.username}/${response.list.slug}`)
    } catch (err) {
      console.error('Create list error:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to create list. Please try again.')
      }
      setLoading(false)
    }
  }

  const getSelectedMemberName = () => {
    if (!selectedFamilyMemberId) return 'Me (Personal List)'
    const member = familyMembers.find(m => m._id === selectedFamilyMemberId)
    return member ? (member.displayName || member.name) : 'Unknown'
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getSurpriseModeName = () => {
    if (!surpriseSettings.notifyOnClaim) return 'Maximum Surprise'
    if (surpriseSettings.revealClaimer) return 'Full Transparency'
    return 'Balanced Mode'
  }

  const getSurpriseModeDescription = () => {
    if (!surpriseSettings.notifyOnClaim) return "You won't know anything until the big day!"
    if (surpriseSettings.revealClaimer) return "You'll know who got you what"
    return 'Get notified, keep claimer secret'
  }

  const getSurpriseModeColors = () => {
    if (!surpriseSettings.notifyOnClaim) {
      return { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-500', text: 'text-green-700', subtext: 'text-green-600' }
    }
    if (surpriseSettings.revealClaimer) {
      return { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', text: 'text-amber-700', subtext: 'text-amber-600' }
    }
    return { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-500', text: 'text-purple-700', subtext: 'text-purple-600' }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin" />
      </div>
    )
  }

  const surpriseColors = getSurpriseModeColors()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create a New List</h1>
              <p className="text-slate-500">Share your wishes with friends and family</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in-up">
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Family Member Selection */}
            {familyMembers.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowFamilySelector(!showFamilySelector)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Who is this list for?</p>
                      <p className="text-sm text-gray-600">{getSelectedMemberName()}</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showFamilySelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFamilySelector && (
                  <div className="border-t border-gray-200 p-4 space-y-2">
                    {/* Me option */}
                    <button
                      type="button"
                      onClick={() => setSelectedFamilyMemberId(null)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        selectedFamilyMemberId === null
                          ? 'bg-cyan-50 border-2 border-cyan-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedFamilyMemberId === null ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`font-medium ${selectedFamilyMemberId === null ? 'text-cyan-700' : 'text-gray-700'}`}>
                        Me (Personal List)
                      </span>
                      {selectedFamilyMemberId === null && (
                        <svg className="w-5 h-5 text-cyan-500 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>

                    {/* Family members */}
                    {familyMembers.map((member, index) => (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => setSelectedFamilyMemberId(member._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          selectedFamilyMemberId === member._id
                            ? 'bg-cyan-50 border-2 border-cyan-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor: selectedFamilyMemberId === member._id
                              ? '#14b8a6'
                              : ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 6]
                          }}
                        >
                          {getInitials(member.name)}
                        </div>
                        <div className="text-left">
                          <p className={`font-medium ${selectedFamilyMemberId === member._id ? 'text-cyan-700' : 'text-gray-700'}`}>
                            {member.displayName || member.name}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{member.relationship}</p>
                        </div>
                        {selectedFamilyMemberId === member._id && (
                          <svg className="w-5 h-5 text-cyan-500 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </button>
                    ))}

                    <Link
                      href="/family/add"
                      className="flex items-center justify-center gap-2 p-3 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">Add New Family Member</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
                List Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                placeholder="e.g., Nick's Birthday Wishlist"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none text-slate-900 placeholder-slate-400"
                placeholder="Tell people what this list is for..."
                disabled={loading}
              />
            </div>

            {/* Occasion */}
            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-slate-700 mb-1.5">
                Occasion <span className="text-slate-400">(optional)</span>
              </label>
              <select
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-900"
                disabled={loading}
              >
                <option value="">Select an occasion</option>
                {OCCASIONS.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {occasion}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCategorySelector(!showCategorySelector)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Categories</p>
                    <p className="text-sm text-slate-500">
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} selected`
                        : 'Helps with suggestions (optional)'}
                    </p>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${showCategorySelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCategorySelector && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_CATEGORIES.map((category) => {
                      const isSelected = selectedCategories.includes(category.id)
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-500 to-cyan-500 text-white shadow-sm'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <CategoryIcon type={category.id} className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          <span className="text-sm font-medium">{category.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Privacy
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can find and view', icon: 'globe' },
                  { value: 'unlisted', label: 'Unlisted', desc: 'Only people with link', icon: 'link' },
                  { value: 'private', label: 'Private', desc: 'Only you can view', icon: 'lock' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.privacy === option.value
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value={option.value}
                      checked={formData.privacy === option.value}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={loading}
                    />
                    {option.icon === 'globe' && (
                      <svg className={`w-5 h-5 ${formData.privacy === option.value ? 'text-cyan-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {option.icon === 'link' && (
                      <svg className={`w-5 h-5 ${formData.privacy === option.value ? 'text-cyan-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                    {option.icon === 'lock' && (
                      <svg className={`w-5 h-5 ${formData.privacy === option.value ? 'text-cyan-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.desc}</p>
                    </div>
                    {formData.privacy === option.value && (
                      <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Surprise Settings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Gradient accent bar */}
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>

              <button
                type="button"
                onClick={() => setShowSurpriseModal(true)}
                className="w-full p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">Gift Surprise Settings</p>
                      <p className="text-xs text-slate-500">Control what you see when items are claimed</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Current mode display */}
                <div className={`${surpriseColors.bg} ${surpriseColors.border} border rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-full ${surpriseColors.icon} flex items-center justify-center`}>
                      {!surpriseSettings.notifyOnClaim ? (
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.53 1.45l-1.42 1.41 1.06 1.06c.27-.14.56-.22.87-.22.55 0 1.05.22 1.41.59.78.78.78 2.05 0 2.83L13 10.59l1.41 1.41 3.54-3.54a4 4 0 00-5.66-5.66l-1.06-1.06 1.42-1.41-1.42-1.42-3.54 3.54a4 4 0 005.66 5.66L10.53 12l1.41-1.41-2.83-2.83c-.78-.78-.78-2.05 0-2.83s2.05-.78 2.83 0L14.53 7.52a2 2 0 01-2.83 2.83L10.53 9.18 9.12 10.59l3.54 3.54a4 4 0 005.66-5.66l-1.06-1.06 1.42-1.41-1.42-1.42-.73.73z"/>
                        </svg>
                      ) : surpriseSettings.revealClaimer ? (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${surpriseColors.text}`}>
                      {getSurpriseModeName()}
                    </span>
                  </div>
                  <p className={`text-sm ${surpriseColors.subtext} ml-8`}>
                    {getSurpriseModeDescription()}
                  </p>
                </div>

                <p className="text-xs text-violet-600 font-medium mt-3 flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Tap to customize these settings
                </p>
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create List'
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </main>

      {/* Surprise Settings Modal */}
      {showSurpriseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                  </svg>
                  <h2 className="text-2xl font-bold">Gift Surprise Settings</h2>
                </div>
                <button
                  onClick={() => setShowSurpriseModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-white/90">Keep the magic alive! Choose how you want to handle gift surprises.</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Explanation */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2">How do you want to handle claims?</h3>
                <p className="text-gray-600 text-sm">
                  When someone claims an item from your list, you have options for how much you want to know. Choose what works best for you!
                </p>

                <div className="bg-purple-50 p-3 rounded-xl mt-4 flex gap-2">
                  <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pro Tip</p>
                    <p className="text-sm text-gray-600">
                      If this is a gift list for yourself, you might want to keep it a complete surprise! Turn off notifications or hide who claimed items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                {/* Notify on Claim */}
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Notify Me When Items Are Claimed</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Get a notification when someone marks an item as purchased. You can still keep who claimed it a secret!
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={surpriseSettings.notifyOnClaim}
                        onChange={(e) => handleSurpriseToggle('notifyOnClaim', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {surpriseSettings.notifyOnClaim && (
                    <div className="ml-13 mt-3 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
                        </svg>
                        Preview: "Someone claimed 'Nike Sneakers' from your Birthday list"
                      </p>
                    </div>
                  )}
                </div>

                {/* Reveal Claimer */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <svg className={`w-5 h-5 text-amber-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {surpriseSettings.revealClaimer ? (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Show Me Who Claimed Items</p>
                        <p className="text-sm text-gray-600 mt-1">
                          See exactly who purchased each item. Warning: This might spoil the surprise!
                        </p>
                      </div>
                    </div>
                    <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${!surpriseSettings.notifyOnClaim ? 'opacity-50' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={surpriseSettings.revealClaimer}
                        onChange={(e) => handleSurpriseToggle('revealClaimer', e.target.checked)}
                        disabled={!surpriseSettings.notifyOnClaim}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {surpriseSettings.notifyOnClaim && surpriseSettings.revealClaimer && (
                    <div className="ml-13 mt-3 bg-amber-50 rounded-xl p-3">
                      <p className="text-xs text-amber-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Preview: "Sarah claimed 'Nike Sneakers' from your Birthday list"
                      </p>
                    </div>
                  )}

                  {!surpriseSettings.notifyOnClaim && (
                    <div className="ml-13 mt-3 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 italic">
                        Enable notifications first to reveal who claimed items
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Mode Summary */}
              <div className={`${surpriseColors.bg} ${surpriseColors.border} border rounded-xl p-4 mt-6`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full ${surpriseColors.icon} flex items-center justify-center`}>
                    {!surpriseSettings.notifyOnClaim ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    ) : surpriseSettings.revealClaimer ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wide ${surpriseColors.text}`}>
                    {getSurpriseModeName()}
                  </span>
                </div>
                <p className={`text-sm ${surpriseColors.subtext} ml-9 font-medium`}>
                  {getSurpriseModeDescription()}
                </p>
              </div>

              {/* Info */}
              <div className="bg-purple-50 rounded-xl p-3 mt-4 flex gap-2">
                <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <p className="text-sm text-gray-700">
                  These settings are just for this list. You can change your default settings in your profile.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSurpriseModal(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateList() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin" />
      </div>
    }>
      <CreateListContent />
    </Suspense>
  )
}
