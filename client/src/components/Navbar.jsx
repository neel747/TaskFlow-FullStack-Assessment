import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMenu, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { getInitials } from '../utils/helpers';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          id="menu-toggle"
        >
          <HiOutlineMenu className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
          {getGreeting()}, {user?.name?.split(' ')[0]}
        </h1>
      </div>

      {/* profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          id="profile-dropdown-toggle"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">{getInitials(user?.name)}</span>
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 fade-in">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full capitalize">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              id="logout-btn"
            >
              <HiOutlineLogout className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
