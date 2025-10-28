// src/pages/AllProperties.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useProperties } from "../contexts/PropertiesContext";
import { useLoader } from "../contexts/LoaderContext";
import LocationSearch from "../components/LocationSearch";
import Toggle from "../components/Toggle";
import MapView from "../components/MapView";
import { PropertyList } from "../components/PropertyCard";
import clsx from "clsx";

function uniqueFrom(arr = [], key) {
    const out = new Set();
    for (const it of arr) {
        const v = it?.[key];
        if (v && typeof v === "string") out.add(v.trim());
    }
    return [...out];
}

function norm(v) {
    return v == null ? "" : String(v).trim().toLowerCase();
}

function getZip(p) {
    return norm(p?.zip_code ?? p?.zipCode ?? p?.zipcode ?? "");
}

function getStreet(p) {
    return norm(p?.street ?? p?.street_name ?? "");
}


export default function AllProperties() {
    const { properties = [], propertiesLoading } = useProperties();
    const { setShowLoader } = useLoader();

    const [locations, setLocations] = useState([]);
    const [showMap, setShowMap] = useState(true);
    const [openMenu, setOpenMenu] = useState(null);

    const barRef = useRef(null);
    const [headerH, setHeaderH] = useState(0);

    useEffect(() => setShowLoader(!!propertiesLoading), [propertiesLoading, setShowLoader]);

    useEffect(() => {
        const measure = () => setHeaderH(barRef.current?.offsetHeight || 0);
        measure();
        let ro;
        if (window.ResizeObserver) {
            ro = new ResizeObserver(measure);
            if (barRef.current) ro.observe(barRef.current);
        }
        window.addEventListener("resize", measure);
        return () => {
            window.removeEventListener("resize", measure);
            ro?.disconnect?.();
        };
    }, []);

    useEffect(() => {
        const onDocClick = (e) => {
            if (!barRef.current?.contains(e.target)) setOpenMenu(null);
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const [filters, setFilters] = useState({ listing: null, type: null });

    const listingOptions = useMemo(() => uniqueFrom(properties, "status"), [properties]);
    const typeOptions = useMemo(() => uniqueFrom(properties, "home_type"), [properties]);

    const { zipWanted, streetWanted, hasFilters } = useMemo(() => {
        const z = new Set();
        const s = new Set();
        for (const f of locations) {
            if (f?.id?.startsWith?.("zip:")) z.add(f.id.slice(4));      // already lowercased in LocationSearch
            if (f?.id?.startsWith?.("street:")) s.add(f.id.slice(7));   // already lowercased in LocationSearch
        }
        return { zipWanted: z, streetWanted: s, hasFilters: z.size > 0 || s.size > 0 };
    }, [locations]);

    const filtered = useMemo(() => {
        if (!properties?.length) return [];
        return properties.filter((p) => {
            const okListing = !filters?.listing || p?.status === filters.listing;
            const okType = !filters?.type || p?.home_type === filters.type;

            if (!hasFilters) return okListing && okType;

            const zip = getZip(p);
            const street = getStreet(p);

            const zipOk = zipWanted.size ? zipWanted.has(zip) : false;
            const streetOk = streetWanted.size ? streetWanted.has(street) : false;

            const okLocation = zipOk || streetOk;

            return okListing && okType && okLocation;
        });
    }, [properties, filters?.listing, filters?.type, hasFilters, zipWanted, streetWanted]);


    const toggleMenu = (m) => setOpenMenu((cur) => (cur === m ? null : m));
    const selectFilter = (key, value) => {
        setFilters((f) => ({ ...f, [key]: value }));
        setOpenMenu(null);
    };
    const clearAll = () => {
        setFilters({ listing: null, type: null });
        setLocations([]);
        setOpenMenu(null);
    };

    if (propertiesLoading) return null;

    return (
        <div className="min-h-screen">

            <div className="mt-18"></div>
            <div
                ref={barRef}
                className={clsx(
                    "sticky top-18 z-40 w-full bg-white/70 backdrop-blur",
                    "dark:bg-slate-900/60"
                )}
            >
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                    <div
                        className={clsx(
                            "flex items-center gap-3 rounded-2xl px-3 py-2",
                            "bg-white/60 shadow-sm",
                            "dark:bg-slate-900/50"
                        )}
                    >
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu("listing");
                                }}
                                className="h-11 whitespace-nowrap rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95"
                            >
                                {filters.listing || "For Sale"}{" "}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={clsx("inline h-4 w-4 align-[-1px] transition-transform", openMenu === "listing" && "rotate-180")}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openMenu === "listing" && (
                                <div className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-[#151618]">
                                    {(listingOptions.length ? listingOptions : ["Buy", "Rent", "Lease"]).map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => selectFilter("listing", opt)}
                                            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-slate-800"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => selectFilter("listing", null)}
                                        className="block w-full bg-rose-100 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:hover:bg-rose-900/60"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu("type");
                                }}
                                className="h-11 whitespace-nowrap rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95"
                            >
                                {filters.type || "Type"}{" "}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={clsx("inline h-4 w-4 align-[-1px] transition-transform", openMenu === "type" && "rotate-180")}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openMenu === "type" && (
                                <div className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-[#151618]">
                                    {(typeOptions.length ? typeOptions : ["Apartment", "Bungalow", "Duplex", "Storey"]).map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => selectFilter("type", opt)}
                                            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-slate-800"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => selectFilter("type", null)}
                                        className="block w-full bg-rose-100 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:hover:bg-rose-900/60"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="h-11">
                                <LocationSearch
                                    properties={properties}
                                    selected={locations}
                                    onChange={setLocations}
                                    placeholder="Search by zipcode or street…"
                                />
                            </div>
                        </div>

                        <div className="flex h-11 items-center gap-2 whitespace-nowrap pl-1">
                            <span className="text-sm text-slate-700 dark:text-slate-100">{showMap ? 'Hide Map' : 'Show Map'}</span>
                            <Toggle checked={showMap} onChange={setShowMap} />
                        </div>

                        <button
                            onClick={clearAll}
                            className="h-11 whitespace-nowrap rounded-xl border border-slate-300 px-4 text-sm text-slate-600 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            title="Clear all filters"
                        >
                            Reset
                        </button>

                        <div className="hidden h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:flex">
                            {filtered.length} found
                        </div>


                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-6 py-5 lg:grid-cols-12">
                    <section className={clsx(showMap ? "lg:col-span-6" : "lg:col-span-12")}>
                        <PropertyList properties={filtered} />
                    </section>

                    {showMap && (
                        <aside
                            className="relative lg:col-span-6"
                            style={{ position: "sticky", top: headerH, height: `calc(100vh - ${headerH}px)` }}
                        >
                            <div className="h-200 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                                <MapView properties={filtered} zoomThreshold={14} dark={false} className="h-full w-full" />
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}
