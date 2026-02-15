'use client'

import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import FollowButton from '@/components/FollowButton'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import LikeButton from '@/components/LikeButton'

/**
 * ProfileClient Component
 * Client-side portion of profile page with interactive features
 */
export default function ProfileClient({ user, lists, stats }) {
  const { user: currentUser } = useAuth()
  const isOwnProfile = currentUser?.username === user.username

  return (
    <>
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={user.avatar}
              name={user.displayName || user.username}
              size="xl"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {user.displayName || user.username}
                </h1>
                <p className="text-slate-400 mb-3">@{user.username}</p>
              </div>

              {/* Follow Button - only show if not own profile and user is logged in */}
              {!isOwnProfile && currentUser && (
                <FollowButton
                  userId={user._id}
                  size="md"
                />
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-slate-600 mb-4">{user.bio}</p>
            )}

            {/* Location & Website */}
            <div className="flex flex-wrap gap-4 mb-4">
              {user.location && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 hover:underline"
                  >
                    {user.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="cursor-pointer hover:opacity-75 transition-opacity">
                <span className="font-bold text-slate-900">{stats?.publicListsCount || 0}</span>
                <span className="text-slate-500 ml-1">
                  {stats?.publicListsCount === 1 ? 'list' : 'lists'}
                </span>
              </div>
              <div className="cursor-pointer hover:opacity-75 transition-opacity">
                <span className="font-bold text-slate-900">{stats?.followersCount || 0}</span>
                <span className="text-slate-500 ml-1">
                  {stats?.followersCount === 1 ? 'follower' : 'followers'}
                </span>
              </div>
              <div className="cursor-pointer hover:opacity-75 transition-opacity">
                <span className="font-bold text-slate-900">{stats?.followingCount || 0}</span>
                <span className="text-slate-500 ml-1">following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-5">
          Public Lists ({lists?.length || 0})
        </h2>

        {!lists || lists.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="No public lists yet"
            description={`${user.displayName || user.username} hasn't created any public lists`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lists.map((list, index) => (
              <div
                key={list._id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link
                  href={`/u/${user.username}/${list.slug}`}
                  className="block p-5"
                >
                  <div
                    className="flex items-start gap-4 mb-4"
                    style={{ viewTransitionName: `list-${list.slug}`, contain: 'layout paint' }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 mb-1 truncate group-hover:text-cyan-600 transition-colors">
                        {list.title}
                      </h3>
                      {list.occasion && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full border border-cyan-200">
                          {list.occasion}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preview Images */}
                  {list.previewImages && list.previewImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {list.previewImages.slice(0, 4).map((image, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-lg bg-slate-100 overflow-hidden"
                        >
                          <img
                            src={image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {list.itemCount || 0} items
                    </span>
                    {list.viewCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {list.viewCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Like Button */}
                <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center">
                  <LikeButton
                    listId={list._id}
                    initialIsLiked={list.isLiked}
                    initialLikeCount={list.likeCount || 0}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
