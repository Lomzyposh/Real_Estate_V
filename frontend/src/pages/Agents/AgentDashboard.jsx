import React, { useEffect, useMemo, useRef, useState, useCallback, useContext } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { FiHome, FiBarChart2, FiMenu, FiX } from "react-icons/fi";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../../contexts/LoaderContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import RequireAgent from "../../components/RequireAgent";
import { useAgent } from "../../contexts/AgentContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";

async function approvePropertyRequest(propertyId, approved = true) {
  const res = await fetch(`/api/properties/${propertyId}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ approved }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Failed to update approval");
  return data;
}
async function unapprovePropertyRequest(propertyId) {
  return approvePropertyRequest(propertyId, false);
}

export default function AgentDashboard() {

  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { agentInfo = [], setAgentInfo, agentInfoLoading, agentInfoError } = useAgent();
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [approvingId, setApprovingId] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [targetProperty, setTargetProperty] = useState(null);

  const { setShowLoader } = useLoader();
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const dashboardRef = useRef(null);
  const performanceRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalProperty, setModalProperty] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const [form, setForm] = useState({
    reason: "",
    effectiveDate: "",
    handoverNotes: "",
    altAgentEmail: "",
  });

  const refById = useMemo(
    () => ({ dashboard: dashboardRef, performance: performanceRef }),
    []
  );

  useEffect(() => setShowLoader(!!agentInfoLoading), [agentInfoLoading, setShowLoader]);
  useEffect(() => setFilteredProperties(Array.isArray(agentInfo) ? agentInfo : []), [agentInfo]);

  const scrollTo = (id) => {
    setActive(id);
    refById[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  };

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const handleScroll = () => {
      const midpoint = main.scrollTop + main.clientHeight / 2;
      const mid = (el) => (el ? el.offsetTop + el.clientHeight / 2 : Infinity);
      const d = Math.abs(midpoint - mid(dashboardRef.current));
      const p = Math.abs(midpoint - mid(performanceRef.current));
      const next = d <= p ? "dashboard" : "performance";
      if (next !== active) setActive(next);
    };
    main.addEventListener("scroll", handleScroll);
    return () => main.removeEventListener("scroll", handleScroll);
  }, [active]);

  const propertyId = (p) => p?.property_id || p?.id || p?._id;

  const totalMine = filteredProperties.length;
  const forSale = filteredProperties.filter((p) => /sale/i.test(p?.status || "")).length;
  const forRent = filteredProperties.filter((p) => /rent/i.test(p?.status || "")).length;

  const openReleaseModal = useCallback((property) => {
    setModalProperty(property);
    setForm({ reason: "", effectiveDate: "", handoverNotes: "", altAgentEmail: "" });
    setSubmitMessage("");
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => { setModalOpen(false); setModalProperty(null); }, []);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
  const validate = (values) => {
    const errs = {};
    if (!values.effectiveDate) errs.effectiveDate = "Effective date is required.";
    else if (new Date(values.effectiveDate) < startOfToday) errs.effectiveDate = "Date can’t be in the past.";
    if (!values.reason || values.reason.trim().length < 10) errs.reason = "Please provide at least 10 characters for the reason.";
    if (values.altAgentEmail && !isEmail(values.altAgentEmail)) errs.altAgentEmail = "Enter a valid email address.";
    if (values.handoverNotes && values.handoverNotes.length > 500) errs.handoverNotes = "Handover notes must be 500 characters or fewer.";
    return errs;
  };
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => { const next = { ...prev, [name]: value }; setErrors(validate(next)); return next; });
  };
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));
  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setTouched({ effectiveDate: true, altAgentEmail: true, reason: true, handoverNotes: true });
    if (Object.keys(v).length) {
      const firstKey = ["effectiveDate", "reason", "altAgentEmail", "handoverNotes"].find(k => v[k]);
      if (firstKey) document.getElementById(firstKey)?.focus();
      setSubmitMessage("");
      return;
    }
    setSubmitMessage("Your suggestion has been recorded locally (not submitted).");
  };

  const mockMonthly = [
    { m: "Jan", v: 8 }, { m: "Feb", v: 3 }, { m: "Mar", v: 1 },
    { m: "Apr", v: 4 }, { m: "May", v: 2 }, { m: "Jun", v: 5 },
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

  const isDark = theme === "dark";
  const axisTickColor = isDark ? "#E5E7EB" : "#374151";
  const gridStroke = isDark ? "rgba(148,163,184,0.25)" : "rgba(17,24,39,0.12)";
  const tooltipBg = isDark ? "#0f111a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";
  const tooltipText = isDark ? "#E5E7EB" : "#111827";
  const legendColor = isDark ? "#E5E7EB" : "#111827";

  const doApprove = async (id) => {
    setApprovingId(id);
    const prev = filteredProperties;
    const next = prev.map((x) => (propertyId(x) === id ? { ...x, agentApproved: 1 } : x));
    setFilteredProperties(next);
    setAgentInfo(next);
    try {
      await approvePropertyRequest(id, true);
      toast.success(`Property #${id} has been approved ✅`);
    } catch (err) {
      setFilteredProperties(prev);
      setAgentInfo(prev);
      toast.error(err.message || "Failed to approve property");
    } finally {
      setApprovingId(null);
    }
  };

  const doUnapprove = async (id) => {
    setApprovingId(id);
    const prev = filteredProperties;
    const next = prev.map((x) => (propertyId(x) === id ? { ...x, agentApproved: 0 } : x));
    setFilteredProperties(next);
    setAgentInfo(next);
    try {
      await unapprovePropertyRequest(id);
      toast.success(`Property #${id} has been unapproved ❌`);
    } catch (err) {
      setFilteredProperties(prev);
      setAgentInfo(prev);
      toast.error(err.message || "Failed to unapprove property");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <RequireAgent>
      <div className="flex min-h-screen bg-[#f9f9ff] dark:bg-[#1e1e1e] transition-colors duration-300">
        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#1a1d29]/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen((s) => !s)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle sidebar">
            <FiMenu className="text-[#252525] dark:text-white" />
          </button>
          <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/images/homeLogo.png" alt="Logo" className='w-12 h-12' />
            <h2 className="text-xl text-[var(--text)] dark:text-[var(--primary)] font-bold font-[Montserrat] tracking-wide">NestNova</h2>
          </div>
          <div className="w-8" />
        </div>

        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#252525] border-r border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between transition-transform duration-300",
            "lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          aria-label="Sidebar"
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/images/homeLogo.png" alt="Logo" className='w-12 h-12' />
              <h2 className="text-xl text-[var(--text)] dark:text-[var(--primary)] font-bold font-[Montserrat] tracking-wide">NestNova</h2>
            </div>
            {/* <button
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
            </button> */}
            <nav className="flex flex-col gap-2 text-gray-600 dark:text-gray-300">
              <button
                onClick={() => scrollTo("dashboard")}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors select-none",
                  active === "dashboard"
                    ? "bg-indigo-100 text-green-700 dark:bg-[#1e1e1e] dark:text-green-300 font-medium"
                    : "hover:bg-indigo-50 dark:hover:bg-[#313131]"
                )}
              >
                <FiHome /> Dashboard
              </button>

              <button
                onClick={() => scrollTo("performance")}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors select-none",
                  active === "performance"
                    ? "bg-indigo-100 text-green-700 dark:bg-[#1e1e1e] dark:text-green-300 font-medium"
                    : "hover:bg-indigo-50 dark:hover:bg-[#313131]"
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
              onClick={() => navigate("/")}
              className="group w-full flex items-center justify-center gap-2 px-4 py-2.5
             rounded-xl font-medium text-sm 
             bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100
             dark:from-[#1e1e1e] dark:via-[#252525] dark:to-[#1e1e1e]
             text-green-700 dark:text-green-300
             shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.1)]
             hover:shadow-[0_6px_14px_rgba(0,0,0,0.15)]
             hover:from-indigo-200 hover:to-indigo-100
             dark:hover:from-[#252525] dark:hover:to-[#1e1e1e]
             hover:text-indigo-800 dark:hover:text-indigo-200
             transition-all duration-300 ease-out cursor-pointer"
            >
              <i className="bi bi-arrow-left-circle-fill text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
              <span>Main Page</span>
            </button>

          </div>
        </aside>

        {/* Main */}
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
            className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1e1e1e]/80 shadow-sm backdrop-blur scroll-mt-6"
            style={{ minHeight: "70vh" }}
          >
            <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 rounded-t-2xl bg-white/80 dark:bg-[#1e1e1e]/80 border-b border-gray-100 dark:border-gray-800 backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">Your portfolio at a glance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#252525]/70">
                <div className="text-sm text-gray-600 dark:text-gray-200">Total Properties</div>
                <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{totalMine}</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#252525]/70">
                <div className="text-sm text-gray-600 dark:text-gray-200">For Sale</div>
                <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{forSale}</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#252525]/70">
                <div className="text-sm text-gray-600 dark:text-gray-200">For Rent</div>
                <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{forRent}</div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">Your latest listings</h3>

              {agentInfoLoading ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
              ) : agentInfoError ? (
                <div className="text-sm text-red-500">Failed to load: {String(agentInfoError)}</div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">No properties yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProperties.slice(0, 6).map((p) => {
                    const id = propertyId(p);
                    const approved = p.agentApproved === 1 || p.agentApproved === true;

                    return (
                      <div
                        key={id}
                        className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-[#252525]/70 flex flex-col"
                      >
                        <div className="relative h-40 sm:h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          {p.main_image || p.images?.[0]?.url ? (
                            <img
                              src={p.main_image || p.images?.[0]?.url}
                              alt={p.title || p.name || "Property"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-xs text-gray-600 dark:text-gray-300">
                              No image
                            </div>
                          )}

                          {/* Status chip + quick Approve (tiny) if pending */}
                          <div className="absolute top-2 right-2 flex items-center gap-2">
                            <span
                              className={clsx(
                                "px-2 py-1 rounded-md text-[11px] font-medium border",
                                approved
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/70"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/70"
                              )}
                              title={approved ? "Approved" : "Pending Approval"}
                            >
                              {approved ? "Approved" : "Pending"}
                            </span>

                            {!approved && (
                              <button
                                onClick={() => { setTargetProperty(p); setConfirmVisible(true); }}
                                disabled={approvingId === id}
                                className={clsx(
                                  "px-2 py-1 rounded-md text-[11px] font-medium border transition-colors",
                                  "bg-indigo-50 text-green-700 border-indigo-200 hover:bg-indigo-100",
                                  "dark:bg-green-900 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/50 cursor-pointer",
                                  approvingId === id && "opacity-60 cursor-not-allowed"
                                )}
                                title="Approve this property"
                              >
                                {approvingId === id ? "Approving…" : "Approve"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                            {p.title || p.name || `#${id}`}
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
                              onClick={() => navigate(`/details/${id}`)}
                              className="text-center px-3 py-2 rounded-lg text-sm font-medium dark:bg-[#1e1e1e] hover:bg-indigo-50 dark:hover:bg-[#161616] transition-colors text-gray-900 dark:text-gray-100"
                            >
                              View
                            </button>

                            {/* Secondary action switches: Approve (if pending) / Suggest Release (if approved) */}
                            {approved ? (
                              <button
                                onClick={() => { setTargetProperty(p); setConfirmVisible(true); }}
                                disabled={approvingId === id}
                                className={clsx(
                                  "text-center px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                                  "border-red-200 hover:bg-red-50",
                                  "dark:border-red-800 dark:hover:bg-red-900/30",
                                  approvingId === id && "opacity-60 cursor-not-allowed",
                                  "text-gray-900 dark:text-gray-100"
                                )}
                                title="Unapprove (Release)"
                              >
                                Suggest Release
                              </button>
                            ) : (
                              <button
                                onClick={() => { setTargetProperty(p); setConfirmVisible(true); }}
                                disabled={approvingId === id}
                                className={clsx(
                                  "text-center px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                                  "bg-indigo-50 text-green-700 border-indigo-200 hover:bg-indigo-100",
                                  "dark:bg-transparent dark:text-green-300 dark:hover:bg-green-900/50",
                                  approvingId === id && "opacity-60 cursor-not-allowed"
                                )}
                                title="Approve this property"
                              >
                                {approvingId === id ? "Approving…" : "Approve"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section
            id="performance"
            ref={performanceRef}
            className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#252525]/80 shadow-sm backdrop-blur scroll-mt-6"
            style={{ minHeight: "60vh" }}
          >
            <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 rounded-t-2xl bg-white/80 dark:bg-[#1e1e1e]/80 border-b border-gray-100 dark:border-gray-800 backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">Quick stats and activity trends</p>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#252525]/70">
                  <div className="text-sm text-gray-600 dark:text-gray-200">Active Listings</div>
                  <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{filteredProperties.length}</div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#252525]/70">
                  <div className="text-sm text-gray-600 dark:text-gray-200">Avg. Days on Market</div>
                  <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                    {filteredProperties.length ? Math.max(7, Math.min(45, 12 + filteredProperties.length)) : 0}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#252525]/70">
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
                          contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderWidth: 1 }}
                          labelStyle={{ color: tooltipText }}
                          itemStyle={{ color: tooltipText }}
                        />
                        <Bar dataKey="v" name="Updates" fill="#4CAF50" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#252525]/70">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-200">Listing Mix</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">By status</div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderWidth: 1 }}
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
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#252525] shadow-lg">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Suggest Release of Agency</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Property: <span className="font-mono">{propertyId(modalProperty)}</span>
                  </p>
                </div>
                <button onClick={closeModal} aria-label="Close" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100">
                  <FiX />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-4 sm:p-5 space-y-4" noValidate>
                {/* inputs omitted (local-only sample) */}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-gray-900 dark:text-gray-100">
                    Submit (Local Only)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmVisible && targetProperty && (
          <ConfirmDialog
            message={
              (targetProperty.agentApproved === 1 || targetProperty.agentApproved === true)
                ? `Are you sure you want to unapprove (release) property #${propertyId(targetProperty)}?`
                : `Approve property #${propertyId(targetProperty)}?`
            }
            onConfirm={async () => {
              const id = propertyId(targetProperty);
              const isApproved = targetProperty.agentApproved === 1 || targetProperty.agentApproved === true;
              setConfirmVisible(false);
              if (isApproved) {
                await doUnapprove(id);
              } else {
                await doApprove(id);
              }
              setTargetProperty(null);
            }}
            onCancel={() => {
              setConfirmVisible(false);
              setTargetProperty(null);
            }}
          />
        )}

      </div>
    </RequireAgent>
  );
}
