import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const INIT = {
    purpose: "",
    persona: "",
    name: "",
    email: "",
    org: "",
    phone: "",
    message: "",
};

const PURPOSES = ["Buying", "Selling", "Renting", "Partnership", "Support", "Other"];
const PERSONAS = ["Home Buyer", "Home Seller", "Landlord", "Tenant", "Agent/Broker", "Press/Media"];

export default function Contact() {
    const [form, setForm] = useState(INIT);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState(false);
    const { user } = useAuth();

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    useEffect(() => {
        if (user?.email) setForm((prev) => ({ ...prev, email: user.email }));
    }, [user]);

    const validate = () => {
        const e = {};
        if (!form.purpose) e.purpose = "Select a purpose";
        if (!form.persona) e.persona = "Select a description";
        if (!form.name.trim()) e.name = "Full name is required";
        if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email is required";
        if (!form.message.trim()) e.message = "Tell us a bit about your inquiry";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        setOk(false);
        if (!validate()) return;
        try {
            setLoading(true);
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(await res.text());
            setOk(true);
            toast.success("Message Sent Successfully");
            setForm(INIT);
            setErrors({});
        } catch (err) {
            setErrors((e) => ({ ...e, _server: "Failed to send. Please try again." }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen mt-20 bg-[#F4F0EC] dark:bg-[#1e1e1e]">
            <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-8">
                <h1 className="text-4xl font-[Prata] tracking-tight text-emerald-900 dark:text-emerald-200">
                    Let’s Get In Touch
                </h1>

                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    <InfoCard icon="phone" title="Call" lines={["+1 (555) 123-4567", "+1 (555) 987-6543"]} />
                    <InfoCard icon="mail" title="Email" lines={["nestnova09@gmail.com", "help@nestnova.com"]} />
                    <InfoCard icon="pin" title="Office" lines={["221B Elm Street", "New York, NY"]} />
                </div>

                <hr className="mt-10 border-emerald-900/20 dark:border-emerald-100/10" />
            </section>

            {/* ✅ Always animates in (no whileInView race) */}
            <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mx-auto max-w-6xl px-4 sm:px-6 pb-16"
            >
                <h2 className="text-2xl sm:text-3xl font-semibold text-emerald-900 dark:text-emerald-100">
                    Or fill out the form below
                </h2>

                <form
                    onSubmit={submit}
                    className="mt-6 rounded-2xl border border-emerald-900/10 dark:border-emerald-100/10 bg-white/70 dark:bg-[#252525]/60 backdrop-blur p-4 sm:p-6"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Inquiry Purpose*" error={errors.purpose} icon="compass">
                            <select
                                value={form.purpose}
                                onChange={(e) => set("purpose", e.target.value)}
                                className="w-full rounded-lg border outline-none text-sm pr-3
                           border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10
                           bg-white/90 text-emerald-900 placeholder:text-emerald-900/50
                           dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10"
                            >
                                <option value="">Choose one option…</option>
                                {PURPOSES.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Description that fits you*" error={errors.persona} icon="brief">
                            <select
                                value={form.persona}
                                onChange={(e) => set("persona", e.target.value)}
                                className="w-full rounded-lg border outline-none text-sm pr-3
                           border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10
                           bg-white/90 text-emerald-900 placeholder:text-emerald-900/50
                           dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10"
                            >
                                <option value="">Choose one option…</option>
                                {PERSONAS.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="Full Name*" error={errors.name} icon="user">
                            <input
                                type="text"
                                placeholder="Enter your full name…"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                className="w-full rounded-lg border outline-none text-sm pr-3 h-11
                           border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10
                           bg-white/90 text-emerald-900 placeholder:text-emerald-900/50
                           dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10"
                            />
                        </Field>

                        <Field label="Organization" icon="building">
                            <input
                                type="text"
                                placeholder="Enter your organization…"
                                value={form.org}
                                onChange={(e) => set("org", e.target.value)}
                                className="w-full rounded-lg border outline-none text-sm pr-3 h-11
                           border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10
                           bg-white/90 text-emerald-900 placeholder:text-emerald-900/50
                           dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10"
                            />
                        </Field>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="Email Address*" error={errors.email} icon="mail">
                            <input
                                type="email"
                                placeholder="Enter your email address…"
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                className="w-full rounded-lg border outline-none text-sm pr-3 h-11
                           border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10
                           bg-white/90 text-emerald-900 placeholder:text-emerald-900/50
                           dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10"
                            />
                        </Field>

                        <Field label="Phone Number" icon="phone">
                            <input
                                type="tel"
                                placeholder="Enter your phone number…"
                                value={form.phone}
                                onChange={(e) => set("phone", e.target.value)}
                                className="w-full rounded-lg border outline-none text-sm pr-3 h-11
                           border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10
                           bg-white/90 text-emerald-900 placeholder:text-emerald-900/50
                           dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10"
                            />
                        </Field>
                    </div>

                    <div className="mt-4">
                        <Field label="Inquiry Message*" error={errors.message} icon="chat">
                            <textarea
                                rows={5}
                                placeholder="Enter your message here…"
                                value={form.message}
                                onChange={(e) => set("message", e.target.value)}
                                className="w-full rounded-lg border outline-none text-sm pr-3 pt-3 resize-y
                           border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10
                           bg-white/90 text-emerald-900 placeholder:text-emerald-900/50
                           dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10"
                            />
                        </Field>
                    </div>

                    {errors._server && (
                        <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors._server}</p>
                    )}
                    {ok && (
                        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                            Thanks! Your message has been sent.
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            {loading ? "Sending…" : "Submit Form"}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="-mr-1">
                                <path
                                    d="M5 12h14M13 5l7 7-7 7"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </form>
            </motion.section>
        </main>
    );
}

/* ---------- Bits ---------- */

function InfoCard({ icon, title, lines = [] }) {
    return (
        <div className="rounded-2xl border border-emerald-900/10 dark:border-emerald-100/10 bg-white/70 dark:bg-[#252525]/60 backdrop-blur p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <div className="mt-1 text-emerald-900 dark:text-emerald-200">
                    <Icon name={icon} />
                </div>
                <div>
                    <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{title}</div>
                    <div className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-200/80 space-y-0.5">
                        {lines.map((l, i) => (
                            <div key={i}>{l}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, error, icon, children }) {
    const arr = React.Children.toArray(children);
    const rawChild = arr[0];
    const isValid = React.isValidElement(rawChild);
    const isNative = isValid && typeof rawChild.type === "string";
    const isTextarea = isNative && rawChild.type === "textarea";

    // merge classes (avoid duplicating if the child already has base pieces)
    const base = "w-full rounded-lg border outline-none text-sm pr-3";
    const baseFocus =
        "border-emerald-900/20 focus:border-emerald-900/40 focus:ring-2 focus:ring-emerald-900/10";
    const baseTheme =
        "bg-white/90 text-emerald-900 placeholder:text-emerald-900/50 dark:bg-[#252525] dark:text-emerald-100 dark:border-emerald-100/15 dark:focus:ring-white/10";

    let merged = base + " " + baseFocus + " " + baseTheme + " pl-11 " + (isTextarea ? "pt-3" : "h-11");
    if (isValid && rawChild.props.className) {
        merged = [rawChild.props.className, merged].join(" ");
    }

    const content = isValid ? React.cloneElement(rawChild, { className: merged }) : children;

    return (
        <label className="block">
            <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">{label}</span>
            </div>

            <div className="relative">
                <span
                    className={
                        "pointer-events-none absolute left-3 text-emerald-900/70 dark:text-emerald-200/70 " +
                        (isTextarea ? "top-3" : "top-1/2 -translate-y-1/2")
                    }
                >
                    <Icon name={icon} />
                </span>
                {content}
            </div>

            {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{error}</p>}
        </label>
    );
}

function Icon({ name }) {
    const common = "h-5 w-5";
    switch (name) {
        case "phone":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5l4-2 3 6-2 2a12 12 0 006 6l2-2 6 3-2 4c-7 0-17-10-17-17z"
                    />
                </svg>
            );
        case "mail":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
                    <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
                </svg>
            );
        case "pin":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s7-4.35 7-10A7 7 0 105 11c0 5.65 7 10 7 10z"
                    />
                    <circle cx="12" cy="11" r="2" />
                </svg>
            );
        case "compass":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.6" />
                    <path d="M9 15l2-6 6-2-2 6-6 2z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "brief":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8h18v10H3z" strokeWidth="1.6" />
                    <path d="M9 8V6h6v2" strokeWidth="1.6" />
                </svg>
            );
        case "user":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" strokeWidth="1.6" />
                    <path d="M4 20c2-4 14-4 16 0" strokeWidth="1.6" />
                </svg>
            );
        case "building":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 21h18V7H3z" strokeWidth="1.6" />
                    <path d="M7 7V3h10v4" strokeWidth="1.6" />
                    <path d="M7 11h2M7 15h2M11 11h2M11 15h2M15 11h2M15 15h2" strokeWidth="1.6" />
                </svg>
            );
        case "chat":
            return (
                <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M21 11.5A7.5 7.5 0 016 18l-3 3 1-4A7.5 7.5 0 1116 6"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        default:
            return null;
    }
}
