import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { catalogApi, enrollmentApi, reviewApi } from '../api/services'
import { useApp } from '../context/AppContext'
import { useProtectedAction } from '../hooks/useProtectedAction'
import Modal from '../components/ui/Modal'
import { formatCurrency } from '../utils/format'
import type { Course, SessionTypeItem, TimeSlotItem, WeeklyScheduleItem } from '../types'

import CalendarIcon from '../assets/boxicons_calendar.png'
import IconStar from '../assets/IconStar.png'
import IconDev from '../assets/IconDev.png'
import IconDataScience from '../assets/IconDataScience.png' 
import IconDesign from '../assets/IconDesign.png'
import IconBusiness from '../assets/IconBusiness.png'
import IconMarketing from '../assets/IconMarketing.png'
import IconFirstStep from '../assets/IconFirstStep.png'
import IconSecondStep from '../assets/IconSecondStep.png'
import IconThirdStep from '../assets/IconThirdStep.png'
import IconWarning from '../assets/IconWarning.png'
import IconOnline from '../assets/IconOnline.png'
import IconGroup from '../assets/IconGroup.png'
import IconLocation from '../assets/IconLocation.png'
import IconLoc from '../assets/IconLoc.png'
import IconCourseComplete from '../assets/IconCourseComplete.png'
import IconRevoke from '../assets/IconRevoke.png'

