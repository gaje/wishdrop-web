/**
 * Next.js Dynamic Sitemap
 * Generates sitemap.xml with static pages and dynamic user profiles
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
const SITE_URL = 'https://wishdrop.app'

export default async function sitemap() {
  const entries = []

  // Static pages
  const staticPages = [
    { url: '/', changeFrequency: 'weekly', priority: 1.0 },
    { url: '/discover', changeFrequency: 'daily', priority: 0.8 },
    { url: '/signup', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/login', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/legal/privacy', changeFrequency: 'monthly', priority: 0.2 },
    { url: '/legal/terms', changeFrequency: 'monthly', priority: 0.2 },
    { url: '/legal/affiliate-disclosure', changeFrequency: 'monthly', priority: 0.2 },
    { url: '/legal/community-guidelines', changeFrequency: 'monthly', priority: 0.2 },
  ]

  staticPages.forEach(page => {
    entries.push({
      url: `${SITE_URL}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  })

  // Dynamic user profile pages
  try {
    // Fetch public users - this endpoint might not exist yet
    // Try to fetch from discover/trending or a public users endpoint
    const response = await fetch(`${API_BASE}/api/discover/trending?limit=100`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Use a reasonable timeout to prevent sitemap generation from hanging
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const data = await response.json()

      // Extract unique users from trending lists
      const userMap = new Map()

      if (data.lists && Array.isArray(data.lists)) {
        data.lists.forEach(list => {
          if (list.userId && list.userId.username) {
            const userId = list.userId._id || list.userId
            if (!userMap.has(userId)) {
              userMap.set(userId, {
                username: list.userId.username,
                lists: []
              })
            }
            // Track lists for this user
            if (list.slug) {
              userMap.get(userId).lists.push(list.slug)
            }
          }
        })
      }

      // Add user profile pages
      userMap.forEach((userData, userId) => {
        // Add profile page
        entries.push({
          url: `${SITE_URL}/u/${userData.username}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })

        // Add public list pages for this user
        userData.lists.forEach(slug => {
          entries.push({
            url: `${SITE_URL}/u/${userData.username}/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        })
      })
    }
  } catch (error) {
    // Gracefully handle API errors - sitemap still works with just static pages
    console.warn('Could not fetch dynamic pages for sitemap:', error.message)
  }

  // Dynamic product pages
  try {
    const productResponse = await fetch(`${API_BASE}/api/products/slugs`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })

    if (productResponse.ok) {
      const productData = await productResponse.json()

      if (productData.products && Array.isArray(productData.products)) {
        productData.products.forEach(product => {
          entries.push({
            url: `${SITE_URL}/product/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        })
      }
    }
  } catch (error) {
    console.warn('Could not fetch products for sitemap:', error.message)
  }

  return entries
}
