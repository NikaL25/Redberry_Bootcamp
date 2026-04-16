import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { formatCurrency } from '../../utils/format'

import IconStar from '../../assets/IconStar.png'
import CalendarIcon from '../../assets/boxicons_calendar.png'

import IconOnline from '../../assets/IconOnline.png'
import IconGroup from '../../assets/IconGroup.png'
import IconLoc from '../../assets/IconLoc.png'

export default function EnrolledSidebar() {
  const { modals, closeModal, enrollments } = useApp()

  if (!modals.enrolledSidebar) return null

  const totalCost = enrollments.reduce(
    (acc, item) =>
      acc + Number(item?.finalPrice ?? item?.course?.basePrice ?? 0),
    0
  )

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/40"
      onClick={() => closeModal('enrolledSidebar')}
    >
      <aside className="absolute right-0 top-0 h-full w-[794px] overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[40px] ml-6 font-semibold ">Enrolled Courses</h3>
         
          <p className='text-[#0A0A0A] text-[16px] ml-[150px]'>
            Total Enrollments {enrollments.length}
          </p>
          <button
            className="font-bold text-gray-500"
            onClick={() => closeModal('enrolledSidebar')}
          >
            Close
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="mb-4 text-gray-600">
              Your learning journey starts here! Browse courses to get started.
            </p>

            <Link
              className="font-bold text-brand-primary"
              to="/courses"
              onClick={() => closeModal('enrolledSidebar')}
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-5 ml-10">
            {enrollments.map((item) => {
            
              const instructorName = item.course?.instructor?.fullName || item.course?.instructor?.name || 'Unknown Instructor';
              const rating = Number(item.course?.avgRating ?? 0).toFixed(1);

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white w-[623px] p-5 shadow-soft"
                >
                  <div className="flex gap-4">
                  
                    <img
                      src={item.course?.image}
                      alt={item.course?.title}
                      className="h-[191px] w-[269px] rounded-xl object-cover"
                    />

                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500">
                          {instructorName}
                        </p>

                        <div className="ml-auto flex items-center gap-1">
                          <img
                            src={IconStar}
                            className="h-[16px] w-[16px] object-contain"
                            alt="rating"
                          />
                          <p className="text-sm font-medium text-gray-700">
                            {rating}
                          </p>
                        </div>
                      </div>

                      <h4 className="mt-2 text-[18px] font-extrabold text-gray-900 line-clamp-2">
                        {item.course?.title}
                      </h4>

                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2 py-1">
                          <img src={CalendarIcon} className="h-4 w-4" />
                          <span>
                            {item.course?.durationWeeks
                              ? `${item.course.durationWeeks} weeks`
                              : 'Schedule not set'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                          <img src={IconOnline} className="h-4 w-4" />
                          <span>
                            {item.course?.schedule?.time ||
                              item.timeSlot?.name ||
                              'Evening 6:00 PM - 8:00 PM'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                          <img src={IconGroup} className="h-4 w-4" />
                          <span>
                            {item.sessionType?.name ||
                              item.course?.sessionType ||
                              'In Person'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                          <img src={IconLoc} className="h-4 w-4" />
                          <span>
                            {item.course?.location ||
                              'Tbilisi, Chavchavadze St.30'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 relative w-full">
                    <div className="w-[446px]">
                      <p className="mb-1 text-sm font-semibold">
                        {item.progress ?? 0}% Complete
                      </p>

                      <div className="h-[10px] w-full rounded-full bg-gray-100">
                        <div
                          className="h-[10px] rounded-full bg-brand-primary"
                          style={{ width: `${item.progress ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/courses/${item.course?.id}`}
                      onClick={() => closeModal('enrolledSidebar')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex h-[42px] items-center justify-center rounded-lg border border-[#5448C8] px-4 font-bold text-brand-primary transition hover:bg-[#5448C8] hover:text-white"
                    >
                      View
                    </Link>
                  </div>
                </article>
              )
            })}

            {/* SUMMARY */}
            <div className="rounded-xl bg-gray-50 p-4 w-[623px]">
              <p className="text-sm font-semibold">
                Total enrollments: {enrollments.length}
              </p>
              <p className="text-sm font-semibold">
                Total amount: {formatCurrency(totalCost)}
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}