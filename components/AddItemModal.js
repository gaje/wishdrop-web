'use client'

import { useState, useEffect } from 'react'
import Modal, { ModalActions } from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import api from '@/lib/api'

// Decode HTML entities in strings
function decodeHtmlEntities(text) {
  if (!text) return text
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

// Common stores list (same as mobile app)
const COMMON_STORES = [
  { name: 'Amazon', website: 'https://www.amazon.com' },
  { name: 'Apple Store', website: 'https://www.apple.com' },
  { name: 'AT&T', website: 'https://www.att.com' },
  { name: 'Banana Republic', website: 'https://www.bananarepublic.com' },
  { name: 'Barnes & Noble', website: 'https://www.barnesandnoble.com' },
  { name: 'Bath & Body Works', website: 'https://www.bathandbodyworks.com' },
  { name: 'Bed Bath & Beyond', website: 'https://www.bedbathandbeyond.com' },
  { name: 'Best Buy', website: 'https://www.bestbuy.com' },
  { name: 'Container Store', website: 'https://www.containerstore.com' },
  { name: 'Costco', website: 'https://www.costco.com' },
  { name: 'CVS', website: 'https://www.cvs.com' },
  { name: "Dick's Sporting Goods", website: 'https://www.dickssportinggoods.com' },
  { name: 'Dollar General', website: 'https://www.dollargeneral.com' },
  { name: 'Dollar Tree', website: 'https://www.dollartree.com' },
  { name: 'Forever 21', website: 'https://www.forever21.com' },
  { name: 'GameStop', website: 'https://www.gamestop.com' },
  { name: 'Gap', website: 'https://www.gap.com' },
  { name: 'H&M', website: 'https://www.hm.com' },
  { name: 'Hobby Lobby', website: 'https://www.hobbylobby.com' },
  { name: 'Home Depot', website: 'https://www.homedepot.com' },
  { name: 'Jo-Ann Fabrics', website: 'https://www.joann.com' },
  { name: "Kohl's", website: 'https://www.kohls.com' },
  { name: 'Kroger', website: 'https://www.kroger.com' },
  { name: "Lowe's", website: 'https://www.lowes.com' },
  { name: "Macy's", website: 'https://www.macys.com' },
  { name: 'Marshalls', website: 'https://www.marshalls.com' },
  { name: 'Michaels', website: 'https://www.michaels.com' },
  { name: 'Nordstrom', website: 'https://www.nordstrom.com' },
  { name: 'Office Depot', website: 'https://www.officedepot.com' },
  { name: 'Old Navy', website: 'https://www.oldnavy.com' },
  { name: 'Petco', website: 'https://www.petco.com' },
  { name: 'PetSmart', website: 'https://www.petsmart.com' },
  { name: 'REI', website: 'https://www.rei.com' },
  { name: 'Rite Aid', website: 'https://www.riteaid.com' },
  { name: 'Ross', website: 'https://www.rossstores.com' },
  { name: 'Safeway', website: 'https://www.safeway.com' },
  { name: "Sam's Club", website: 'https://www.samsclub.com' },
  { name: 'Sephora', website: 'https://www.sephora.com' },
  { name: 'Staples', website: 'https://www.staples.com' },
  { name: 'T-Mobile', website: 'https://www.t-mobile.com' },
  { name: 'Target', website: 'https://www.target.com' },
  { name: 'TJ Maxx', website: 'https://www.tjmaxx.com' },
  { name: "Trader Joe's", website: 'https://www.traderjoes.com' },
  { name: 'Ulta', website: 'https://www.ulta.com' },
  { name: 'Verizon', website: 'https://www.verizon.com' },
  { name: "Victoria's Secret", website: 'https://www.victoriassecret.com' },
  { name: 'Walgreens', website: 'https://www.walgreens.com' },
  { name: 'Walmart', website: 'https://www.walmart.com' },
  { name: 'Whole Foods', website: 'https://www.wholefoodsmarket.com' },
  { name: 'Zara', website: 'https://www.zara.com' },
]

/**
 * AddItemModal Component
 * Modal for adding a new item to a list with URL metadata fetching or manual entry
 */
export default function AddItemModal({
  isOpen,
  onClose,
  listId,
  onItemAdded,
}) {
  // Entry mode: 'url' or 'manual'
  const [entryMode, setEntryMode] = useState('url')

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    price: '',
    notes: '',
    priority: 'normal',
    imageUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [previewError, setPreviewError] = useState(false)
  const [metadata, setMetadata] = useState(null)

  // Store selector state
  const [selectedStore, setSelectedStore] = useState('')
  const [customStore, setCustomStore] = useState('')
  const [showStoreDropdown, setShowStoreDropdown] = useState(false)
  const [storeSearchQuery, setStoreSearchQuery] = useState('')

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: '', url: '', price: '', notes: '', priority: 'normal', imageUrl: '' })
      setError('')
      setPreviewImage('')
      setPreviewError(false)
      setMetadata(null)
      setEntryMode('url')
      setSelectedStore('')
      setCustomStore('')
      setShowStoreDropdown(false)
      setStoreSearchQuery('')
    }
  }, [isOpen])

  // Fetch metadata for URL
  const fetchUrlMetadata = async (url) => {
    if (!url || !url.startsWith('http')) {
      setPreviewImage('')
      setPreviewError(false)
      setMetadata(null)
      return
    }

    setFetchingMetadata(true)
    setPreviewError(false)
    try {
      const fetchedMetadata = await api.metadata.fetch(url)
      if (fetchedMetadata) {
        setMetadata(fetchedMetadata)
        const decodedTitle = decodeHtmlEntities(fetchedMetadata.title)
        setFormData(prev => ({
          ...prev,
          title: prev.title || decodedTitle || '',
          price: prev.price || (fetchedMetadata.price?.amount ? String(fetchedMetadata.price.amount) : ''),
        }))
        setPreviewImage(fetchedMetadata.image || '')
      }
    } catch (err) {
      console.error('Failed to fetch metadata:', err)
    } finally {
      setFetchingMetadata(false)
    }
  }

  // Debounce URL metadata fetching
  useEffect(() => {
    if (entryMode !== 'url') return

    const timer = setTimeout(() => {
      if (formData.url && formData.url.startsWith('http')) {
        fetchUrlMetadata(formData.url)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.url, entryMode])

  // Filter stores based on search query
  const filteredStores = COMMON_STORES.filter(store =>
    store.name.toLowerCase().includes(storeSearchQuery.toLowerCase())
  )

  const handleStoreSelect = (store) => {
    setSelectedStore(store.name)
    setShowStoreDropdown(false)
    setStoreSearchQuery('')
    if (store.name === 'Other') {
      setCustomStore('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Determine image URL based on entry mode
      let imageUrl
      if (entryMode === 'url') {
        imageUrl = metadata?.image || previewImage || undefined
      } else {
        imageUrl = formData.imageUrl || undefined
      }

      // Determine merchant from store selection or metadata
      let merchant
      if (entryMode === 'manual') {
        merchant = selectedStore === 'Other' ? customStore : selectedStore || undefined
      } else {
        merchant = metadata?.merchant || undefined
      }

      const itemData = {
        listId,
        title: formData.title.trim(),
        url: formData.url || undefined,
        notes: formData.notes || undefined,
        priority: formData.priority,
        image: imageUrl,
        description: metadata?.description || undefined,
        merchant: merchant,
        brand: metadata?.brand || undefined,
      }

      // Price from user input or metadata
      if (formData.price) {
        itemData.price = { amount: parseFloat(formData.price), currency: 'USD' }
      } else if (metadata?.price?.amount) {
        itemData.price = metadata.price
      }

      await api.items.create(itemData)
      onItemAdded?.()
      onClose()
    } catch (err) {
      console.error('Failed to add item:', err)
      setError(err.getUserMessage?.() || 'Failed to add item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const priorities = [
    { value: 'high', label: 'High', color: 'bg-red-500' },
    { value: 'normal', label: 'Normal', color: 'bg-amber-500' },
    { value: 'low', label: 'Low', color: 'bg-slate-400' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Item"
      description="Add a new item to your wishlist"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Entry Mode Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setEntryMode('url')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              entryMode === 'url'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Paste URL
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              entryMode === 'manual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Manual Entry
          </button>
        </div>

        {entryMode === 'url' ? (
          /* URL Entry Mode */
          <>
            {/* URL Input with Metadata Preview */}
            <div className="mb-4">
              <Input
                label="Product URL"
                type="url"
                placeholder="https://example.com/product"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                helperText={!metadata && !fetchingMetadata ? "Paste a link and we'll auto-fill the details" : undefined}
                icon={
                  fetchingMetadata ? (
                    <svg className="w-5 h-5 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )
                }
                iconPosition="left"
              />

              {/* Loading state */}
              {fetchingMetadata && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Card - shown after metadata is fetched */}
              {metadata && !fetchingMetadata && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex gap-4">
                    {/* Image */}
                    {(previewImage || metadata?.image) && !previewError ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={previewImage || metadata?.image}
                          alt="Product preview"
                          className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                          onError={() => setPreviewError(true)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage('');
                            setPreviewError(false);
                            if (metadata) setMetadata({ ...metadata, image: null });
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-slate-600 rounded-full text-white hover:bg-slate-700 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm line-clamp-2 mb-1">
                        {formData.title || metadata?.title || 'No title found'}
                      </p>
                      {(formData.price || metadata?.price?.amount) && (
                        <p className="text-teal-600 font-semibold text-sm">
                          ${formData.price || metadata?.price?.amount}
                        </p>
                      )}
                      {metadata?.merchant && (
                        <p className="text-slate-500 text-xs mt-1">{metadata.merchant}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional fields - only shown after metadata is fetched */}
            {metadata && !fetchingMetadata && (
              <>
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
                    icon={<span className="text-slate-400 font-medium">$</span>}
                    iconPosition="left"
                  />
                </div>

                {/* Priority */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any additional details (size, color, etc.)"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-slate-900 placeholder-slate-400"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          /* Manual Entry Mode */
          <>
            {/* Store Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Store (optional)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-left flex items-center justify-between hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <span className={selectedStore ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedStore || 'Select a store...'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${showStoreDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Store Dropdown */}
                {showStoreDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-64 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-slate-100">
                      <input
                        type="text"
                        placeholder="Search stores..."
                        value={storeSearchQuery}
                        onChange={(e) => setStoreSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                    {/* Store list */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredStores.map((store) => (
                        <button
                          key={store.name}
                          type="button"
                          onClick={() => handleStoreSelect(store)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                            selectedStore === store.name ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                          }`}
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {store.name}
                        </button>
                      ))}
                      {/* Other/Custom option */}
                      <button
                        type="button"
                        onClick={() => handleStoreSelect({ name: 'Other', website: null })}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100 ${
                          selectedStore === 'Other' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                        }`}
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Other (custom store)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom store input when "Other" is selected */}
              {selectedStore === 'Other' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter store name..."
                    value={customStore}
                    onChange={(e) => setCustomStore(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
              )}
            </div>

            {/* Image URL Input */}
            <div className="mb-4">
              <Input
                label="Image URL (optional)"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                helperText="Paste a link to the product image"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                iconPosition="left"
              />

              {/* Image preview for manual entry */}
              {formData.imageUrl && (
                <div className="mt-3 relative">
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="w-full h-32 object-cover rounded-xl border border-slate-200"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Optional URL for manual entries */}
            <div className="mb-4">
              <Input
                label="Product URL (optional)"
                type="url"
                placeholder="https://example.com/product"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                helperText="Add a link where the item can be purchased"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
                iconPosition="left"
              />
            </div>

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
                icon={<span className="text-slate-400 font-medium">$</span>}
                iconPosition="left"
              />
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
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
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Any additional details (size, color, etc.)"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-slate-900 placeholder-slate-400"
              />
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        <ModalActions>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Item
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
