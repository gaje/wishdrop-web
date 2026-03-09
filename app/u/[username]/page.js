
import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000') + '/api'

export async function generateMetadata({ params }) {
  const { username } = await params

  try {
    const res = await fetch(
      `${API_BASE}/users/${encodeURIComponent(username)}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return {
        title: 'Profile Not Found | Wishdrop',
        description: 'This profile may not exist.',
      }
    }

    const data = await res.json()
    const user = data.user

    const title = `@${username} on Wishdrop`
    const description = user.bio || `Check out @${username}'s wishlists`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        images: user.avatarUrl
          ? [{ url: user.avatarUrl, width: 256, height: 256 }]
          : [{ url: '/logo-circle.png', width: 512, height: 512 }],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: user.avatarUrl ? [user.avatarUrl] : undefined,
      },
    }
  } catch (error) {
    console.error('Failed to generate metadata for profile:', error)
    return {
      title: 'Profile | Wishdrop',
      description: 'Create and share wishlists with friends and family.',
    }
  }
}

async function getUserProfile(username) {
  try {
    const res = await fetch(
      `${API_BASE}/users/${encodeURIComponent(username)}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }
}

export default async function UserProfilePage({ params }) {
  const { username } = await params
  const data = await getUserProfile(username)

  if (!data || !data.user) {
    notFound()
  }

  const { user, lists, stats } = data

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileClient user={user} lists={lists} stats={stats} />
      </main>
    </div>
  )
}
