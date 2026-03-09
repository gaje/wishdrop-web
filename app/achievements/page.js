'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuth } from '@/lib/AuthContext'
import api, { APIError } from '@/lib/api'

// Tier colors and styling
const TIER_CONFIG = {
  bronze: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-100',
    label: 'Bronze',
    headerBg: 'bg-gradient-to-r from-amber-100 to-amber-200',
    badgeBg: 'bg-amber-600',
    progressBg: 'bg-amber-500',
    points: 10,
  },
  silver: {
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-700',
    icon: 'text-slate-500',
    iconBg: 'bg-slate-200',
    label: 'Silver',
    headerBg: 'bg-gradient-to-r from-slate-200 to-slate-300',
    badgeBg: 'bg-slate-500',
    progressBg: 'bg-slate-500',
    points: 25,
  },
  gold: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    icon: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    label: 'Gold',
    headerBg: 'bg-gradient-to-r from-yellow-200 to-yellow-300',
    badgeBg: 'bg-yellow-500',
    progressBg: 'bg-yellow-500',
    points: 50,
  },
  platinum: {
    bg: 'bg-violet-50',
    border: 'border-violet-300',
    text: 'text-violet-900',
    icon: 'text-violet-600',
    iconBg: 'bg-violet-100',
    label: 'Platinum',
    headerBg: 'bg-gradient-to-r from-violet-200 to-violet-300',
    badgeBg: 'bg-violet-600',
    progressBg: 'bg-violet-500',
    points: 100,
  },
  diamond: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
    text: 'text-cyan-900',
    icon: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    label: 'Diamond',
    headerBg: 'bg-gradient-to-r from-cyan-200 to-cyan-300',
    badgeBg: 'bg-cyan-600',
    progressBg: 'bg-cyan-500',
    points: 200,
  },
}

// Tier order for display
const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond']

