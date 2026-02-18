'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/lib/AuthContext'
import api, { APIError } from '@/lib/api'

const CURRENCIES = [
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
  { value: 'CAD', label: 'CAD', symbol: 'C$' },
  { value: 'AUD', label: 'AUD', symbol: 'A$' },
]

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Discoverable by anyone. Only your connections can claim.', color: 'emerald' },
  { value: 'shared', label: 'Shared', description: 'Only people you share the link with. Anyone with the link can claim.', color: 'amber' },
  { value: 'private', label: 'Private', description: 'Only you can see this list.', color: 'rose' },
]

const PrivacyIcon = ({ type, className }) => {
  switch (type) {
    case 'public':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'shared':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    case 'private':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    default:
      return null
  }
}

const NOTIFICATION_TYPES = [
  { key: 'achievements', icon: 'trophy', label: 'Achievements', description: 'When you unlock a new achievement', color: 'amber' },
  { key: 'followers', icon: 'user-plus', label: 'New Followers', description: 'When someone follows you', color: 'blue' },
  { key: 'likes', icon: 'heart', label: 'Likes', description: 'When someone likes your list', color: 'rose' },
  { key: 'comments', icon: 'chat', label: 'Comments', description: 'When someone comments on your list', color: 'violet' },
  { key: 'listShared', icon: 'share', label: 'List Shared', description: 'When someone shares a list with you', color: 'cyan' },
  { key: 'itemClaimed', icon: 'gift', label: 'Items Claimed', description: 'When someone claims an item from your list', color: 'emerald' },
  { key: 'newListFromFollowing', icon: 'document', label: 'New Lists', description: 'When people you follow create lists', color: 'purple' },
  { key: 'connectionRequests', icon: 'link', label: 'Connection Requests', description: 'When someone wants to connect with you', color: 'teal' },
]

