// components/Footer.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const location = useLocation();
    const hideNav = location.pathname === "/signIn" || location.pathname === "/signUp" || location.pathname === "/agentDashboard" || location.pathname === "/adminDashboard";

    if (hideNav) return null;
    return (
        <footer className="relative bg-gray-50 dark:bg-[#0e111d] border-t border-gray-200 dark:border-gray-800">
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] dark:opacity-[0.12]"
                viewBox="0 0 1440 400"
                preserveAspectRatio="none"
            >
                <path d="M0 360 L320 200 L640 300 L960 160 L1440 260" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
                <div className="grid gap-10 sm:gap-12 md:grid-cols-3 lg:grid-cols-4">

                    <div className="space-y-5">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <img src="/images/homeLogo.png" alt="NestNova" className="h-8 w-8 rounded-md" />
                            <span className="text-2xl font-extrabold font-[Prata] tracking-tight text-gray-900 dark:text-gray-100">
                                NestNova
                            </span>
                        </Link>

                        <p className="text-sm leading-6 text-gray-600 dark:text-gray-300 max-w-xs">
                            Discover your dream property — buy, sell, or rent with trusted agents and verified listings.
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-gray-700 dark:text-gray-300">
                            <a href="#" aria-label="X (Twitter)"
                                className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 dark:border-gray-800 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition">
                                <FaXTwitter />
                            </a>
                            <a href="#" aria-label="LinkedIn"
                                className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 dark:border-gray-800 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition">
                                <FaLinkedinIn />
                            </a>
                            <a href="#" aria-label="Instagram"
                                className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 dark:border-gray-800 hover:border-pink-500/40 hover:text-pink-600 dark:hover:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 transition">
                                <FaInstagram />
                            </a>
                            <a href="#" aria-label="Facebook"
                                className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 dark:border-gray-800 hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition">
                                <FaFacebookF />
                            </a>
                        </div>

                        <button
                            onClick={scrollTop}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 rounded-md px-1 py-1"
                        >
                            <span className="transition-transform group-hover:-translate-y-0.5">↑</span>
                            Back to top
                        </button>
                    </div>

                    {/* Columns */}
                    <FooterCol
                        title="Pages"
                        links={[
                            { to: "/", label: "Home" },
                            { to: "/profile", label: "Profile" },
                            { to: "/contact", label: "Contact" },
                        ]}
                    />
                    <FooterCol
                        title="Explore"
                        links={[
                            { to: "/allProperties", label: "Buy a Home" },
                            { to: "/sell", label: "Sell a Home" },
                            { to: "/allProperties?status=rent", label: "Rent a Home" },
                            { to: "/agents", label: "Find an Agent" },
                        ]}
                    />
                    <FooterCol
                        title="Legal"
                        links={[
                            { to: "/privacy", label: "Privacy Policy" },
                            { to: "/terms", label: "Terms of Service" },
                            { to: "/security", label: "Security" },
                        ]}
                    />
                </div>
            </div>

            {/* Bottom accent bar */}
            <div className="relative">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-400">
                    © {new Date().getFullYear()} NestNova. All rights reserved.
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400/70 opacity-70" />
            </div>
        </footer>
    );
}

/* ----------------- helpers ----------------- */
function FooterCol({ title, links }) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">{title}</h4>
            <ul className="space-y-2">
                {links.map((l) => (
                    <li key={l.to}>
                        <FooterLink to={l.to}>{l.label}</FooterLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FooterLink({ to, children }) {
    return (
        <Link
            to={to}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400/40 rounded-sm"
        >
            {children}
        </Link>
    );
}
