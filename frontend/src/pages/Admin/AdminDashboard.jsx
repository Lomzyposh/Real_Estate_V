import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { FiHome, FiUsers, FiUserCheck, FiMap, FiMenu } from "react-icons/fi";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import RequireAdmin from "../../components/RequireAdmin";
import { useAdmin } from "../../contexts/AdminContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";

/* Fallback request helper (used by confirm action if you don't want to rely on context) */
async function togglePublishedRequest(propertyId, published) {
  const res = await fetch(`/api/admin/properties/${propertyId}/published`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ published }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to update publish state");
  return data; // return updated property row
}

export default function AdminDashboard() {
  ;
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);

  const overviewRef = useRef(null);
  const usersRef = useRef(null);
  const agentsRef = useRef(null);
  const propertiesRef = useRef(null);

  const refById = useMemo(
    () => ({ overview: overviewRef, users: usersRef, agents: agentsRef, properties: propertiesRef }),
    []
  );

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { users, agents, properties, loading, error, totals, refetch, togglePublished } = useAdmin();

  const isDark = theme === "dark";
  const axisTickColor = isDark ? "#E5E7EB" : "#374151";
  const gridStroke = isDark ? "rgba(148,163,184,0.25)" : "rgba(17,24,39,0.12)";
  const tooltipBg = isDark ? "#0f111a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";
  const tooltipText = isDark ? "#E5E7EB" : "#111827";
  const legendColor = isDark ? "#E5E7EB" : "#111827";
  const PIE_COLORS = ["#22C55E", "#6366F1", "#F59E0B", "#EF4444"];

  const mockMonthly = [
    { m: "Jan", v: Math.max(1, Math.floor(users.length * 0.1)) },
    { m: "Feb", v: Math.max(1, Math.floor(users.length * 0.08)) },
    { m: "Mar", v: Math.max(1, Math.floor(users.length * 0.12)) },
    { m: "Apr", v: Math.max(1, Math.floor(users.length * 0.07)) },
    { m: "May", v: Math.max(1, Math.floor(users.length * 0.13)) },
    { m: "Jun", v: Math.max(1, Math.floor(users.length * 0.09)) },
  ];

  const pieData = [
    { name: "For Rent", value: totals.forRent },
    { name: "For Sale", value: totals.forSale },
    { name: "Pending", value: totals.pending },
    { name: "Other", value: Math.max(totals.totalProps - totals.forRent - totals.forSale - totals.pending, 0) },
  ];

  const scrollTo = (id) => {
    setActive(id);
    refById[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  };

  // Scroll spy
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const handleScroll = () => {
      const midpoint = main.scrollTop + main.clientHeight / 2;
      const mid = (el) => (el ? el.offsetTop + el.clientHeight / 2 : Infinity);
      const dists = [
        { id: "overview", dist: Math.abs(midpoint - mid(overviewRef.current)) },
        { id: "users", dist: Math.abs(midpoint - mid(usersRef.current)) },
        { id: "agents", dist: Math.abs(midpoint - mid(agentsRef.current)) },
        { id: "properties", dist: Math.abs(midpoint - mid(propertiesRef.current)) },
      ].sort((a, b) => a.dist - b.dist);
      const closest = dists[0]?.id;
      if (closest && closest !== active) setActive(closest);
    };
    main.addEventListener("scroll", handleScroll);
    return () => main.removeEventListener("scroll", handleScroll);
  }, [active]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [targetProperty, setTargetProperty] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const propertyId = (p) => p?.property_id || p?.id || p?._id;

  return (
    <RequireAdmin>
      <div className="flex min-h-screen bg-[#f9f9ff] dark:bg-[#0f111a] transition-colors duration-300">
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#1a1d29]/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen((s) => !s)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FiMenu className="text-[#252525] dark:text-white" />
          </button>
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <img src="/images/homeLogo.png" alt="Logo" className="w-12 h-12" />
            <h2 className="text-xl dark:text-[var(--primary)] font-bold font-[Prata] tracking-wide">NestNova</h2>
          </div>
          <div className="w-8" />
        </div>

        <aside
          className={clsx(
            "fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#1a1d29] border-r border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col gap-5">
            <div onClick={() => navigate("/")} className="flex items-center justify-center gap-2 cursor-pointer">
              <img src="/images/homeLogo.png" alt="Logo" className="w-12 h-12" />
              <h2 className="text-xl dark:text-[var(--primary)] font-bold font-[Montserrat] tracking-wide">NestNova</h2>
            </div>

            <nav className="flex flex-col gap-2 text-gray-600 dark:text-gray-300">
              <SideItem id="overview" active={active} onClick={scrollTo} icon={<FiHome />} label="Overview" />
              <SideItem id="properties" active={active} onClick={scrollTo} icon={<FiMap />} label="Properties" />
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
             dark:from-indigo-950/40 dark:via-indigo-900/40 dark:to-indigo-950/40
             text-indigo-700 dark:text-indigo-300
             shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.1)]
             hover:shadow-[0_6px_14px_rgba(0,0,0,0.15)]
             hover:from-indigo-200 hover:to-indigo-100
             dark:hover:from-indigo-900/60 dark:hover:to-indigo-950/60
             hover:text-indigo-800 dark:hover:text-indigo-200
             transition-all duration-300 ease-out"
            >
              <i className="bi bi-arrow-left-circle-fill text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
              <span>Main Page</span>
            </button>

          </div>
        </aside>

        {/* Main content */}
        <main
          ref={mainRef}
          className="flex-1 p-4 sm:p-8 text-gray-700 dark:text-gray-200 transition-colors lg:ml-64 pt-16 lg:pt-0"
        >
          <section id="overview" ref={overviewRef}>
            <StickyTitle title="Overview" subtitle="Platform at a glance" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <KPI title="Total Users" value={totals.totalUsers} />
              <KPI title="Total Agents" value={totals.totalAgents} />
              <KPI title="Total Properties" value={totals.totalProps} />
            </div>
          </section>

          {/* Properties */}
          <section id="properties" ref={propertiesRef} className="mt-8">
            <StickyTitle title="Properties" subtitle="All listings across the platform" />
            <div className="p-4 sm:p-6">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{String(error)}</p>
              ) : properties.length === 0 ? (
                <p>No properties found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {properties.map((p) => {
                    const id = propertyId(p);
                    // 👉 approved state mirrors PUBLISHED
                    const approved =
                      p.published === true || p.published === 1 || p.published === "1";
                    const cover = p.main_image || p.images?.[0]?.url;

                    return (
                      <div key={id} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-[#121426]/70 flex flex-col">
                        <div className="h-40 sm:h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          {cover ? (
                            <img src={cover} alt="Property" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-xs text-gray-600 dark:text-gray-300">No image</div>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="text-sm font-semibold truncate">{p.title || `#${id}`}</div>
                          <div className="text-xs text-gray-500 truncate mt-1">{p.street || p.location || "—"}</div>

                          <div className="mt-3 mb-4 flex items-center gap-2">
                            <span
                              className={clsx(
                                "inline-flex items-center px-2 py-1 rounded-md border text-[11px] font-medium",
                                approved
                                  ? "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                  : "border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                              )}
                            >
                              {approved ? "Published" : "Unpublished"}
                            </span>
                            {p.status && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md border border-gray-300 text-[11px]">
                                {p.status}
                              </span>
                            )}
                          </div>

                          <div className="mt-auto grid grid-cols-2 gap-2">
                            <button
                              onClick={() => navigate(`/details/${id}`)}
                              className="px-3 py-2 rounded-lg text-sm border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            >
                              View
                            </button>

                            {/* Approve/Unpublish driven by `published` */}
                            <button
                              onClick={() => {
                                setTargetProperty(p);
                                setConfirmVisible(true);
                              }}
                              disabled={busyId === id}
                              className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                                approved
                                  ? "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/50",
                                busyId === id && "opacity-60 cursor-not-allowed"
                              )}
                            >
                              {busyId === id ? (approved ? "Unpublishing…" : "Publishing…") : (approved ? "Unpublish" : "Publish")}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Confirm Dialog */}
      {confirmVisible && targetProperty && (
        <ConfirmDialog
          message={
            (targetProperty.published === true || targetProperty.published === 1 || targetProperty.published === "1")
              ? `Unpublish property #${propertyId(targetProperty)} so it becomes inaccessible to users?`
              : `Publish property #${propertyId(targetProperty)} so it becomes accessible to users?`
          }
          onConfirm={async (ok) => {
            if (!ok) { setConfirmVisible(false); setTargetProperty(null); return; }
            const id = propertyId(targetProperty);
            const currApproved =
              targetProperty.published === true || targetProperty.published === 1 || targetProperty.published === "1";
            const nextPublished = !currApproved;

            setBusyId(id);
            setConfirmVisible(false);

            try {
              // Use context action if provided; fall back to direct request helper
              if (typeof togglePublished === "function") {
                await togglePublished(id, nextPublished);
              } else {
                await togglePublishedRequest(id, nextPublished);
              }
              toast.success(`Property #${id} ${nextPublished ? "published" : "unpublished"} ✅`);
              await refetch();
            } catch (err) {
              toast.error(err?.message || "Failed to update publish state");
            } finally {
              setBusyId(null);
              setTargetProperty(null);
            }
          }}
          onCancel={() => { setConfirmVisible(false); setTargetProperty(null); }}
        />
      )}
    </RequireAdmin>
  );
}

/* ---------- Small UI helpers ---------- */
function StickyTitle({ title, subtitle }) {
  return (
    <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 bg-white/80 dark:bg-[#151826]/80 border-b border-gray-100 dark:border-gray-800 backdrop-blur rounded-t-2xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-300">{subtitle}</p>
    </div>
  );
}
function KPI({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-[#121426]/70">
      <div className="text-sm text-gray-600 dark:text-gray-200">{title}</div>
      <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
function SideItem({ id, active, onClick, icon, label }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={clsx(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors select-none",
        active === id
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium"
          : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
      )}
    >
      {icon} {label}
    </button>
  );
}
