import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center fade-in">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <HiOutlineExclamationCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-base font-medium text-slate-700 mb-1">Something went wrong</h3>
      <p className="text-sm text-slate-500 mb-4">{message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
