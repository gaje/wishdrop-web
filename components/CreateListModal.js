'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    case 'sports-fitness':
    case 'garden-outdoors':
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

export default function CreateListModal({ isOpen, onClose, familyMemberId: initialFamilyMemberId }) {
  const router = useRouter()
  const { user } = useAuth()

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
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState(initialFamilyMemberId || null)
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

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadFamilyMembers()
      loadDefaultSurpriseSettings()
    }
  }, [isOpen, user])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: '', description: '', occasion: '', privacy: 'public' })
      setError('')
      setSelectedCategories([])
      setShowCategorySelector(false)
      setShowFamilySelector(false)
      setShowSurpriseModal(false)
    }
  }, [isOpen])

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
      onClose()
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

  if (!isOpen) return null

  const surpriseColors = getSurpriseModeColors()

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Create New List</h2>
                  <p className="text-sm text-slate-500">Share your wishes with friends and family</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Family Member Selection */}
              {familyMembers.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowFamilySelector(!showFamilySelector)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-900 text-sm">Who is this list for?</p>
                        <p className="text-xs text-slate-500">{getSelectedMemberName()}</p>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${showFamilySelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showFamilySelector && (
                    <div className="border-t border-slate-100 p-3 space-y-2 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => setSelectedFamilyMemberId(null)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          selectedFamilyMemberId === null
                            ? 'bg-cyan-50 border border-cyan-500'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedFamilyMemberId === null ? 'bg-cyan-500' : 'bg-slate-300'
                        }`}>
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className={`text-sm font-medium ${selectedFamilyMemberId === null ? 'text-cyan-700' : 'text-slate-700'}`}>
                          Me (Personal List)
                        </span>
                      </button>

                      {familyMembers.map((member, index) => (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => setSelectedFamilyMemberId(member._id)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                            selectedFamilyMemberId === member._id
                              ? 'bg-cyan-50 border border-cyan-500'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              backgroundColor: selectedFamilyMemberId === member._id
                                ? '#14b8a6'
                                : ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 6]
                            }}
                          >
                            {getInitials(member.name)}
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-medium ${selectedFamilyMemberId === member._id ? 'text-cyan-700' : 'text-slate-700'}`}>
                              {member.displayName || member.name}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">{member.relationship}</p>
                          </div>
                        </button>
                      ))}
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
                  autoFocus
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
                  rows={2}
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

              {/* Categories - Collapsible */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCategorySelector(!showCategorySelector)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 text-sm">Categories</p>
                      <p className="text-xs text-slate-500">
                        {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'Optional'}
                      </p>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showCategorySelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCategorySelector && (
                  <div className="border-t border-slate-100 p-3 bg-slate-50/50">
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_CATEGORIES.map((category) => {
                        const isSelected = selectedCategories.includes(category.id)
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                              isSelected
                                ? 'bg-gradient-to-r from-cyan-500 to-cyan-500 text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <CategoryIcon type={category.id} className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                            <span className="font-medium">{category.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Privacy</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'public', label: 'Public', icon: 'globe' },
                    { value: 'shared', label: 'Shared', icon: 'link' },
                    { value: 'private', label: 'Private', icon: 'lock' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, privacy: option.value })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.privacy === option.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      disabled={loading}
                    >
                      {option.icon === 'globe' && (
                        <svg className={`w-5 h-5 mx-auto mb-1 ${formData.privacy === option.value ? 'text-cyan-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {option.icon === 'link' && (
                        <svg className={`w-5 h-5 mx-auto mb-1 ${formData.privacy === option.value ? 'text-cyan-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                      {option.icon === 'lock' && (
                        <svg className={`w-5 h-5 mx-auto mb-1 ${formData.privacy === option.value ? 'text-cyan-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      <p className={`text-xs font-medium ${formData.privacy === option.value ? 'text-cyan-700' : 'text-slate-600'}`}>
                        {option.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Surprise Settings - Compact */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>
                <button
                  type="button"
                  onClick={() => setShowSurpriseModal(true)}
                  className="w-full p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-900 text-sm">Gift Surprise Settings</p>
                        <p className={`text-xs font-medium ${surpriseColors.text}`}>{getSurpriseModeName()}</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Surprise Settings Sub-Modal */}
      {showSurpriseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                  </svg>
                  <h2 className="text-xl font-bold">Gift Surprise Settings</h2>
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
              <p className="mt-2 text-white/90 text-sm">Choose how you want to handle gift surprises.</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="space-y-4">
                {/* Notify on Claim */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Notify Me When Items Are Claimed</p>
                      <p className="text-sm text-slate-500 mt-0.5">Get notified when someone marks an item as purchased</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={surpriseSettings.notifyOnClaim}
                      onChange={(e) => handleSurpriseToggle('notifyOnClaim', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Reveal Claimer */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Show Me Who Claimed Items</p>
                      <p className="text-sm text-slate-500 mt-0.5">See exactly who purchased each item</p>
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
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Current Mode Summary */}
              <div className={`${surpriseColors.bg} ${surpriseColors.border} border rounded-xl p-4 mt-6`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full ${surpriseColors.icon} flex items-center justify-center`}>
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wide ${surpriseColors.text}`}>
                    {getSurpriseModeName()}
                  </span>
                </div>
                <p className={`text-sm ${surpriseColors.subtext} ml-8`}>
                  {getSurpriseModeDescription()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200">
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
    </>
  )
}
