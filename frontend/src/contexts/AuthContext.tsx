import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  token: string | null
  username: string | null
  setToken: (token: string | null) => void
  setUsername: (username: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [username, setUsernameState] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')
    if (storedToken) {
      setTokenState(storedToken)
      setUsernameState(storedUsername)
    }
  }, [])

  const setToken = (newToken: string | null) => {
    setTokenState(newToken)
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUsername = (newUsername: string | null) => {
    setUsernameState(newUsername)
    if (newUsername) {
      localStorage.setItem('username', newUsername)
    } else {
      localStorage.removeItem('username')
    }
  }

  const logout = () => {
    setToken(null)
    setUsername(null)
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        setToken,
        setUsername,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
