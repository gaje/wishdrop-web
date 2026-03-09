import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Connections, Claiming, and Guest Claiming
 *
 * Prerequisites:
 * - Backend server running at localhost:4000
 * - Web app running at localhost:3000
 * - Test accounts seeded: cd wishlist-server && npm run seed:test-accounts
 *
 * Run with:
 *   cd wishlist-web
 *   RUN_E2E_CONNECTION_TESTS=1 npx playwright test e2e/connections-claiming.spec.js --project=chromium --workers=1
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

// Dev mode SSR + hydration can be slow; use generous timeouts
test.use({ actionTimeout: 15_000, navigationTimeout: 30_000 })

const ALICE = {
  email: 'alice@test.wishdrop.app',
  password: 'TestPass123!',
  username: 'alice_test',
}

const BOB = {
  email: 'bob@test.wishdrop.app',
  password: 'TestPass123!',
  username: 'bob_test',
}

const CHARLIE = {
  email: 'charlie@test.wishdrop.app',
  password: 'TestPass123!',
  username: 'charlie_test',
}

// Token cache — avoids hammering the auth endpoint (50 req/15min in dev mode).
// Each Playwright worker gets its own module scope, so tokens are cached per-worker.
const tokenCache = {}
const userIdCache = {}

async function getToken(request, user) {
  if (tokenCache[user.email]) return tokenCache[user.email]
  const resp = await request.post(`${API_BASE}/api/auth/login`, {
    data: { email: user.email, password: user.password },
  })
  if (!resp.ok()) {
    throw new Error(`Login failed for ${user.email}: ${resp.status()} ${resp.statusText()}`)
  }
  const { token } = await resp.json()
  tokenCache[user.email] = token
  return token
}

async function getUserId(request, user) {
  if (userIdCache[user.email]) return userIdCache[user.email]
  const token = await getToken(request, user)
  const resp = await request.get(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const { user: userData } = await resp.json()
  const userId = userData.id || userData._id
  userIdCache[user.email] = userId
  return userId
}

// API-based login — fast, no UI navigation.
// Must navigate to the app origin first so localStorage is accessible
// (Playwright pages start at about:blank which blocks storage access).
async function loginAs(page, user) {
  const token = await getToken(page.request, user)
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token)
}

// Reset all claims on a list using Alice's owner privileges.
// Owner's DELETE /api/items/:id/claim clears both claimedBy AND guestClaim.
async function resetAllClaims(request, listSlug) {
  const aliceToken = await getToken(request, ALICE)
  const listResp = await request.get(
    `${API_BASE}/api/lists/${ALICE.username}/${listSlug}`,
    { headers: { Authorization: `Bearer ${aliceToken}` } }
  )
  if (!listResp.ok()) return
  const { items } = await listResp.json()
  for (const item of items || []) {
    if (item.claimedBy || item.guestClaim?.name) {
      await request
        .delete(`${API_BASE}/api/items/${item._id}/claim`, {
          headers: { Authorization: `Bearer ${aliceToken}` },
        })
        .catch(() => {})
      // Also explicitly clear guest claim (owner can always do this)
      if (item.guestClaim?.name) {
        await request
          .delete(`${API_BASE}/api/items/${item._id}/guest-claim`, {
            headers: { Authorization: `Bearer ${aliceToken}` },
          })
          .catch(() => {})
      }
    }
  }
}

