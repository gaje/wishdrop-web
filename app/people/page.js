'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'

import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'

const AVATAR_GRADIENTS = [
  'from-cyan-400 to-cyan-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-green-500',
  'from-blue-400 to-indigo-500',
]

export default function MyPeoplePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  // Add/Edit Contact Modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroups, setSelectedGroups] = useState([])
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)

  // Manage Groups Modal
  const [groupsModalOpen, setGroupsModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupEmoji, setNewGroupEmoji] = useState('')
  const [editingGroup, setEditingGroup] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await api.contacts.getAll()
      setContacts(response.contacts || [])
      setGroups(response.groups || [])
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Search users
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

  // Add or update contact
  const handleSaveContact = async () => {
    if (!selectedUser) return

    setSaving(true)
    try {
      if (editingContact) {
        // Update existing contact
        await api.contacts.update(editingContact.userId, {
          groupIds: selectedGroups,
          nickname: nickname.trim() || null,
        })
      } else {
        // Add new contact
        await api.contacts.add(selectedUser._id, selectedGroups, nickname.trim() || null)
      }
      await loadData()
      closeAddModal()
    } catch (error) {
      alert(error.message || 'Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  // Open edit modal for a contact
  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setSelectedUser(contact.user)
    setSelectedGroups(contact.groupIds || [])
    setNickname(contact.nickname || '')
    setAddModalOpen(true)
  }

  // Remove contact
  const handleRemoveContact = async (userId) => {
    if (!confirm('Remove this contact?')) return

    try {
      await api.contacts.remove(userId)
      setContacts(prev => prev.filter(c => c.userId !== userId))
    } catch (error) {
      alert(error.message || 'Failed to remove contact')
    }
  }

  // Create group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    try {
      await api.contactGroups.create(newGroupName.trim(), newGroupEmoji || null)
      await loadData()
      setNewGroupName('')
      setNewGroupEmoji('')
    } catch (error) {
      alert(error.message || 'Failed to create group')
    }
  }

  // Delete group
  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Delete this group? Contacts will not be deleted.')) return

    try {
      await api.contactGroups.delete(groupId)
      await loadData()
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null)
      }
    } catch (error) {
      alert(error.message || 'Failed to delete group')
    }
  }

  const closeAddModal = () => {
    setAddModalOpen(false)
    setEditingContact(null)
    setSearchQuery('')
    setSearchResults([])
    setSelectedUser(null)
    setSelectedGroups([])
    setNickname('')
  }

  // Filter contacts
  const filteredContacts = selectedGroupId
    ? contacts.filter(c => c.groupIds?.some(gid => gid === selectedGroupId))
    : contacts

  // Get group badges for a contact
  const getContactGroups = (contact) => {
    if (!contact.groupIds || contact.groupIds.length === 0) return []
    return groups.filter(g => contact.groupIds.includes(g._id))
  }

  if (authLoading || !user) {
    return (
      <>

        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My People</h1>
              <p className="text-slate-500 text-sm mt-1">
                {contacts.length === 0
                  ? 'Save contacts for quick sharing'
                  : `${contacts.length} saved contact${contacts.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupsModalOpen(true)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Groups
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Contact
              </button>
            </div>
          </div>

          {/* Group Filters */}
          {groups.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedGroupId(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGroupId === null
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({contacts.length})
              </button>
              {groups.map(group => {
                const count = contacts.filter(c =>
                  c.groupIds?.some(gid => gid === group._id)
                ).length

                return (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroupId(selectedGroupId === group._id ? null : group._id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedGroupId === group._id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {group.emoji && <span className="mr-1">{group.emoji}</span>}
                    {group.name} ({count})
                  </button>
                )
              })}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredContacts.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {selectedGroupId ? 'No contacts in this group' : 'No saved contacts'}
              </h3>
              <p className="text-slate-500 mb-6">
                {selectedGroupId
                  ? 'Add contacts to this group for faster sharing'
                  : 'Save contacts you share lists with frequently for quick access'}
              </p>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Add Your First Contact
              </button>
            </div>
          ) : (
            /* Contacts Grid */
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredContacts.map((contact, index) => {
                const contactGroups = getContactGroups(contact)
                const displayName = contact.nickname || contact.user?.displayName || contact.user?.username

                return (
                  <div
                    key={contact.userId}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Link href={`/u/${contact.user?.username}`}>
                        <Avatar
                          src={contact.user?.avatar}
                          name={displayName}
                          size="lg"
                          className="cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/u/${contact.user?.username}`}
                          className="font-semibold text-slate-900 hover:text-cyan-600 transition-colors"
                        >
                          {displayName}
                        </Link>
                        {contact.nickname && contact.user?.username && (
                          <p className="text-sm text-slate-500">@{contact.user.username}</p>
                        )}

                        {/* Group badges */}
                        {contactGroups.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contactGroups.map(group => (
                              <span
                                key={group._id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                              >
                                {group.emoji && <span className="mr-1">{group.emoji}</span>}
                                {group.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Edit contact"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveContact(contact.userId)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove contact"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Contact Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={closeAddModal}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="md"
      >
        {selectedUser ? (
          <div className="space-y-4">
            {/* Selected User */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <Avatar src={selectedUser.avatar} name={selectedUser.displayName || selectedUser.username} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {selectedUser.displayName || selectedUser.username}
                </p>
                <p className="text-sm text-slate-500">@{selectedUser.username}</p>
              </div>
              {/* Only show clear button when adding, not editing */}
              {!editingContact && (
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nickname (optional)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Add a nickname..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                maxLength={50}
              />
            </div>

            {/* Groups */}
            {groups.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add to Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {groups.map(group => {
                    const isSelected = selectedGroups.includes(group._id)
                    return (
                      <button
                        key={group._id}
                        onClick={() => {
                          setSelectedGroups(prev =>
                            isSelected
                              ? prev.filter(id => id !== group._id)
                              : [...prev, group._id]
                          )
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {group.emoji && <span className="mr-1">{group.emoji}</span>}
                        {group.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContact}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingContact ? 'Save Changes' : 'Add Contact'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                autoFocus
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                {searchResults.map((user, index) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left ${
                      index > 0 ? 'border-t border-slate-100' : ''
                    }`}
                  >
                    <Avatar src={user.avatar} name={user.displayName || user.username} size="sm" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {user.displayName || user.username}
                      </p>
                      {user.displayName && (
                        <p className="text-sm text-slate-500">@{user.username}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <p className="text-center text-slate-400 py-8">No users found</p>
            )}

            {searchQuery.length < 2 && (
              <p className="text-center text-slate-400 py-8">
                Type at least 2 characters to search
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Manage Groups Modal */}
      <Modal
        isOpen={groupsModalOpen}
        onClose={() => setGroupsModalOpen(false)}
        title="Manage Groups"
        size="md"
      >
        <div className="space-y-4">
          {/* Existing Groups */}
          {groups.map(group => (
            <div key={group._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-lg">
                {group.emoji || '📁'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{group.name}</p>
                <p className="text-sm text-slate-500">
                  {group.contactCount || 0} contact{group.contactCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => handleDeleteGroup(group._id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add New Group */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Create New Group</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroupEmoji}
                onChange={(e) => setNewGroupEmoji(e.target.value)}
                placeholder="Emoji"
                className="w-16 px-3 py-2.5 rounded-xl border border-slate-200 text-center focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                maxLength={2}
              />
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                maxLength={50}
              />
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
