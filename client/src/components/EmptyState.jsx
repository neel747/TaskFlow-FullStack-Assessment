import { HiOutlineFolder, HiOutlineClipboardList, HiOutlineEmojiSad } from 'react-icons/hi';

const icons = {
  projects: HiOutlineFolder,
  tasks: HiOutlineClipboardList,
  default: HiOutlineEmojiSad
};

export default function EmptyState({ type = 'default', title, message, action }) {
  const Icon = icons[type] || icons.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center fade-in">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-700 mb-1">
        {title || 'Nothing here yet'}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">
        {message || 'Items will appear here once they are created.'}
      </p>
      {action && action}
    </div>
  );
}