const categoryIcons = {
  Development: IconDev,
  Design: IconDesign,
  Business: IconBusiness,
  'Data Science': IconDataScience,
  Marketing: IconMarketing,
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const { showToast, refreshEnrollments, modals, openModal, closeModal } = useApp()
  const { ensureAuth, ensureCompleteProfile } = useProtectedAction()

  const [course, setCourse] = useState<(Course & { enrollment?: any }) | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklyScheduleItem[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlotItem[]>([])
  const [sessionTypes, setSessionTypes] = useState<SessionTypeItem[]>([])
  
  const [selectedSession, setSelectedSession] = useState<SessionTypeItem | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | string>('')
  const [selectedWeekly, setSelectedWeekly] = useState<number | string>('')

  // Exact CourseSchedule row matching all three choices (resolved last).
  const [finalSchedule, setFinalSchedule] = useState<any>(null)
  
  const [openWeekly, setOpenWeekly] = useState<boolean>(false)
  const [openSlot, setOpenSlot] = useState<boolean>(false)

  const selectedSessionType = selectedSession?.sessionType || selectedSession?.name || ''

  // Step 1: load distinct session types first.
  useEffect(() => {
    const loadCourseDetails = async () => {
      const { data } = await catalogApi.courseDetails(id)
      setCourse(data.data)
      const sessions = await catalogApi.sessionTypes(id)
      setSessionTypes(sessions.data.data ?? [])
      setLoading(false)
    }
    loadCourseDetails()
  }, [id])

  // Step 2: time slots filtered by chosen session type.
  useEffect(() => {
    if (!selectedSessionType) return
    const loadTimeSlots = async () => {
      const { data } = await catalogApi.timeSlots(id, { sessionType: selectedSessionType })
      setTimeSlots(data.data ?? [])
      setSelectedSlot('')
      setSelectedWeekly('')
      setWeeklySchedules([])
      setFinalSchedule(null)
    }
    loadTimeSlots()
  }, [id, selectedSessionType])

  // Step 3: weekly schedules filtered by session type + time slot.
  useEffect(() => {
    if (!selectedSessionType || !selectedSlot) return
    const loadWeekly = async () => {
      const { data } = await catalogApi.weeklySchedules(id, {
        sessionType: selectedSessionType,
        timeSlotId: selectedSlot,
      })
      setWeeklySchedules(data.data ?? [])
      setSelectedWeekly('')
      setFinalSchedule(null)
    }
    loadWeekly()
  }, [id, selectedSessionType, selectedSlot])

  // Resolve the exact CourseSchedule row once all three steps are chosen.
  useEffect(() => {
    if (!selectedSessionType || !selectedSlot || !selectedWeekly) {
      setFinalSchedule(null)
      return
    }
    const loadExact = async () => {
      const { data } = await catalogApi.sessionTypes(id, {
        sessionType: selectedSessionType,
        weeklyScheduleId: selectedWeekly,
        timeSlotId: selectedSlot,
      })
      setFinalSchedule(data.data?.[0] ?? null)
    }
    loadExact()
  }, [id, selectedSessionType, selectedSlot, selectedWeekly])

  const handleRetake = async () => {
    try {
      await enrollmentApi.remove(enrollment.id)
      
      await refreshEnrollments()
      const detail = await catalogApi.courseDetails(id)
      setCourse(detail.data.data)
      
      showToast('Course reset. You can now enroll again!')
    } catch (error: any) {
      console.error(error)
      showToast('Could not reset course. Please try again.', 'error')
    }
  }
  const enrollment = course?.enrollment
  const sessionModifier = Number(finalSchedule?.priceModifier ?? selectedSession?.priceModifier ?? 0)
  const totalPrice = Number(course?.basePrice ?? 0) + sessionModifier

  const selectedScheduleId = useMemo(
    () => finalSchedule?.courseScheduleId || finalSchedule?.id,
    [finalSchedule]
  )
  
  const displayRating = useMemo(() => {
    return Number(course?.avgRating ?? 0).toFixed(1)
  }, [course]) 

  const categoryName = course?.category?.name || 'Development'
  const icon = categoryIcons[categoryName] || IconDev

  const canEnroll = Boolean(selectedSession && selectedSlot && selectedWeekly && selectedScheduleId)

  const handleEnroll = async (force: boolean = false) => {
    if (!ensureAuth()) return
    if (!ensureCompleteProfile()) return

    if (!canEnroll) {
      showToast('Please select session type, time slot and weekly schedule', 'error')
      return
    }

    if ((finalSchedule?.availableSeats ?? selectedSession.availableSeats ?? 1) <= 0) {
      showToast('This session is fully booked', 'error')
      return
    }

    try {
      await enrollmentApi.enroll({
        courseId: Number(id),
        courseScheduleId: selectedScheduleId,
        force,
      })
      await refreshEnrollments()
      showToast('Enrollment successful')
      const detail = await catalogApi.courseDetails(id)
      setCourse(detail.data.data)
      closeModal('conflict')
    } catch (error) {
      if (error.response?.status === 409) {
        openModal('conflict', error.response.data)
      } else {
        showToast(error.response?.data?.message || 'Enrollment failed', 'error')
      }
    }
  }

  const handleComplete = async () => {
    await enrollmentApi.complete(enrollment.id)
    await refreshEnrollments()
    const detail = await catalogApi.courseDetails(id)
    setCourse(detail.data.data)
    showToast(`Congratulations! You've completed ${course.title}!`)
  }

  if (loading) return <p>Loading...</p>
  if (!course) return <p>Course not found.</p>

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_530px] p-6">
      <section className='w-full max-w-[903px]'>
        <h1 className="mb-6 text-4xl font-extrabold">{course.title}</h1>
        <img
          src={course.image}
          className="mb-6 w-full h-[474px] object-cover rounded-2xl"
          alt={course.title}
        />

        <div className="mb-4 w-full flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <img src={CalendarIcon} className="h-4 w-4" />
            <span>{course.durationWeeks} weeks</span>
          </div>
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
  <img src={IconStar} className="h-4 w-4" />
  <span className="font-medium">
{Number(course?.avgRating || course?.avg_rating || 0).toFixed(1)}  </span>
</div>
            <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-white border border-gray-100 shadow-sm text-gray-700">
              <img src={icon} className="h-4 w-4 object-contain" />
              {categoryName}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3  py-2 bg-white h-[40px] rounded-md transition border border-gray-100 shadow-sm w-fit self-start mb-6">
  {course.instructor?.avatar ? (
    <img 
      src={course.instructor.avatar} 
      className="h-[30px] w-[30px] rounded-md object-cover" 
      alt="" 
    />
  ) : (
    <div className="h-[30px] w-[30px] rounded-md bg-gray-200" />
  )}
  
  <p className="text-sm text-gray-500 font-medium">
    {course.instructor?.fullName || course.instructor?.name || 'Unknown Instructor'}
  </p>
</div>
        <h2 className="mb-3 text-[20px] font-bold text-[#8A8A8A]">Course Description</h2>
        <p className="text-[#525252] text-[16px]">{course.description}</p>
      </section>

      <aside className="mt-[55px] w-[530px] rounded-2xl border p-6 shadow-soft self-start">
        {!enrollment ? (
          <>
            <div className='flex'>
              <img src={IconFirstStep} className='object-contain' alt="" />
              <h3 className="mb-4 mt-4 ml-2 text-[24px] font-extrabold text-[#130E67]">
                Session Type
              </h3>
            </div>

            <div className="mb-5">
              <div
                className={`cursor-pointer flex items-center gap-2 ${!selectedSession ? 'opacity-50' : ''}`}
                onClick={() => selectedSession && setOpenSlot(!openSlot)}
              >
                <img src={IconSecondStep} className="object-contain" />
                <h3 className="text-[24px] font-extrabold text-[#8A8A8A] hover:text-[#130E67] transition-colors">
                  Time Slot{selectedSlot ? `: ${timeSlots.find((t) => t.id === selectedSlot)?.name || ''}` : ''}
                </h3>
              </div>
              {openSlot && (
                <div className="border rounded-lg mt-2 bg-white overflow-hidden shadow-sm">
                  {timeSlots.length > 0 ? timeSlots.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedSlot(item.id)
                        setOpenSlot(false)
                      }}
                      className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedSlot === item.id ? 'bg-gray-50 font-medium' : ''}`}
                    >
                      {item.name || item.label}
                    </div>
                  )) : <div className="p-3 text-gray-400">Select a session type first</div>}
                </div>
              )}
            </div>

            <div className="mb-5">
              <div
                className={`cursor-pointer flex items-center gap-2 ${!selectedSlot ? 'opacity-50' : ''}`}
                onClick={() => selectedSlot && setOpenWeekly(!openWeekly)}
              >
                <img src={IconThirdStep} className="object-contain" />
                <h3 className="text-[24px] font-extrabold text-[#8A8A8A] hover:text-[#130E67] transition-colors">
                  Select Weekly Schedule{selectedWeekly ? `: ${weeklySchedules.find((w) => w.id === selectedWeekly)?.name || ''}` : ''}
                </h3>
              </div>
              {openWeekly && (
                <div className="border rounded-lg mt-2 bg-white overflow-hidden shadow-sm">
                  {weeklySchedules.length > 0 ? weeklySchedules.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedWeekly(item.id)
                        setOpenWeekly(false)
                      }}
                      className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedWeekly === item.id ? 'bg-gray-50 font-medium' : ''}`}
                    >
                      {item.name || item.label}
                    </div>
                  )) : <div className="p-3 text-gray-400">Select a session type and time slot first</div>}
                </div>
              )}
            </div>

            <div className='flex justify-between mb-5 h-[131px] gap-2'>
              {sessionTypes.length > 0 ? (
                sessionTypes.map((session) => {
                  const sessionKey = session.sessionType || session.name
                  const isSelected = (selectedSession?.sessionType || selectedSession?.name) === sessionKey;
                  const isDisabled = (session.availableSeats ?? 1) <= 0;

                  const lowerName = String(session.name || '').toLowerCase();
                  let sessionIcon = IconLocation;
                  if (lowerName.includes('online')) sessionIcon = IconOnline;
                  if (lowerName.includes('person') || lowerName.includes('group') || lowerName.includes('hybrid') || lowerName.includes('in_person') || lowerName.includes('in person')) sessionIcon = IconGroup;

                  return (
                    <div
                      key={sessionKey}
                      onClick={() => {
                        if (isDisabled) return
                        setSelectedSession(session)
                        setSelectedSlot('')
                        setSelectedWeekly('')
                        setTimeSlots([])
                        setWeeklySchedules([])
                        setFinalSchedule(null)
                        setOpenSlot(true)
                        setOpenWeekly(false)
                      }}
                      className={`flex-1 h-full bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2
                        ${isSelected ? 'border-[#736BEA] bg-purple-50' : 'border-transparent hover:border-gray-300'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <img src={sessionIcon} className="h-[26px] w-[26px] object-contain" alt={session.name} />
                      <p className='mt-[10px] text-[16px] text-[#525252] font-bold capitalize'>{session.name}</p>

                      <div className='flex items-center gap-1 justify-center min-h-[20px]'>
                        {session.location && session.location.toLowerCase() !== 'online' ? (
                          <>
                            <img src={IconLoc} className='object-contain h-3 w-3' />
                            <p className='mt-[6px] text-[12px] text-[#525252] truncate max-w-[80px]' title={session.location}>
                              {session.location}
                            </p>
                          </>
                        ) : lowerName.includes('online') ? (
                          <p className='mt-[6px] text-[12px] text-[#525252]'>Google Meet</p>
                        ) : null}
                      </div>

                      <p className='mt-[14px] text-[14px] text-[#736BEA] font-medium'>
                        {session.priceModifier ? `+ $${session.priceModifier}` : 'Included'}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed">
                  Select schedule and time to view sessions
                </div>
              )}
            </div>

            <div className='flex justify-between mb-5 text-center w-full'>
              <div className='ml-8'>
                <p className='text-[#3D3D3D] text-[12px]'>50 Seats Available</p>
              </div>
              <div>
                {selectedSession?.availableSeats <= 5 && selectedSession?.availableSeats > 0 && (
                   <div className='flex'>
                     <img src={IconWarning} className='object-contain h-[16px] w-[16px]' />
                     <p className='text-[#F4A316] text-[12px] px-1'>Only {selectedSession.availableSeats} Seats Remaining</p>
                   </div>
                )}
              </div>
              <div className='mr-6'>
                <p className='text-[#3D3D3D] text-[12px]'>130 Seats Available</p>
              </div>
            </div>

            <div className="my-7 h-[306px] w-full p-4 bg-white border rounded-xl text-sm shadow-sm">
              <div className='flex justify-between py-[48px] px-[20px] '>
                <div>
                  <p className='text-[24px] font-bold text-[#ADADAD]'>Total Price</p>
                  <p className='text-[#ADADAD] text-[16px] mt-[32px]'>Base Price</p>
                  <p className='text-[#ADADAD] text-[16px] mt-[12px]'>Session Type</p>
                </div>

                <div className="text-right">
                  <p className='text-[32px] font-bold'>{formatCurrency(totalPrice)}</p>
                  <p className='mt-[32px] text-[16px] font-bold'>+ {formatCurrency(course.basePrice)}</p>
                  <p className='mt-[12px] text-[16px] font-bold'>
                    {selectedSession?.priceModifier ? `+ ${formatCurrency(selectedSession.priceModifier)}` : '+ $0'}
                  </p>
                </div>
              </div>

              <button
                className={`w-full max-w-[420px] mx-auto block h-[63px] text-[20px] py-3 rounded-lg font-bold transition-all duration-300 ${
                  canEnroll 
                    ? 'bg-[#736BEA] text-white hover:bg-[#5f57cf] shadow-md cursor-pointer' 
                    : 'bg-[#EEEDFC] text-[#B7B3F4] cursor-not-allowed'
                }`}
                onClick={() => canEnroll && handleEnroll(false)}
                disabled={!canEnroll}
              >
                Enroll Now
              </button>
            </div>
          </>
        ) : (
          <>
           <div className={`h-[56px] w-[111px] flex items-center justify-center rounded-full ${
  (enrollment.progress ?? 0) >= 100 ? 'bg-green-100' : 'bg-purple-100'
}`}>
  <h3 className={`text-[18px] font-extrabold ${
    (enrollment.progress ?? 0) >= 100 ? 'text-green-600' : 'text-[#736BEA]'
  }`}>
    {(enrollment.progress ?? 0) >= 100 ? 'Complete' : 'Enrolled'}
  </h3>
</div>

            <div className="mb-4 space-y-2 text-[20px] text-gray-600 mt-4">
              <div className="flex items-center gap-2">
                <img src={CalendarIcon} className="h-4 w-4" />
                <span>
                  {enrollment.course?.durationWeeks
                    ? `${enrollment.course.durationWeeks} weeks`
                    : 'Schedule not set'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <img src={IconOnline} className="h-4 w-4" />
                <span>
                  {enrollment.course?.schedule?.time ||
                    enrollment.timeSlot?.name ||
                    'Evening 6:00 PM - 8:00 PM'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <img src={IconGroup} className="h-4 w-4" />
                <span>
                  {enrollment.sessionType?.name ||
                    enrollment.course?.sessionType ||
                    'Online'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <img src={IconLoc} className="h-4 w-4" />
                <span>
                  {enrollment.course?.location ||
                    'Tbilisi, Chavchavadze St.30'}
                </span>
              </div>
            </div>

            <h3 className="mb-2 font-bold mt-[48px]">
                 Progress: {enrollment.progress ?? 0}%
            </h3>

            <div className="h-2 bg-gray-200 rounded-full mb-4">
            <div
              className={`h-2 rounded-full transition-all ${
                (enrollment.progress ?? 0) >= 100 ? 'bg-green-500' : 'bg-brand-primary'
              }`}
              style={{ width: `${Math.min(enrollment.progress ?? 0, 100)}%` }}
            />
          </div>

          <button
  className={`w-full py-3 rounded-lg font-bold transition mt-[40px] flex items-center justify-center gap-2 ${
    (enrollment.progress ?? 0) >= 100 
      ? 'bg-[#736BEA] border-2 border-[#736BEA] text-white hover:opacity-90' 
      : 'bg-[#736BEA] text-white hover:opacity-90'
  }`}
  onClick={(enrollment.progress ?? 0) >= 100 ? handleRetake : handleComplete}
>
  {(enrollment.progress ?? 0) >= 100 ? (
    <>
    
      <span>Retake Course</span>
      <img src={IconRevoke} alt="" className="h-5 w-5 object-contain" />
    </>
  ) : (
    <>
      <span>Complete Course</span>
      <img src={IconCourseComplete} alt="" className="h-5 w-5 object-contain" />

    </>
  )}
</button>
          </>
        )}
      </aside>

      <Modal
        isOpen={Boolean(modals.conflict)}
        onClose={() => closeModal('conflict')}
        title="Schedule Conflict"
      >
        <p className="mb-4 text-sm">
          You already have a course at this time.
        </p>
        <div className="flex gap-3">
          <button onClick={() => closeModal('conflict')} className="flex-1 border py-2 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => handleEnroll(true)}
            className="flex-1 bg-[#736BEA] text-white py-2 rounded-lg"
          >
            Continue
          </button>
        </div>
      </Modal>
    </div>
  )
}