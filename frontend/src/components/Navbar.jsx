import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import clsx from 'clsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoader } from '../contexts/LoaderContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/', label: 'Buy / Sell' },
  { to: '/home/1', label: 'Detail ( test )' },
  { to: '/', label: 'Contact' },
];

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, statusLoading } = useAuth();
  const { setShowLoader } = useLoader();

  // Drive your global loader from auth loading, but do it in an effect (not during render).
  useEffect(() => {
    setShowLoader(Boolean(statusLoading));
  }, [statusLoading, setShowLoader]);

  // Hide navbar on auth pages
  if (location.pathname === '/signIn' || location.pathname === '/signUp') return null;

  return (
    <nav className="w-full flex justify-between items-center px-3 py-2 shadow-md fixed top-0 z-20 bg-[var(--background)] dark:bg-[var(--dark-background)]">
      {/* Logo */}
      <div className="flex items-center gap-1 p-3">
        <img src="/images/homeLogo.png" alt="Home Logo" className="w-12 h-12" />
        <p className="text-[var(--dark-primary)] font-[Unbounded] font-extrabold">NestNova</p>
      </div>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-10 text-[var(--dark-text)] dark:text-white font-semibold">
        {navLinks.map((link) => (
          <li
            key={link.label}
            className="relative text-[var(--dark-text)] dark:text-white font-[Montserrat] font-semibold 
              transition-colors duration-300
              before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 
              before:bottom-0 before:h-[2px] before:w-0 before:bg-[var(--dark-primary)] dark:before:bg-[var(--primary)]
              before:transition-all before:duration-300 
              hover:text-[var(--dark-primary)] dark:hover:text-[var(--primary)]
              hover:before:w-full"
          >
            <Link to={link.to} className="py-2">{link.label}</Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          className="w-10 h-10 bg-[var(--background)] text-[var(--primary)] rounded-full cursor-pointer z-20 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)] duration-300 grid place-items-center"
          title={theme === 'light' ? 'Toggle Dark Mode' : 'Toggle Light Mode'}
          onClick={toggleTheme}
        >
          <i className={theme === 'light' ? 'bi bi-moon' : 'bi bi-sun'} />
        </button>

        {statusLoading ? (
          <div
            aria-busy="true"
            className="hidden md:block h-10 min-w-[260px] rounded-xl bg-black/5 dark:bg-white/10 animate-pulse"
          />
        ) : user ? (
          <div className="relative group">
            <button
              type="button"
              tabIndex={0}
              aria-haspopup="menu"
              aria-expanded="false"
              className="flex items-center justify-between gap-3
                bg-white dark:bg-[#252525]
                text-gray-900 dark:text-gray-100
                rounded-xl border border-black/5 dark:border-white/10
                shadow-sm px-3 py-2 min-w-[260px]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profileUrl || '/images/blank-profileImg.webp'}
                  alt={user.displayName || user.name || 'Profile'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="leading-tight text-left">
                  <div className="text-[15px] font-semibold">
                    {user.name || user.userId || 'John Doe'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                    {user.email || 'doe@gmail.com'}
                  </div>
                </div>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-gray-800 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 select-none
                rounded-xl border border-black/5 dark:border-white/10
                bg-[var(--surface)]/95 backdrop-blur
                shadow-lg py-1
                opacity-0 translate-y-1 pointer-events-none
                transition-all duration-200 z-50
                group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto"
            >
              <Link
                to="/profile"
                role="menuitem"
                className="block px-4 py-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
              >
                My Profile
              </Link>
              <button
                role="menuitem"
                className="block w-full text-left px-4 py-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/signIn')}
            className="hidden md:inline-block rounded-full px-4 py-2 font-[Montserrat] font-semibold
              text-[var(--on-primary)] bg-[var(--primary)]
              shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_0px_-2px_4px_rgba(0,0,0,0.35),0_6px_10px_rgba(0,0,0,0.25)]
              transition-all duration-150 transform hover:scale-105 hover:brightness-110
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--surface)]"
          >
            Sign In
          </button>
        )}

        <button
          className="md:hidden inline-flex items-center justify-center rounded p-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] text-[var(--dark-text)] dark:text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'} text-2xl`} />
        </button>
      </div>

      <div
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
      />

      <ul
        className={clsx(
          'fixed top-0 right-0 h-full w-64 bg-white dark:bg-[var(--background)] shadow-lg z-50 flex flex-col gap-6 pt-24 px-8 transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {navLinks.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="block py-2 text-[var(--dark-text)] dark:text-white font-[Roboto] font-semibold"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}

        {!statusLoading ? (
          <button
            onClick={() => {
              setOpen(false);
              navigate('/signIn');
            }}
            className="bg-[var(--dark-primary)] rounded text-white px-4 py-2 font-[Montserrat] font-semibold cursor-pointer transition-all transform hover:scale-105 hover:bg-[var(--primary)]"
          >
            Sign In
          </button>
        ) : (
          <div className="h-10 rounded-xl bg-black/5 dark:bg-white/10 animate-pulse" aria-busy="true" />
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
