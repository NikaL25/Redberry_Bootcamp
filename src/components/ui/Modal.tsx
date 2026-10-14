import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: unknown
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  canClose?: boolean
}

export default function Modal({ isOpen, onClose, title, children, canClose = true }: ModalProps) {
  if (!isOpen) return null

  const handleOverlayClick = () => {
    if (canClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={handleOverlayClick}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-gray-900">{title}</h3>
          {canClose && (
            <button className="text-sm font-bold text-gray-500 hover:text-gray-900" onClick={onClose}>
              Close
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
