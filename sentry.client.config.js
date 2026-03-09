/**
 * Sentry initialization for client-side error tracking
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Only initialize if DSN is set (avoids noise in development)
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',

    // Sample 100% of errors for beta
    sampleRate: 1.0,

    // Don't send default PII
    sendDefaultPii: false,

    // Scrub sensitive data before sending
    beforeSend(event) {
      // Scrub sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization
        delete event.request.headers.cookie
      }

      return event
    },
  })
}
