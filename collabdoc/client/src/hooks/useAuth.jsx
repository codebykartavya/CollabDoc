import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    let user = null
    try {
      user = userStr ? JSON.parse(userStr) : null
    } catch {
      user = null
    }
    return { token, user }
  })

  const login = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setAuthState({ token, user })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthState({ token: null, user: null })
    window.location.href = '/login'
  }

  const isAuthenticated = !!authState.token && !!authState.user

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      token: authState.token,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
