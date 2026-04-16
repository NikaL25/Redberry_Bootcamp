import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../ui/Modal'
import { useApp } from '../../context/AppContext'
import { cleanMobileNumber } from '../../utils/format'

import IconDownload from "../../assets/IconDownload.png"
import IconWrite from "../../assets/IconWrite.png"
import IconComplete from "../../assets/IconComplete.png"

const schema = z.object({
  full_name: z.string().min(3).max(50),
  mobile_number: z
    .string()
    .min(1, 'Mobile number is required')
    .transform((value) => cleanMobileNumber(value))
    .refine((value) => /^5\d{8}$/.test(value), 'Please enter a valid Georgian mobile number'),
  age: z.coerce.number().min(16).max(120),
  avatar: z.any().optional(),
})

export default function ProfileModal() {
  const { modals, closeModal, user, updateProfile, showToast, normalizeApiError, refreshMe } = useApp()
  const [dragActive, setDragActive] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ 
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.fullName ?? '',
        mobile_number: user.mobileNumber ?? '',
        age: user.age ?? 29,
      })
    }
  }, [user, reset])

  const onSubmit = async (values) => {
    try {
      await updateProfile({ ...values, avatar: values.avatar?.[0] })
      await refreshMe()
      showToast('Profile updated successfully')
      closeModal('profile')
    } catch (error) {
      showToast(normalizeApiError(error), 'error')
    }
  }

  const inputBaseStyles = "w-full rounded-xl border border-gray-300 p-4 outline-none transition-all focus:border-indigo-500 text-gray-500 bg-white"

  return (
    <Modal isOpen={modals.profile} onClose={() => closeModal('profile')}>
      <div className="p-6 max-w-md mx-auto bg-white rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Profile</h2>

        <div className="flex items-center gap-4 mb-8">
  <div className="relative">
    <img 
      src={user?.avatar || 'https://via.placeholder.com/80'} 
      alt="Profile" 
      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
    />
    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
  </div>
  <div>
    <h3 className="text-xl font-bold text-gray-900 leading-tight">
      {user?.fullName || user?.username || 'User'}
    </h3>
    <p className="text-green-500 text-sm font-medium">
      {user?.profileComplete ? 'Profile is Complete' : 'Profile is Incomplete'}
    </p>
  </div>
</div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
            <div className="relative">
              <input 
                className={inputBaseStyles} 
                placeholder="Username" 
                {...register('full_name')} 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <img src={IconWrite} alt="Edit" className="h-5 w-5 object-contain opacity-40" />
              </div>
            </div>
            {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
            <div className="relative">
              <input 
                className={`${inputBaseStyles} bg-gray-50 border-gray-200 cursor-not-allowed`} 
                disabled 
                value={user?.email || 'Email@gmail.com'} 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <img src={IconComplete} alt="Complete" className="h-5 w-5 object-contain opacity-40" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Mobile Number</label>
              <div className="relative">
                <input 
                  className={inputBaseStyles} 
                  placeholder="+995 599209820" 
                  {...register('mobile_number')} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <img src={IconComplete} alt="Complete" className="h-5 w-5 object-contain opacity-40" />
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Age</label>
              <div className="relative">
                <select 
                  className={`${inputBaseStyles} appearance-none pr-10`}
                  {...register('age')}
                >
                  {[...Array(100)].map((_, i) => (
                    <option key={i} value={i + 16}>{i + 16}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <span className="text-[10px]">▼</span> 
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Upload Avatar</label>
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                setValue('avatar', e.dataTransfer.files);
              }}
            >
              <div className="mb-3">
                <img src={IconDownload} alt="Upload" className="h-10 w-10 object-contain opacity-40" />
              </div>
              <p className="text-gray-600 font-medium text-center">
                Drag and drop or <span className="text-indigo-600 underline cursor-pointer">Upload file</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">JPG, PNG or WEBP</p>
              
              <input 
                type="file" 
                className="hidden" 
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setValue('avatar', e.target.files)}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="absolute inset-0 cursor-pointer opacity-0" />
            </div>
          </div>

          <button 
            className="w-full bg-[#5D57E6] hover:bg-[#4C47C4] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-[0.98] disabled:opacity-70 mt-4" 
            disabled={isSubmitting} 
            type="submit"
          >
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </Modal>
  )
}