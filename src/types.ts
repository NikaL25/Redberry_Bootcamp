// Shared API shapes (mirrors backend Laravel-style envelope + snake_case aliases).
// Keep fields optional/nullable where the backend may omit them so the
// TypeScript rewrite stays behavior-identical to the previous JS version.

export interface Instructor {
  id: number
  name: string
  fullName?: string | null
  full_name?: string | null
  avatar?: string | null
  biography?: string | null
}

export interface Category {
  id: number
  name: string
  slug?: string
  description?: string | null
  image?: string | null
}

export interface Topic {
  id: number
  name: string
  slug?: string
}

export interface Course {
  id: number
  title: string
  slug?: string
  description?: string
  image?: string | null
  basePrice?: number
  base_price?: number
  durationWeeks?: number
  duration_weeks?: number
  avgRating?: number | string | null
  avg_rating?: number | string | null
  instructorId?: number
  instructor_id?: number
  instructor?: Instructor | null
  category?: Category | null
  schedule?: { time?: string } | null
  sessionType?: string | null
  location?: string | null
}

export interface Enrollment {
  id: number
  progress?: number | null
  finalPrice?: number | null
  courseId?: number
  courseScheduleId?: number
  course?: Course | null
  timeSlot?: { id?: number | string; name?: string } | null
  sessionType?: { name?: string } | null
}

export interface User {
  id?: number
  username?: string
  email?: string
  avatar?: string | null
  fullName?: string | null
  mobileNumber?: string | null
  age?: number | null
  profileComplete?: boolean
}

export interface SessionTypeItem {
  id?: number | string
  name?: string
  sessionType?: string
  priceModifier?: number | null
  availableSeats?: number | null
  location?: string | null
}

export interface TimeSlotItem {
  id: number | string
  name?: string
  label?: string
}

export interface WeeklyScheduleItem {
  id: number | string
  name?: string
  label?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    last_page?: number
    current_page?: number
    per_page?: number
    total?: number
  }
}

export type ModalName = 'login' | 'register' | 'profile' | 'enrolledSidebar' | 'conflict'

export type ToastType = 'success' | 'error'

export interface Toast {
  message: string
  type: ToastType
}
