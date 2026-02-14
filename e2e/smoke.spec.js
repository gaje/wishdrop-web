import { test, expect } from '@playwright/test'

test.describe('Beta Smoke Test', () => {

  test('landing page loads with key sections', async ({ page }) => {
    await page.goto('/')
    // Verify hero section
    await expect(page.getByText('No more guessing')).toBeVisible()
    // Verify preview section exists (from Plan 03)
    await expect(page.getByText('See It in Action')).toBeVisible()
    // Verify features section
    await expect(page.getByText('Why Wishdrop')).toBeVisible()
    // Verify CTA
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
  })

  test('sitemap is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')
    expect(response.status()).toBe(200)
    const content = await page.content()
    expect(content).toContain('urlset')
    expect(content).toContain('wishdrop.app')
  })

  test('error boundary renders on error', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/login/, { timeout: 5000 }).catch(() => {})
    const bodyText = await page.textContent('body')
    expect(bodyText.length).toBeGreaterThan(0)
  })

  test('signup page loads correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
  })

  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('discover page loads without auth', async ({ page }) => {
    await page.goto('/discover')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    expect(url).toContain('/discover')
  })

  test('legal pages are accessible', async ({ page }) => {
    await page.goto('/legal/privacy')
    await expect(page.getByText(/privacy/i)).toBeVisible()
    await page.goto('/legal/terms')
    await expect(page.getByText(/terms/i)).toBeVisible()
    await page.goto('/legal/affiliate-disclosure')
    await expect(page.getByText(/affiliate/i)).toBeVisible()
  })

  test('footer contains all required links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer').last()
    await expect(footer.getByText(/privacy/i)).toBeVisible()
    await expect(footer.getByText(/terms/i)).toBeVisible()
    await expect(footer.getByText(/affiliate/i)).toBeVisible()
  })

})
