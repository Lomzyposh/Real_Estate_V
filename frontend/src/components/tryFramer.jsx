import { motion } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20 } },
};


export default function Hero() {
    return (
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
            {["Welcome", "To", "NestNova"].map((word, i) => (
                <motion.h1 key={i} variants={item} className="text-4xl font-bold">
                    {word}
                </motion.h1>
            ))}
        </motion.div>
    );
}
