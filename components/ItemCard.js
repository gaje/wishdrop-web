'use client'

import { useMemo } from 'react'
import ProductImage from './ui/ProductImage'

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
  connectionStatus = null,
  onConnect,
  onGuestClaim,
  onGuestUnclaim,
  isGuestClaimedByMe = false,
  listPrivacy = null,
}) {
  const {
    _id,
    title,
    price,
    notes,
    url: originalUrl,
    image,
    imageUrl,
    priority,
    claimedBy,
    guestClaim,
    merchant,
    affiliateCode,
  } = item

  // Prefer affiliate redirect (routed through API server for click tracking), fall back to original URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const url = affiliateCode ? `${API_BASE}/r/${affiliateCode}` : originalUrl

  // Support both 'image' (API) and 'imageUrl' (legacy) field names
  const itemImage = image || imageUrl

  // Decode HTML entities in title for display (handles legacy data)
  const displayTitle = useMemo(() => decodeHtmlEntities(title), [title])

  const isClaimed = !!claimedBy
  const isGuestClaimed = !!guestClaim?.name
  const claimerId = typeof claimedBy === 'object' ? claimedBy?._id : claimedBy
  const isClaimedByMe = !!currentUserId && claimerId === currentUserId

  // Priority badge config
  const priorityConfig = {
    high: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', label: 'High Priority' },
    normal: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Normal' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Medium' },
    low: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', label: 'Low' },
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative aspect-square bg-slate-100">
        <ProductImage
          src={itemImage}
          alt={displayTitle}
          className="w-full h-full"
          imgClassName="object-cover"
        />

        {/* Claimed Badge */}
        {(isClaimed || isGuestClaimed) && (
          <div
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm ${
              isClaimedByMe || isGuestClaimedByMe
                ? 'bg-emerald-500'
                : isOwner
                ? 'bg-violet-500'
                : 'bg-slate-500'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {isClaimedByMe || isGuestClaimedByMe
              ? 'You claimed this'
              : isOwner
              ? (guestClaim?.name ? `${guestClaim.name} claimed this` : "Someone's got it!")
              : 'Claimed'}
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
          <p className="text-lg font-bold text-cyan-600 mb-1">
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
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-cyan-200 transition-all"
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
                {/* Guest unclaim — when current guest previously claimed this */}
                {isGuestClaimedByMe ? (
                  <button
                    onClick={() => onGuestUnclaim?.(_id)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Unclaim
                  </button>
                ) : isClaimed || isGuestClaimed ? (
                  /* Already claimed by someone else — show nothing for authenticated unclaim check */
                  isClaimedByMe && (
                    <button
                      onClick={() => onUnclaim?.(_id)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                    >
                      Unclaim
                    </button>
                  )
                ) : (
                  /* Not claimed — show appropriate claim action */
                  listPrivacy === 'shared' && !currentUserId ? (
                    /* Guest on a shared list */
                    <button
                      onClick={() => onGuestClaim?.(item)}
                      className="flex-1 px-4 py-2.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-semibold text-sm transition-colors border border-cyan-200"
                    >
                      Claim This
                    </button>
                  ) : currentUserId && (
                    connectionStatus === 'connected' || listPrivacy === 'shared' ? (
                      <button
                        onClick={() => onClaim?.(_id)}
                        className="flex-1 px-4 py-2.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-semibold text-sm transition-colors border border-cyan-200"
                      >
                        Claim This
                      </button>
                    ) : (
                      <button
                        onClick={onConnect}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
                      >
                        Connect to Claim
                      </button>
                    )
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
