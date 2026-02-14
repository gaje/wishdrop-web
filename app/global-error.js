'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Capture the error in Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '16px',
            }}>
              Something went wrong
            </h1>

            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                color: 'white',
                fontWeight: '500',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
