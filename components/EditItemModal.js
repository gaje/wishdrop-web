'use client'

import { useState, useEffect } from 'react'
import Modal, { ModalActions } from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import api from '@/lib/api'

/**
 * EditItemModal Component
 * Modal for editing an existing wishlist item
 */
export default function EditItemModal({
  isOpen,
  onClose,
  item,
  onItemUpdated,
  onItemDeleted,
}) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    price: '',
    notes: '',
    priority: 'medium',
  })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        url: item.url || '',
        price: item.price?.amount ? String(item.price.amount) : '',
        notes: item.notes || '',
        priority: item.priority || 'medium',
      })
      setError('')
      setShowDeleteConfirm(false)
    }
  }, [item])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const updateData = {
        title: formData.title.trim(),
        url: formData.url || null,
        notes: formData.notes || null,
        priority: formData.priority,
      }

      if (formData.price) {
        updateData.price = { amount: parseFloat(formData.price), currency: 'USD' }
      } else {
        updateData.price = null
      }

      await api.items.update(item._id, updateData)
      onItemUpdated?.()
      onClose()
    } catch (err) {
      console.error('Failed to update item:', err)
      setError(err.getUserMessage?.() || 'Failed to update item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.items.delete(item._id)
      onItemDeleted?.()
      onClose()
    } catch (err) {
      console.error('Failed to delete item:', err)
      setError(err.getUserMessage?.() || 'Failed to delete item. Please try again.')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const priorities = [
    { value: 'high', label: 'High', color: 'bg-red-500' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
    { value: 'low', label: 'Low', color: 'bg-gray-400' },
  ]

  if (!item) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Item"
      description="Update your wishlist item details"
      size="lg"
    >
      {showDeleteConfirm ? (
        /* Delete Confirmation */
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete this item?</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{item.title}"? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Item
            </Button>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSubmit}>
          {/* Preview Image */}
          {item.imageUrl && (
            <div className="mb-4">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <Input
              label="Item Name"
              required
              placeholder="e.g., Blue Wireless Headphones"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              error={error && !formData.title.trim() ? 'Title is required' : ''}
            />
          </div>

          {/* URL */}
          <div className="mb-4">
            <Input
              label="Product URL"
              type="url"
              placeholder="https://example.com/product"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
              iconPosition="left"
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              placeholder="29.99"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              icon={<span className="text-gray-400 font-medium">$</span>}
              iconPosition="left"
            />
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {priorities.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: value }))}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                    formData.priority === value
                      ? `${color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Any additional details (size, color, etc.)"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Delete Item
            </button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}
