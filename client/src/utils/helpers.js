// figure out deadline risk level based on due date
export function getDeadlineRisk(deadline, status) {
  if (!deadline || status === 'done') return null;

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return { level: 'overdue', label: 'Overdue', className: 'risk-overdue' };
  if (diffDays < 1) return { level: 'danger', label: 'Due today', className: 'risk-danger' };
  if (diffDays < 3) return { level: 'warning', label: `${Math.ceil(diffDays)}d left`, className: 'risk-warning' };
  return { level: 'safe', label: `${Math.ceil(diffDays)}d left`, className: 'risk-safe' };
}

// format date for display
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// format relative time like "2 hours ago"
export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

// get initials from name for avatar
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// capitalize first letter
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// readable status labels
export const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
  'planning': 'Planning',
  'active': 'Active',
  'on-hold': 'On Hold',
  'completed': 'Completed'
};
