/**
 * Detects known junk image URLs — Amazon logos, site branding,
 * transparent pixels, sprites, and other non-product images.
 *
 * Aligned with server-side junk detection in wishlist-server/src/lib/scraper/meta.js
 * but runs client-side to catch images already stored in the DB.
 */

const JUNK_PATTERNS = [
  // Amazon branding & site assets
  '/images/G/01/prime/',
  '/images/G/01/kindle/',
  '/images/G/01/AmazonExports/',
  '/images/G/01/x-locale/',
  '/images/G/01/digital/',
  '/images/G/01/gno/',
  'amazon_logo',

  // Generic junk patterns
  'transparent-pixel',
  'grey-pixel',
  'loading-4S',
  'sprite',
  'badge',

  // Data URI fallbacks (server-generated SVG placeholders)
  'data:image/svg+xml,',
]

// Patterns that must match as whole path segments to avoid false positives
// e.g., "icon" should match "/icon.png" or "/icons/" but not "lexicon.jpg"
const SEGMENT_PATTERNS = [
  'logo',
  'icon',
]

export function isJunkImageUrl(url) {
  if (!url) return false

  const lower = url.toLowerCase()

  // Check substring patterns
  if (JUNK_PATTERNS.some(pattern => lower.includes(pattern.toLowerCase()))) {
    return true
  }

  // Check segment patterns — must be preceded by / or - or _ and followed by . or / or - or _ or end of string
  for (const pattern of SEGMENT_PATTERNS) {
    const regex = new RegExp(`[/\\-_]${pattern}[./\\-_s]|[/\\-_]${pattern}$`, 'i')
    if (regex.test(lower)) {
      return true
    }
  }

  return false
}
