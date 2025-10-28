import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";

function initials(name = "") {
    const parts = String(name).trim().split(/\s+/);
    if (!parts[0]) return "A";
    if (!parts[1]) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AgentComboBox({ agents = [], value, onChange, loading }) {
    console.log(agents);
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const wrapperRef = useRef(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        if (!q) return agents;
        return agents.filter((a) =>
            [a.name, a.companyName, a.email, a.agentId, a.userId, a.profileImage]
                .filter(Boolean)
                .some((x) => String(x).toLowerCase().includes(q))
        );
    }, [agents, query]);

    const selectedAgent = useMemo(
        () =>
            agents.find(
                (a) => String(a.agentId ?? a.userId ?? a.id) === String(value)
            ) || null,
        [agents, value]
    );

    useEffect(() => {
        function onDocClick(e) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target)) setMenuOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <Combobox
                value={selectedAgent}
                onChange={(a) =>
                    onChange({
                        target: { value: a ? a.agentId ?? a.userId ?? a.id : "" },
                    })
                }
                disabled={loading}
            >
                <Combobox.Label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Select Agent *
                </Combobox.Label>

                <div
                    className="relative w-full cursor-default overflow-visible rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-zinc-900/70 text-left focus-within:ring-2 focus-within:ring-orange-400/30"
                    onClick={() => setMenuOpen(true)}
                >
                    <Combobox.Input
                        className="w-full border-none bg-transparent py-2.5 pl-11 pr-9 text-sm text-gray-900 dark:text-gray-100 outline-none"
                        displayValue={(a) =>
                            a
                                ? `${a.name || "Unnamed"}${a.companyName ? " • " + a.companyName : ""
                                }`
                                : ""
                        }
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setMenuOpen(true);
                        }}
                        onFocus={() => setMenuOpen(true)}
                        placeholder={loading ? "Loading agents…" : "Search agent name"}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setMenuOpen(false);
                        }}
                    />

                    {/* Avatar in input */}
                    {selectedAgent ? (
                        <div className="absolute inset-y-0 left-2 flex items-center">
                            {selectedAgent.profileImage ? (
                                <img
                                    src={selectedAgent.profileImage}
                                    alt=""
                                    className="h-7 w-7 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-7 w-7 rounded-full bg-orange-500/90 text-white grid place-items-center text-xs font-semibold">
                                    {initials(selectedAgent.name)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="absolute inset-y-0 left-2 flex items-center">
                            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-white/10 grid place-items-center text-[10px] text-gray-500">
                                AG
                            </div>
                        </div>
                    )}

                    {/* Chevron */}
                    <Combobox.Button
                        className="absolute inset-y-0 right-0 flex items-center pr-2"
                        onClick={(e) => {
                            e.preventDefault();
                            setMenuOpen((s) => !s);
                        }}
                    >
                        <svg
                            className={`h-5 w-5 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""
                                }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Combobox.Button>
                </div>

                {/* Options */}
                <Transition
                    as={Fragment}
                    show={menuOpen}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                >
                    <Combobox.Options
                        // Important: z-50 + max height + overflow for scroll
                        className="absolute z-50 mt-2 w-full overflow-y-auto overscroll-contain
                       rounded-xl border border-black/10 dark:border-white/15
                       bg-white dark:bg-zinc-900 py-1 shadow-xl focus:outline-none
                       max-h-72 scroll-py-1"
                    >
                        {loading ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                Loading agents…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                No agents found.
                            </div>
                        ) : (
                            filtered.map((a) => {
                                const id = a.agentId ?? a.userId ?? a.id;
                                const selected = String(value) === String(id);
                                return (
                                    <Combobox.Option
                                        key={id}
                                        value={a}
                                        className={({ active }) =>
                                            `flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer
                       ${active ? "bg-orange-50 dark:bg-white/10" : ""}`
                                        }
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {a.profileImage ? (
                                            <img
                                                src={a.profileImage}
                                                alt="No img"
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-9 w-9 rounded-full bg-orange-500/90 text-white grid place-items-center text-xs font-semibold">
                                                {initials(a.name)}
                                            </div>
                                        )}

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {a.name || "Unnamed Agent"}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {a.companyName || "Independent"}
                                                {a.email ? ` • ${a.email}` : ""}
                                            </div>
                                        </div>

                                        {/* Check */}
                                        {selected && (
                                            <svg
                                                className="h-5 w-5 text-orange-500 shrink-0"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3-3A1 1 0 016.8 9.693l2.293 2.293 6.493-6.493a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </Combobox.Option>
                                );
                            })
                        )}
                    </Combobox.Options>
                </Transition>
            </Combobox>

            {/* Hint */}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Click the field to browse all agents, or start typing to filter.
            </p>
        </div>
    );
}
