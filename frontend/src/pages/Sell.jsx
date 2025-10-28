import React from 'react';
import { motion } from 'framer-motion';
import PropertyQuickAdd from '../components/PropertyAdd';
import Dropdown from '../components/DropDown';

const faq = [
    { q: "When selling my house, where should I begin?", a: "Start by telling us a few details about your property. We’ll evaluate the home and send a fair cash offer—no fees or obligations." },
    { q: "Where are cash offers available?", a: "We buy homes across major cities and surrounding areas. Send your address and we’ll confirm availability within minutes." },
    { q: "How do partner agents help sell homes faster and for more?", a: "Our vetted agents use pro photography, pricing strategy, and targeted marketing to maximize exposure and attract qualified buyers." },
    { q: "What are the benefits of listing publicly vs. a private network?", a: "Public portals unlock more buyer traffic; private listings can be discrete and fast. We’ll recommend the path that fits your goals." },
    { q: "How long does it take to sell a house?", a: "Cash sales can close in as little as 7–14 days. Traditional listings vary by market, condition, and price strategy." },
    { q: "What home seller mistakes should I avoid?", a: "Overpricing, poor photos, and limited showing availability. We help you avoid these with comps, staging tips, and flexible scheduling." },
    { q: "What is an MLS?", a: "The Multiple Listing Service (MLS) is the database agents use to share listings with other agents and buyer websites." },
];

/* ====== motion variants ====== */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.08 },
    }),
};

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
};

const card = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

