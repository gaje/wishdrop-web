'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import api from './api'

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const token = api.getAuthToken()
      if (!token) {
        setLoading(false)
        return
      }

      const userData = await api.auth.me()
      setUser(userData.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      api.clearAuthToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const response = await api.auth.login(email, password)
    setUser(response.user)
    return response
  }

  async function signup(email, password, username, displayName) {
    const response = await api.auth.signup(email, password, username, displayName)
    setUser(response.user)
    return response
  }

  async function logout() {
    await api.auth.logout()
    setUser(null)
  }

  async function refreshUser() {
    try {
      const userData = await api.auth.me()
      setUser(userData.user)
      return userData.user
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
