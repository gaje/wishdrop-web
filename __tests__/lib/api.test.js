import { getAuthToken, setAuthToken, clearAuthToken } from '@/lib/api'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('API Client - Token Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearAuthToken()
  })

  describe('setAuthToken', () => {
    it('should store token in localStorage', () => {
      setAuthToken('test-token-123')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-token-123')
    })

    it('should remove token when set to null', () => {
      setAuthToken(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('getAuthToken', () => {
    it('should return cached token if available', () => {
      setAuthToken('cached-token')
      localStorageMock.getItem.mockReturnValue('different-token')

      const token = getAuthToken()
      expect(token).toBe('cached-token')
    })

    it('should fall back to localStorage', () => {
      clearAuthToken()
      localStorageMock.getItem.mockReturnValue('stored-token')

      const token = getAuthToken()
      expect(token).toBe('stored-token')
    })
  })

  describe('clearAuthToken', () => {
    it('should clear token from memory and localStorage', () => {
      // Clear any cached state first
      clearAuthToken()
      jest.clearAllMocks()

      // Set and then clear a token
      setAuthToken('token-to-clear')
      clearAuthToken()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')

      // After clearing, getItem should return the mocked value (null)
      localStorageMock.getItem.mockReturnValue(null)
      expect(getAuthToken()).toBeNull()
    })
  })
})