const ICON_COLORS = {
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
  violet: 'bg-violet-50 text-violet-600 border-violet-200',
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  teal: 'bg-teal-50 text-teal-600 border-teal-200',
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout, refreshUser } = useAuth()

  const [lists, setLists] = useState([])
  const [settings, setSettings] = useState({
    defaultListId: '',
    defaultPrivacy: 'public',
    currency: 'USD',
  })
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    masterToggle: true,
    types: {
      achievements: true,
      likes: true,
      comments: true,
      followers: true,
      listShared: true,
      itemClaimed: true,
      newListFromFollowing: true,
    },
    defaultSurpriseSettings: {
      notifyOnClaim: true,
      revealClaimer: false,
    },
  })
  const [notificationLoading, setNotificationLoading] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      setDisplayName(user.displayName || '')
      if (user.settings) {
        setSettings({
          defaultListId: user.settings.defaultListId || '',
          defaultPrivacy: user.settings.defaultPrivacy || 'public',
          currency: user.settings.currency || 'USD',
        })
      }
      loadLists()
      loadNotificationPreferences()
    }
  }, [user, authLoading, router])

  const loadLists = async () => {
    try {
      const response = await api.lists.getMine()
      setLists(response.lists || [])
    } catch (err) {
      console.error('Failed to load lists:', err)
    }
  }

  const loadNotificationPreferences = async () => {
    try {
      setNotificationLoading(true)
      const response = await api.users.getNotificationPreferences()
      if (response.preferences) {
        setNotificationPrefs(response.preferences)
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err)
    } finally {
      setNotificationLoading(false)
    }
  }

  const updateNotificationPreference = async (updates) => {
    try {
      setSavingNotifications(true)
      const response = await api.users.updateNotificationPreferences(updates)
      if (response.preferences) {
        setNotificationPrefs(response.preferences)
      }
      setSuccess('Notification settings saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to update notification preferences:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to save notification settings')
      }
    } finally {
      setSavingNotifications(false)
    }
  }

  const toggleMasterNotifications = (value) => {
    setNotificationPrefs((prev) => ({ ...prev, masterToggle: value }))
    updateNotificationPreference({ masterToggle: value })
  }

  const toggleNotificationType = (key, value) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      types: { ...prev.types, [key]: value },
    }))
    updateNotificationPreference({ types: { [key]: value } })
  }

  const toggleSurpriseSetting = (key, value) => {
    const updates = { [key]: value }
    if (key === 'notifyOnClaim' && !value) {
      updates.revealClaimer = false
    }
    setNotificationPrefs((prev) => ({
      ...prev,
      defaultSurpriseSettings: { ...prev.defaultSurpriseSettings, ...updates },
    }))
    updateNotificationPreference({ defaultSurpriseSettings: updates })
  }

  const getNotificationIcon = (iconType) => {
    switch (iconType) {
      case 'trophy':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
      case 'user-plus':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        )
      case 'heart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'chat':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'share':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )
      case 'gift':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        )
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'link':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await api.users.updateProfile({ displayName })
      await refreshUser()
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to update profile:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await api.users.updateSettings(settings)
      await refreshUser()
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to save settings')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setError('')

    try {
      await api.users.deleteAccount()
      await logout()
      router.push('/')
    } catch (err) {
      console.error('Failed to delete account:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to delete account')
      }
      setDeleting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading settings...</p>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-200/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-500">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
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

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Account</h2>
                  <p className="text-sm text-slate-500">Your personal information</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-2">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                  placeholder="Enter your display name"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 flex items-center gap-2">
                  <span className="text-slate-400">@</span>
                  {user.username}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
                  <p className="text-sm text-slate-500">Customize your experience</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="defaultList" className="block text-sm font-medium text-slate-700 mb-2">
                  Default List
                </label>
                <div className="relative">
                  <select
                    id="defaultList"
                    value={settings.defaultListId}
                    onChange={(e) => setSettings({ ...settings, defaultListId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white transition-all text-slate-900 appearance-none cursor-pointer"
                  >
                    <option value="">None selected</option>
                    {lists.map((list) => (
                      <option key={list._id} value={list._id}>
                        {list.title}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="mt-2 text-xs text-slate-500">New items will be added to this list by default</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Default Privacy
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIVACY_OPTIONS.map((option) => {
                    const isSelected = settings.defaultPrivacy === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSettings({ ...settings, defaultPrivacy: option.value })}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? option.color === 'emerald'
                              ? 'border-emerald-500 bg-emerald-50'
                              : option.color === 'amber'
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-rose-500 bg-rose-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                          option.color === 'emerald' ? 'bg-emerald-100' : option.color === 'amber' ? 'bg-amber-100' : 'bg-rose-100'
                        }`}>
                          <PrivacyIcon type={option.value} className={`w-5 h-5 ${
                            option.color === 'emerald' ? 'text-emerald-600' : option.color === 'amber' ? 'text-amber-600' : 'text-rose-600'
                          }`} />
                        </div>
                        <div className={`font-medium text-sm ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{option.description}</div>
                        {isSelected && (
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                            option.color === 'emerald' ? 'bg-emerald-500' : option.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Currency
                </label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map((currency) => {
                    const isSelected = settings.currency === currency.value
                    return (
                      <button
                        key={currency.value}
                        type="button"
                        onClick={() => setSettings({ ...settings, currency: currency.value })}
                        className={`px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="font-medium">{currency.symbol}</span>
                        <span className="text-slate-600">{currency.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Notification Settings Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                  <p className="text-sm text-slate-500">Control what you're notified about</p>
                </div>
              </div>
            </div>

            {notificationLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500">Loading notifications...</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Enable All Notifications</h3>
                      <p className="text-sm text-slate-500">Master switch for all notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMasterNotifications(!notificationPrefs.masterToggle)}
                    disabled={savingNotifications}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      notificationPrefs.masterToggle ? 'bg-cyan-500' : 'bg-slate-300'
                    } ${savingNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        notificationPrefs.masterToggle ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Notification Types */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Notification Types</h3>
                  <div className="space-y-2">
                    {NOTIFICATION_TYPES.map((type) => (
                      <div
                        key={type.key}
                        className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${ICON_COLORS[type.color]}`}>
                            {getNotificationIcon(type.icon)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{type.label}</p>
                            <p className="text-sm text-slate-500">{type.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleNotificationType(type.key, !notificationPrefs.types[type.key])}
                          disabled={savingNotifications || !notificationPrefs.masterToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationPrefs.types[type.key] && notificationPrefs.masterToggle
                              ? 'bg-cyan-500'
                              : 'bg-slate-300'
                          } ${savingNotifications || !notificationPrefs.masterToggle ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              notificationPrefs.types[type.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gift Surprise Settings */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Gift Surprise Settings</h3>
                      <p className="text-sm text-slate-500">Default settings for new lists</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Notify on Claim */}
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">Notify When Items Are Claimed</p>
                        <p className="text-sm text-slate-500">Get notified when someone marks an item as purchased</p>
                      </div>
                      <button
                        onClick={() => toggleSurpriseSetting('notifyOnClaim', !notificationPrefs.defaultSurpriseSettings.notifyOnClaim)}
                        disabled={savingNotifications}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationPrefs.defaultSurpriseSettings.notifyOnClaim ? 'bg-cyan-500' : 'bg-slate-300'
                        } ${savingNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            notificationPrefs.defaultSurpriseSettings.notifyOnClaim ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Reveal Claimer */}
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">Reveal Who Claimed Items</p>
                        <p className="text-sm text-slate-500">Show who claimed the item (may spoil the surprise!)</p>
                      </div>
                      <button
                        onClick={() => toggleSurpriseSetting('revealClaimer', !notificationPrefs.defaultSurpriseSettings.revealClaimer)}
                        disabled={savingNotifications || !notificationPrefs.defaultSurpriseSettings.notifyOnClaim}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationPrefs.defaultSurpriseSettings.revealClaimer && notificationPrefs.defaultSurpriseSettings.notifyOnClaim
                            ? 'bg-cyan-500'
                            : 'bg-slate-300'
                        } ${savingNotifications || !notificationPrefs.defaultSurpriseSettings.notifyOnClaim ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            notificationPrefs.defaultSurpriseSettings.revealClaimer ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-purple-800">
                        These are your default settings. You can customize them for each list when creating or editing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Saving Indicator */}
                {savingNotifications && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-cyan-500 rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-600 font-medium">Saving changes...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Family Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Family</h2>
                  <p className="text-sm text-slate-500">Manage wishlists for loved ones</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                href="/family"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 group-hover:bg-white border border-transparent group-hover:border-violet-200 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-slate-900 font-medium">Manage Family Members</span>
                    <p className="text-sm text-slate-500">Add and edit family profiles</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Quick Links</h2>
                  <p className="text-sm text-slate-500">Shortcuts to useful pages</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                href={`/u/${user.username}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white border border-transparent group-hover:border-slate-200 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-slate-900 font-medium">View Public Profile</span>
                    <p className="text-sm text-slate-500">See how others see you</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/profile/edit"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white border border-transparent group-hover:border-slate-200 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-slate-900 font-medium">Edit Profile</span>
                    <p className="text-sm text-slate-500">Update your bio and avatar</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/connections"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 group-hover:bg-white border border-transparent group-hover:border-teal-200 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-slate-900 font-medium">Connections & Blocked</span>
                    <p className="text-sm text-slate-500">Manage your connections and blocked users</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/achievements"
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-white border border-transparent group-hover:border-amber-200 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-slate-900 font-medium">Achievements</span>
                    <p className="text-sm text-slate-500">View your unlocked badges</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border-2 border-rose-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-rose-700">Danger Zone</h2>
                  <p className="text-sm text-rose-600/70">Irreversible actions</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3.5 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-6 py-3.5 border-2 border-rose-300 text-rose-600 rounded-xl font-medium hover:bg-rose-50 hover:border-rose-400 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Account
                </button>
              ) : (
                <div className="p-5 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-rose-800 mb-1">Are you absolutely sure?</h4>
                      <p className="text-rose-700 text-sm">
                        This action cannot be undone. All your lists, items, and data will be permanently deleted.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        'Yes, Delete My Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
