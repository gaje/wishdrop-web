'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import Header from '@/components/Header'

const RelationshipIcon = ({ type, className }) => {
  switch (type) {
    case 'child':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'spouse':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )
    case 'partner':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'parent':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'sibling':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'friend':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}

const RELATIONSHIPS = [
  { value: 'child', label: 'Child', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', selected: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  { value: 'spouse', label: 'Spouse', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', selected: 'border-rose-500 bg-rose-50', iconColor: 'text-rose-600' },
  { value: 'partner', label: 'Partner', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', selected: 'border-pink-500 bg-pink-50', iconColor: 'text-pink-600' },
  { value: 'parent', label: 'Parent', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', selected: 'border-violet-500 bg-violet-50', iconColor: 'text-violet-600' },
  { value: 'sibling', label: 'Sibling', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', selected: 'border-cyan-500 bg-cyan-50', iconColor: 'text-cyan-600' },
  { value: 'friend', label: 'Friend', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', selected: 'border-emerald-500 bg-emerald-50', iconColor: 'text-emerald-600' },
  { value: 'other', label: 'Other', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', selected: 'border-slate-500 bg-slate-100', iconColor: 'text-slate-600' },
]

export default function EditFamilyMemberPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [birthday, setBirthday] = useState('')
  const [showOptionalInfo, setShowOptionalInfo] = useState(false)
  const [interests, setInterests] = useState('')
  const [favoriteColors, setFavoriteColors] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [shirtSize, setShirtSize] = useState('')
  const [shoeSize, setShoeSize] = useState('')
  const [pantSize, setPantSize] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && id) {
      loadMember()
    }
  }, [user, id])

  const loadMember = async () => {
    try {
      setLoading(true)
      const response = await api.family.getMember(id)
      const member = response.member

      setName(member.name || '')
      setRelationship(member.relationship || '')
      if (member.dateOfBirth) {
        setBirthday(new Date(member.dateOfBirth).toISOString().split('T')[0])
      }
      setInterests(member.interests?.join(', ') || '')
      setFavoriteColors(member.favoriteColors?.join(', ') || '')
      setHobbies(member.hobbies?.join(', ') || '')
      setShirtSize(member.sizes?.shirt || '')
      setShoeSize(member.sizes?.shoes || '')
      setPantSize(member.sizes?.pants || '')

      // Show optional info if any is set
      if (member.interests?.length || member.favoriteColors?.length || member.hobbies?.length ||
          member.sizes?.shirt || member.sizes?.shoes || member.sizes?.pants) {
        setShowOptionalInfo(true)
      }
    } catch (err) {
      console.error('Failed to load family member:', err)
      setError(err.message || 'Failed to load family member')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = birthday ? calculateAge(birthday) : null

  const handleSave = async () => {
    setError('')

    if (!name.trim()) {
      setError('Please enter a name')
      return
    }

    if (!relationship) {
      setError('Please select a relationship')
      return
    }

    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        relationship,
        dateOfBirth: birthday ? new Date(birthday).toISOString() : undefined,
        interests: interests ? interests.split(',').map(i => i.trim()).filter(Boolean) : [],
        favoriteColors: favoriteColors ? favoriteColors.split(',').map(c => c.trim()).filter(Boolean) : [],
        hobbies: hobbies ? hobbies.split(',').map(h => h.trim()).filter(Boolean) : [],
        sizes: {
          shirt: shirtSize.trim() || undefined,
          shoes: shoeSize.trim() || undefined,
          pants: pantSize.trim() || undefined,
        },
      }

      await api.family.updateMember(id, data)
      router.push(`/family/${id}`)
    } catch (err) {
      console.error('Failed to update family member:', err)
      setError(err.message || 'Failed to update family member. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/family/${id}`}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancel
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Edit Family Member</h1>
              <p className="text-slate-500">Update {name || 'family member'}'s profile</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-fade-in-up">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bobby"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
            />
          </div>

          {/* Relationship */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Relationship <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {RELATIONSHIPS.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => setRelationship(rel.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    relationship === rel.value
                      ? rel.selected
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <RelationshipIcon type={rel.value} className={`w-5 h-5 ${relationship === rel.value ? rel.iconColor : 'text-slate-400'}`} />
                  <span className="font-medium text-sm">{rel.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Birthday */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Birthday <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
            />
            {age !== null && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {age} {age === 1 ? 'year' : 'years'} old
              </div>
            )}
          </div>

          {/* Optional Information Toggle */}
          <button
            type="button"
            onClick={() => setShowOptionalInfo(!showOptionalInfo)}
            className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors animate-fade-in-up"
            style={{ animationDelay: '0.15s' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-900">Additional Details</span>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${showOptionalInfo ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Optional Information */}
          {showOptionalInfo && (
            <>
              {/* Interests */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-fade-in-up">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Interests
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., LEGO, dinosaurs, art"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
                />
                <p className="mt-2 text-xs text-slate-500">Separate with commas</p>
              </div>

              {/* Favorite Colors */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-fade-in-up">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Favorite Colors
                </label>
                <input
                  type="text"
                  value={favoriteColors}
                  onChange={(e) => setFavoriteColors(e.target.value)}
                  placeholder="e.g., blue, green"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
                />
                <p className="mt-2 text-xs text-slate-500">Separate with commas</p>
              </div>

              {/* Hobbies */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-fade-in-up">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Hobbies
                </label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder="e.g., soccer, drawing, reading"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
                />
                <p className="mt-2 text-xs text-slate-500">Separate with commas</p>
              </div>

              {/* Sizes */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-fade-in-up">
                <label className="block text-sm font-semibold text-slate-900 mb-4">
                  Sizes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Shirt</label>
                    <input
                      type="text"
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value)}
                      placeholder="e.g., Youth M"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Shoe</label>
                    <input
                      type="text"
                      value={shoeSize}
                      onChange={(e) => setShoeSize(e.target.value)}
                      placeholder="e.g., 7"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Pants</label>
                    <input
                      type="text"
                      value={pantSize}
                      onChange={(e) => setPantSize(e.target.value)}
                      placeholder="e.g., 32x34"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim() || !relationship}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 animate-fade-in-up ${
              saving || !name.trim() || !relationship
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-200/50'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
