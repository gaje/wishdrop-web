import { cookies } from 'next/headers'
import { Link } from 'next-view-transitions'
import HeaderActions from './HeaderActions'

export default async function Header() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('wishdrop_logged_in')?.value === '1'

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <img
              src="https://cdnifly.netlify.app/wishdrop/wishdrop-full.png"
              alt="Wishdrop"
              className="h-8 w-auto"
            />
          </Link>

          <HeaderActions
            isLoggedIn={isLoggedIn}
            guestSlot={
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-gray-700 hover:text-cyan-600 font-medium py-2">
                  Log in
                </Link>
                <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow">
                  Sign up
                </Link>
              </div>
            }
            authShell={
              <nav className="flex items-center gap-4 lg:gap-6">
                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/dashboard" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
                    My Lists
                  </Link>
                  <Link href="/feed" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
                    Following
                  </Link>
                  <Link href="/discover" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
                    Discover
                  </Link>
                </div>

                {/* Static search pill */}
                <div className="relative flex items-center">
                  <div className="relative flex items-center h-10" style={{ width: '110px' }}>
                    <div className="absolute inset-0 rounded-xl bg-slate-100 border border-transparent" />
                    <span className="relative z-10 flex items-center gap-2 px-3 h-10 text-slate-500">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm font-medium whitespace-nowrap">Search</span>
                    </span>
                  </div>
                </div>

                {/* Notification bell placeholder */}
                <div className="relative p-2 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>

                {/* User avatar placeholder */}
                <div className="relative ml-2 pl-4 border-l border-gray-200 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                  <div className="w-16 h-4 rounded bg-slate-100 hidden sm:block" />
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </nav>
            }
          />
        </div>
      </div>
    </header>
  )
}
