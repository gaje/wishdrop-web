const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

const sentryOptions = {
  org: 'gajetastic',
  project: 'wishdrop-web',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  automaticVercelMonitors: true,
}

module.exports = withSentryConfig(nextConfig, sentryOptions)
