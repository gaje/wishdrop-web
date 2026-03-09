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
      document.cookie = 'wishdrop_logged_in=1; path=/; max-age=2592000; SameSite=Lax'
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      api.clearAuthToken()
      setUser(null)
      document.cookie = 'wishdrop_logged_in=; path=/; max-age=0'
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const response = await api.auth.login(email, password)
    setUser(response.user)
    document.cookie = 'wishdrop_logged_in=1; path=/; max-age=2592000; SameSite=Lax'
    return response
  }

  async function signup(email, password, username, displayName, options) {
    const response = await api.auth.signup(email, password, username, displayName, options)
    setUser(response.user)
    document.cookie = 'wishdrop_logged_in=1; path=/; max-age=2592000; SameSite=Lax'
    return response
  }

  async function logout() {
    await api.auth.logout()
    setUser(null)
    document.cookie = 'wishdrop_logged_in=; path=/; max-age=0'
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
