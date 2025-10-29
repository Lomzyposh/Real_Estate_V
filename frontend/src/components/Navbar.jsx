// src/components/Navbar.jsx
import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import clsx from "clsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoader } from "../contexts/LoaderContext";
import ImportPropertiesButton from "./ImportPropertiesButton";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/allProperties", label: "Buy" },
  { to: "/sell", label: "Sell" },
  { to: "/allProperties?status=rent", label: "Rent" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [expandMenu, setExpandMenu] = useState(false);
  const { user, logout, statusLoading } = useAuth();
  const { setShowLoader } = useLoader();
  const hideNav = location.pathname === "/signIn" || location.pathname === "/signUp" || location.pathname === "/agentDashboard" || location.pathname === "/adminDashboard";

  useEffect(() => setShowLoader(Boolean(statusLoading)), [statusLoading, setShowLoader]);


  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

  if (hideNav) return null;

  const DashLink = () => {
    const { user } = useAuth();

    if (!user) return null;

    let link = null;

    switch (user.role) {
      case "admin":
        link = "/adminDashboard";
        break;
      case "agent":
        link = "/agentDashboard";
        break;
      default:
        return null;
    }

    return (
      <Link
        to={link}
        role="menuitem"
        className="block px-4 py-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
      >
        Dashboard
      </Link>
    );
  }


  return (
    <nav
      className={clsx(
        "fixed inset-x-0 top-0 z-50 p-2",
        "border-b border-black/5 dark:border-white/10",

        "bg-[var(--background)] dark:bg-[var(--dark-background)]",

        "md:supports-[backdrop-filter]:bg-[var(--background)]/70",
        "md:supports-[backdrop-filter]:dark:bg-[var(--dark-background)]/60",
        "md:backdrop-blur-md"
      )}
      role="navigation"
      aria-label="Primary"
    >

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
          <div className="flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}>
            <img src="/images/homeLogo.png" alt="Logo" className='w-12 h-12' />
            <h2 className="text-xl text-[var(--text)] dark:text-[var(--primary)] font-bold font-[Prata] tracking-wide">NestNova</h2>
          </div>
          {/* <ImportPropertiesButton fileUrl="/data/property.json" batchSize={100} /> */}

          <ul className="hidden md:flex items-center gap-6 lg:gap-10 font-semibold">
            {navLinks.map((link) => {
              return (
                <li
                  key={link.to}
                  className={clsx(
                    "relative font-[Quicksand] transition-colors duration-300",
                    "text-[var(--dark-text)] dark:text-white",
                    "before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:-bottom-1 before:h-[2px] before:w-0 before:bg-[var(--dark-primary)] dark:before:bg-[var(--primary)] before:transition-all before:duration-300 hover:before:w-full",
                    
                  )}
                >
                  <Link to={link.to} className={clsx("py-2",isActive(link.to)
                      ? "text-orange-400"
                      : "hover:text-[var(--dark-primary)] dark:hover:text-[var(--primary)]")} aria-current={isActive(link.to) ? "page" : undefined}>
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              title={theme === "light" ? "Toggle Dark Mode" : "Toggle Light Mode"}
              className={clsx(
                "w-9 h-9 sm:w-10 sm:h-10 grid place-items-center rounded-full",
                "bg-transparent text-[var(--primary)]",
                "shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)]",
                "duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
              )}
              onClick={() => navigate('/allproperties?favorite=true')}
            >
              <i className="bi bi-bookmark-fill text-amber-400 text-xl"></i>
            </button>
            <button
              onClick={toggleTheme}
              title={theme === "light" ? "Toggle Dark Mode" : "Toggle Light Mode"}
              className={clsx(
                "w-9 h-9 sm:w-10 sm:h-10 grid place-items-center rounded-full",
                "bg-[#252525] dark:bg-[#fff] text-[var(--primary)]",
                "shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)]",
                "duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
              )}
            >
              <i className={theme === "light" ? "bi bi-moon" : "bi bi-sun"} />
            </button>


            {statusLoading ? (
              <div className="hidden md:block h-10 min-w-[240px] lg:min-w-[260px] rounded-xl bg-black/5 dark:bg-white/10 animate-pulse" />
            ) : user ? (
              <div className="relative group hidden md:block">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded="false"
                  className="flex items-center justify-between gap-3 cursor-pointer bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100 rounded-xl border border-black/5 dark:border-white/10 shadow-sm px-3 py-2 min-w-[240px] lg:min-w-[260px]"
                  onClick={() => setExpandMenu(prev => !prev)}
                >
                  <div className="flex items-center gap-3 min-w-0 ">
                    <img
                      src={user.profileUrl || "/images/blank-profileImg.webp"}
                      alt={user.displayName || user.name || "Profile"}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="leading-tight min-w-0 text-left">
                      <div className="text-[15px] font-semibold truncate">{user.name || user.userId || "John Doe"}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email || "doe@gmail.com"}</div>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" className={`w-5 h-5 ${expandMenu && 'rotate-180'} transition-all duration-100`} fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div
                  role="menu"
                  className={`absolute right-0 mt-2 w-48 select-none rounded-xl border bg-white dark:bg-[#252525] border-black/5 dark:border-white/10 backdrop-blur shadow-lg py-1 ${expandMenu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'translate-y-1 opacity-0 pointer-events-none'}  transition-all duration-200 z-50`}
                >
                  <DashLink />

                  <Link
                    to="/profile"
                    role="menuitem"
                    className="block px-4 py-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
                  >
                    My Profile
                  </Link>

                  <button
                    role="menuitem"
                    className="block w-full text-black dark:text-white text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/signIn")}
                className="hidden md:inline-block rounded-full px-4 py-2 font-[Montserrat] font-semibold text-[var(--on-primary)] bg-[var(--primary)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.35),0_6px_10px_rgba(0,0,0,0.25)] transition-all duration-150 hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--surface)]"
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
              <i className={`bi ${open ? "bi-x-lg" : "bi-list"} text-2xl`} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={clsx(
          "fixed top-0 right-0 h-full w-[84%] max-w-sm z-50",
          "bg-[var(--background)] dark:bg-[var(--dark-background)] shadow-lg",
          "flex flex-col gap-6 pt-20 sm:pt-24 px-6 sm:px-8 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3">
          <img
            src={(user && user.profileUrl) || "/images/blank-profileImg.webp"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--dark-text)] dark:text-white truncate">
              {(user && (user.name || user.userId)) || "Guest"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {(user && user.email) || "Welcome to NestNova"}
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={clsx(
                  "block py-3 px-3 rounded-lg font-[Roboto] font-semibold",
                  "text-[var(--dark-text)] dark:text-white",
                  isActive(link.to) ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"
                )}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.to) ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {!statusLoading ? (
          user ? (
            <div className="mt-auto grid grid-cols-2 gap-3">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="text-center rounded-lg px-4 py-2 font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="rounded-lg px-4 py-2 font-semibold text-white bg-[var(--dark-primary)] hover:bg-[var(--primary)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                navigate("/signIn");
              }}
              className="mt-auto bg-[var(--dark-primary)] rounded-lg text-white px-4 py-3 font-[Montserrat] font-semibold hover:bg-[var(--primary)]"
            >
              Sign In
            </button>
          )
        ) : (
          <div className="h-10 rounded-xl bg-black/5 dark:bg-white/10 animate-pulse" aria-busy="true" />
        )}
      </aside>
    </nav>
  );
}
