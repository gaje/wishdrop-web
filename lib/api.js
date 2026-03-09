/**
 * API Client for Wishlist Web App
 * Handles all backend communication with proper error handling and auth
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

class APIError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
    this.isRetryable = false
  }

  getUserMessage() {
    if (this.status === 400 && this.data?.details) {
      const messages = this.data.details.map(d => d.message).join('\n')
      return messages || 'Validation failed. Please check your input.'
    }

    // Handle rate limit errors with retry info
    if (this.status === 429) {
      const retryAfter = this.data?.retryAfter
      if (retryAfter) {
        return `Too many attempts. Please try again in ${retryAfter}.`
      }
      return this.message || 'Too many requests. Please slow down.'
    }

    const messages = {
      400: this.message || 'Invalid request. Please check your input.',
      401: 'Please log in to continue.',
      403: 'You don\'t have permission to do that.',
      404: 'Item not found.',
      409: 'This item already exists.',
      422: 'Invalid data provided.',
      429: this.message || 'Too many requests. Please slow down.',
      500: 'Server error. Please try again.',
      503: 'Service temporarily unavailable.',
      0: 'Network error. Please check your connection.'
    }

    return messages[this.status] || this.message || 'Something went wrong.'
  }

  shouldRetry() {
    return this.status === 0 || this.status >= 500
  }
}

// Token storage using localStorage
let authToken = null

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  if (authToken) return authToken
  try {
    authToken = localStorage.getItem('auth_token')
    return authToken
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return
  authToken = token
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  authToken = null
  localStorage.removeItem('auth_token')
}

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const maxRetries = options.retries || 2
  const retryDelay = options.retryDelay || 1000
  const timeout = options.timeout || 30000

  const token = getAuthToken()
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  delete config.retries
  delete config.retryDelay
  delete config.timeout

  let lastError = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      })

      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ])

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        if (response.ok) return { success: true }
        throw new APIError('Invalid response format', response.status)
      }

      const data = await response.json()

      if (!response.ok) {
        const error = new APIError(
          data.error || data.message || 'Request failed',
          response.status,
          data
        )
        error.isRetryable = error.shouldRetry()
        throw error
      }

      return data
    } catch (error) {
      lastError = error

      if (!(error instanceof APIError)) {
        lastError = new APIError(error.message || 'Network error', 0)
        lastError.isRetryable = true
      }

      if (!lastError.isRetryable || attempt === maxRetries) {
        break
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
      console.log(`Retrying request to ${endpoint} (attempt ${attempt + 2}/${maxRetries + 1})`)
    }
  }

  throw lastError
}

// ============================================================================
// AUTH
// ============================================================================

export const auth = {
  async signup(email, password, username, displayName, { acceptedTerms } = {}) {
    const response = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName, acceptedTerms }),
    })

    if (response.token) {
      setAuthToken(response.token)
    }

    return response
  },

  async login(email, password) {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.token) {
      setAuthToken(response.token)
    }

    return response
  },

  async me() {
    return apiFetch('/api/auth/me')
  },

  async forgotPassword(email) {
    return apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(email, resetToken, newPassword) {
    const response = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword }),
    })

    if (response.token) {
      setAuthToken(response.token)
    }

    return response
  },

  async logout() {
    clearAuthToken()
  },
}

// ============================================================================
// LISTS
// ============================================================================

export const lists = {
  async getMine() {
    return apiFetch('/api/lists/mine')
  },

  async getById(id) {
    return apiFetch(`/api/lists/${id}`)
  },

  async getPublic(username, slug) {
    return apiFetch(`/api/lists/${username}/${slug}`)
  },

  async getPublicWithToken(username, slug, guestToken) {
    const endpoint = guestToken
      ? `/api/lists/${username}/${slug}?guestToken=${guestToken}`
      : `/api/lists/${username}/${slug}`
    return apiFetch(endpoint)
  },

  async create(data) {
    return apiFetch('/api/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id, data) {
    return apiFetch(`/api/lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id) {
    return apiFetch(`/api/lists/${id}`, {
      method: 'DELETE',
    })
  },

  async getSharedWithMe() {
    return apiFetch('/api/lists/shared-with-me')
  },

  async share(id, userIds) {
    return apiFetch(`/api/lists/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    })
  },

  async unshare(id, userId) {
    return apiFetch(`/api/lists/${id}/share/${userId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================================================
// ITEMS
// ============================================================================

export const items = {
  async getById(id) {
    return apiFetch(`/api/items/${id}`)
  },

  async getByList(listId) {
    return apiFetch(`/api/items?listId=${listId}`)
  },

  async create(data) {
    return apiFetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id, data) {
    return apiFetch(`/api/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id) {
    return apiFetch(`/api/items/${id}`, {
      method: 'DELETE',
    })
  },

  async claim(id) {
    return apiFetch(`/api/items/${id}/claim`, {
      method: 'POST',
    })
  },

  async unclaim(id) {
    return apiFetch(`/api/items/${id}/claim`, {
      method: 'DELETE',
    })
  },

  async guestClaim(itemId, guestToken, guestName) {
    return apiFetch(`/api/items/${itemId}/guest-claim`, {
      method: 'POST',
      body: JSON.stringify({ guestToken, guestName }),
    })
  },

  async guestUnclaim(itemId, guestToken) {
    return apiFetch(`/api/items/${itemId}/guest-claim`, {
      method: 'DELETE',
      body: JSON.stringify({ guestToken }),
    })
  },
}

// ============================================================================
// METADATA & AFFILIATE
// ============================================================================

export const metadata = {
  async fetch(url) {
    return apiFetch('/api/metadata/fetch', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  },
}

export const affiliate = {
  async rewrite(url) {
    return apiFetch('/api/affiliate/rewrite', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
  },
}

// ============================================================================
// USERS
// ============================================================================

export const users = {
  async getMe() {
    return apiFetch('/api/users/me')
  },

  async getByUsername(username) {
    return apiFetch(`/api/users/${username}`)
  },

  async updateSettings(settings) {
    return apiFetch('/api/users/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    })
  },

  async updateProfile(profile) {
    return apiFetch('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    })
  },

  async deleteAccount() {
    return apiFetch('/api/users/account', {
      method: 'DELETE',
    })
  },

  async search(query, limit = 10) {
    return apiFetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  },

  async getPreferences() {
    return apiFetch('/api/users/preferences')
  },

  async updatePreferences(preferences) {
    return apiFetch('/api/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    })
  },

  async getNotificationPreferences() {
    return apiFetch('/api/users/notification-preferences')
  },

  async updateNotificationPreferences(preferences) {
    return apiFetch('/api/users/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    })
  },

  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)

    const token = getAuthToken()
    const response = await fetch(`${API_BASE}/api/users/avatar`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new APIError(data.error || 'Failed to upload avatar', response.status, data)
    }

    return response.json()
  },
}

// ============================================================================
// CONTACT GROUPS
// ============================================================================

export const contactGroups = {
  /**
   * Get all contact groups with contact counts
   */
  async getAll() {
    return apiFetch('/api/users/me/groups')
  },

  /**
   * Create a new contact group
   */
  async create(name, emoji = null) {
    return apiFetch('/api/users/me/groups', {
      method: 'POST',
      body: JSON.stringify({ name, emoji }),
    })
  },

  /**
   * Update a contact group
   */
  async update(groupId, data) {
    return apiFetch(`/api/users/me/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete a contact group
   */
  async delete(groupId) {
    return apiFetch(`/api/users/me/groups/${groupId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================================================
// SAVED CONTACTS
// ============================================================================

export const contacts = {
  /**
   * Get all saved contacts with populated user data
   */
  async getAll() {
    return apiFetch('/api/users/me/contacts')
  },

  /**
   * Add a new saved contact
   */
  async add(userId, groupIds = [], nickname = null) {
    return apiFetch('/api/users/me/contacts', {
      method: 'POST',
      body: JSON.stringify({ userId, groupIds, nickname }),
    })
  },

  /**
   * Update a saved contact
   */
  async update(userId, data) {
    return apiFetch(`/api/users/me/contacts/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Remove a saved contact
   */
  async remove(userId) {
    return apiFetch(`/api/users/me/contacts/${userId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get contacts in a specific group
   */
  async getByGroup(groupId) {
    return apiFetch(`/api/users/me/contacts/by-group/${groupId}`)
  },
}

// ============================================================================
// INVITES
// ============================================================================

export const invites = {
  /**
   * Get invite details by code
   */
  async getByCode(code) {
    return apiFetch(`/api/invites/${code}`)
  },

  /**
   * Accept an invite
   */
  async accept(code) {
    return apiFetch(`/api/invites/${code}/accept`, {
      method: 'POST',
    })
  },

  /**
   * Create a new invite for a list
   */
  async create(listId, options = {}) {
    return apiFetch(`/api/invites/lists/${listId}/invites`, {
      method: 'POST',
      body: JSON.stringify(options),
    })
  },

  /**
   * Get all pending invites for a list
   */
  async getForList(listId) {
    return apiFetch(`/api/invites/lists/${listId}/invites`)
  },

  /**
   * Revoke an invite
   */
  async revoke(listId, inviteId) {
    return apiFetch(`/api/invites/lists/${listId}/invites/${inviteId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Check for pending invites for current user's email
   */
  async checkPending() {
    return apiFetch('/api/invites/check-pending', {
      method: 'POST',
    })
  },
}

// ============================================================================
// REDIRECT
// ============================================================================

export function getRedirectUrl(code) {
  return `${API_BASE}/r/${code}`
}

// ============================================================================
// DISCOVER
// ============================================================================

export const discover = {
  async trending(limit = 20, offset = 0) {
    return apiFetch(`/api/discover/trending?limit=${limit}&offset=${offset}`)
  },

  async new(limit = 20, offset = 0) {
    return apiFetch(`/api/discover/new?limit=${limit}&offset=${offset}`)
  },

  async featured(limit = 20, offset = 0) {
    return apiFetch(`/api/discover/featured?limit=${limit}&offset=${offset}`)
  },

  async byCategory(category, limit = 20, offset = 0) {
    return apiFetch(`/api/discover/category/${encodeURIComponent(category)}?limit=${limit}&offset=${offset}`)
  },

  async categories() {
    return apiFetch('/api/discover/categories')
  },

  async trendingItems(limit = 10) {
    return apiFetch(`/api/discover/trending-items?limit=${limit}`)
  },

  /**
   * Get unified discovery feed (hero, trending, collections)
   */
  async feed(options = {}) {
    const { heroLimit = 5, trendingLimit = 10, collectionsLimit = 10 } = options
    return apiFetch(`/api/discover/feed?heroLimit=${heroLimit}&trendingLimit=${trendingLimit}&collectionsLimit=${collectionsLimit}`)
  },

  /**
   * Search products and users on Discover page
   */
  async search(query, limit = 20) {
    return apiFetch(`/api/discover/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  },
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export const achievements = {
  async getAll() {
    return apiFetch('/api/achievements')
  },

  async getMine() {
    return apiFetch('/api/achievements/me')
  },

  async getByCategory(category) {
    return apiFetch(`/api/achievements/category/${category}`)
  },
}

// ============================================================================
// FOLLOW/UNFOLLOW
// ============================================================================

export const follow = {
  async followUser(userId) {
    return apiFetch(`/api/follow/${userId}`, {
      method: 'POST',
    })
  },

  async unfollowUser(userId) {
    return apiFetch(`/api/follow/${userId}`, {
      method: 'DELETE',
    })
  },

  async getFollowers(userId, page = 1, limit = 20) {
    return apiFetch(`/api/follow/${userId}/followers?page=${page}&limit=${limit}`)
  },

  async getFollowing(userId, page = 1, limit = 20) {
    return apiFetch(`/api/follow/${userId}/following?page=${page}&limit=${limit}`)
  },

  async getFollowStatus(userId) {
    return apiFetch(`/api/follow/${userId}/status`)
  },
}

// ============================================================================
// SOCIAL (Likes & Comments)
// ============================================================================

export const social = {
  async likeList(listId) {
    return apiFetch(`/api/social/lists/${listId}/like`, {
      method: 'POST',
    })
  },

  async unlikeList(listId) {
    return apiFetch(`/api/social/lists/${listId}/like`, {
      method: 'DELETE',
    })
  },

  async getLikeStatus(listId) {
    return apiFetch(`/api/social/lists/${listId}/like-status`)
  },

  async getLikes(listId, limit = 20, offset = 0) {
    return apiFetch(`/api/social/lists/${listId}/likes?limit=${limit}&offset=${offset}`)
  },

  async addComment(listId, text) {
    return apiFetch(`/api/social/lists/${listId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  },

  async getComments(listId, limit = 20, offset = 0) {
    return apiFetch(`/api/social/lists/${listId}/comments?limit=${limit}&offset=${offset}`)
  },

  async deleteComment(commentId) {
    return apiFetch(`/api/social/comments/${commentId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export const recommendations = {
  async get() {
    return apiFetch('/api/recommendations')
  },
}

// ============================================================================
// FEED
// ============================================================================

export const feed = {
  async get(limit = 20, offset = 0) {
    return apiFetch(`/api/feed?limit=${limit}&offset=${offset}`)
  },

  async getStats() {
    return apiFetch('/api/feed/stats')
  },
}

// ============================================================================
// SEARCH
// ============================================================================

export const search = {
  async search(query, type = 'all', limit = 10) {
    return apiFetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`)
  },

  async suggestions(query) {
    return apiFetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
  },
}

// ============================================================================
// VIDEOS (Drops)
// ============================================================================

export const videos = {
  async initUpload(params = {}) {
    return apiFetch('/api/videos/init-upload', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  async uploadToCloudflare(uploadUrl, file, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100
          onProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Cloudflare may return empty response on success
          try {
            const response = xhr.responseText ? JSON.parse(xhr.responseText) : {}
            resolve(response)
          } catch (e) {
            // If JSON parse fails, still resolve as success since status is 2xx
            resolve({ success: true })
          }
        } else {
          reject(new APIError('Upload failed', xhr.status))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new APIError('Upload failed', 0))
      })

      xhr.addEventListener('abort', () => {
        reject(new APIError('Upload cancelled', 0))
      })

      xhr.open('POST', uploadUrl)
      xhr.send(formData)
    })
  },

  async getFeed(cursor = null, limit = 20) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (cursor) params.append('cursor', cursor)
    return apiFetch(`/api/videos/feed?${params.toString()}`)
  },

  async getById(id) {
    return apiFetch(`/api/videos/${id}`)
  },

  async like(id) {
    return apiFetch(`/api/videos/${id}/like`, {
      method: 'POST',
    })
  },

  async unlike(id) {
    return apiFetch(`/api/videos/${id}/like`, {
      method: 'DELETE',
    })
  },

  async trackView(id) {
    return apiFetch(`/api/videos/${id}/view`, {
      method: 'POST',
    })
  },

  async delete(id) {
    return apiFetch(`/api/videos/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = {
  async get(limit = 20, offset = 0, unreadOnly = false) {
    return apiFetch(`/api/notifications?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`)
  },

  async markAsRead(notificationId) {
    return apiFetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  },

  async markAllAsRead() {
    return apiFetch('/api/notifications/read-all', {
      method: 'PUT',
    })
  },

  async delete(notificationId) {
    return apiFetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  },

  async getSettings() {
    return apiFetch('/api/notifications/settings')
  },

  async updateSettings(enabled) {
    return apiFetch('/api/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    })
  },
}

// ============================================================================
// FAMILY
// ============================================================================

export const family = {
  /**
   * Get all family members for current user
   */
  async getMembers() {
    return apiFetch('/api/family/members')
  },

  /**
   * Get specific family member with details
   * @param {string} id - Family member ID
   */
  async getMember(id) {
    return apiFetch(`/api/family/members/${id}`)
  },

  /**
   * Create new family member
   * @param {Object} data - Family member data
   */
  async createMember(data) {
    return apiFetch('/api/family/members', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update family member
   * @param {string} id - Family member ID
   * @param {Object} data - Updated data
   */
  async updateMember(id, data) {
    return apiFetch(`/api/family/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete family member (soft delete)
   * @param {string} id - Family member ID
   */
  async deleteMember(id) {
    return apiFetch(`/api/family/members/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get lists for a family member
   * @param {string} id - Family member ID
   */
  async getMemberLists(id) {
    return apiFetch(`/api/family/members/${id}/lists`)
  },

  /**
   * Get upcoming events for all family members
   * @param {number} days - Number of days to look ahead (default 90)
   */
  async getUpcomingEvents(days = 90) {
    return apiFetch(`/api/family/upcoming-events?days=${days}`)
  },
}

// ============================================================================
// PRODUCTS
// ============================================================================

export const products = {
  /**
   * Get aggregated product data by normalized URL
   * Returns product info, stats, videos, and lists from all public/shared sources
   * @param {string} normalizedUrl - Product's normalized URL
   */
  async getByUrl(normalizedUrl) {
    const encodedUrl = encodeURIComponent(normalizedUrl)
    return apiFetch(`/api/products/by-url/${encodedUrl}`)
  },

  /**
   * Get all videos for a product from public/shared lists
   * @param {string} normalizedUrl - Product's normalized URL
   */
  async getVideos(normalizedUrl) {
    const encodedUrl = encodeURIComponent(normalizedUrl)
    return apiFetch(`/api/products/by-url/${encodedUrl}/videos`)
  },

  /**
   * Get all public/shared lists containing a product
   * @param {string} normalizedUrl - Product's normalized URL
   * @param {number} limit - Max number of lists to return (default 20)
   */
  async getLists(normalizedUrl, limit = 20) {
    const encodedUrl = encodeURIComponent(normalizedUrl)
    return apiFetch(`/api/products/by-url/${encodedUrl}/lists?limit=${limit}`)
  },

  /**
   * Get aggregated product data by slug
   * @param {string} slug - Product's URL slug
   */
  async getBySlug(slug) {
    return apiFetch(`/api/products/by-slug/${slug}`)
  },
}

// ============================================================================
// CORRECTIONS
// ============================================================================

export const corrections = {
  async rejectMatch(productA, productB) {
    return apiFetch('/api/corrections/reject-match', {
      method: 'POST',
      body: JSON.stringify({ productA, productB }),
    })
  },
  async suggestMatch(productA, productB) {
    return apiFetch('/api/corrections/suggest-match', {
      method: 'POST',
      body: JSON.stringify({ productA, productB }),
    })
  },
  async forProduct(normalizedUrl) {
    const encodedUrl = encodeURIComponent(normalizedUrl)
    return apiFetch(`/api/corrections/for-product/${encodedUrl}`)
  },
  async suggestMetadata(normalizedUrl, field, value) {
    return apiFetch('/api/corrections/suggest-metadata', {
      method: 'POST',
      body: JSON.stringify({ normalizedUrl, field, value }),
    })
  },
}

// ============================================================================
// OWNED PRODUCTS (Have It)
// ============================================================================

export const ownedProducts = {
  /**
   * Get user's owned products (things they have)
   */
  async getMine() {
    return apiFetch('/api/owned-products')
  },

  /**
   * Get a single owned product by ID
   */
  async getById(id) {
    return apiFetch(`/api/owned-products/${id}`)
  },

  /**
   * Create an owned product
   */
  async create(data) {
    return apiFetch('/api/owned-products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update an owned product
   */
  async update(id, data) {
    return apiFetch(`/api/owned-products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete an owned product
   */
  async delete(id) {
    return apiFetch(`/api/owned-products/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get products needing video reviews
   */
  async getNeedingVideo() {
    return apiFetch('/api/owned-products/needing-video')
  },

  /**
   * Get user's owned product stats
   */
  async getStats() {
    return apiFetch('/api/owned-products/stats')
  },
}

// ============================================================================
// CONNECTIONS
// ============================================================================

export const connections = {
  async request(userId) {
    return apiFetch('/api/connections/request', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },

  async acceptRequest(connectionId) {
    return apiFetch(`/api/connections/request/${connectionId}/accept`, {
      method: 'POST',
    })
  },

  async rejectRequest(connectionId) {
    return apiFetch(`/api/connections/request/${connectionId}/reject`, {
      method: 'POST',
    })
  },

  async getAll() {
    return apiFetch('/api/connections')
  },

  async getPending() {
    return apiFetch('/api/connections/pending')
  },

  async getSentPending() {
    return apiFetch('/api/connections/pending/sent')
  },

  async checkStatus(userId) {
    return apiFetch(`/api/connections/check/${userId}`)
  },

  async remove(userId) {
    return apiFetch(`/api/connections/${userId}`, {
      method: 'DELETE',
    })
  },

  async createInvite() {
    return apiFetch('/api/connections/invite', {
      method: 'POST',
    })
  },

  async acceptInvite(code) {
    return apiFetch(`/api/connections/invite/${code}/accept`, {
      method: 'POST',
    })
  },
}

// ============================================================================
// BLOCKS
// ============================================================================

export const blocks = {
  async block(userId) {
    return apiFetch(`/api/blocks/${userId}`, {
      method: 'POST',
    })
  },

  async unblock(userId) {
    return apiFetch(`/api/blocks/${userId}`, {
      method: 'DELETE',
    })
  },

  async getAll() {
    return apiFetch('/api/blocks')
  },
}

// ============================================================================
// REPORTS
// ============================================================================

export const reports = {
  async submit({ contentType, contentId, category, details }) {
    return apiFetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ contentType, contentId, category, details }),
    })
  },
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const health = {
  async check() {
    return apiFetch('/health')
  },
}

// ============================================================================
// LEGAL
// ============================================================================

export const legal = {
  async getPrivacyPolicy() {
    return apiFetch('/api/legal/privacy')
  },

  async getTermsOfService() {
    return apiFetch('/api/legal/terms')
  },

  async getAffiliateDisclosure() {
    return apiFetch('/api/legal/affiliate-disclosure')
  },

  async getCommunityGuidelines() {
    return apiFetch('/api/legal/community-guidelines')
  },

  async getVersion() {
    return apiFetch('/api/legal/version')
  },
}

export const contactForm = {
  async send(category, name, email, message) {
    return apiFetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ category, name, email, message }),
    })
  },
}

export { APIError }

export default {
  auth,
  lists,
  items,
  metadata,
  affiliate,
  users,
  contactGroups,
  contacts,
  invites,
  discover,
  achievements,
  follow,
  social,
  recommendations,
  search,
  feed,
  videos,
  family,
  products,
  corrections,
  ownedProducts,
  notifications,
  legal,
  connections,
  blocks,
  reports,
  contactForm,
  getRedirectUrl,
  health,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
}
