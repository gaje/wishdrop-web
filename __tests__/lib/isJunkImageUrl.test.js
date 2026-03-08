import { isJunkImageUrl } from '@/lib/isJunkImageUrl'

describe('isJunkImageUrl', () => {
  it('returns false for a normal product image URL', () => {
    expect(isJunkImageUrl('https://m.media-amazon.com/images/I/71abc123.jpg')).toBe(false)
  })

  it('returns false for null/undefined', () => {
    expect(isJunkImageUrl(null)).toBe(false)
    expect(isJunkImageUrl(undefined)).toBe(false)
    expect(isJunkImageUrl('')).toBe(false)
  })

  it('detects Amazon logo images', () => {
    expect(isJunkImageUrl('https://m.media-amazon.com/images/G/01/amazon_logo.png')).toBe(true)
  })

  it('detects Amazon branding/export images', () => {
    expect(isJunkImageUrl('https://m.media-amazon.com/images/G/01/AmazonExports/banner.jpg')).toBe(true)
    expect(isJunkImageUrl('https://m.media-amazon.com/images/G/01/prime/hero.jpg')).toBe(true)
  })

  it('detects transparent/grey pixel placeholders', () => {
    expect(isJunkImageUrl('https://example.com/transparent-pixel.gif')).toBe(true)
    expect(isJunkImageUrl('https://example.com/grey-pixel.png')).toBe(true)
  })

  it('detects generic sprite/icon/badge/logo patterns', () => {
    expect(isJunkImageUrl('https://cdn.example.com/assets/sprite-icons.png')).toBe(true)
    expect(isJunkImageUrl('https://cdn.example.com/site-logo.svg')).toBe(true)
    expect(isJunkImageUrl('https://cdn.example.com/trust-badge.png')).toBe(true)
  })

  it('detects Amazon loading placeholder', () => {
    expect(isJunkImageUrl('https://m.media-amazon.com/images/G/01/loading-4S.gif')).toBe(true)
  })

  it('detects data URI SVG fallbacks', () => {
    expect(isJunkImageUrl('data:image/svg+xml,')).toBe(true)
  })

  it('does not flag normal CDN image URLs', () => {
    expect(isJunkImageUrl('https://images-na.ssl-images-amazon.com/images/I/81XYZ.jpg')).toBe(false)
    expect(isJunkImageUrl('https://target.scene7.com/product123.jpg')).toBe(false)
    expect(isJunkImageUrl('https://i5.walmartimages.com/product.jpg')).toBe(false)
  })
})