// Category labels and icons
const CATEGORY_CONFIG = {
  lists: { label: 'Lists', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  items: { label: 'Items', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
  videos: { label: 'Drops', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  social: { label: 'Social', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  engagement: { label: 'Engagement', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  profile: { label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  family: { label: 'Family', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  activity: { label: 'Activity', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  special: { label: 'Special', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
}

export default function AchievementsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('tier') // 'tier' or 'category'
  const [activeCategory, setActiveCategory] = useState('all')
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalPoints: 0,
    totalAchievements: 0,
    totalPossiblePoints: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadAchievements()
    }
  }, [user, authLoading, router])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const response = await api.achievements.getMine()

      // Filter out hidden achievements that aren't unlocked
      const visibleAchievements = (response.achievements || []).filter(
        a => !a.hidden || a.unlocked
      )
      setAchievements(visibleAchievements)

      // Calculate stats
      const allAchievements = response.achievements || []
      const total = allAchievements.filter(a => !a.hidden).length
      const earned = allAchievements.filter(a => a.unlocked).length
      const points = allAchievements.reduce((sum, a) => sum + (a.unlocked ? (a.points || 10) : 0), 0)
      const possiblePoints = allAchievements.filter(a => !a.hidden).reduce((sum, a) => sum + (a.points || 10), 0)

      setStats({
        totalEarned: earned,
        totalPoints: points,
        totalAchievements: total,
        totalPossiblePoints: possiblePoints,
      })
    } catch (err) {
      console.error('Failed to load achievements:', err)
      if (err instanceof APIError) {
        setError(err.getUserMessage())
      } else {
        setError('Failed to load achievements')
      }
    } finally {
      setLoading(false)
    }
  }

  // Group achievements by tier
  const getAchievementsByTier = () => {
    const grouped = {}
    for (const tier of TIER_ORDER) {
      const tierAchievements = achievements.filter(a => a.tier === tier)
      if (tierAchievements.length > 0) {
        grouped[tier] = {
          unlocked: tierAchievements.filter(a => a.unlocked),
          locked: tierAchievements.filter(a => !a.unlocked),
          total: tierAchievements.length,
          earnedCount: tierAchievements.filter(a => a.unlocked).length,
        }
      }
    }
    return grouped
  }

  // Filter achievements by category
  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory)

  const unlockedAchievements = filteredAchievements.filter(a => a.unlocked)
  const lockedAchievements = filteredAchievements.filter(a => !a.unlocked)

  const achievementsByTier = getAchievementsByTier()

  const renderAchievementCard = (achievement, index = 0) => {
    const unlocked = achievement.unlocked || false
    const tier = achievement.tier || 'bronze'
    const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.bronze

    return (
      <div
        key={achievement._id || achievement.key}
        className={`rounded-2xl p-5 border transition-all duration-300 ${
          unlocked
            ? `${tierConfig.bg} ${tierConfig.border}`
            : 'bg-white border-slate-200/80'
        }`}
        style={{
          animationDelay: `${index * 0.03}s`,
          opacity: unlocked ? 1 : 0.7
        }}
      >
        <div className="flex items-start gap-4 mb-3">
          {/* Icon/Emoji */}
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl ${
            unlocked ? tierConfig.iconBg : 'bg-slate-100'
          }`}>
            {achievement.icon || '🏆'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className={`font-semibold ${unlocked ? tierConfig.text : 'text-slate-400'}`}>
                {achievement.name || achievement.title}
              </h3>
              {/* Tier Badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${
                unlocked ? tierConfig.badgeBg : 'bg-slate-400'
              }`}>
                {tier}
              </span>
            </div>
            <p className={`text-sm ${unlocked ? tierConfig.text : 'text-slate-400'}`}>
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Points and Date */}
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center gap-1 font-medium ${unlocked ? tierConfig.icon : 'text-slate-400'}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {achievement.points || 10} pts
          </div>
          {unlocked && achievement.unlockedAt ? (
            <span className={`text-xs ${tierConfig.text}`}>
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </span>
          ) : !unlocked && (
            <div className="flex items-center gap-1 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs">Locked</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
              <p className="text-slate-500">{stats.totalEarned} of {stats.totalAchievements} unlocked</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-amber-500 animate-spin mb-4" />
            <p className="text-slate-500">Loading achievements...</p>
          </div>
        ) : (
          <>
            {/* Stats Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6 animate-fade-in-up">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalEarned}</div>
                  <div className="text-xs text-slate-500">Unlocked</div>
                </div>
                <div className="text-center border-x border-slate-200">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-violet-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalPoints}</div>
                  <div className="text-xs text-slate-500">Points</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.totalAchievements > 0
                      ? Math.round((stats.totalEarned / stats.totalAchievements) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-slate-500">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalAchievements > 0 ? (stats.totalEarned / stats.totalAchievements) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setViewMode('tier')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'tier'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                By Level
              </button>
              <button
                onClick={() => setViewMode('category')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'category'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                By Category
              </button>
            </div>

            {/* Category Filter (only shown in category view) */}
            {viewMode === 'category' && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === 'all'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${
                      activeCategory === key
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                    </svg>
                    {config.label}
                  </button>
                ))}
              </div>
            )}

            {/* Achievement List */}
            {achievements.length === 0 ? (
              <div className="text-center py-16 animate-fade-in bg-white rounded-2xl border border-slate-200/80">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No achievements yet</h2>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start creating lists and adding items to earn achievements</p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-200 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First List
                </Link>
              </div>
            ) : viewMode === 'tier' ? (
              /* Tier-based View */
              <div className="space-y-8">
                {TIER_ORDER.map(tier => {
                  const tierData = achievementsByTier[tier]
                  if (!tierData) return null
                  const tierConfig = TIER_CONFIG[tier]

                  return (
                    <div key={tier}>
                      {/* Tier Header */}
                      <div className={`rounded-xl p-4 mb-4 flex items-center justify-between ${tierConfig.headerBg}`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${tierConfig.text}`}>
                            {tierConfig.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${tierConfig.badgeBg}`}>
                            {tierConfig.points} pts each
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${tierConfig.text}`}>
                          {tierData.earnedCount}/{tierData.total}
                        </span>
                      </div>

                      {/* Tier Progress Bar */}
                      <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${tierConfig.progressBg}`}
                          style={{ width: `${(tierData.earnedCount / tierData.total) * 100}%` }}
                        />
                      </div>

                      {/* Achievements Grid */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Unlocked in this tier */}
                        {tierData.unlocked.map((achievement, index) =>
                          renderAchievementCard(achievement, index)
                        )}

                        {/* Locked in this tier */}
                        {tierData.locked.length > 0 && tierData.unlocked.length > 0 && (
                          <div className="sm:col-span-2 flex items-center gap-2 text-slate-400 text-sm py-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {tierData.locked.length} more to unlock
                          </div>
                        )}
                        {tierData.locked.map((achievement, index) =>
                          renderAchievementCard(achievement, tierData.unlocked.length + index)
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Category-based View */
              <>
                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Unlocked ({unlockedAchievements.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {unlockedAchievements.map((achievement, index) =>
                        renderAchievementCard(achievement, index)
                      )}
                    </div>
                  </div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-500 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked ({lockedAchievements.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {lockedAchievements.map((achievement, index) =>
                        renderAchievementCard(achievement, unlockedAchievements.length + index)
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/settings"
            className="text-slate-500 hover:text-slate-700 text-sm flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Settings
          </Link>
        </div>
      </main>
    </div>
  )
}
