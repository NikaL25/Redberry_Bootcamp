import { api } from './client'

export const authApi = {
  login: (payload) => api.post('/login', payload),
  register: (payload) => api.post('/register', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  updateProfile: (payload) =>
    api.put('/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export const catalogApi = {
  featured: () => api.get('/courses/featured'),
  inProgress: () => api.get('/courses/in-progress'),
  courses: (params) => api.get('/courses', { params }),
  courseDetails: (id) => api.get(`/courses/${id}`),
  categories: () => api.get('/categories'),
  topics: (params) => api.get('/topics', { params }),
  instructors: () => api.get('/instructors'),
  weeklySchedules: (id) => api.get(`/courses/${id}/weekly-schedules`),
  timeSlots: (id, weeklyScheduleId) => api.get(`/courses/${id}/time-slots`, { params: { weekly_schedule_id: weeklyScheduleId } }),
  sessionTypes: (id, weeklyScheduleId, timeSlotId) =>
    api.get(`/courses/${id}/session-types`, {
      params: { weekly_schedule_id: weeklyScheduleId, time_slot_id: timeSlotId },
    }),
}

export const enrollmentApi = {
  list: () => api.get('/enrollments'),
  enroll: (payload) => api.post('/enrollments', payload),
  complete: (id) => api.patch(`/enrollments/${id}/complete`),
  remove: (id) => api.delete(`/enrollments/${id}`),
  retake: (id) => api.patch(`/enrollments/${id}/retake`), 

}

export const reviewApi = {
  rateCourse: (id, rating) => api.post(`/courses/${id}/reviews`, { rating }),
}

