import Header from '@/components/Header'
import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://10.0.0.25:4000/api'

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
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileClient user={user} lists={lists} stats={stats} />
      </main>
    </div>
  )
}
