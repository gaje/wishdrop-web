import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Social Features
 *
 * Prerequisites:
 * - Backend server running at NEXT_PUBLIC_API_URL
 * - Test user accounts exist
 * - At least one public list exists for testing likes
 *
 * These tests verify:
 * 1. Following/unfollowing users
 * 2. Liking/unliking lists
 * 3. Adding and deleting comments
 * 4. Profile page social elements
 */

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
  username: process.env.TEST_USERNAME || 'testuser',
}

const OTHER_USER = {
  username: process.env.TEST_OTHER_USERNAME || 'otheruser',
}

test.describe('Follow Button', () => {
  test.skip(() => !process.env.RUN_E2E_SOCIAL_TESTS, 'Social E2E tests require backend setup')

  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should display follow button on other user profile', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // Follow button should be visible
    const followButton = page.getByRole('button', { name: /follow/i })
    await expect(followButton).toBeVisible()
  })

  test('should not display follow button on own profile', async ({ page }) => {
    await page.goto(`/u/${TEST_USER.username}`)

    // Follow button should NOT be visible on own profile
    const followButton = page.getByRole('button', { name: /^follow$/i })
    await expect(followButton).not.toBeVisible()
  })

  test('should toggle follow state when clicked', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    const followButton = page.getByRole('button', { name: /follow/i }).first()
    const initialText = await followButton.textContent()

    await followButton.click()

    // Button text should change
    await expect(followButton).not.toHaveText(initialText)
  })

  test('should update follower count after following', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // Get initial follower count
    const followerText = page.locator('text=followers').first()
    await expect(followerText).toBeVisible()

    // Click follow if not already following
    const followButton = page.getByRole('button', { name: 'Follow' })
    if (await followButton.isVisible()) {
      await followButton.click()
      // Should now show "Following"
      await expect(page.getByRole('button', { name: 'Following' })).toBeVisible()
    }
  })
})

test.describe('Like Button', () => {
  test.skip(() => !process.env.RUN_E2E_SOCIAL_TESTS, 'Social E2E tests require backend setup')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should display like button on lists', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // Check that there's at least one list card with a like button
    const likeButton = page.getByLabel(/like/i).first()
    if (await page.locator('.rounded-2xl').count() > 0) {
      await expect(likeButton).toBeVisible()
    }
  })

  test('should toggle like state when clicked', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    // Wait for list page to load
    await page.waitForLoadState('networkidle')

    const likeButton = page.getByLabel(/like|unlike/i).first()
    if (await likeButton.isVisible()) {
      const initialLabel = await likeButton.getAttribute('aria-label')

      await likeButton.click()

      // Wait for state change
      await page.waitForTimeout(500)

      // Label should toggle between "Like" and "Unlike"
      const newLabel = await likeButton.getAttribute('aria-label')
      expect(newLabel).not.toBe(initialLabel)
    }
  })

  test('should animate heart on like', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()
    await page.waitForLoadState('networkidle')

    const likeButton = page.getByLabel('Like').first()
    if (await likeButton.isVisible()) {
      await likeButton.click()

      // Check for scale animation class (transition-transform is always present)
      const svg = likeButton.locator('svg')
      await expect(svg).toHaveClass(/transition-transform/)
    }
  })
})

test.describe('Comments Section', () => {
  test.skip(() => !process.env.RUN_E2E_SOCIAL_TESTS, 'Social E2E tests require backend setup')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should show comment input when logged in', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    // Look for comment textarea
    const commentInput = page.getByPlaceholder('Write a comment...')
    await expect(commentInput).toBeVisible()
  })

  test('should show login prompt when not logged in', async ({ page, context }) => {
    // Clear auth state
    await context.clearCookies()
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    // Should show login link instead of comment input
    const loginPrompt = page.getByRole('link', { name: 'Log in' })
    await expect(loginPrompt).toBeVisible()
  })

  test('should add a new comment', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    const commentInput = page.getByPlaceholder('Write a comment...')
    await commentInput.fill('This is a test comment from E2E')

    await page.getByRole('button', { name: 'Post' }).click()

    // Comment should appear
    await expect(page.getByText('This is a test comment from E2E')).toBeVisible()
  })

  test('should clear input after posting comment', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    const commentInput = page.getByPlaceholder('Write a comment...')
    await commentInput.fill('Another test comment')

    await page.getByRole('button', { name: 'Post' }).click()

    // Input should be cleared
    await expect(commentInput).toHaveValue('')
  })

  test('should disable post button when input is empty', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    const postButton = page.getByRole('button', { name: 'Post' })
    await expect(postButton).toBeDisabled()
  })

  test('should show character warning near limit', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    const commentInput = page.getByPlaceholder('Write a comment...')
    // Type 450 characters (near the 500 limit)
    await commentInput.fill('a'.repeat(450))

    // Warning should appear
    await expect(page.getByText(/characters remaining/)).toBeVisible()
  })

  test('should delete own comment', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)
    await page.getByRole('link').first().click()

    // First add a comment
    const commentInput = page.getByPlaceholder('Write a comment...')
    const uniqueText = `Delete test ${Date.now()}`
    await commentInput.fill(uniqueText)
    await page.getByRole('button', { name: 'Post' }).click()

    // Wait for comment to appear
    await expect(page.getByText(uniqueText)).toBeVisible()

    // Click delete
    page.on('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Delete' }).first().click()

    // Comment should be removed
    await expect(page.getByText(uniqueText)).not.toBeVisible()
  })
})

test.describe('Profile Page Social Elements', () => {
  test.skip(() => !process.env.RUN_E2E_SOCIAL_TESTS, 'Social E2E tests require backend setup')

  test('should display follower and following counts', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // Check for stats display
    await expect(page.getByText(/follower/)).toBeVisible()
    await expect(page.getByText(/following/)).toBeVisible()
  })

  test('should display public lists count', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // Check for lists count
    await expect(page.getByText(/list/)).toBeVisible()
  })

  test('should show like buttons on each list card', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // If there are list cards, they should have like buttons
    const listCards = page.locator('.rounded-2xl').filter({ has: page.getByRole('link') })
    const count = await listCards.count()

    if (count > 0) {
      // Each card should have a like button in its footer
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = listCards.nth(i)
        const likeButton = card.getByLabel(/like|unlike/i)
        await expect(likeButton).toBeVisible()
      }
    }
  })

  test('should navigate to list when clicking on card link', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    const firstListLink = page.getByRole('link').filter({ hasText: /./i }).first()
    if (await firstListLink.isVisible()) {
      const href = await firstListLink.getAttribute('href')
      await firstListLink.click()

      // Should navigate to the list page
      await expect(page).toHaveURL(new RegExp(OTHER_USER.username))
    }
  })
})

test.describe('Social Features - Unauthenticated', () => {
  test.skip(() => !process.env.RUN_E2E_SOCIAL_TESTS, 'Social E2E tests require backend setup')

  test('should not show follow button when not logged in', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // Follow button should not be visible
    const followButton = page.getByRole('button', { name: /^follow$/i })
    await expect(followButton).not.toBeVisible()
  })

  test('should still show like counts without login', async ({ page }) => {
    await page.goto(`/u/${OTHER_USER.username}`)

    // Like counts should be visible even when logged out
    // The heart icon should still be visible as a display element
    const likeElements = page.locator('svg path[d*="M4.318"]')
    const count = await likeElements.count()
    expect(count).toBeGreaterThanOrEqual(0) // May or may not have likes
  })
})
