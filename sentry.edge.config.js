/**
 * Sentry initialization for edge runtime
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

// Only initialize if DSN is set
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
    sampleRate: 1.0,
    sendDefaultPii: false,
  })
}