// Physically delete a connection between two users.
// The DELETE endpoint only marks connections as 'removed' (soft delete),
// and the check endpoint returns 'none' for removed connections — but the
// document still exists. To truly delete: first make it 'pending' (via request),
// then reject it (which calls Connection.deleteOne).
async function removeConnection(request, userA, userB) {
  const tokenA = await getToken(request, userA)
  const tokenB = await getToken(request, userB)
  const idA = await getUserId(request, userA)
  const idB = await getUserId(request, userB)

  // Step 1: If connected, soft-delete first (required before re-requesting)
  const checkResp = await request.get(`${API_BASE}/api/connections/check/${idB}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  })
  if (!checkResp.ok()) return

  const { status } = await checkResp.json()

  if (status === 'connected') {
    await request.delete(`${API_BASE}/api/connections/${idB}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    })
  }

  // Step 2: Send a request from A to B. This either:
  //   - Creates a new 'pending' document (if none exists)
  //   - Re-enables a 'removed' document as 'pending'
  //   - Returns 409 if already pending (that's fine)
  await request.post(`${API_BASE}/api/connections/request`, {
    headers: { Authorization: `Bearer ${tokenA}` },
    data: { userId: idB },
  })

  // Step 3: B rejects the pending request (physically deletes the document)
  const pendingResp = await request.get(`${API_BASE}/api/connections/pending`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  })
  if (pendingResp.ok()) {
    // Pending endpoint returns an array, not { requests: [...] }
    const pendingData = await pendingResp.json()
    const pendingArr = Array.isArray(pendingData) ? pendingData : pendingData.requests || []
    for (const req of pendingArr) {
      const reqUsername = req.requester?.username
      if (reqUsername === userA.username) {
        await request.post(`${API_BASE}/api/connections/request/${req._id}/reject`, {
          headers: { Authorization: `Bearer ${tokenB}` },
        })
      }
    }
  }

  // Step 4: Also check A's pending (in case B sent a request to A)
  const pendingAResp = await request.get(`${API_BASE}/api/connections/pending`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  })
  if (pendingAResp.ok()) {
    const pendingAData = await pendingAResp.json()
    const pendingAArr = Array.isArray(pendingAData) ? pendingAData : pendingAData.requests || []
    for (const req of pendingAArr) {
      const reqUsername = req.requester?.username
      if (reqUsername === userB.username) {
        await request.post(`${API_BASE}/api/connections/request/${req._id}/reject`, {
          headers: { Authorization: `Bearer ${tokenA}` },
        })
      }
    }
  }
}

// Ensure an accepted connection exists between two users.
async function ensureConnection(request, fromUser, toUser) {
  const fromToken = await getToken(request, fromUser)
  const toToken = await getToken(request, toUser)
  const toId = await getUserId(request, toUser)

  // Check current status
  const checkResp = await request.get(`${API_BASE}/api/connections/check/${toId}`, {
    headers: { Authorization: `Bearer ${fromToken}` },
  })
  if (!checkResp.ok()) return

  const { status } = await checkResp.json()
  if (status === 'connected') return // Already connected

  // If pending or removed, clean up first
  if (status === 'pending_sent' || status === 'pending_received') {
    await removeConnection(request, fromUser, toUser)
  }

  // Send connection request (also handles 'removed' → 'pending' re-enable)
  await request.post(`${API_BASE}/api/connections/request`, {
    headers: { Authorization: `Bearer ${fromToken}` },
    data: { userId: toId },
  })

  // Accept the request — pending endpoint returns an array, not { requests }
  const pendingResp = await request.get(`${API_BASE}/api/connections/pending`, {
    headers: { Authorization: `Bearer ${toToken}` },
  })
  if (!pendingResp.ok()) return

  const pendingData = await pendingResp.json()
  const pendingArr = Array.isArray(pendingData) ? pendingData : pendingData.requests || []
  const pendingReq = pendingArr.find(
    (r) => r.requester?.username === fromUser.username
  )

  if (pendingReq) {
    await request.post(
      `${API_BASE}/api/connections/request/${pendingReq._id}/accept`,
      { headers: { Authorization: `Bearer ${toToken}` } }
    )
  }
}

// ============================================================================
// Group 1: Connection Flow (serial — each step depends on the previous)
// ============================================================================

