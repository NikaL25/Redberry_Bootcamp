import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { catalogApi } from '../api/services'
import { formatCurrency } from '../utils/format'

import IconStar from '../assets/IconStar.png'
import IconDev from '../assets/IconDev.png'

import IconDataScience from '../assets/IconDataScience.png' 
import IconDesign from '../assets/IconDesign.png'
import IconBusiness from '../assets/IconBusiness.png'
import IconMarketing from '../assets/IconMarketing.png'

const sortMap = {
  newest: 'newest',
  priceLow: 'price_asc',
  priceHigh: 'price_desc',
  popular: 'popular',
  title: 'title_az',
}

const categoryIcons = {
  Development: IconDev,
  Design: IconDesign,
  Business: IconBusiness,
  'Data Science': IconDataScience,
  Marketing: IconMarketing,
}

export default function CourseCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [coursesData, setCoursesData] = useState({ data: [], meta: {} })
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)

  const page = Number(searchParams.get('page') || 1)
  const sort = searchParams.get('sort') || 'newest'
  const categoriesParam = searchParams.get('categories') || ''
  const topicsParam = searchParams.get('topics') || ''
  const instructorsParam = searchParams.get('instructors') || ''

  const selectedCategories = useMemo(
    () => categoriesParam.split(',').filter(Boolean),
    [categoriesParam]
  )

  const selectedTopics = useMemo(
    () => topicsParam.split(',').filter(Boolean),
    [topicsParam]
  )

  const selectedInstructors = useMemo(
    () => instructorsParam.split(',').filter(Boolean),
    [instructorsParam]
  )

  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        setLoading(true)

        const params = {
          page,
          sort: sortMap[sort] || sortMap.newest,
        }

        if (selectedCategories.length) params['categories[]'] = selectedCategories
        if (selectedTopics.length) params['topics[]'] = selectedTopics
        if (selectedInstructors.length) params['instructors[]'] = selectedInstructors

        const [coursesResponse, categoriesResponse, topicsResponse, instructorsResponse] =
          await Promise.all([
            catalogApi.courses(params),
            catalogApi.categories(),
            catalogApi.topics(
              selectedCategories.length ? { 'categories[]': selectedCategories } : {}
            ),
            catalogApi.instructors(),
          ])

        setCoursesData(coursesResponse.data)
        setCategories(categoriesResponse.data.data ?? [])
        setTopics(topicsResponse.data.data ?? [])
        setInstructors(instructorsResponse.data.data ?? [])
      } catch {
        setCoursesData({ data: [], meta: {} })
      } finally {
        setLoading(false)
      }
    }

    loadCatalogData()
  }, [page, sort, selectedCategories, selectedInstructors, selectedTopics])

  const toggleFilter = (key, value) => {
    const current = new Set(
      (searchParams.get(key) || '').split(',').filter(Boolean)
    )

    if (current.has(String(value))) current.delete(String(value))
    else current.add(String(value))

    const next = new URLSearchParams(searchParams)
    next.set('page', '1')

    if (current.size) next.set(key, Array.from(current).join(','))
    else next.delete(key)

    setSearchParams(next)
  }

  const activeFilters =
    selectedCategories.length +
    selectedTopics.length +
    selectedInstructors.length

  const totalPages = coursesData.meta?.last_page || 1

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  )

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr] p-6">

      <aside className="space-y-8 w-[299px] rounded-2xl bg-[#F5F5F5] p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-bold text-gray-900">Filters</h1>
          <button
            className="text-sm text-gray-500 hover:text-black"
            onClick={() => setSearchParams({ page: '1', sort })}
          >
            Clear All Filters ✕
          </button>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = selectedCategories.includes(String(category.id))
             
              const icon = categoryIcons[category.name] || IconDev

              return (
                <button
                  key={category.id}
                  onClick={() => toggleFilter('categories', category.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition
                    ${isActive
                      ? 'bg-brand-primary text-white'
                      : 'bg-[#FFFFFF] text-gray-700 hover:bg-gray-200 rounded-md'
                    }`}
                >
                  <img src={icon} className="h-4 w-4 object-contain" alt="" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

      
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => {
              const isActive = selectedTopics.includes(String(topic.id))
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleFilter('topics', topic.id)}
                  className={`rounded-full px-4 py-2 text-sm transition
                    ${isActive ? 'bg-brand-primary text-white' : 'bg-[#FFFFFF] text-gray-700 hover:bg-gray-200 rounded-md'}`}
                >
                  {topic.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Instructor</h3>
          <div className="flex flex-col gap-2">
            {instructors.map((inst) => {
              const isActive = selectedInstructors.includes(String(inst.id))
              return (
                <button
                  key={inst.id}
                  onClick={() => toggleFilter('instructors', inst.id)}
                  className={`flex items-center gap-3 px-3 py-2 w-fit self-start rounded-md transition
                    ${isActive ? 'bg-brand-primary text-white' : 'bg-[#FFFFFF] text-gray-700 hover:bg-gray-200'}`}
                >
                  {inst.avatar ? (
                    <img src={inst.avatar} className="h-[30px] w-[30px] rounded-md object-cover" alt="" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-300" />
                  )}
                  {inst.fullName || inst.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-4 border-t text-sm text-gray-400">
          {activeFilters} Filters Active
        </div>
      </aside>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <p className="font-semibold">
            {coursesData.data?.length ? `Showing ${coursesData.data.length} courses` : 'No courses found'}
          </p>
          <select
            className="rounded border p-2"
            value={sort}
            onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), sort: e.target.value, page: '1' })}
          >
            <option value="newest">Newest</option>
            <option value="priceLow">Price Low</option>
            <option value="priceHigh">Price High</option>
            <option value="popular">Popular</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(coursesData.data ?? []).map((course) => {
              const currentCategoryIcon = categoryIcons[course.category?.name] || IconDev

              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition hover:shadow-md"
                >
                  <img src={course.image} className="h-[200px] w-full object-cover" alt="" />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{course.instructor?.fullName} | {course.durationWeeks} Weeks</span>
                      <div className="flex items-center gap-1">
                        <img src={IconStar} className="h-4 w-4" alt="" />
                        <span className="text-sm font-medium text-gray-700">
                          {Number(course.avgRating ?? 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-2 text-[22px] font-extrabold text-gray-900">{course.title}</h3>

                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                        <img src={currentCategoryIcon} className="object-contain h-[18px] mr-1" alt="" />
                        {course.category?.name || 'Development'}
                      </span>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-6">
                      <div>
                        <p className="text-xs text-gray-400">Starting from</p>
                        <p className="text-[26px] font-extrabold text-gray-900">{formatCurrency(course.basePrice)}</p>
                      </div>
                      <span className="rounded-lg bg-brand-primary px-5 py-3 font-bold text-white">Details</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

       <div className="mt-8 flex flex-wrap gap-2">
  <button
    className="rounded border px-3 py-1"
    disabled={page <= 1}
    onClick={() =>
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        page: String(page - 1),
      })
    }
  >
    Prev
  </button>

  {pages.map((pageNumber) => (
    <button
      key={pageNumber}
      className={`rounded border px-3 py-1 ${
        pageNumber === page ? 'bg-brand-primary text-white' : ''
      }`}
      onClick={() =>
        setSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          page: String(pageNumber),
        })
      }
    >
      {pageNumber}
    </button>
  ))}

  <button
    className="rounded border px-3 py-1"
    disabled={page >= totalPages}
    onClick={() =>
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        page: String(page + 1),
      })
    }
  >
    Next
  </button>
</div>
      </section>
    </div>
  )
}