import React, { useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSaved } from "../contexts/SavedContext";
import { useProperties } from "../contexts/PropertiesContext";
import clsx from "clsx";
import { motion } from "framer-motion";

const toMoney = (n) =>
    typeof n === "number"
        ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
        : "$—";

const bedsBathsSqft = (b, ba, s) =>
    `${(b ?? "--")} bds | ${(ba ?? "--")} ba | ${(s ?? "—").toLocaleString?.() ?? s} sqft`;

const addrLine = (p) => [p?.street, p?.city, p?.state, p?.zip_code].filter(Boolean).join(", ");
const isFeatured = (p) => p?.featured === true || p?.featured === 1 || p?.tag === "featured";

function SaveButton({ id }) {
    const { isSaved, toggleSaved } = useSaved();
    const saved = isSaved(id);

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
                e.stopPropagation();
                toggleSaved(id);
            }}
            aria-label={saved ? "Remove from favorites" : "Save to favorites"}
            className={clsx(
                "absolute top-3 right-3 grid place-items-center h-9 w-9 rounded-full",
                "bg-white/90 dark:bg-black/60 backdrop-blur border border-black/10 dark:border-white/10 shadow"
            )}
        >
            {saved ? (
                <i className="bi bi-bookmark-fill text-amber-400 text-xl" />
            ) : (
                <i className="bi bi-bookmark text-gray-600 dark:text-gray-200 text-xl" />
            )}
        </motion.button>
    );
}

const HomeCard = ({ p, idx }) => {
    const id = p.property_id || p.id || p._id;
    const img = p.main_image || p.images?.[0]?.url;
    const price = toMoney(Number(p.price));
    const meta = bedsBathsSqft(p.bedrooms, p.bathrooms, p.sqft);
    const navigate = useNavigate();
    const ribbon = p.days_on ? { text: `${p.days_on} days on NestNova`, tone: "bg-orange-500" } : null;

    return (
        <motion.div
            className="relative w-[320px] shrink-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121426]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
        >
            <div className="relative h-44">
                <img
                    src={img || "/images/placeholder-haus.jpg"}
                    alt={addrLine(p)}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                {ribbon && (
                    <span
                        className={`absolute left-3 top-3 px-3 py-1 text-xs font-semibold text-white rounded-full ${ribbon.tone}`}
                    >
                        {ribbon.text}
                    </span>
                )}
                <SaveButton id={id} />
            </div>

            <Link to={`/details/${id}`} className="block p-4">
                <motion.div whileHover={{ scale: 1.02 }}>
                    <div className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{price}</div>
                    <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">{meta}</div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">{addrLine(p)}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {p.status || "Active"}
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
};

export default function FeaturedHomes({
    title = "Featured Properties",
    limit = 12,
    className = "",
}) {
    const { properties = [], propertiesLoading } = useProperties();
    const list = useMemo(() => (properties || []).filter(isFeatured).slice(0, limit), [properties, limit]);

    const scrollerRef = useRef(null);
    const scrollBy = (dx) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

    if (!propertiesLoading && list.length === 0) return null;

    return (
        <motion.section
            className={`py-10 ${className}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
        >
            <div className="flex items-center justify-between mb-4 sm:mb-6 p-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 font-[Poppins]">
                    {title}
                </h2>
                <div className="hidden sm:flex gap-2">
                    <button
                        onClick={() => scrollBy(-340)}
                        className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1222] text-gray-700 dark:text-gray-200 grid place-items-center active:opacity-60"
                        aria-label="Scroll left"
                    >
                        <i className="bi bi-arrow-left-short text-2xl" />
                    </button>
                    <button
                        onClick={() => scrollBy(340)}
                        className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1222] text-gray-700 dark:text-gray-200 grid place-items-center active:opacity-60"
                        aria-label="Scroll right"
                    >
                        <i className="bi bi-arrow-right-short text-2xl" />
                    </button>
                </div>
            </div>

            <div ref={scrollerRef} className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x">
                {propertiesLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-[320px] h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl"
                        />
                    ))
                    : list.map((p, i) => <HomeCard key={p.property_id || p.id || p._id} p={p} idx={i} />)}
            </div>
        </motion.section>
    );
}
