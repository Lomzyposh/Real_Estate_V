import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoader } from "../contexts/LoaderContext";
import { toast } from "react-toastify";
import FeaturedHomes from "../components/FeaturedHomes";
import { motion } from "framer-motion";
import GetStartedCards from "../components/GetStartedCard";
import { TypeAnimation } from "react-type-animation";


const HOME_TYPES = [
    "SingleFamily",
    "Townhouse",
    "Condominium",
    "Loft",
    "Attached",
    "Penthouse",
];

export default function Home({ background = "/images/mainHouse1.jpg" }) {
    const navigate = useNavigate();
    const { setShowLoader } = useLoader();
    ;

    const [lookingFor, setLookingFor] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [location, setLocation] = useState("");
    const [rooms, setRooms] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (lookingFor) params.set("type", lookingFor);
        if (maxPrice) params.set("priceMax", String(maxPrice));
        if (location) params.set("city", location);
        if (rooms) params.set("bedsMin", rooms === "4+" ? "4" : String(rooms));

        navigate(`/allproperties?${params.toString()}`);
    };

    return (
        <>
            <section className="relative w-full mt-10">
                <motion.div
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[68vh] min-h-[520px] w-full overflow-hidden rounded-2xl sm:rounded-3xl"
                >
                    <motion.img
                        src={background}
                        alt="Hero background"
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.2 }}
                        style={{
                            filter: "brightness(0.85) contrast(1.05) saturate(1.1) blur(0.3px)",
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60 dark:from-black/50 dark:via-black/30 dark:to-black/70 backdrop-blur-[2px]" />

                    <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-6 sm:px-6 lg:px-10 lg:pb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 36 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="mb-4 flex flex-wrap gap-2">
                                {["House", "Apartment", "Residential"].map((t, i) => (
                                    <motion.span
                                        key={t}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur dark:bg-white/10 dark:text-gray-100 dark:ring-1 dark:ring-white/10"
                                    >
                                        {t}
                                    </motion.span>
                                ))}
                            </div>

                            <h1 className="text-4xl font-semibold font-[Lora] leading-tight tracking-[-0.02em] text-white sm:text-5xl lg:text-5xl">
                                <TypeAnimation
                                    sequence={[
                                        "Build Your Future",
                                        3500,
                                        "Shape Your Dreams",
                                        3500,
                                        "Own Your Tomorrow",
                                        3500,
                                    ]}
                                    wrapper="span"
                                    speed={50}
                                    repeat={Infinity}
                                    className="text-[var(--primary)]"
                                />{" "}
                                <br className="block" /> One Property at a Time.
                            </h1>

                            <p className="mt-4 max-w-xl text-sm/6 text-white/90 sm:text-base/7">
                                Own your world. One property at a time. Explore homes, apartments and
                                lands across prime locations.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>


                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="-mt-6 w-full px-3 sm:px-6 lg:px-10"
                >
                    <form
                        onSubmit={onSubmit}
                        className="mx-auto w-full max-w-6xl rounded-2xl border border-gray-200/70 bg-white/80 p-3 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-[#252525]/80"
                    >
                        <div className="flex items-center justify-between px-2 pb-2 pt-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Find the best place</h3>
                        </div>

                        <motion.div
                            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                        >
                            <motion.label initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Home type</span>
                                <select
                                    value={lookingFor}
                                    onChange={(e) => setLookingFor(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-[#1e1e1e] dark:text-slate-100 dark:focus:ring-white/10"
                                >
                                    <option value="">Any type</option>
                                    {HOME_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </motion.label>

                            <motion.label initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Max price</span>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="e.g. 300000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-[#1e1e1e] dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-white/10"
                                />
                            </motion.label>

                            <motion.label initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Location (City)</span>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-[#1e1e1e] dark:text-slate-100 dark:focus:ring-white/10"
                                >
                                    <option value="">Any city</option>
                                    {["Illinois", "Washington", "Florida", "California", "Texas", "New York", "Los Angeles"].map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </motion.label>

                            <motion.label initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Number of rooms</span>
                                <select
                                    value={rooms}
                                    onChange={(e) => setRooms(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-[#1e1e1e] dark:text-slate-100 dark:focus:ring-white/10"
                                >
                                    <option value="">Any</option>
                                    <option value="1">1 Bed</option>
                                    <option value="2">2 Beds</option>
                                    <option value="3">3 Beds</option>
                                    <option value="4+">4+ Beds</option>
                                </select>
                            </motion.label>
                        </motion.div>

                        <div className="mt-3 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Filter:</span>
                                {["Street", "House", "Residential", "Apartment"].map((f) => (
                                    <span
                                        key={f}
                                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#1e1e1e] dark:text-gray-200"
                                    >
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                Search Properties
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </section>

            <FeaturedHomes title="Featured Properties" className="mt-20" />
            <GetStartedCards />
        </>
    );
}
function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
            {children}
        </label>
    );
}
