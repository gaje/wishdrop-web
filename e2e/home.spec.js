import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/Wishdrop/i)
  })

  test('should have login and signup links', async ({ page }) => {
    await page.goto('/')

    // Check for navigation links
    const loginLink = page.getByRole('link', { name: /log in/i })
    const signupLink = page.getByRole('link', { name: /sign up/i })

    await expect(loginLink).toBeVisible()
    await expect(signupLink).toBeVisible()
  })
})
