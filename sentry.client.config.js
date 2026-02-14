/**
 * Sentry initialization for client-side error tracking
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Only initialize if DSN is set (avoids noise in development)
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

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

      // Scrub sensitive body fields
      if (event.request?.data) {
        const sensitiveFields = ['password', 'newPassword', 'token', 'secret', 'jwt', 'resetToken']
        sensitiveFields.forEach(field => {
          if (typeof event.request.data === 'object' && event.request.data[field]) {
            event.request.data[field] = '[Filtered]'
          }
        })
      }

      return event
    },

    // Don't report API errors (already caught by server Sentry)
    denyUrls: [/\/api\//],
  })
}
