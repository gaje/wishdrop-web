#!/usr/bin/env node
/**
 * Captures landing page screenshots using Playwright.
 *
 * Prerequisites:
 *   1. Seed demo data:  cd wishlist-server && node src/scripts/seed-demo-screenshots.js
 *   2. Start backend:   cd wishlist-server && npm run dev
 *   3. Start frontend:  cd wishlist-web && npm run dev
 *
 * Usage:
 *   cd wishlist-web && node scripts/capture-screenshots.js
 */
import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_BASE = process.env.API_BASE || 'http://localhost:4000'
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000'
const OUTPUT_DIR = path.resolve(__dirname, '../public/screenshots')

const DEMO_EMAIL = 'sarah@demo.wishdrop.app'
const DEMO_PASSWORD = 'DemoPass123!'

// iPhone 14 Pro dimensions
const VIEWPORT = { width: 390, height: 844 }
const DEVICE_SCALE_FACTOR = 2

// CSS injected after each navigation to clean up the screenshot
const CLEANUP_CSS = `
  /* Hide Next.js dev indicator */
  nextjs-portal { display: none !important; }
  /* Push the sticky header down to simulate a phone status bar */
  header[class*="sticky"] {
    top: 32px !important;
  }
  /* Fill the status bar area with white */
  body::before {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 32px;
    background: white;
    z-index: 9999;
  }
  /* Offset page content so it isn't hidden behind the status bar */
  body {
    padding-top: 32px;
  }
  /* Add gap between logo and header actions (search, bell, avatar) */
  header .flex.items-center.justify-between {
    gap: 16px;
  }
  /* Shrink the search pill so it doesn't crowd the logo */
  header nav .relative.flex.items-center .relative.flex.items-center.h-10 {
    width: 90px !important;
  }
`

async function login() {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(`Login failed (${response.status}): ${data.error || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.token
}

/**
 * Navigate to a URL and apply screenshot cleanup (hide dev tools, add status bar padding).
 */
async function navigateTo(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: CLEANUP_CSS })
  // Wait for images to load and layout to settle
  await page.waitForTimeout(1500)
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log('Logging in as demo user...')
  const token = await login()
  console.log('Logged in successfully\n')

  console.log('Launching browser...')
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  })

  const page = await context.newPage()

  // Set auth token and dismiss banners
  await page.goto(WEB_BASE)
  await page.evaluate((t) => {
    localStorage.setItem('auth_token', t)
    localStorage.setItem('wishdrop_family_banner_dismissed', 'true')
  }, token)

  // --- Screenshot 1: Dashboard with lists ---
  console.log('Capturing dashboard...')
  await navigateTo(page, `${WEB_BASE}/dashboard`)
  await page.waitForSelector('a[href*="/u/"]', { timeout: 10000 }).catch(() => {
    console.log('  Warning: No list links found, capturing current state')
  })
  // Scroll past the Want It / Have It toggle to focus on lists
  await page.evaluate(() => window.scrollBy(0, 60))
  await page.waitForTimeout(500)
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'dashboard.png'),
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
  })
  console.log('  Saved dashboard.png')

  // --- Screenshot 2: Shared list detail showing items ---
  console.log('Capturing shared list view...')
  await navigateTo(page, `${WEB_BASE}/u/sarahm/birthday-wishlist`)
  // Scroll down slightly to show list title + item cards with images
  await page.evaluate(() => window.scrollBy(0, 130))
  await page.waitForTimeout(800)
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'share.png'),
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
  })
  console.log('  Saved share.png')

  // --- Screenshot 3: Public profile showing lists ---
  console.log('Capturing profile / discover view...')
  await navigateTo(page, `${WEB_BASE}/u/sarahm`)
  // Scroll down slightly so "Public Lists" section is visible with avatar
  await page.evaluate(() => window.scrollBy(0, 60))
  await page.waitForTimeout(800)
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'discover.png'),
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
  })
  console.log('  Saved discover.png')

  await browser.close()
  console.log(`\nAll screenshots saved to ${OUTPUT_DIR}`)
}

main().catch((error) => {
  console.error('Screenshot capture failed:', error)
  process.exit(1)
})
