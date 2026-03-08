'use client'

import ProductImage from '../ui/ProductImage'

/**
 * ProductCard - Grid card for product display
 * Shows image, title, price, merchant
 * Social proof overlay when >= 3 interactions
 * Hover effects: translate-y, shadow
 */
export default function ProductCard({ product, onClick }) {
  if (!product) return null

  const showSocialProof = product.stats && (product.stats.wishlistCount >= 3 || product.stats.videoCount >= 3)

  return (
    <button
      onClick={() => onClick?.(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 text-left w-full"
    >
      {/* Product Image - Square aspect ratio */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.title}
          className="w-full h-full"
          imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Social Proof Overlay - Only show when >= 3 */}
        {showSocialProof && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.stats.wishlistCount >= 3 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-xs font-semibold text-slate-700">
                <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {product.stats.wishlistCount}
              </span>
            )}
            {product.stats.videoCount >= 3 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 shadow-sm backdrop-blur-sm text-xs font-semibold text-slate-700">
                <svg className="w-3 h-3 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {product.stats.videoCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-cyan-600 transition-colors min-h-[40px]">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          {(typeof product.price === 'object' ? product.price.amount : product.price) ? (
            <span className="text-base font-bold text-slate-900">${typeof product.price === 'object' ? product.price.amount?.toFixed(2) : Number(product.price).toFixed(2)}</span>
          ) : (
            <span className="text-xs text-slate-400">Price unavailable</span>
          )}
          {product.merchant && (
            <span className="text-xs text-slate-400 truncate max-w-[70px]">{product.merchant}</span>
          )}
        </div>
      </div>
    </button>
  )
}
