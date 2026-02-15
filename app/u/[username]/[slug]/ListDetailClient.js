'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import ItemCard from '@/components/ItemCard'
import AddItemModal from '@/components/AddItemModal'
import EditItemModal from '@/components/EditItemModal'
import LikeButton from '@/components/LikeButton'
import CommentsSection from '@/components/CommentsSection'
import ShareSheet from '@/components/ShareSheet'
import AvatarStack from '@/components/ui/AvatarStack'

export default function ListDetailClient({ username, slug, list, initialItems }) {
  const router = useRouter()
  const { user } = useAuth()

  const [items, setItems] = useState(initialItems)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [sharedWith, setSharedWith] = useState(list?.sharedWith || [])
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [checkingConnection, setCheckingConnection] = useState(false)

  const isOwner = user && user.username === username
  const listOwnerId = list?.owner?._id || list?.userId

  // Load shared users data
  useEffect(() => {
    if (isOwner && list?._id) {
      loadListData()
    }
  }, [isOwner, list?._id])

  // Check connection status with list owner
  useEffect(() => {
    if (user && !isOwner && listOwnerId) {
      checkConnectionStatus()
    }
  }, [user, isOwner, listOwnerId])

  const checkConnectionStatus = async () => {
    setCheckingConnection(true)
    try {
      const data = await api.connections.checkStatus(listOwnerId)
      setConnectionStatus(data.status)
    } catch (err) {
      console.error('Failed to check connection status:', err)
      setConnectionStatus(null)
    } finally {
      setCheckingConnection(false)
    }
  }

  const loadListData = async () => {
    try {
      const response = await api.lists.getById(list._id)
      if (response?.list?.sharedWith) {
        setSharedWith(response.list.sharedWith)
      }
    } catch (err) {
      console.error('Failed to load list data:', err)
    }
  }

  const reloadItems = async () => {
    try {
      const response = await api.lists.getPublic(username, slug)
      if (response && response.items) {
        setItems(response.items)
      }
    } catch (err) {
      console.error('Failed to reload items:', err)
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleClaimItem = async (itemId) => {
    try {
      await api.items.claim(itemId)
      await reloadItems()
    } catch (err) {
      console.error('Failed to claim item:', err)
      // Check if error is due to missing connection
      if (err.status === 403 && err.message?.includes('connection')) {
        alert('You need to connect with the list owner to claim items.')
      } else {
        alert(err.getUserMessage?.() || 'Failed to claim item. Please try again.')
      }
    }
  }

  const handleConnect = async () => {
    try {
      await api.connections.request(listOwnerId)
      setConnectionStatus('pending_sent')
      alert('Connection request sent!')
    } catch (err) {
      alert(err.getUserMessage?.() || 'Failed to send connection request')
    }
  }

  const handleUnclaimItem = async (itemId) => {
    try {
      await api.items.unclaim(itemId)
      await reloadItems()
    } catch (err) {
      console.error('Failed to unclaim item:', err)
      alert('Failed to unclaim item. Please try again.')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await api.items.delete(itemId)
      await reloadItems()
    } catch (err) {
      console.error('Failed to delete item:', err)
      alert('Failed to delete item. Please try again.')
    }
  }

  const handleDeleteList = async () => {
    if (!confirm('Are you sure you want to delete this entire list? This cannot be undone.')) return

    try {
      await api.lists.delete(username, slug)
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to delete list:', err)
      alert('Failed to delete list. Please try again.')
    }
  }

  const copyListUrl = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <LikeButton
            listId={list._id}
            initialLikeCount={list.likeCount || 0}
            size="lg"
          />
          <span className="text-sm text-slate-500">
            {list.likeCount === 1 ? '1 person likes this' : `${list.likeCount || 0} likes`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sharing visibility indicator - show who has access */}
          {isOwner && sharedWith.length > 0 && (
            <button
              onClick={() => setShowShareSheet(true)}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-xl hover:bg-cyan-100 transition-colors"
              title={`Shared with ${sharedWith.length} ${sharedWith.length === 1 ? 'person' : 'people'}`}
            >
              <AvatarStack users={sharedWith} max={3} size="sm" />
              <span className="text-xs font-medium text-cyan-700">
                {sharedWith.length} shared
              </span>
            </button>
          )}

          {/* Share button - opens ShareSheet for owner, copy link for others */}
          {isOwner ? (
            <button
              onClick={() => setShowShareSheet(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          ) : (
            <button
              onClick={copyListUrl}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              {copySuccess ? (
                <>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          )}

          {isOwner && (
            <>
              <Link
                href={`/edit/${username}/${slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit List
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-cyan-200 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </>
          )}
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No items yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {isOwner ? 'Add your first item to get started!' : 'This list is empty'}
          </p>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <div
              key={item._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ItemCard
                item={item}
                isOwner={isOwner}
                currentUserId={user?._id}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onClaim={handleClaimItem}
                onUnclaim={handleUnclaimItem}
                connectionStatus={connectionStatus}
                onConnect={handleConnect}
              />
            </div>
          ))}
        </div>
      )}

      {/* Owner Actions */}
      {isOwner && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleDeleteList}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete this list
          </button>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments
          </h3>
          <CommentsSection listId={list._id} />
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        listId={list._id}
        onItemAdded={reloadItems}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingItem(null)
        }}
        item={editingItem}
        onItemUpdated={reloadItems}
        onItemDeleted={reloadItems}
      />

      {/* Share Sheet */}
      {isOwner && (
        <ShareSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          list={{ ...list, owner: { username } }}
          onShareUpdate={loadListData}
        />
      )}
    </>
  )
}