test.describe.serial('Connection Flow', () => {
  test.skip(
    () => !process.env.RUN_E2E_CONNECTION_TESTS,
    'Requires RUN_E2E_CONNECTION_TESTS=1 and seeded accounts'
  )

  // Remove any existing Alice-Bob connection before the flow tests
  test.beforeAll(async ({ request }) => {
    await removeConnection(request, BOB, ALICE)

    // Verify clean
    const bobToken = await getToken(request, BOB)
    const aliceId = await getUserId(request, ALICE)
    const checkResp = await request.get(
      `${API_BASE}/api/connections/check/${aliceId}`,
      { headers: { Authorization: `Bearer ${bobToken}` } }
    )
    if (checkResp.ok()) {
      const { status } = await checkResp.json()
      if (status !== 'none') {
        throw new Error(`Connection not cleaned up: status=${status}`)
      }
    }
  })

  test('Bob sees Connect button on Alice profile', async ({ page }) => {
    await loginAs(page, BOB)
    await page.goto(`/u/${ALICE.username}`, { waitUntil: 'networkidle' })

    const connectBtn = page.getByRole('button', { name: 'Connect', exact: true })
    await expect(connectBtn).toBeVisible()
  })

  test('Bob sends connection request', async ({ page }) => {
    await loginAs(page, BOB)
    await page.goto(`/u/${ALICE.username}`, { waitUntil: 'networkidle' })

    // Wait for ConnectionButton to finish its initial status check
    const connectBtn = page.getByRole('button', { name: 'Connect', exact: true })
    await expect(connectBtn).toBeVisible()
    await connectBtn.click()

    // Should transition to "Requested" (disabled)
    const requestedBtn = page.getByRole('button', { name: 'Requested' })
    await expect(requestedBtn).toBeVisible({ timeout: 10_000 })
    await expect(requestedBtn).toBeDisabled()
  })

  test('Alice sees pending request and accepts', async ({ page }) => {
    await loginAs(page, ALICE)
    await page.goto('/connections', { waitUntil: 'networkidle' })

    // Wait for page to be fully loaded (auth check + initial data fetch)
    await expect(page.getByText('My Connections')).toBeVisible()

    // Click "Pending Requests" tab
    await page.getByRole('button', { name: /Pending Requests/ }).click()

    // Wait for the pending request to load (data fetch after tab switch)
    await expect(page.getByText(`@${BOB.username}`)).toBeVisible({ timeout: 10_000 })

    // Click Accept and wait for the request to be processed
    await page.getByRole('button', { name: 'Accept' }).click()

    // Wait for the pending list to update (Accept button disappears, Received count drops)
    await expect(page.getByText('Received (0)')).toBeVisible({ timeout: 10_000 })

    // Now switch to Connections tab to verify
    await page.getByRole('button', { name: 'Connections' }).first().click()
    await expect(page.getByText(`@${BOB.username}`)).toBeVisible({ timeout: 10_000 })
  })

  test('Bob now sees Connected button on Alice profile', async ({ page }) => {
    await loginAs(page, BOB)
    await page.goto(`/u/${ALICE.username}`, { waitUntil: 'networkidle' })

    const connectedBtn = page.getByRole('button', { name: 'Connected' })
    await expect(connectedBtn).toBeVisible()
  })

  test('Alice removes the connection', async ({ page }) => {
    await loginAs(page, ALICE)
    await page.goto(`/u/${BOB.username}`, { waitUntil: 'networkidle' })

    // Click "Connected" to reveal dropdown
    const connectedBtn = page.getByRole('button', { name: 'Connected' })
    await expect(connectedBtn).toBeVisible()
    await connectedBtn.click()

    // Handle confirm dialog
    page.on('dialog', (dialog) => dialog.accept())

    // Click "Remove"
    await page.getByRole('button', { name: 'Remove' }).click()

    // Should go back to "Connect" state
    await expect(
      page.getByRole('button', { name: 'Connect', exact: true })
    ).toBeVisible()
  })

  // Re-establish connection for subsequent test groups
  test.afterAll(async ({ request }) => {
    await ensureConnection(request, BOB, ALICE)
  })
})

// ============================================================================
// Group 2: Claiming on Public Lists (connection required)
// ============================================================================

