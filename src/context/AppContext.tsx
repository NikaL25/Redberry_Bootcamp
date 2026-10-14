import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi, enrollmentApi } from '../api/services'
import type { LoginPayload } from '../api/services'
import { normalizeApiError } from '../api/client'
import type { Enrollment, ModalName, Toast, ToastType, User } from '../types'

interface ModalsState {
  login: boolean
  register: boolean
  profile: boolean
  enrolledSidebar: boolean
  conflict: unknown
}

const MODALS: ModalsState = {
  login: false,
  register: false,
  profile: false,
  enrolledSidebar: false,
  conflict: null,
}

interface AppContextValue {
  user: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  enrollments: Enrollment[]
  modals: ModalsState
  toast: Toast | null
  openModal: (name: ModalName, payload?: unknown) => void
  closeModal: (name: ModalName) => void
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: Record<string, unknown>) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: Record<string, unknown>) => Promise<User>
  refreshMe: () => Promise<void>
  refreshEnrollments: () => Promise<void>
  showToast: (message: string, type?: ToastType) => void
  normalizeApiError: (error: unknown) => string
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setAuthLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [modals, setModals] = useState<ModalsState>(MODALS)
  const [toast, setToast] = useState<Toast | null>(null)

  const isAuthenticated = Boolean(user)

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await authApi.me()
      setUser(data.data as User)
    } catch {
      setUser(null)
      localStorage.removeItem('auth_token')
    }
  }, [])

  const refreshEnrollments = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const { data } = await enrollmentApi.list()
      setEnrollments((data.data ?? []) as Enrollment[])
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

  const openModal = (name: ModalName, payload: unknown = true) =>
    setModals((prev) => ({ ...prev, [name]: payload }) as ModalsState)
  const closeModal = (name: ModalName) =>
    setModals((prev) => ({ ...prev, [name]: name === 'conflict' ? null : false }) as ModalsState)

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload)
    localStorage.setItem('auth_token', data.data.token as string)
    await refreshMe()
    await refreshEnrollments()
  }, [refreshEnrollments, refreshMe])

  const register = useCallback(async (payload: Record<string, unknown>) => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value as string | Blob)
    })
    const { data } = await authApi.register(formData)
    localStorage.setItem('auth_token', data.data.token as string)
    await refreshMe()
    await refreshEnrollments()
  }, [refreshEnrollments, refreshMe])

  const updateProfile = useCallback(async (payload: Record<string, unknown>) => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value as string | Blob)
    })
    const { data } = await authApi.updateProfile(formData)
    setUser(data.data as User)
    return data.data as User
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

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const value = useMemo<AppContextValue>(
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

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
