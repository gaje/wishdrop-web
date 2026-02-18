const GUEST_TOKEN_KEY = 'wishlist_guest_token'

export function getOrCreateGuestToken() {
  if (typeof window === 'undefined') return null
  let token = localStorage.getItem(GUEST_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(GUEST_TOKEN_KEY, token)
  }
  return token
}

export function getGuestToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GUEST_TOKEN_KEY)
}