test.describe('Claiming on Public Lists', () => {
  test.skip(
    () => !process.env.RUN_E2E_CONNECTION_TESTS,
    'Requires RUN_E2E_CONNECTION_TESTS=1 and seeded accounts'
  )

  const PUBLIC_LIST_URL = `/u/${ALICE.username}/alices-public-wishlist`

  // Ensure connection + clean up stale claims
  test.beforeAll(async ({ request }) => {
    await ensureConnection(request, BOB, ALICE)
    await resetAllClaims(request, 'alices-public-wishlist')
  })

  test('Bob (connected) sees Claim This buttons', async ({ page }) => {
    await loginAs(page, BOB)
    await page.goto(PUBLIC_LIST_URL, { waitUntil: 'networkidle' })

    // Wait for items to load
    await expect(page.getByText('Wireless Headphones')).toBeVisible()

    // Connected user should see "Claim This" on unclaimed items
    const claimButtons = page.getByRole('button', { name: 'Claim This' })
    await expect(claimButtons.first()).toBeVisible()
  })

  test('Bob claims an item and sees confirmation', async ({ page }) => {
    await loginAs(page, BOB)
    await page.goto(PUBLIC_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Wireless Headphones')).toBeVisible()

    // Claim the first available item
    const claimButton = page.getByRole('button', { name: 'Claim This' }).first()
    await claimButton.click()

    // Should show "You claimed this"
    await expect(page.getByText('You claimed this').first()).toBeVisible()
  })

  test('Bob unclaims the item', async ({ page }) => {
    await loginAs(page, BOB)
    await page.goto(PUBLIC_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Wireless Headphones')).toBeVisible()

    // Unclaim the item Bob claimed
    const unclaimButton = page.getByRole('button', { name: 'Unclaim' }).first()
    await expect(unclaimButton).toBeVisible()
    await unclaimButton.click()

    // Should revert to "Claim This"
    await expect(
      page.getByRole('button', { name: 'Claim This' }).first()
    ).toBeVisible()
  })

  test('Charlie (not connected) sees Connect to Claim', async ({ page }) => {
    await loginAs(page, CHARLIE)
    await page.goto(PUBLIC_LIST_URL, { waitUntil: 'networkidle' })

    // Wait for items to load
    await expect(page.getByText('Wireless Headphones')).toBeVisible()

    // Not connected → should see "Connect to Claim"
    const connectToClaim = page.getByRole('button', { name: 'Connect to Claim' })
    await expect(connectToClaim.first()).toBeVisible()
  })

  test('Charlie cannot see Claim This buttons', async ({ page }) => {
    await loginAs(page, CHARLIE)
    await page.goto(PUBLIC_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Wireless Headphones')).toBeVisible()

    // Should NOT have any "Claim This" buttons
    const claimButtons = page.getByRole('button', { name: 'Claim This' })
    await expect(claimButtons).toHaveCount(0)
  })
})

// ============================================================================
// Group 3: Claiming on Shared Lists (no connection needed)
// ============================================================================

test.describe('Claiming on Shared Lists', () => {
  test.skip(
    () => !process.env.RUN_E2E_CONNECTION_TESTS,
    'Requires RUN_E2E_CONNECTION_TESTS=1 and seeded accounts'
  )

  const SHARED_LIST_URL = `/u/${ALICE.username}/alices-birthday-list`

  // Clean up any existing claims before these tests
  test.beforeAll(async ({ request }) => {
    await resetAllClaims(request, 'alices-birthday-list')
  })

  test('Bob (connected) claims and unclaims on shared list', async ({ page }) => {
    await loginAs(page, BOB)
    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Cozy Blanket')).toBeVisible()

    // Claim
    const claimButton = page.getByRole('button', { name: 'Claim This' }).first()
    await expect(claimButton).toBeVisible()
    await claimButton.click()
    await expect(page.getByText('You claimed this').first()).toBeVisible()

    // Unclaim
    const unclaimButton = page.getByRole('button', { name: 'Unclaim' }).first()
    await unclaimButton.click()
    await expect(
      page.getByRole('button', { name: 'Claim This' }).first()
    ).toBeVisible()
  })

  test('Charlie (not connected) can also claim on shared list', async ({ page }) => {
    await loginAs(page, CHARLIE)
    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Cozy Blanket')).toBeVisible()

    // On shared lists, connection is not required — should see "Claim This"
    const claimButton = page.getByRole('button', { name: 'Claim This' }).first()
    await expect(claimButton).toBeVisible()

    // Should NOT see "Connect to Claim" on shared lists
    const connectToClaim = page.getByRole('button', { name: 'Connect to Claim' })
    await expect(connectToClaim).toHaveCount(0)
  })

  test('Charlie claims on shared list successfully', async ({ page }) => {
    await loginAs(page, CHARLIE)
    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Cozy Blanket')).toBeVisible()

    const claimButton = page.getByRole('button', { name: 'Claim This' }).first()
    await claimButton.click()
    await expect(page.getByText('You claimed this').first()).toBeVisible()

    // Clean up: unclaim
    const unclaimButton = page.getByRole('button', { name: 'Unclaim' }).first()
    await unclaimButton.click()
  })
})

// ============================================================================
// Group 4: Guest Claiming on Shared Lists
// ============================================================================

test.describe('Guest Claiming', () => {
  test.skip(
    () => !process.env.RUN_E2E_CONNECTION_TESTS,
    'Requires RUN_E2E_CONNECTION_TESTS=1 and seeded accounts'
  )

  const SHARED_LIST_URL = `/u/${ALICE.username}/alices-birthday-list`
  const PUBLIC_LIST_URL = `/u/${ALICE.username}/alices-public-wishlist`

  // Clean up all claims on both lists before tests
  test.beforeAll(async ({ request }) => {
    await resetAllClaims(request, 'alices-birthday-list')
    await resetAllClaims(request, 'alices-public-wishlist')
  })

  test('Guest sees Claim This on shared list', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Cozy Blanket')).toBeVisible()

    const claimButtons = page.getByRole('button', { name: 'Claim This' })
    await expect(claimButtons.first()).toBeVisible()

    await context.close()
  })

  test('Guest claims item via modal', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Cozy Blanket')).toBeVisible()

    await page.getByRole('button', { name: 'Claim This' }).first().click()

    // GuestClaimModal should open
    await expect(page.getByText('Claim This Item')).toBeVisible()

    // Enter name
    await page.getByPlaceholder('Enter your name').fill('Grandma')

    // Click Claim button in modal
    await page.getByRole('button', { name: 'Claim', exact: true }).click()

    // Modal should close and item should show claimed
    await expect(page.getByText('You claimed this').first()).toBeVisible()

    await context.close()
  })

  test('Guest unclaims item', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Cozy Blanket')).toBeVisible()

    // Claim an item first
    await page.getByRole('button', { name: 'Claim This' }).first().click()
    await expect(page.getByText('Claim This Item')).toBeVisible()
    await page.getByPlaceholder('Enter your name').fill('Uncle Joe')
    await page.getByRole('button', { name: 'Claim', exact: true }).click()
    await expect(page.getByText('You claimed this').first()).toBeVisible()

    // Now unclaim
    await page.getByRole('button', { name: 'Unclaim' }).first().click()

    // Should revert to "Claim This"
    await expect(
      page.getByRole('button', { name: 'Claim This' }).first()
    ).toBeVisible()

    await context.close()
  })

  test('Guest cannot claim on public list', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(PUBLIC_LIST_URL, { waitUntil: 'networkidle' })
    await expect(page.getByText('Wireless Headphones')).toBeVisible()

    // Guest on public list should NOT see "Claim This"
    const claimButtons = page.getByRole('button', { name: 'Claim This' })
    await expect(claimButtons).toHaveCount(0)

    // Should also not see "Connect to Claim" (that's for authenticated non-connected users)
    const connectToClaim = page.getByRole('button', { name: 'Connect to Claim' })
    await expect(connectToClaim).toHaveCount(0)

    await context.close()
  })

  test('Guest cannot access private list', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(`/u/${ALICE.username}/alices-secret-list`)

    // Private list should show error or redirect — items should not be visible
    await expect(page.getByText('Surprise Gift for Bob')).not.toBeVisible()

    await context.close()
  })
})