const Sell = () => {
    return (
        <div>
            {/* HERO */}
            <section className="relative w-full min-h-[90vh] flex items-center justify-center px-6 md:px-16 py-20 overflow-hidden">
                <motion.img
                    src="/images/house1.jpg"
                    alt="Modern house"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl brightness-70 dark:brightness-50"
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />

                <motion.div
                    className="relative mt-30 z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-10"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.div className="text-gray-200 md:w-1/2 space-y-5" variants={fadeUp}>
                        <h1 className="text-4xl md:text-4xl font-bold font-[prata] first-letter:text-6xl leading-tight">
                            Sell Your House For <br />
                            <span className="text-orange-400 font-[lora]">Cash Fast</span> — Get Offer In Minutes!
                        </h1>
                        <p className="max-w-md">
                            Eliminate the stress of selling your house the traditional way and save thousands by
                            selling directly to us for cash!
                        </p>
                        <motion.a
                            href="#addForm"
                            className="inline-flex items-center gap-1 px-5 py-3 bg-[var(--primary)] font-extrabold rounded cursor-pointer text-white hover:opacity-90 transition-all duration-300"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Explore <i className="bi bi-arrow-down-short text-lg" />
                        </motion.a>
                    </motion.div>
                </motion.div>
            </section>

            {/* STEPS */}
            <section className="w-full py-20 px-6 md:px-16 bg-white dark:bg-[#252525]">
                <motion.div
                    className="max-w-6xl mx-auto text-center mb-14"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={stagger}
                >
                    <motion.h2
                        className="text-3xl md:text-4xl font-[lora] font-bold text-gray-900 dark:text-white"
                        variants={fadeUp}
                    >
                        Sell Your House Fast in <span className="text-orange-500 font-[prata]">5 Simple Steps</span>
                    </motion.h2>
                    <motion.p
                        className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                        variants={fadeUp}
                        custom={1}
                    >
                        We’ve made the selling process super easy. Just follow these quick steps to get your
                        fair cash offer without any hassle.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                >
                    {/* 01 */}
                    <motion.div className="flex items-center gap-6" variants={card}>
                        <div className="text-6xl font-extrabold text-orange-400 opacity-100 dark:opacity-20">01</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Cash Offer</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fill our quick form to get a fair cash offer for your house in just minutes.
                            </p>
                        </div>
                    </motion.div>

                    {/* 02 */}
                    <motion.div className="flex items-center gap-6" variants={card}>
                        <div className="text-6xl font-extrabold text-orange-400 opacity-100 dark:opacity-20">02</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Schedule a Visit</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                We’ll visit your property at your convenience to verify its details.
                            </p>
                        </div>
                    </motion.div>

                    {/* 03 */}
                    <motion.div className="flex items-center gap-6" variants={card}>
                        <div className="text-6xl font-extrabold text-orange-400 opacity-100 dark:opacity-20">03</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Receive Your Offer</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Get your personalized offer without fees, commissions, or obligations.
                            </p>
                        </div>
                    </motion.div>

                    {/* 04 */}
                    <motion.div className="flex items-center gap-6" variants={card}>
                        <div className="text-6xl font-extrabold text-orange-400 opacity-100 dark:opacity-20">04</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fast Closing</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Choose your closing date — we’ll handle all the paperwork and costs.
                            </p>
                        </div>
                    </motion.div>

                    {/* 05 */}
                    <motion.div className="flex items-center gap-6" variants={card}>
                        <div className="text-6xl font-extrabold text-orange-400 opacity-100 dark:opacity-20">05</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Paid Instantly</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Once everything’s signed, receive your cash payment immediately. Simple as that!
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* RESOURCES */}
            <section className="flex flex-col justify-center items-center p-10 bg-[#4caf4f5c] dark:bg-[#25252577]">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={stagger}
                    className="text-center"
                >
                    <motion.h2
                        className="text-3xl md:text-4xl font-[prata] font-bold text-gray-900 dark:text-white"
                        variants={fadeUp}
                    >
                        Go-to resources for a successful sale
                    </motion.h2>
                    <motion.p
                        className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl text-center mx-auto"
                        variants={fadeUp}
                        custom={1}
                    >
                        Get practical guides and strategies for every step of your selling process.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto mt-10 text-[#333] dark:text-[#fff]"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                >
                    <ResourceCard
                        img="/images/house2.png"
                        href="https://www.zillow.com/learn/home-selling-tips/"
                        read="4 mins read"
                        title="14 tips for selling your home fast and for more money"
                    />
                    <ResourceCard
                        img="https://delivery.digitalassets.zillowgroup.com/api/public/content/Module6_Steps-Selling-Image2x_CMS_Medium_Large.png?v=50638c26"
                        href="https://www.zillow.com/learn/best-time-to-sell/"
                        read="8 mins read"
                        title="When is the best time to sell a house"
                    />
                    <ResourceCard
                        img="https://delivery.digitalassets.zillowgroup.com/api/public/content/Module6_Best-Time-Image2x_CMS_Medium_Large.png?v=4d052836"
                        href="https://www.zillow.com/learn/choose-right-real-estate-agent/"
                        read="6 mins read"
                        title="How to choose the right real estate agent"
                    />
                    <ResourceCard
                        img="https://delivery.digitalassets.zillowgroup.com/api/public/content/Module6_Choose-Agent-Image2x_CMS_Medium_Large.png?v=941acad3"
                        href="https://www.zillow.com/learn/steps-to-selling-a-house/"
                        read="14 mins read"
                        title="Steps to selling a house"
                    />
                </motion.div>
            </section>

            <Dropdown items={faq} />
            <PropertyQuickAdd />
        </div>
    );
};

export default Sell;

/* ====== Small resource card component with motion ====== */
function ResourceCard({ img, href, read, title }) {
    return (
        <motion.a
            target="_blank"
            href={href}
            className="bg-[#fff] dark:bg-[#252525] cursor-pointer overflow-hidden rounded-2xl hover:bg-[#f3ffeb6f] dark:hover:bg-[#333] transition-all"
            variants={card}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.995 }}
        >
            <motion.img
                src={img}
                alt=""
                className="w-full"
                initial={{ scale: 1.03 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <div className="p-5 *:mt-2">
                <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-l font-medium text-green-400 inset-ring inset-ring-green-500/20">
                    {read}
                </span>
                <h3 className="text-[18px]">{title}</h3>
                <p className="text-blue-600 font-extrabold">Read Article</p>
            </div>
        </motion.a>
    );
}
