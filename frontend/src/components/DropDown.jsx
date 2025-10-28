import { useState } from "react";

export default function Dropdown({
    title = "Frequently asked questions",
    items = DEFAULT_ITEMS,
    allowMultiple = false,
}) {
    const [open, setOpen] = useState(allowMultiple ? new Set() : -1);

    const toggle = (i) => {
        if (allowMultiple) {
            const next = new Set(open);
            next.has(i) ? next.delete(i) : next.add(i);
            setOpen(next);
        } else {
            setOpen((prev) => (prev === i ? -1 : i));
        }
    };

    const isOpen = (i) => (allowMultiple ? open.has(i) : open === i);

    return (
        <section className="w-full px-6 md:px-16 py-16 bg-white dark:bg-[#252525]">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-[prata] font-extrabold tracking-tight text-gray-900 dark:text-white text-center mb-10">
                    {title}
                </h2>

                <div className="divide-y divide-gray-200 dark:divide-white/10 rounded-2xl bg-white dark:bg-[#1e1d1d] shadow-sm">
                    {items.map((it, i) => (
                        <div key={i} className="px-4 md:px-6">
                            <button
                                onClick={() => toggle(i)}
                                className="w-full py-5 flex items-center justify-between text-left gap-4"
                                aria-expanded={isOpen(i)}
                                aria-controls={`faq-panel-${i}`}
                            >
                                <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                                    {it.q}
                                </span>

                                {/* Chevron */}
                                <svg
                                    className={`size-5 shrink-0 transition-transform ${isOpen(i) ? "rotate-180" : ""
                                        } text-gray-500 dark:text-gray-300`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            <div
                                id={`faq-panel-${i}`}
                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen(i) ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="pb-6 text-gray-600 dark:text-gray-300">
                                        {it.a}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
