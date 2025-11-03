import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Card = ({ kind, title, desc, cta, to, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true, amount: 0.25 }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1e1e1e]/80 shadow-sm hover:shadow-lg transition-all"
    >
        <div className="p-8 flex flex-col items-center text-center gap-4">
            <img src={`/images/icons/${kind}.png`} alt="" className="h-28 w-28" />
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm h-20 leading-6 text-gray-600 dark:text-gray-300 max-w-[34ch]">{desc}</p>
            <Link
                to={to}
                className="mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold border border-green-500 text-green-700 dark:text-green-200 hover:bg-blue-50 dark:hover:bg-blue-500/10"
            >
                {cta}
            </Link>
        </div>
    </motion.div>
);

export default function GetStartedCards() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="py-16 dark:bg-[#252525]"
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mx-auto max-w-7xl px-4 text-center mb-10"
            >
                <h1 className="text-3xl sm:text-4xl font-bold font-[Poppins] text-gray-900 dark:text-gray-100">
                    Your next move starts here
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Buy, sell, or rent — all in one seamless experience.</p>
            </motion.div>

            <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card
                    kind="buy"
                    title="Buy a home"
                    desc="A local agent can give you a clear breakdown of costs so you avoid surprise expenses."
                    cta="Find a local agent"
                    to="/agents"
                    delay={0.05}
                />
                <Card
                    kind="sellHouse"
                    title="Sell a home"
                    desc="Whatever path you choose to sell, we’ll help you navigate to a successful sale."
                    cta="See your options"
                    to="/sell"
                    delay={0.12}
                />
                <Card
                    kind="rent"
                    title="Rent a home"
                    desc="Shop the largest rental network — from searching, to applying, to paying rent."
                    cta="Find rentals"
                    to="/allProperties?status=rent"
                    delay={0.18}
                />
            </div>
        </motion.section>
    );
}
