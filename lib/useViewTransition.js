'use client'

import { useRouter as useNextRouter } from 'next/navigation'
import { useTransitionRouter } from 'next-view-transitions'

/**
 * Hook to enable View Transitions for Next.js navigation
 * Uses next-view-transitions library for proper SPA transitions
 */
export function useViewTransition() {
  const router = useTransitionRouter()

  const navigate = (href, options = {}) => {
    router.push(href, options)
  }

  return { navigate }
}
