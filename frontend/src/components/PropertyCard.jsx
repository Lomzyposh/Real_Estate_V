// src/components/PropertyCard.jsx
import React from "react";
import { FaStar } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { LuRuler, LuBedDouble } from "react-icons/lu";
import { TbStairs } from "react-icons/tb";
import clsx from "clsx";
import { useSaved } from "../contexts/SavedContext";
import { useNavigate } from "react-router-dom";
import { LazyMotion, domAnimation, MotionConfig, m, useReducedMotion } from "framer-motion"; // CHANGED

const formatMoney = (n = 0, currency = "USD") =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);

const listVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06, // CHANGED (was 0.2)
            delayChildren: 0.04,
        },
    },
};

// Reduced wobble spring
const cardVariants = {
    hidden: { opacity: 0, y: 16 }, // CHANGED (was y: 40)
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 360, // CHANGED
            damping: 30,    // CHANGED
            mass: 0.8,      // CHANGED
        },
    },
};

export default function PropertyCard({
    item: data,
    className = "",
    currency = "USD",
}) {
    const reduce = useReducedMotion();

    const {
        property_id,
        street,
        zip_code,
        main_image,
        sqft,
        bedrooms,
        floor_count,
        price,
        rating,
        status,
        home_type,
    } = data || {};

    const { isSaved, toggleSaved } = useSaved();
    const saved = isSaved(property_id ?? null);
    const navigate = useNavigate();

    const fallbackImg =
        "https://images.pexels.com/photos/28216688/pexels-photo-28216688.png";

    return (
        <m.article
            variants={cardVariants}
            initial={reduce ? false : "hidden"}
            animate={reduce ? undefined : "show"}
            whileHover={{
                y: -2,
                scale: 1.01,
                transition: { type: "spring", stiffness: 500, damping: 32 },
            }
            }
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }} // CHANGED
            className={
                clsx(
                    "rounded-2xl border border-slate-200/70 bg-white shadow-sm",
                    "dark:bg-[#252525] dark:border-slate-700/60",
                    // Avoid transition-all & transform transitions (let Framer own transform)
                    "overflow-hidden transition-shadow duration-200 hover:shadow-lg", // CHANGED
                    className
                )
            }
        >
            <div className="relative">
                <img
                    onClick={() => navigate(`/details/${property_id}`)}
                    src={main_image || fallbackImg}
                    alt={street || "Property image"}
                    className="h-48 w-full cursor-pointer object-cover sm:h-56"
                    loading="lazy"
                    decoding="async" // CHANGED
                    referrerPolicy="no-referrer" // optional (can help consistency)
                />

                {status && (
                    <span
                        className={clsx(
                            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
                            "bg-white/90 text-slate-800 shadow-sm backdrop-blur",
                            "dark:bg-slate-800/90 dark:text-slate-100"
                        )}
                    >
                        {status}
                    </span>
                )}

                <button
                    onClick={() => toggleSaved(property_id)}
                    className={clsx(
                        "absolute right-3 top-3 grid h-9 w-9 place-items-center",
                        "rounded-full bg-white/95 shadow-sm backdrop-blur",
                        "active:scale-95",
                        "dark:bg-slate-800/90"
                    )}
                    aria-label={saved ? "Remove from favorites" : "Save to favorites"}
                >
                    {saved ? (
                        <i className="bi bi-bookmark text-green-500 text-xl" />
                    ) : (
                        <i className="bi bi-bookmark text-gray-600 dark:text-gray-200 text-xl" />
                    )}
                </button>

                {Number.isFinite(price) && (
                    <div
                        className={clsx(
                            "hidden sm:flex absolute bottom-3 left-3 items-center",
                            "rounded-xl bg-slate-900/85 px-3 py-1.5 text-sm font-semibold text-white",
                            "backdrop-blur"
                        )}
                    >
                        {formatMoney(price, currency)}
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4">
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <HiOutlineLocationMarker className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="line-clamp-1">
                        {zip_code ? `${zip_code}, ` : ""}
                        {street || "—"}
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                        <LuRuler className="text-slate-400 dark:text-slate-500" />
                        {sqft ? `${sqft} m²` : "—"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <LuBedDouble className="text-slate-400 dark:text-slate-500" />
                        {Number.isFinite(bedrooms) ? `${bedrooms} bedrooms` : "—"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <TbStairs className="text-slate-400 dark:text-slate-500" />
                        {Number.isFinite(floor_count) ? `${floor_count} floors` : "—"}
                    </span>
                    {home_type && (
                        <span className="ml-auto text-xs rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                            {home_type}
                        </span>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                            {formatMoney(price, currency)} {status === "For Rent" && (
                                <span>
                                    /mos
                                </span>
                            )}
                        </span>
                    </div>

                    {!!rating && Number.isFinite(rating) ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <FaStar className="-mt-[1px]" />
                            {rating.toFixed(1)}
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400">No ratings</span>
                    )}
                </div>
            </div>
        </m.article >
    );
}

export function PropertyList({ properties = [], className = "" }) {
    const reduce = useReducedMotion();
    if (!properties?.length) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
                No properties found.
            </div>
        );
    }

    return (
        <LazyMotion features={domAnimation}>
            <MotionConfig
                reducedMotion="user"
                transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.8 }}
            >
                <m.div
                    initial={reduce ? false : "hidden"}
                    animate={reduce ? "show" : undefined}
                    whileInView={reduce ? undefined : "show"}
                    viewport={reduce ? { once: true, amount: 0 } : { once: true, amount: 0.2 }}
                    className={clsx(
                        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
                        className
                    )}
                >
                    {properties.map((p, idx) => (
                        <PropertyCard key={p.property_id ?? idx} item={p} />
                    ))}
                </m.div>
            </MotionConfig>
        </LazyMotion>
    );
}
