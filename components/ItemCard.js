'use client'

import { useState, useMemo } from 'react'

/**
 * Decode HTML entities in text for display
 * Handles legacy data that may have encoded entities
 */
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text
  // Use browser's built-in HTML parser to decode entities
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }
  // Fallback for SSR - decode common entities
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

/**
 * ItemCard Component
 * Displays a wishlist item with image, title, price, and actions
 */
export default function ItemCard({
  item,
  isOwner = false,
  currentUserId = null,
  onEdit,
  onDelete,
  onClaim,
  onUnclaim,
  showActions = true,
}) {
  const [imageError, setImageError] = useState(false)

  const {
    _id,
    title,
    price,
    notes,
    url,
    image,
    imageUrl,
    priority,
    claimedBy,
    merchant,
  } = item

  // Support both 'image' (API) and 'imageUrl' (legacy) field names
  const itemImage = image || imageUrl

  // Decode HTML entities in title for display (handles legacy data)
  const displayTitle = useMemo(() => decodeHtmlEntities(title), [title])

  const isClaimed = !!claimedBy
  const isClaimedByMe = claimedBy?._id === currentUserId

  // Priority badge config
  const priorityConfig = {
    high: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', label: 'High Priority' },
    normal: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Normal' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Medium' },
    low: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', label: 'Low' },
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative aspect-square bg-slate-100">
        {itemImage && !imageError ? (
          <img
            src={itemImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Claimed Badge */}
        {isClaimed && (
          <div
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm ${
              isClaimedByMe
                ? 'bg-emerald-500'
                : isOwner
                ? 'bg-violet-500'
                : 'bg-slate-500'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {isClaimedByMe ? 'Claimed by you' : isOwner ? "Someone's got it!" : 'Claimed'}
          </div>
        )}

        {/* Priority Badge */}
        {priority && priorityConfig[priority] && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${priorityConfig[priority].bg} ${priorityConfig[priority].text} border ${priorityConfig[priority].border}`}>
              {priorityConfig[priority].label}
            </span>
          </div>
        )}

        {/* Owner Edit Overlay */}
        {isOwner && onEdit && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onEdit(item)}
              className="px-4 py-2 bg-white rounded-xl font-semibold text-slate-900 shadow-lg hover:shadow-xl transition-all transform scale-90 group-hover:scale-100"
            >
              Edit Item
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-slate-900 mb-1.5 line-clamp-2 min-h-[44px] leading-snug">
          {displayTitle}
        </h3>

        {/* Price */}
        {price?.amount ? (
          <p className="text-lg font-bold text-teal-600 mb-1">
            ${typeof price.amount === 'number' ? price.amount.toFixed(2) : price.amount}
          </p>
        ) : (
          <p className="text-sm text-slate-400 mb-1">Price unavailable</p>
        )}

        {/* Merchant */}
        {merchant && (
          <p className="text-xs text-slate-500 mb-2 truncate">{merchant}</p>
        )}

        {/* Notes */}
        {notes && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{notes}</p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            {/* View/Buy Button */}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-teal-200 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Item
              </a>
            )}

            {/* Owner Actions */}
            {isOwner ? (
              <button
                onClick={() => onDelete?.(_id)}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold text-sm transition-colors border border-rose-200"
              >
                Delete
              </button>
            ) : (
              /* Visitor Actions */
              <>
                {isClaimed ? (
                  isClaimedByMe && (
                    <button
                      onClick={() => onUnclaim?.(_id)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                    >
                      Unclaim
                    </button>
                  )
                ) : (
                  currentUserId && (
                    <button
                      onClick={() => onClaim?.(_id)}
                      className="flex-1 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-semibold text-sm transition-colors border border-teal-200"
                    >
                      Claim This
                    </button>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
