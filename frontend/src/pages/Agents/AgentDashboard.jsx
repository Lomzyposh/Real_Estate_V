// src/layouts/DashboardScrollSpyFixed.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback, useContext } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";

import { FiHome, FiBarChart2, FiMenu, FiX } from "react-icons/fi";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../contexts/PropertiesContext";
import { useLoader } from "../../contexts/LoaderContext";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function AgentDashboard() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { properties = [], propertiesLoading } = useProperties();
  const [filteredProperties, setFilteredProperties] = useState([]);
  const { setShowLoader } = useLoader();
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const dashboardRef = useRef(null);
  const performanceRef = useRef(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProperty, setModalProperty] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  // Local-only form state
  const [form, setForm] = useState({
    reason: "",
    effectiveDate: "",
    handoverNotes: "",
    altAgentEmail: "",
  });

  // Detect Tailwind dark mode (class on <html>)
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const obs = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const refById = useMemo(
    () => ({
      dashboard: dashboardRef,
      performance: performanceRef,
    }),
    []
  );

  useEffect(() => setShowLoader(!!propertiesLoading), [propertiesLoading, setShowLoader]);

  useEffect(() => {
    const agentId = user?.userId ?? user?.id ?? user?._id;
    if (!agentId) {
      setFilteredProperties([]);
      return;
    }
    const mine = properties.filter((p) => {
      const candidates = [
        p.agentId,
        p.agent_id,
        p.agent?.userId,
        p.ownerId,
        p.userId,
        p.createdBy,
      ].filter(Boolean);
      return candidates.some((cid) => String(cid) === String(agentId));
    });
    setFilteredProperties(mine);
  }, [properties, user]);

  const scrollTo = (id) => {
    setActive(id);
    const node = refById[id]?.current;
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false); // auto-close on mobile after clicking a link
  };

  // Scroll spy
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      const midpoint = main.scrollTop + main.clientHeight / 2;

      const getMid = (el) => (el ? el.offsetTop + el.clientHeight / 2 : Infinity);
      const dMid = getMid(dashboardRef.current);
      const pMid = getMid(performanceRef.current);

      const distances = [
        { id: "dashboard", dist: Math.abs(midpoint - dMid) },
        { id: "performance", dist: Math.abs(midpoint - pMid) },
      ].sort((a, b) => a.dist - b.dist);

      const closest = distances[0]?.id;
      if (closest && closest !== active) setActive(closest);
    };

    main.addEventListener("scroll", handleScroll);
    return () => main.removeEventListener("scroll", handleScroll);
  }, [active]);

  const totalMine = filteredProperties.length;
  const forSale = filteredProperties.filter((p) => /sale/i.test(p?.status || "")).length;
  const forRent = filteredProperties.filter((p) => /rent/i.test(p?.status || "")).length;

  // ---- Modal helpers ----
  const openReleaseModal = useCallback((property) => {
    setModalProperty(property);
    setForm({
      reason: "",
      effectiveDate: "",
      handoverNotes: "",
      altAgentEmail: "",
    });
    setSubmitMessage("");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalProperty(null);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);
  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Today at 00:00 to compare dates
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Basic email regex
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

  // Validator
  const validate = (values) => {
    const errs = {};
    if (!values.effectiveDate) {
      errs.effectiveDate = "Effective date is required.";
    } else {
      const d = new Date(values.effectiveDate);
      if (d < startOfToday) errs.effectiveDate = "Date can’t be in the past.";
    }

    if (!values.reason || values.reason.trim().length < 10) {
      errs.reason = "Please provide at least 10 characters for the reason.";
    }

    if (values.altAgentEmail && !isEmail(values.altAgentEmail)) {
      errs.altAgentEmail = "Enter a valid email address.";
    }

    if (values.handoverNotes && values.handoverNotes.length > 500) {
      errs.handoverNotes = "Handover notes must be 500 characters or fewer.";
    }

    return errs;
  };


  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      setErrors(validate(next));
      return next;
    });
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setTouched({
      effectiveDate: true,
      altAgentEmail: true,
      reason: true,
      handoverNotes: true,
    });

    if (Object.keys(v).length) {
      const order = ["effectiveDate", "reason", "altAgentEmail", "handoverNotes"];
      const first = order.find((k) => v[k]);
      if (first) document.getElementById(first)?.focus();
      setSubmitMessage("");
      return;
    }

    setSubmitMessage("Your suggestion has been recorded locally (not submitted).");
  };


  const propertyId = (p) => p?.property_id || p?.id || p?._id;

  const mockMonthly = [
    { m: "Jan", v: 2 },
    { m: "Feb", v: 3 },
    { m: "Mar", v: 1 },
    { m: "Apr", v: 4 },
    { m: "May", v: 2 },
    { m: "Jun", v: 5 },
  ];

  const rentCount = filteredProperties.filter(p => /rent/i.test(p?.status || "")).length;
  const saleCount = filteredProperties.filter(p => /sale/i.test(p?.status || "")).length;
  const otherCount = Math.max(filteredProperties.length - rentCount - saleCount, 0);

  const pieData = [
    { name: "For Rent", value: rentCount },
    { name: "For Sale", value: saleCount },
    ...(otherCount ? [{ name: "Other", value: otherCount }] : []),
  ];

  const PIE_COLORS = ["#22C55E", "#6366F1", "#F59E0B"];

  // Recharts dark-mode styles
  const axisTickColor = isDark ? "#E5E7EB" /* slate-200 */ : "#374151" /* gray-700 */;
  const gridStroke = isDark ? "rgba(148,163,184,0.25)" /* slate-400/25 */ : "rgba(17,24,39,0.12)" /* gray-900/12 */;
  const tooltipBg = isDark ? "#0f111a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";
  const tooltipText = isDark ? "#E5E7EB" : "#111827";
  const legendColor = isDark ? "#E5E7EB" : "#111827";




  return (
    <div className="flex min-h-screen bg-[#f9f9ff] dark:bg-[#0f111a] transition-colors duration-300">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#1a1d29]/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen((s) => !s)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-[#252525] dark:text-white" />
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
          aria-label="Home"
        >
          <img src="/images/homeLogo.png" alt="NestNova logo" className="w-8 h-8" />
          <span className="text-lg font-[unbounded] font-bold text-green-400">NestNova</span>
        </button>
        <div className="w-8" />
      </div>

      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#1a1d29] border-r border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col gap-5">
          <button
            onClick={() => navigate("/")}
            className="hidden lg:flex items-center gap-2 p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <img src="/images/homeLogo.png" alt="NestNova logo" className="w-9 h-9" />
            <h1 className="text-xl font-[unbounded] font-bold text-green-400">NestNova</h1>
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
          <nav className="flex flex-col gap-2 text-gray-600 dark:text-gray-300">
            <button
              onClick={() => scrollTo("dashboard")}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors select-none",
                active === "dashboard"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium"
                  : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              )}
            >
              <FiHome /> Dashboard
            </button>

            <button
              onClick={() => scrollTo("performance")}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors select-none",
                active === "performance"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium"
                  : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              )}
            >
              <FiBarChart2 /> Performance
            </button>
          </nav>
        </div>

        <div className="flex gap-2 items-center justify-between lg:block">
          <button
            className="lg:hidden px-4 py-2 rounded-lg text-sm dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            Close
          </button>

          <button
            className="w-full gap-3 px-4 py-2 rounded-lg transition-color select-none text-sm bg-indigo-900/30 hover:bg-red-900/10 text-gray-600 dark:text-gray-300 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left-circle-fill"></i> Main Page
          </button>
        </div>
      </aside>

      <main
        ref={mainRef}
        className={clsx(
          "flex-1 p-4 sm:p-8 text-gray-700 dark:text-gray-200 transition-colors",
          "lg:ml-64",
          "pt-16 lg:pt-0"
        )}
      >
        <section
          id="dashboard"
          ref={dashboardRef}
          className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#151826]/80 shadow-sm backdrop-blur scroll-mt-6"
          style={{ minHeight: "70vh" }}
        >
          <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 rounded-t-2xl bg-white/80 dark:bg-[#151826]/80 border-b border-gray-100 dark:border-gray-800 backdrop-blur">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-300">Your portfolio at a glance</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
              <div className="text-sm text-gray-600 dark:text-gray-200">Total Properties</div>
              <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{totalMine}</div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
              <div className="text-sm text-gray-600 dark:text-gray-200">For Sale</div>
              <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{forSale}</div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
              <div className="text-sm text-gray-600 dark:text-gray-200">For Rent</div>
              <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{forRent}</div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">Your latest listings</h3>

            {propertiesLoading ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">No properties yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProperties.slice(0, 6).map((p) => (
                  <div
                    key={propertyId(p)}
                    className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-[#121426]/70 flex flex-col"
                  >
                    <div className="h-40 sm:h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {p.cover_img || p.images?.[0]?.url ? (
                        <img
                          src={p.cover_img || p.images?.[0]?.url}
                          alt={p.title || p.name || "Property"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-xs text-gray-600 dark:text-gray-300">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                        {p.title || p.name || `#${propertyId(p)}`}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">
                        {(p.zip_code && p.street) ? `${p.zip_code}, ${p.street}` : p.location || "—"}
                      </div>
                      <div className="mt-3 mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200">
                          {p.status || "Unknown"}
                        </span>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/details/${propertyId(p)}`)}
                          className="text-center px-3 py-2 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-gray-900 dark:text-gray-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openReleaseModal(p)}
                          className="text-center px-3 py-2 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-gray-900 dark:text-gray-100"
                        >
                          Suggest Release
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Performance */}
        <section
          id="performance"
          ref={performanceRef}
          className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#151826]/80 shadow-sm backdrop-blur scroll-mt-6"
          style={{ minHeight: "60vh" }}
        >
          <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 rounded-t-2xl bg-white/80 dark:bg-[#151826]/80 border-b border-gray-100 dark:border-gray-800 backdrop-blur">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance</h2>
            <p className="text-sm text-gray-500 dark:text-gray-300">Quick stats and activity trends</p>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
                <div className="text-sm text-gray-600 dark:text-gray-200">Active Listings</div>
                <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{filteredProperties.length}</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
                <div className="text-sm text-gray-600 dark:text-gray-200">Avg. Days on Market</div>
                <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {filteredProperties.length ? Math.max(7, Math.min(45, 12 + filteredProperties.length)) : 0}
                </div>
              </div>
            </div>

            {/* Right: charts */}
            <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Bar Chart Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-200">Monthly Activity</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">Listings updated / month</div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockMonthly} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                      <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                      <XAxis dataKey="m" tick={{ fill: axisTickColor }} />
                      <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipText,
                          borderWidth: 1,
                        }}
                        labelStyle={{ color: tooltipText }}
                        itemStyle={{ color: tooltipText }}
                      />
                      <Bar dataKey="v" name="Updates" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-200">Listing Mix</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">By status</div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipText,
                          borderWidth: 1,
                        }}
                        labelStyle={{ color: tooltipText }}
                        itemStyle={{ color: tooltipText }}
                      />
                      <Legend wrapperStyle={{ color: legendColor }} />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        // Disable default labels to avoid black text on dark mode.
                        label={false}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center px-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121426] shadow-lg">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Suggest Release of Agency
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Property: <span className="font-mono">{propertyId(modalProperty)}</span>
                </p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-4 sm:p-5 space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Effective Date */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="effectiveDate" className="text-sm text-gray-700 dark:text-gray-200">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="effectiveDate"
                    name="effectiveDate"
                    type="date"
                    value={form.effectiveDate}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={!!(touched.effectiveDate && errors.effectiveDate)}
                    aria-describedby={touched.effectiveDate && errors.effectiveDate ? "err-effectiveDate" : undefined}
                    className={
                      "w-full rounded-lg px-3 py-2 text-sm outline-none " +
                      "bg-white dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 " +
                      (touched.effectiveDate && errors.effectiveDate
                        ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500")
                    }
                  />
                  {touched.effectiveDate && errors.effectiveDate && (
                    <p id="err-effectiveDate" className="text-xs text-red-600 mt-1">
                      {errors.effectiveDate}
                    </p>
                  )}
                </div>

                {/* Alternative Agent Email (optional) */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="altAgentEmail" className="text-sm text-gray-700 dark:text-gray-200">
                    Alternative Agent Email (optional)
                  </label>
                  <input
                    id="altAgentEmail"
                    name="altAgentEmail"
                    type="email"
                    value={form.altAgentEmail}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="agent@example.com"
                    aria-invalid={!!(touched.altAgentEmail && errors.altAgentEmail)}
                    aria-describedby={touched.altAgentEmail && errors.altAgentEmail ? "err-altAgentEmail" : undefined}
                    className={
                      "w-full rounded-lg px-3 py-2 text-sm outline-none " +
                      "bg-white dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 " +
                      (touched.altAgentEmail && errors.altAgentEmail
                        ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500")
                    }
                  />
                  {touched.altAgentEmail && errors.altAgentEmail && (
                    <p id="err-altAgentEmail" className="text-xs text-red-600 mt-1">
                      {errors.altAgentEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="reason" className="text-sm text-gray-700 dark:text-gray-200">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  value={form.reason}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="Provide a brief reason for releasing this agency…"
                  aria-invalid={!!(touched.reason && errors.reason)}
                  aria-describedby={touched.reason && errors.reason ? "err-reason" : undefined}
                  className={
                    "w-full rounded-lg px-3 py-2 text-sm outline-none resize-y " +
                    "bg-white dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 " +
                    (touched.reason && errors.reason
                      ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500")
                  }
                />
                {touched.reason && errors.reason && (
                  <p id="err-reason" className="text-xs text-red-600 mt-1">
                    {errors.reason}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="handoverNotes" className="text-sm text-gray-700 dark:text-gray-200">
                  Handover Notes (optional)
                </label>
                <textarea
                  id="handoverNotes"
                  name="handoverNotes"
                  rows={3}
                  value={form.handoverNotes}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="Anything the next agent or owner should know…"
                  aria-invalid={!!(touched.handoverNotes && errors.handoverNotes)}
                  aria-describedby={touched.handoverNotes && errors.handoverNotes ? "err-handoverNotes" : undefined}
                  className={
                    "w-full rounded-lg px-3 py-2 text-sm outline-none resize-y " +
                    "bg-white dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 " +
                    (touched.handoverNotes && errors.handoverNotes
                      ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500")
                  }
                />
                {touched.handoverNotes && errors.handoverNotes && (
                  <p id="err-handoverNotes" className="text-xs text-red-600 mt-1">
                    {errors.handoverNotes}
                  </p>
                )}
              </div>

              {submitMessage && (
                <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                  {submitMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-gray-900 dark:text-gray-100"
                >
                  Submit (Local Only)
                </button>
              </div>
            </form>
          </div>
        </div>

      )}
    </div>
  );
}