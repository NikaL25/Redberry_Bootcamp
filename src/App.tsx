import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import CourseCatalogPage from './pages/CourseCatalogPage'
import CourseDetailPage from './pages/CourseDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<CourseCatalogPage />} path="courses" />
        <Route element={<CourseDetailPage />} path="courses/:id" />
        <Route element={<NotFoundPage />} path="404" />
        <Route element={<Navigate replace to="/404" />} path="*" />
      </Route>
    </Routes>
  )
}
