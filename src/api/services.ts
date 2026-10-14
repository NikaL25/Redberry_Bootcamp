import { api } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export type RegisterPayload = FormData

export type UpdateProfilePayload = FormData

export interface CoursesQueryParams {
  page?: number
  sort?: string
  'categories[]'?: string[]
  'topics[]'?: string[]
  'instructors[]'?: string[]
  [key: string]: unknown
}

export interface ScheduleFilter {
  sessionType?: string
  timeSlotId?: number | string
  weeklyScheduleId?: number | string
}

export interface EnrollPayload {
  courseId: number
  courseScheduleId: number | string
  force?: boolean
}

export const authApi = {
  login: (payload: LoginPayload) => api.post('/login', payload),
  register: (payload: RegisterPayload) => api.post('/register', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  updateProfile: (payload: UpdateProfilePayload) =>
    api.put('/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export const catalogApi = {
  featured: () => api.get('/courses/featured'),
  inProgress: () => api.get('/courses/in-progress'),
  courses: (params?: CoursesQueryParams) => api.get('/courses', { params }),
  courseDetails: (id: number | string) => api.get(`/courses/${id}`),
  categories: () => api.get('/categories'),
  topics: (params?: Record<string, string[]>) => api.get('/topics', { params }),
  instructors: () => api.get('/instructors'),
  // Enrollment flow is Session Type -> Time Slot -> Weekly Schedule.
  // sessionTypes() with no args returns distinct session types for step 1.
  weeklySchedules: (id: number | string, { sessionType, timeSlotId }: ScheduleFilter = {}) =>
    api.get(`/courses/${id}/weekly-schedules`, {
      params: {
        ...(sessionType ? { session_type: sessionType } : {}),
        ...(timeSlotId ? { time_slot_id: timeSlotId } : {}),
      },
    }),
  timeSlots: (id: number | string, { sessionType, weeklyScheduleId }: ScheduleFilter = {}) =>
    api.get(`/courses/${id}/time-slots`, {
      params: {
        ...(sessionType ? { session_type: sessionType } : {}),
        ...(weeklyScheduleId ? { weekly_schedule_id: weeklyScheduleId } : {}),
      },
    }),
  sessionTypes: (id: number | string, { sessionType, weeklyScheduleId, timeSlotId }: ScheduleFilter = {}) =>
    api.get(`/courses/${id}/session-types`, {
      params: {
        ...(sessionType ? { session_type: sessionType } : {}),
        ...(weeklyScheduleId ? { weekly_schedule_id: weeklyScheduleId } : {}),
        ...(timeSlotId ? { time_slot_id: timeSlotId } : {}),
      },
    }),
}

export const enrollmentApi = {
  list: () => api.get('/enrollments'),
  enroll: (payload: EnrollPayload) => api.post('/enrollments', payload),
  complete: (id: number | string) => api.patch(`/enrollments/${id}/complete`),
  remove: (id: number | string) => api.delete(`/enrollments/${id}`),
  retake: (id: number | string) => api.patch(`/enrollments/${id}/retake`),

}

export const reviewApi = {
  rateCourse: (id: number | string, rating: number) => api.post(`/courses/${id}/reviews`, { rating }),
}
