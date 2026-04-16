import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.redclass.redberryinternship.ge/api'

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const normalizeApiError = (error) => {
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.data?.errors) {
    const firstField = Object.values(error.response.data.errors)[0]
    if (Array.isArray(firstField) && firstField[0]) return firstField[0]
  }
  return 'Something went wrong. Please try again.'
}
