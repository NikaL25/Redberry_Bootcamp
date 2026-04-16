import { useApp } from '../context/AppContext'

export function useProtectedAction() {
  const { isAuthenticated, user, openModal, showToast } = useApp()

  const ensureAuth = () => {
    if (!isAuthenticated) {
      openModal('login')
      return false
    }
    return true
  }

  const ensureCompleteProfile = () => {
    if (!ensureAuth()) return false
    if (!user?.profileComplete) {
      showToast('Please complete your profile to enroll in courses', 'error')
      openModal('profile')
      return false
    }
    return true
  }

  return { ensureAuth, ensureCompleteProfile }
}
