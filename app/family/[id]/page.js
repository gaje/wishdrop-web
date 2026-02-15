'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import Header from '@/components/Header'

const RELATIONSHIP_LABELS = {
  child: 'Child',
  spouse: 'Spouse',
  partner: 'Partner',
  parent: 'Parent',
  sibling: 'Sibling',
  friend: 'Friend',
  other: 'Other',
}

const AVATAR_COLORS = [
  'from-cyan-400 to-cyan-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-pink-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-green-500',
]

export default function FamilyMemberDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      setMember(response.member)
    } catch (err) {
      console.error('Failed to load family member:', err)
      setError(err.message || 'Failed to load family member')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await api.family.deleteMember(id)
      router.push('/family')
    } catch (err) {
      console.error('Failed to delete family member:', err)
      alert(err.message || 'Failed to delete family member')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Family Member Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This family member could not be found.'}</p>
          <Link href="/family" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Family
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-50 to-blue-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Link
            href="/family"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-6 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Family
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${AVATAR_COLORS[0]} flex items-center justify-center flex-shrink-0 ring-4 ring-white/30`}>
              {member.avatar ? (
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={128}
                  height={128}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-3xl sm:text-4xl">
                  {getInitials(member.name)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {member.displayName || member.name}
                </h1>
                {member.age !== null && member.age !== undefined && (
                  <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white">
                    {member.age} {member.age === 1 ? 'year' : 'years'} old
                  </span>
                )}
              </div>
              <p className="text-white/80 text-lg capitalize mb-4">
                {RELATIONSHIP_LABELS[member.relationship] || member.relationship}
              </p>

              {/* Upcoming Birthday */}
              {member.daysUntilBirthday !== null && member.daysUntilBirthday !== undefined && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-xl text-amber-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"/>
                  </svg>
                  <span className="font-medium">
                    {member.daysUntilBirthday === 0
                      ? 'Birthday is today!'
                      : member.daysUntilBirthday === 1
                      ? 'Birthday is tomorrow'
                      : `Birthday in ${member.daysUntilBirthday} days`}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href={`/family/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-white rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lists */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Wishlists</h2>
                <Link
                  href={`/create?familyMemberId=${id}`}
                  className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create List
                </Link>
              </div>

              {member.lists?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No wishlists yet for {member.name}</p>
                  <Link
                    href={`/create?familyMemberId=${id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First List
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {member.lists.map((list) => (
                    <Link
                      key={list._id}
                      href={`/u/${user.username}/${list.slug}`}
                      className="block p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{list.title}</h3>
                          {list.occasion && (
                            <span className="text-sm text-gray-500">{list.occasion}</span>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            {member.upcomingEvents?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h2>
                <div className="space-y-3">
                  {member.upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-amber-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(event.date)}
                          {event.daysUntil !== undefined && (
                            <span className="ml-1 text-amber-600">
                              ({event.daysUntil === 0 ? 'Today!' : event.daysUntil === 1 ? 'Tomorrow' : `${event.daysUntil} days away`})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
              <dl className="space-y-4">
                {member.dateOfBirth && (
                  <div>
                    <dt className="text-sm text-gray-500">Birthday</dt>
                    <dd className="font-medium text-gray-900">{formatDate(member.dateOfBirth)}</dd>
                  </div>
                )}
                {member.nickname && (
                  <div>
                    <dt className="text-sm text-gray-500">Nickname</dt>
                    <dd className="font-medium text-gray-900">{member.nickname}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Interests & Hobbies */}
            {(member.interests?.length > 0 || member.hobbies?.length > 0 || member.favoriteColors?.length > 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Preferences</h2>
                <div className="space-y-4">
                  {member.interests?.length > 0 && (
                    <div>
                      <dt className="text-sm text-gray-500 mb-2">Interests</dt>
                      <dd className="flex flex-wrap gap-2">
                        {member.interests.map((interest, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {interest}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {member.hobbies?.length > 0 && (
                    <div>
                      <dt className="text-sm text-gray-500 mb-2">Hobbies</dt>
                      <dd className="flex flex-wrap gap-2">
                        {member.hobbies.map((hobby, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {hobby}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {member.favoriteColors?.length > 0 && (
                    <div>
                      <dt className="text-sm text-gray-500 mb-2">Favorite Colors</dt>
                      <dd className="flex flex-wrap gap-2">
                        {member.favoriteColors.map((color, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {color}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sizes */}
            {member.sizes && (member.sizes.shirt || member.sizes.shoes || member.sizes.pants) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sizes</h2>
                <dl className="space-y-3">
                  {member.sizes.shirt && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Shirt</dt>
                      <dd className="font-medium text-gray-900">{member.sizes.shirt}</dd>
                    </div>
                  )}
                  {member.sizes.shoes && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Shoes</dt>
                      <dd className="font-medium text-gray-900">{member.sizes.shoes}</dd>
                    </div>
                  )}
                  {member.sizes.pants && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Pants</dt>
                      <dd className="font-medium text-gray-900">{member.sizes.pants}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Family Member?</h3>
              <p className="text-gray-600">
                Are you sure you want to remove {member.name} from your family? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
