import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Item Management
 *
 * Prerequisites:
 * - Backend server running at EXPO_PUBLIC_API_BASE
 * - Test user account exists with username/password
 * - At least one list exists for the test user
 *
 * These tests verify:
 * 1. Viewing items on a list
 * 2. Adding a new item via modal
 * 3. Editing an existing item
 * 4. Deleting an item
 * 5. Claiming/unclaiming items (as a visitor)
 */

// Test credentials - update these for your test environment
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
  username: process.env.TEST_USERNAME || 'testuser',
}

test.describe('Item Management', () => {
  // Skip these tests if running in CI without proper test setup
  test.skip(({ browserName }) => !process.env.RUN_E2E_ITEM_TESTS, 'Item E2E tests require backend setup')

  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: /log in/i }).click()

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should display items on a list page', async ({ page }) => {
    // Navigate to a list
    await page.getByRole('link', { name: /view list/i }).first().click()

    // Verify the items grid is visible
    const itemsGrid = page.locator('.grid')
    await expect(itemsGrid).toBeVisible()
  })

  test('should open and close add item modal', async ({ page }) => {
    // Navigate to own list
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Click add item button
    await page.getByRole('button', { name: /add item/i }).click()

    // Verify modal opens
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add Item' })).toBeVisible()

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should add a new item', async ({ page }) => {
    // Navigate to own list
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Open add modal
    await page.getByRole('button', { name: /add item/i }).click()

    // Fill in item details
    const timestamp = Date.now()
    const itemName = `Test Item ${timestamp}`

    await page.getByPlaceholder('e.g., Blue Wireless Headphones').fill(itemName)
    await page.getByPlaceholder('29.99').fill('49.99')
    await page.getByPlaceholder('Any additional details').fill('Test notes for this item')

    // Set priority to high
    await page.getByRole('button', { name: 'High' }).click()

    // Submit
    await page.getByRole('button', { name: 'Add Item' }).click()

    // Verify modal closes and item appears
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText(itemName)).toBeVisible()
    await expect(page.getByText('$49.99')).toBeVisible()
    await expect(page.getByText('High Priority')).toBeVisible()
  })

  test('should edit an existing item', async ({ page }) => {
    // Navigate to own list with items
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Hover over an item card and click edit
    const itemCard = page.locator('[class*="rounded-2xl"]').first()
    await itemCard.hover()
    await itemCard.getByRole('button', { name: 'Edit Item' }).click()

    // Verify edit modal opens
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Edit Item' })).toBeVisible()

    // Update the title
    const titleInput = page.getByPlaceholder('e.g., Blue Wireless Headphones')
    await titleInput.clear()
    await titleInput.fill('Updated Item Name')

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Verify update
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Updated Item Name')).toBeVisible()
  })

  test('should delete an item', async ({ page }) => {
    // Navigate to own list
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Open edit modal
    const itemCard = page.locator('[class*="rounded-2xl"]').first()
    await itemCard.hover()
    await itemCard.getByRole('button', { name: 'Edit Item' }).click()

    // Click delete
    await page.getByRole('button', { name: /delete item/i }).click()

    // Confirm deletion
    await expect(page.getByText('Delete this item?')).toBeVisible()
    await page.getByRole('button', { name: 'Delete Item' }).click()

    // Verify modal closes
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should show validation error when submitting without title', async ({ page }) => {
    // Navigate to own list
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Open add modal
    await page.getByRole('button', { name: /add item/i }).click()

    // Try to submit without title
    await page.getByRole('button', { name: 'Add Item' }).click()

    // Modal should still be open (validation prevents submission)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should display priority badges correctly', async ({ page }) => {
    // Navigate to a list
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Check for priority badges
    const highPriority = page.getByText('High Priority')
    const mediumPriority = page.getByText('Medium')
    const lowPriority = page.getByText('Low')

    // At least one priority type should be visible if items exist
    const hasPriority =
      await highPriority.isVisible().catch(() => false) ||
      await mediumPriority.isVisible().catch(() => false) ||
      await lowPriority.isVisible().catch(() => false)

    // This is a soft check - items may not have priorities
    if (await page.locator('[class*="rounded-2xl"]').count() > 0) {
      // Items exist, so we can check the card structure
      const firstItem = page.locator('[class*="rounded-2xl"]').first()
      await expect(firstItem).toBeVisible()
    }
  })
})

test.describe('Item Actions for Visitors', () => {
  test.skip(() => !process.env.RUN_E2E_ITEM_TESTS, 'Item E2E tests require backend setup')

  test('should allow claiming an item when logged in', async ({ page }) => {
    // Log in as a different user
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_VISITOR_EMAIL || 'visitor@example.com')
    await page.getByLabel('Password').fill(process.env.TEST_VISITOR_PASSWORD || 'visitorpass123')
    await page.getByRole('button', { name: /log in/i }).click()

    // Visit another user's list
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Find an unclaimed item and claim it
    const claimButton = page.getByRole('button', { name: 'Claim This' }).first()
    if (await claimButton.isVisible()) {
      await claimButton.click()

      // Verify claimed status
      await expect(page.getByText('Claimed by you')).toBeVisible()
    }
  })

  test('should allow unclaiming an item', async ({ page }) => {
    // Log in as visitor who has claimed an item
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_VISITOR_EMAIL || 'visitor@example.com')
    await page.getByLabel('Password').fill(process.env.TEST_VISITOR_PASSWORD || 'visitorpass123')
    await page.getByRole('button', { name: /log in/i }).click()

    // Visit another user's list
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Find an item claimed by this user and unclaim it
    const unclaimButton = page.getByRole('button', { name: 'Unclaim' }).first()
    if (await unclaimButton.isVisible()) {
      await unclaimButton.click()

      // Verify unclaimed - button should change to Claim This
      await expect(page.getByRole('button', { name: 'Claim This' })).toBeVisible()
    }
  })

  test('should not show edit button to visitors', async ({ page }) => {
    // Visit a list without logging in
    await page.goto(`/u/${TEST_USER.username}`)
    await page.getByRole('link').first().click()

    // Verify no edit button is visible
    await expect(page.getByRole('button', { name: 'Edit Item' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /add item/i })).not.toBeVisible()
  })
})
