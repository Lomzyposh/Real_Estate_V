import React, { useEffect, useMemo, useRef, useState } from "react";

function useDebounced(value, delay = 200) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

function buildLocationIndex(properties = []) {
    const byId = new Map();

    for (const p of properties) {
        const zip = p?.zip_code ?? p?.zipCode ?? p?.zipcode ?? null;
        const street = p?.street ?? p?.street_name ?? null;

        if (zip && String(zip).trim()) {
            const label = String(zip).trim();
            byId.set(`zip:${label.toLowerCase()}`, {
                id: `zip:${label.toLowerCase()}`,
                label,
                type: "ZIP",
            });
        }
        if (street && String(street).trim()) {
            const label = String(street).trim();
            byId.set(`street:${label.toLowerCase()}`, {
                id: `street:${label.toLowerCase()}`,
                label,
                type: "Street",
            });
        }
    }

    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export default function LocationSearch({
    properties = [],
    selected = [],
    onChange,
    placeholder = "Search by zipcode or street…",
}) {
    const inputRef = useRef(null);
    const wrapRef = useRef(null);

    const allOptions = useMemo(() => buildLocationIndex(properties), [properties]);

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const debouncedQuery = useDebounced(query, 180);

    const filtered = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        const selectedIds = new Set(selected.map((s) => s.id));
        if (!q) {
            return allOptions.filter((o) => !selectedIds.has(o.id)).slice(0, 8);
        }
        return allOptions
            .filter(
                (o) =>
                    !selectedIds.has(o.id) &&
                    (o.label.toLowerCase().includes(q) || o.type.toLowerCase().includes(q))
            )
            .slice(0, 12);
    }, [allOptions, debouncedQuery, selected]);

    useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const onKeyDown = (e) => {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
        }
        if (!open || filtered.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + filtered.length) % filtered.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            add(filtered[highlight]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const add = (item) => {
        if (!item) return;
        const next = [...selected, item];
        onChange?.(next);
        setQuery("");
        setOpen(false);
        setHighlight(0);
        inputRef.current?.focus();
    };

    const remove = (id) => {
        const next = selected.filter((s) => s.id !== id);
        onChange?.(next);
        inputRef.current?.focus();
    };

    const mark = (text, q) => {
        const t = String(text);
        const i = t.toLowerCase().indexOf(q.toLowerCase());
        if (i < 0 || !q) return t;
        return (
            <>
                {t.slice(0, i)}
                <span className="bg-yellow-200/60 dark:bg-yellow-300/20 rounded px-0.5">{t.slice(i, i + q.length)}</span>
                {t.slice(i + q.length)}
            </>
        );
    };

    return (
        <div ref={wrapRef}>
            <div
                className="
        w-full rounded-2xl bg-white dark:bg-[#161616]
        border border-gray-200 dark:border-white/10
        shadow-[0_2px_20px_-6px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_20px_-6px_rgba(0,0,0,0.5)]
        px-3 py-2
      "
            >
                <div
                    className="
          flex items-start gap-2
        "
                >
                    <svg
                        className="w-5 h-5 mt-1 text-gray-500 dark:text-gray-400 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 21s6-5.373 6-10a6 6 0 1 0-12 0c0 4.627 6 10 6 10Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle
                            cx="12"
                            cy="11"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>


                    <div
                        className="
            flex-1 min-w-0
            flex flex-wrap items-center gap-2
            max-h-24 overflow-y-auto
            pr-2
          "
                    >
                        {selected.map((s) => (
                            <span
                                key={s.id}
                                className="
                inline-flex items-center gap-1 text-sm
                bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300
                border border-blue-200/60 dark:border-blue-400/30
                px-2 py-0.5 rounded-lg
                max-w-[12rem]
              "
                                title={s.label}
                            >
                                <span className="truncate">{s.label}</span>
                                <button
                                    onClick={() => remove(s.id)}
                                    className="rounded hover:bg-blue-100 dark:hover:bg-blue-400/20 p-0.5 shrink-0"
                                    aria-label={`Remove ${s.label}`}
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </span>
                        ))}

                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            onKeyDown={(e) => {
                                onKeyDown(e);
                                if (e.key === "Backspace" && !query && selected.length) {
                                    e.preventDefault();
                                    remove(selected[selected.length - 1].id);
                                }
                            }}
                            placeholder={placeholder}
                            className="
              flex-1 min-w-[10ch]
              bg-transparent outline-none text-sm
              text-gray-800 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
            "
                        />
                    </div>

                    <svg className="w-5 h-5 mt-1 text-gray-500 dark:text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M11 19a8 8 0 1 1 5.293-14.293A8 8 0 0 1 11 19Zm9 2-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            {open && filtered.length > 0 && (
                <div className="relative">
                    <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg">
                        {filtered.map((opt, idx) => (
                            <button
                                key={opt.id}
                                onMouseEnter={() => setHighlight(idx)}
                                onClick={() => add(opt)}
                                className={`w-full text-left px-4 py-2 flex items-center justify-between ${idx === highlight ? "bg-gray-100 dark:bg-white/10" : ""}`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 3h12l-4 7v7l-4 4v-11L6 3z" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    <span className="text-sm text-gray-800 dark:text-gray-100">
                                        {mark(opt.label, debouncedQuery)}
                                    </span>
                                </span>
                                <span
                                    className={`text-[11px] px-1.5 py-0.5 rounded-md border ${opt.type === "ZIP"
                                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-400/30"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/30"
                                        }`}
                                >
                                    {opt.type}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

}
