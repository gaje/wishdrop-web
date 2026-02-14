/**
 * Sentry initialization for edge runtime
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

// Only initialize if DSN is set
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    sampleRate: 1.0,
    sendDefaultPii: false,
  })
}
