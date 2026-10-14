import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-4xl font-extrabold">Page not found</h1>
      <Link className="mt-4 inline-block font-bold text-brand-primary" to="/">
        Back to Dashboard
      </Link>
    </div>
  )
}
