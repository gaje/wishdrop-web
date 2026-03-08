'use client'

import { useState } from 'react'
import ProductImageFallback from './ProductImageFallback'
import { isJunkImageUrl } from '@/lib/isJunkImageUrl'

/**
 * ProductImage — Smart image wrapper with fallback detection
 *
 * Handles four failure cases:
 * 1. No image URL → renders fallback immediately
 * 2. Known junk URL (Amazon logo, sprites, etc.) → fallback immediately
 * 3. Image load error (404, CORS, etc.) → swaps to fallback
 * 4. Bot blocker (image loads but is <= 2x2 px) → swaps to fallback
 */
const MIN_IMAGE_SIZE = 3 // Images <= 2x2 are considered bot blockers

export default function ProductImage({ src, alt, className = '', imgClassName = '', fill = false, sizes, onError }) {
  const [showFallback, setShowFallback] = useState(!src || isJunkImageUrl(src))

  const handleError = () => {
    setShowFallback(true)
    onError?.()
  }

  const handleLoad = (e) => {
    const img = e.target
    if (img.naturalWidth < MIN_IMAGE_SIZE && img.naturalHeight < MIN_IMAGE_SIZE) {
      setShowFallback(true)
    }
  }

  if (showFallback) {
    return <ProductImageFallback className={className} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${imgClassName}`}
      onError={handleError}
      onLoad={handleLoad}
    />
  )
}
