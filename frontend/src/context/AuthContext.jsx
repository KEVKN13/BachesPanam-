import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, readUser, setAuthToken, storeUser } from '../api/client'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readUser())
  const [token, setToken] = useState(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem('baches_token') : null,
  )
  const [isAuthOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const persistSession = useCallback((session) => {
    setToken(session.token)
    setUser(session.user)
    setAuthToken(session.token)
    storeUser(session.user)
  }, [])

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)
      persistSession(data.data)
      return data.data
    },
    [persistSession],
  )

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    return data.data
  }, [])

  const verifyRegistration = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/verify', payload)
      persistSession(data.data)
      return data.data
    },
    [persistSession],
  )

  const resendCode = useCallback(async (email) => {
    const { data } = await api.post('/auth/resend-code', { email })
    return data.data
  }, [])

  const forgotPassword = useCallback(async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data.data
  }, [])

  const resetPassword = useCallback(async (payload) => {
    const { data } = await api.post('/auth/reset-password', payload)
    return data.data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
    storeUser(null)
  }, [])

  const openAuth = useCallback((mode = 'login') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }, [])

  const closeAuth = useCallback(() => setAuthOpen(false), [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.rol === 'admin',
      isModerator: user?.rol === 'moderador',
      isStaff: user?.rol === 'admin' || user?.rol === 'moderador',
      login,
      register,
      verifyRegistration,
      resendCode,
      forgotPassword,
      resetPassword,
      logout,
      isAuthOpen,
      authMode,
      openAuth,
      closeAuth,
    }),
    [
      user,
      token,
      login,
      register,
      verifyRegistration,
      resendCode,
      forgotPassword,
      resetPassword,
      logout,
      isAuthOpen,
      authMode,
      openAuth,
      closeAuth,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
