import posthog from 'posthog-js'

function capture(event, properties) {
  try {
    if (posthog.__loaded) {
      posthog.capture(event, properties)
    }
  } catch {
    // Analytics should never break the app
  }
}

export const analytics = {
  // Identity — call after login/signup to tie anonymous sessions to a user
  identify(user) {
    try {
      if (posthog.__loaded && user?.id) {
        posthog.identify(user.id, {
          username: user.username,
          email: user.email,
        })
      }
    } catch {
      // noop
    }
  },

  // Reset — call on logout to unlink future events from this user
  reset() {
    try {
      if (posthog.__loaded) {
        posthog.reset()
      }
    } catch {
      // noop
    }
  },

  // ── Auth ───────────────────────────────────
  userSignedUp() {
    capture('user_signed_up')
  },

  userLoggedIn() {
    capture('user_logged_in')
  },

  userLoggedOut() {
    capture('user_logged_out')
  },

  accountDeleted() {
    capture('account_deleted')
  },

  // ── Lists ──────────────────────────────────
  listCreated({ occasion, privacy, isSurprise, categoryCount }) {
    capture('list_created', { occasion, privacy, is_surprise: isSurprise, category_count: categoryCount })
  },

  // ── Items ──────────────────────────────────
  itemAdded({ entryMode, hasPrice, merchant }) {
    capture('item_added', { entry_mode: entryMode, has_price: hasPrice, merchant })
  },

  itemClaimed({ itemId }) {
    capture('item_claimed', { item_id: itemId })
  },

  itemUnclaimed({ itemId }) {
    capture('item_unclaimed', { item_id: itemId })
  },

  buyClicked({ hasAffiliateCode, merchant }) {
    capture('buy_clicked', { has_affiliate_code: hasAffiliateCode, merchant })
  },

  // ── Social / Sharing ──────────────────────
  listShared({ userCount }) {
    capture('list_shared', { user_count: userCount })
  },

  shareLinkCopied() {
    capture('share_link_copied')
  },

  connectionRequested() {
    capture('connection_requested')
  },

  connectionAccepted() {
    capture('connection_accepted')
  },

  // ── Discovery ──────────────────────────────
  discoverCategoryFiltered({ category }) {
    capture('discover_category_filtered', { category })
  },
}
