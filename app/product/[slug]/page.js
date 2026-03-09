import { redirect } from 'next/navigation'
import ProductClient from './ProductClient'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
const SITE_URL = 'https://wishdrop.app'

/**
 * Helper: Fetch product data by slug or encoded URL
 */
async function getProductData(slugOrId) {
  try {
    // First try fetching by slug
    const res = await fetch(`${API_BASE}/api/products/by-slug/${slugOrId}`, {
      cache: 'no-store'
    })

    if (res.ok) {
      const data = await res.json()
      return { type: 'data', data }
    }

    // If not found by slug, check if param is an old encoded URL
    const decoded = decodeURIComponent(slugOrId)
    if (decoded.startsWith('http')) {
      // Try fetching by URL
      const urlRes = await fetch(`${API_BASE}/api/products/by-url/${encodeURIComponent(decoded)}`, {
        cache: 'no-store'
      })

      if (urlRes.ok) {
        const urlData = await urlRes.json()
        // If this product has a slug, redirect to it
        if (urlData.product?.slug) {
          return { type: 'redirect', slug: urlData.product.slug }
        }
        // Otherwise serve data directly
        return { type: 'data', data: urlData }
      }
    }

    return { type: 'not_found' }
  } catch (error) {
    // Re-throw redirect errors (Next.js NEXT_REDIRECT)
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Error fetching product:', error)
    return { type: 'not_found' }
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { slug } = await params
  const result = await getProductData(slug)

  // Fallback metadata for not found or redirect
  if (result.type === 'not_found' || result.type === 'redirect') {
    return {
      title: 'Product Not Found | Wishdrop',
      description: 'This product could not be found.'
    }
  }

  const { product } = result.data

  // Truncate title and description for optimal SEO
  const title = product.title
    ? `${product.title.substring(0, 60)}${product.title.length > 60 ? '...' : ''} | Wishdrop`
    : 'Product | Wishdrop'

  const description = product.description
    ? product.description.substring(0, 155) + (product.description.length > 155 ? '...' : '')
    : `Check out ${product.title || 'this product'} on Wishdrop`

  return {
    title,
    description,
    openGraph: {
      title: product.title || 'Product on Wishdrop',
      description,
      type: 'website',
      url: `${SITE_URL}/product/${slug}`,
      ...(product.image && {
        images: [
          {
            url: product.image,
            alt: product.title
          }
        ]
      })
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title || 'Product on Wishdrop',
      description,
      ...(product.image && {
        images: [product.image]
      })
    }
  }
}

/**
 * Product page - Server component
 */
export default async function ProductPage({ params }) {
  const { slug } = await params
  const result = await getProductData(slug)

  // Handle redirect for old URL format
  if (result.type === 'redirect') {
    redirect(`/product/${result.slug}`)
  }

  // Handle not found
  if (result.type === 'not_found') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-slate-600 mb-6">This product could not be found.</p>
        </div>
      </div>
    )
  }

  const { product, stats, retailers, videos, relatedProducts, lists } = result.data

  // Generate JSON-LD structured data for Product
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.image && { image: product.image }),
    ...(product.description && { description: product.description }),
    ...(product.brand && {
      brand: {
        '@type': 'Brand',
        name: product.brand
      }
    }),
    ...(product.price?.amount && {
      offers: {
        '@type': 'Offer',
        price: product.price.amount,
        priceCurrency: product.price.currency || 'USD',
        availability: 'https://schema.org/InStock',
        ...(product.originalUrl && { url: product.originalUrl })
      }
    }),
    ...(stats?.wishlistCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: stats.wishlistCount
      }
    })
  }

  // Generate JSON-LD for Breadcrumbs
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Discover',
        item: `${SITE_URL}/discover`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${SITE_URL}/product/${slug}`
      }
    ]
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Client component with initial data */}
      <ProductClient
        initialData={result.data}
        slug={slug}
      />
    </>
  )
}
