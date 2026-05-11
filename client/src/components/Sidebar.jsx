import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineX,
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/projects', label: 'Projects', icon: HiOutlineFolder },
  { path: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40 
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* logo area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <span className="font-semibold text-lg text-slate-800">TaskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-slate-100"
          >
            <HiOutlineX className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* bottom user info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
