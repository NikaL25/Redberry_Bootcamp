import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, enrollmentApi } from '../api/services'
import { normalizeApiError } from '../api/client'

const AppContext = createContext(null)

const MODALS = {
  login: false,
  register: false,
  profile: false,
  enrolledSidebar: false,
  conflict: null,
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setAuthLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [modals, setModals] = useState(MODALS)
  const [toast, setToast] = useState(null)

  const isAuthenticated = Boolean(user)

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await authApi.me()
      setUser(data.data)
    } catch {
      setUser(null)
      localStorage.removeItem('auth_token')
    }
  }, [])

  const refreshEnrollments = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const { data } = await enrollmentApi.list()
      setEnrollments(data.data ?? [])
    } catch {
      setEnrollments([])
    }
  }, [isAuthenticated])

  useEffect(() => {
    const initAuth = async () => {
      if (localStorage.getItem('auth_token')) {
        await refreshMe()
      }
      setAuthLoading(false)
    }
    initAuth()
  }, [refreshMe])

  useEffect(() => {
    refreshEnrollments()
  }, [isAuthenticated, refreshEnrollments])

  const openModal = (name, payload = true) => setModals((prev) => ({ ...prev, [name]: payload }))
  const closeModal = (name) => setModals((prev) => ({ ...prev, [name]: name === 'conflict' ? null : false }))

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload)
    localStorage.setItem('auth_token', data.data.token)
    await refreshMe()
    await refreshEnrollments()
  }, [refreshEnrollments, refreshMe])

  const register = useCallback(async (payload) => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value)
    })
    const { data } = await authApi.register(formData)
    localStorage.setItem('auth_token', data.data.token)
    await refreshMe()
    await refreshEnrollments()
  }, [refreshEnrollments, refreshMe])

  const updateProfile = useCallback(async (payload) => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value)
    })
    const { data } = await authApi.updateProfile(formData)
    setUser(data.data)
    return data.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // no-op
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
      setEnrollments([])
    }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAuthLoading,
      enrollments,
      modals,
      toast,
      openModal,
      closeModal,
      login,
      register,
      logout,
      updateProfile,
      refreshMe,
      refreshEnrollments,
      showToast,
      normalizeApiError,
    }),
    [
      user,
      isAuthenticated,
      isAuthLoading,
      enrollments,
      modals,
      toast,
      login,
      register,
      logout,
      updateProfile,
      refreshMe,
      refreshEnrollments,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
