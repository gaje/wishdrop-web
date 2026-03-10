'use client'

import { useState, useEffect } from 'react'
import Modal from './ui/Modal'
import Avatar from './ui/Avatar'
import api from '../lib/api'
import { analytics } from '../lib/analytics'

/**
 * ShareSheet - Modal for sharing lists with users
 *
 * Features:
 * 1. Quick share with saved contacts
 * 2. Search for users
 * 3. View/manage who list is shared with
 * 4. Email invites and invite links
 * 5. Copy public link
 */
export default function ShareSheet({ isOpen, onClose, list, onShareUpdate }) {
  const [activeTab, setActiveTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [sharedUsers, setSharedUsers] = useState([])
  const [savedContacts, setSavedContacts] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [pendingInvites, setPendingInvites] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && list?._id) {
      loadData()
    }
  }, [isOpen, list?._id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [listRes, contactsRes, invitesRes] = await Promise.all([
        api.lists.getById(list._id),
        api.contacts.getAll(),
        api.invites.getForList(list._id).catch(() => ({ invites: [] })),
      ])

      setSharedUsers(listRes.list?.sharedWith || [])
      setSavedContacts(contactsRes.contacts || [])
      setGroups(contactsRes.groups || [])
      setPendingInvites(invitesRes.invites || [])
    } catch (error) {
      console.error('Failed to load sharing data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Search for users
  const handleSearch = async (query) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await api.users.search(query.trim(), 10)
      setSearchResults(response.users || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  // Toggle user selection
  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id)
      if (isSelected) {
        return prev.filter(u => u._id !== user._id)
      }
      return [...prev, user]
    })
  }

  // Share with selected users
  const handleShare = async () => {
    if (selectedUsers.length === 0) return

    setSharing(true)
    try {
      await api.lists.share(list._id, selectedUsers.map(u => u._id))
      analytics.listShared({ userCount: selectedUsers.length })
      await loadData()
      setSelectedUsers([])
      setSearchQuery('')
      setSearchResults([])
      onShareUpdate?.()
    } catch (error) {
      alert(error.message || 'Failed to share list')
    } finally {
      setSharing(false)
    }
  }

  // Remove user from shared list
  const handleRemoveUser = async (userId) => {
    try {
      await api.lists.unshare(list._id, userId)
      setSharedUsers(prev => prev.filter(u => u._id !== userId))
      onShareUpdate?.()
    } catch (error) {
      alert(error.message || 'Failed to remove user')
    }
  }

  // Create invite
  const handleCreateInvite = async (email = null) => {
    try {
      const response = await api.invites.create(list._id, email ? { email } : {})
      await loadData()
      setInviteEmail('')
      return response
    } catch (error) {
      if (error.status === 409) {
        alert('An invite has already been sent to this email')
      } else {
        alert(error.message || 'Failed to create invite')
      }
      return null
    }
  }

  // Revoke invite
  const handleRevokeInvite = async (inviteId) => {
    try {
      await api.invites.revoke(list._id, inviteId)
      setPendingInvites(prev => prev.filter(inv => inv._id !== inviteId))
    } catch (error) {
      alert(error.message || 'Failed to revoke invite')
    }
  }

  // Copy public link
  const handleCopyLink = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_WEB_BASE || window.location.origin
    const shareUrl = `${baseUrl}/u/${list.owner?.username || list.username}/${list.slug}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      analytics.shareLinkCopied()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('Failed to copy link')
    }
  }

  // Filter contacts by group
  const filteredContacts = selectedGroupId
    ? savedContacts.filter(c => c.groupIds?.some(gid => gid === selectedGroupId))
    : savedContacts

  // Exclude already shared users from contacts
  const sharedUserIds = sharedUsers.map(u => u._id)
  const availableContacts = filteredContacts.filter(
    c => !sharedUserIds.includes(c.userId)
  )

  if (!list) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share List"
      description={list.title}
      size="lg"
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 -mt-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Share with Users
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'invite'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Invite via Email
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'link'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Copy Link
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Quick Share - Saved Contacts */}
              {savedContacts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Quick Share
                  </h4>

                  {/* Group filter */}
                  {groups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        onClick={() => setSelectedGroupId(null)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedGroupId === null
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      {groups.map(group => (
                        <button
                          key={group._id}
                          onClick={() => setSelectedGroupId(selectedGroupId === group._id ? null : group._id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedGroupId === group._id
                              ? 'bg-cyan-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {group.emoji && <span className="mr-1">{group.emoji}</span>}
                          {group.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Contacts grid */}
                  {availableContacts.length > 0 ? (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {availableContacts.slice(0, 8).map(contact => {
                        const isSelected = selectedUsers.some(u => u._id === contact.userId)
                        const user = contact.user
                        const displayName = contact.nickname || user?.displayName || user?.username

                        return (
                          <button
                            key={contact.userId}
                            onClick={() => toggleUserSelection({
                              _id: contact.userId,
                              username: user?.username,
                              displayName: displayName,
                              avatar: user?.avatar,
                            })}
                            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                              isSelected ? 'bg-cyan-50 ring-2 ring-cyan-500' : 'hover:bg-gray-50'
                            }`}
                            style={{ width: 72 }}
                          >
                            <div className="relative">
                              <Avatar
                                src={user?.avatar}
                                name={displayName}
                                size="md"
                              />
                              {isSelected && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-600 mt-1 truncate max-w-full">
                              {displayName?.split(' ')[0]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-2">
                      {selectedGroupId ? 'No contacts in this group' : 'All contacts already have access'}
                    </p>
                  )}
                </div>
              )}

              {/* Search */}
              <div>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users by name or username..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                    {searchResults.map((user, index) => {
                      const isSelected = selectedUsers.some(u => u._id === user._id)
                      const isShared = sharedUserIds.includes(user._id)

                      return (
                        <button
                          key={user._id}
                          onClick={() => !isShared && toggleUserSelection(user)}
                          disabled={isShared}
                          className={`w-full flex items-center gap-3 p-3 transition-colors ${
                            index > 0 ? 'border-t border-gray-100' : ''
                          } ${
                            isShared
                              ? 'bg-gray-50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-cyan-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Avatar src={user.avatar} name={user.displayName || user.username} size="sm" />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">
                              {user.displayName || user.username}
                            </p>
                            {user.displayName && (
                              <p className="text-sm text-gray-500">@{user.username}</p>
                            )}
                          </div>
                          {isShared ? (
                            <span className="text-xs text-gray-400">Already shared</span>
                          ) : isSelected ? (
                            <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Selected users + Share button */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedUsers.length} selected
                    </span>
                    <div className="flex -space-x-2">
                      {selectedUsers.slice(0, 3).map(user => (
                        <Avatar key={user._id} src={user.avatar} name={user.displayName} size="xs" className="ring-2 ring-white" />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {sharing ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              )}

              {/* Currently shared with */}
              {sharedUsers.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Shared with ({sharedUsers.length})
                  </h4>
                  <div className="space-y-2">
                    {sharedUsers.map(user => (
                      <div key={user._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                        <Avatar src={user.avatar} name={user.displayName || user.username} size="sm" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {user.displayName || user.username}
                          </p>
                          {user.displayName && (
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove access"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invite Tab */}
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send invite to email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                  />
                  <button
                    onClick={() => handleCreateInvite(inviteEmail)}
                    disabled={!inviteEmail.includes('@')}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Send Invite
                  </button>
                </div>
              </div>

              <div className="text-center py-2">
                <span className="text-gray-400 text-sm">or</span>
              </div>

              <button
                onClick={() => handleCreateInvite()}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Create Invite Link
              </button>

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Pending Invites ({pendingInvites.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingInvites.map(invite => (
                      <div key={invite._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {invite.email || 'Link invite'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRevokeInvite(invite._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revoke invite"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Anyone with the link can view this list{list.privacy === 'public' ? ' (list is public)' : ''}.
              </p>

              <button
                onClick={handleCopyLink}
                className={`w-full px-4 py-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
