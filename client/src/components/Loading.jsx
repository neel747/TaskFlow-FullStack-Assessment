export function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}
      />
      {text && <p className="mt-3 text-sm text-slate-500">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="skeleton h-4 w-3/4 mb-3"></div>
      <div className="skeleton h-3 w-full mb-2"></div>
      <div className="skeleton h-3 w-1/2 mb-4"></div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16"></div>
        <div className="skeleton h-6 w-20"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
