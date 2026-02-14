'use client'

import ProductCard from './ProductCard'

/**
 * CollectionGrid - Section with header and responsive product grid
 * Shows first 8 products with "See All" link
 * Grid: 2 cols mobile, 3 tablet, 4 desktop
 */
export default function CollectionGrid({ collection, onProductClick, onSeeAll }) {
  if (!collection || !collection.products || collection.products.length === 0) {
    return null
  }

  const displayProducts = collection.products.slice(0, 8)
  const hasMore = collection.products.length > 8

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{collection.title}</h2>
          {collection.description && (
            <p className="text-sm text-slate-500 mt-0.5">{collection.description}</p>
          )}
        </div>
        {hasMore && onSeeAll && (
          <button
            onClick={() => onSeeAll(collection)}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
          >
            See All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayProducts.map((product, index) => (
          <ProductCard
            key={product._id || product.normalizedUrl || index}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
    </section>
  )
}
