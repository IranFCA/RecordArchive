import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  email: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  verifyMFA: (email: string, totpCode: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  requiresMFA: boolean
  pendingUserId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requiresMFA, setRequiresMFA] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      // Validate token by making a request
      validateToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]))
      const email = payload.sub

      if (email) {
        setToken(token)
        setUser({ id: payload.user_id || 'admin', email, is_admin: true })
      } else {
        throw new Error('Invalid token payload')
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      localStorage.removeItem('admin_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed')
      }

      const data = await response.json()

      if (data.requires_mfa) {
        setRequiresMFA(true)
        setPendingUserId(data.user_id)
        return
      }

      // Login successful
      setToken(data.access_token)
      setUser({ id: data.user_id, email, is_admin: true })
      localStorage.setItem('admin_token', data.access_token)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyMFA = async (email: string, totpCode: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, totp_code: totpCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'MFA verification failed')
      }

      const data = await response.json()

      // MFA verification successful
      setToken(data.access_token)
      setUser({ id: pendingUserId!, email, is_admin: true })
      setRequiresMFA(false)
      setPendingUserId(null)
      localStorage.setItem('admin_token', data.access_token)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRequiresMFA(false)
    setPendingUserId(null)
    localStorage.removeItem('admin_token')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    verifyMFA,
    logout,
    isLoading,
    requiresMFA,
    pendingUserId,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}