// ============================================================================
// Group 5: Owner View (sees claimed items)
// ============================================================================

test.describe('Owner View', () => {
  test.skip(
    () => !process.env.RUN_E2E_CONNECTION_TESTS,
    'Requires RUN_E2E_CONNECTION_TESTS=1 and seeded accounts'
  )

  const SHARED_LIST_URL = `/u/${ALICE.username}/alices-birthday-list`

  // Clean up ALL claims first, then create exactly one guest claim
  test.beforeAll(async ({ request }) => {
    await resetAllClaims(request, 'alices-birthday-list')

    // Get the shared list items
    const aliceToken = await getToken(request, ALICE)
    const listResp = await request.get(
      `${API_BASE}/api/lists/${ALICE.username}/alices-birthday-list`,
      { headers: { Authorization: `Bearer ${aliceToken}` } }
    )
    if (!listResp.ok()) return

    const { items } = await listResp.json()
    if (!items?.length) return

    // Guest-claim the first item
    const guestToken = `e2e-test-guest-${Date.now()}`
    await request.post(`${API_BASE}/api/items/${items[0]._id}/guest-claim`, {
      data: { guestToken, guestName: 'Grandma Test' },
    })
  })

  test('Alice sees claimed badge on item', async ({ page }) => {
    await loginAs(page, ALICE)
    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })

    // Owner sees "Grandma Test claimed this" on the claimed item
    await expect(
      page.getByText('Grandma Test claimed this').first()
    ).toBeVisible()
  })

  test('Alice sees Claimed indicator', async ({ page }) => {
    await loginAs(page, ALICE)
    await page.goto(SHARED_LIST_URL, { waitUntil: 'networkidle' })

    // Owner sees "Claimed" badge on claimed items
    await expect(page.getByText('Claimed').first()).toBeVisible()
  })
})
