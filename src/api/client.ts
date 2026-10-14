import axios, { type AxiosError } from 'axios'

const baseURL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:4000/api'

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

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[] | string>
}

export const normalizeApiError = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorBody>
  if (axiosError.response?.data?.message) return axiosError.response.data.message
  if (axiosError.response?.data?.errors) {
    const firstField = Object.values(axiosError.response.data.errors)[0]
    if (Array.isArray(firstField) && firstField[0]) return firstField[0]
    if (typeof firstField === 'string' && firstField) return firstField
  }
  return 'Something went wrong. Please try again.'
}
