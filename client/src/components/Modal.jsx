import { HiOutlineX } from 'react-icons/hi';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <HiOutlineX className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
