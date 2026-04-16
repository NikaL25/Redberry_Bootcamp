import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../ui/Modal'
import { useApp } from '../../context/AppContext'

const loginSchema = z.object({
  email: z.string().email().min(3),
  password: z.string().min(3),
})

const registerSchema = z
  .object({
    username: z.string().min(3),
    email: z.string().email().min(3),
    password: z.string().min(3),
    password_confirmation: z.string().min(3),
    avatar: z.any().optional(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'Passwords must match',
    path: ['password_confirmation'],
  })

export function LoginModal() {
  const { modals, closeModal, openModal, login, showToast, normalizeApiError } = useApp()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values) => {
    try {
      await login(values)
      closeModal('login')
      showToast('You are now logged in')
    } catch (error) {
      showToast(normalizeApiError(error), 'error')
    }
  }

  return (
    <Modal isOpen={modals.login} onClose={() => closeModal('login')} title="Log In">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="w-full rounded-lg border p-3" placeholder="Email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        <input className="w-full rounded-lg border p-3" placeholder="Password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        <button className="w-full rounded-lg bg-brand-primary py-3 font-bold text-white" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
        <button
          className="w-full text-sm font-bold text-brand-primary"
          type="button"
          onClick={() => {
            closeModal('login')
            openModal('register')
          }}
        >
          Don&apos;t have an account? Sign Up
        </button>
      </form>
    </Modal>
  )
}

export function RegisterModal() {
  const { modals, closeModal, openModal, register: signUp, showToast, normalizeApiError } = useApp()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const avatar = watch('avatar')?.[0]

  const onSubmit = async (values) => {
    try {
      await signUp({
        ...values,
        avatar: values.avatar?.[0],
      })
      closeModal('register')
      showToast('Registration successful')
    } catch (error) {
      showToast(normalizeApiError(error), 'error')
    }
  }

  return (
    <Modal isOpen={modals.register} onClose={() => closeModal('register')} title="Sign Up">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="w-full rounded-lg border p-3" placeholder="Username" {...register('username')} />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        <input className="w-full rounded-lg border p-3" placeholder="Email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        <input className="w-full rounded-lg border p-3" placeholder="Password" type="password" {...register('password')} />
        <input
          className="w-full rounded-lg border p-3"
          placeholder="Confirm Password"
          type="password"
          {...register('password_confirmation')}
        />
        {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>}
        <input accept=".jpg,.jpeg,.png,.webp" className="w-full rounded-lg border p-3" type="file" {...register('avatar')} />
        {avatar && <p className="text-sm text-gray-500">Selected avatar: {avatar.name}</p>}
        <button className="w-full rounded-lg bg-brand-primary py-3 font-bold text-white" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>
        <button
          className="w-full text-sm font-bold text-brand-primary"
          type="button"
          onClick={() => {
            closeModal('register')
            openModal('login')
          }}
        >
          Already have an account? Log In
        </button>
      </form>
    </Modal>
  )
}
