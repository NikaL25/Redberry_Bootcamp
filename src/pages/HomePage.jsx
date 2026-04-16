import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogApi } from '../api/services'
import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/format'

import img1 from '../assets/img_1.png'
import img2 from '../assets/img_2.png'
import img3 from '../assets/img_3.png'

import arrowLeft from '../assets/Arrowleft.png'
import arrowRight from '../assets/Arrowright.png'
import arrowLeftGrey from '../assets/Arrowleft-grey.png'
import arrowRightGrey from '../assets/Arrowright-grey.png'

import rectActive from '../assets/Rectangle-active.png'
import rectInactive from '../assets/Rectangle-non-active.png'

import IconStar from '../assets/IconStar.png'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [inProgress, setInProgress] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState(0)

  const { isAuthenticated, openModal, showToast } = useApp()

  const images = [img1, img2, img3]

  const nextSlide = () => {
    if (slide < images.length - 1) setSlide(slide + 1)
  }

  const prevSlide = () => {
    if (slide > 0) setSlide(slide - 1)
  }

  const instructorMap = useMemo(() => {
    return Object.fromEntries(instructors.map((i) => [i.id, i]))
  }, [instructors])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          { data: featuredData },
          inProgressResult,
          instructorsRes, 
        ] = await Promise.all([
          catalogApi.featured(),
          isAuthenticated
            ? catalogApi.inProgress()
            : Promise.resolve({ data: { data: [] } }),
          catalogApi.instructors(),
        ])

        setFeatured(featuredData.data ?? [])
        setInProgress(inProgressResult.data?.data ?? [])
        setInstructors(instructorsRes.data?.data ?? [])
      } catch {
        showToast('Failed to load dashboard data', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, showToast])

  return (
    <div className="space-y-12">

      <section className="hero-gradient relative overflow-hidden rounded-[40px] ">
        <img
          src={images[slide]}
          alt="hero slide"
          className=" w-full object-contain"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute bottom-6 right-6 flex gap-3">
          <button onClick={prevSlide} disabled={slide === 0}>
            <img src={slide === 0 ? arrowLeftGrey : arrowLeft} className="h-10 w-10" />
          </button>
          <button onClick={nextSlide} disabled={slide === images.length - 1}>
            <img src={slide === images.length - 1 ? arrowRightGrey : arrowRight} className="h-10 w-10" />
          </button>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, idx) => (
            <button key={idx} onClick={() => setSlide(idx)}>
              <img src={slide === idx ? rectActive : rectInactive} />
            </button>
          ))}
        </div>
      </section>

      {/* CONTINUE LEARNING */}
      <section>
        <h2 className="text-[40px] font-extrabold ">Continue Learning</h2>
          <p className='text-gray-700 text-[18px] mb-6'>Pick up where you left</p>
        {!isAuthenticated ? (
          <div className="rounded-2xl border bg-white p-8 opacity-40">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {(inProgress ?? []).map((item) => (
       <article
  key={item.id}
  className="rounded-2xl border bg-white p-5 shadow-soft w-[506px] h-[219px]"
>

  <div className="flex">
    <div className="image">
      <img
        src={item.course?.image}
        className="h-[123px] w-[143px] rounded-md"
        alt={item.course?.title}
      />
    </div>

    <div className="info px-5 flex-1">
      
      <div className="flex items-center">
        
      <p className="text-sm text-gray-500">
        Lecturer 
        <a className='text-gray-500 font-bold'> {item.course?.instructor?.fullName ||
    item.course?.instructor?.name ||
    instructorMap[item.course?.instructorId]?.fullName ||
    instructorMap[item.course?.instructorId]?.name ||
    "Unknown Instructor"}</a>
  
</p>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <img
            src={IconStar}
            className="h-[18px] w-[18px] object-contain"
          />
          <p className="text-sm font-medium text-gray-700">
            {Number(item.course?.avgRating ?? 0).toFixed(1)}
          </p>
        </div>
      </div>

      <h3 className="mt-3 text-[24px] text-gray-900 font-bold w-[300px]">
        {item.course?.title}
      </h3>
    </div>
  </div>

  <div className="mt-4 flex items-center gap-4">

    <div className="flex-1">
      <div className="mb-2 text-[12px] text-gray-900 font-bold">
        {item.progress ?? 0}% Complete
      </div>

      <div className="h-[15px] bg-gray-100 rounded-full w-full">
        <div
          className="h-[15px] bg-brand-primary rounded-full"
          style={{ width: `${item.progress ?? 0}%` }}
        />
      </div>
    </div>

    <Link
      to={`/courses/${item.course?.id}`}
      className="inline-flex items-center justify-center font-bold border border-[#5448C8] text-brand-primary w-[90px] h-[48px] rounded-lg hover:bg-[#5448C8] hover:text-white transition"
    >
      View
    </Link>

  </div>
</article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div>
            <h2 className="text-[40px] text-gray-950 font-extrabold">
              Start Learning Today
            </h2>
            <p className='mb-9 text-gray-700 text-[18px] '>Choose from our most popular courses and begin your journey</p>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.map((course) => (
              <article key={course.id} className="rounded-2xl border bg-white shadow-soft p-6 flex flex-col">

                <img
                  src={course.image}
                  className="h-[268px] w-full object-cover rounded-xl"
                />

                <div className='flex justify-between'>

                <p className="mt-3 text-xs  uppercase text-gray-500">
                  Lecturer  
                  <a className='ml-1 text-gray-500 font-bold'>
                  {
    course.instructor?.fullName || 
    course.instructor?.name ||
    instructorMap[course.instructorId]?.fullName || 
    instructorMap[course.instructorId]?.name ||
    'Unknown Instructor'
  } </a>
 
</p>

                <div className='flex'>
                  <img src={IconStar}  className='mt-[7px] mr-0.5 object-contain w-[18px] h-[18px]'/>
                  <p className='mt-1'>{Number(course.avgRating ?? 0).toFixed(1)}</p>
                  </div>
                
                </div>

                <h3 className="mt-2 text-[24px] text-gray-900 font-extrabold">
                  {course.title}
                </h3>

                <p className="mt-2 text-[16px]  text-gray-500 line-clamp-3">
                  {course.description}
                </p>

                <div className="mt-auto flex justify-between pt-6">
                  <div className='flex mt-2'>
                    <p className="text-[12px] text-gray-400 mt-4 mr-2">Starting from</p>
                    <p className="text-[32px] font-extrabold">  
                      {formatCurrency(course.basePrice)}
                    </p>
                  </div>

                  <Link
                    to={`/courses/${course.id}`}
                    className="bg-[#4F46E5] h-[58px] text-white px-5 py-2 rounded-lg font-bold"
                  >
                     <p className='mt-2'>View Details</p>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {!isAuthenticated && (
        <section className="text-center bg-white p-10 rounded-2xl shadow-soft">
          <p className="mb-4 font-bold">
            Sign in to track your learning progress
          </p>

          <button
            onClick={() => openModal('login')}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold"
          >
            Log In
          </button>
        </section>
      )}
    </div>
  )
}