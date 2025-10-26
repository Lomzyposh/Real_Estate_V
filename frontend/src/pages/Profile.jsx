import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UnauthorizedOverlay from "../components/unAuth";
import { toast } from "react-toastify";
import { useLoader } from "../contexts/LoaderContext";

async function uploadImageToServer(file, endpoint = "/api/profile/upload") {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(endpoint, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    return data.url;
}

export default function CustomerSettings() {
    const { user, setUser } = useAuth();
    const { showLoader, loaderText } = useLoader();

    const [active, setActive] = useState("Profile");
    const [avatarUrl, setAvatarUrl] = useState("/images/blank-profileImg.webp");
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [fullName, setFullName] = useState("Example");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const mounted = useRef(false);

    useEffect(() => {
        if (!user) return;
        setAvatarUrl(user?.profileUrl || "/images/blank-profileImg.webp");
        setFullName(user?.name || "");
        setPhone(user?.phone_number || "");
        setCity(user?.location || "");
    }, [user]);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        setDirty(true);
    }, [avatarUrl, fullName, phone, city, pwd, selectedFile]);

    // If you want to block when not logged in:
    // if (!user) return <UnauthorizedOverlay seconds={5} />;

    const tabs = ["Profile", "Security"];

    const handleSaveDetails = async () => {
        try {
            if (!fullName?.trim()) {
                toast.error("Please enter your full name");
                return;
            }
            if (!phone?.trim()) {
                toast.error("Please enter your phone number");
                return;
            }
            if (!city?.trim()) {
                toast.error("Please enter your city or location");
                return;
            }

            setSaving(true);

            let finalAvatarUrl = avatarUrl;

            if (selectedFile) {
                finalAvatarUrl = await uploadImageToServer(selectedFile, "/api/profile/upload");
                setAvatarUrl(finalAvatarUrl);
                setPreview("");
                setSelectedFile(null);
            }

            const payload = {
                id: user.userId,
                name: fullName.trim(),
                phone_number: phone.trim(),
                location: city.trim(),
                profileUrl: finalAvatarUrl,
            };

            const headers = { "Content-Type": "application/json" };
            if (user?.token) headers.Authorization = `Bearer ${user.token}`;

            const res = await fetch("/api/me", {
                method: "PATCH",
                headers,
                body: JSON.stringify(payload),
                credentials: "include",
            });

            const data = await res.json();

            setUser(prev => ({
                ...prev,
                name: payload.name,
                phone_number: payload.phone_number,
                location: payload.location,
                profileUrl: payload.profileUrl,
            }));

            if (!res.ok) {
                toast.error(`Error: ${data?.message || "Failed to save changes"}`);
                return;
            }

            setDirty(false);
            toast.success("Profile updated successfully 🎉");
        } catch (err) {
            toast.error(err.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            if (!pwd.current) {
                toast.error("Password Required");
                return;
            }
            if (pwd.next !== pwd.confirm) {
                toast.error("Passwords don't match");
                return;
            }

            setSaving(true);

            const payload = {
                email: user.email,
                currentPassword: pwd.current,
                newPassword: pwd.next
            };

            const headers = { "Content-Type": "application/json" };
            if (user?.token) headers.Authorization = `Bearer ${user.token}`;

            const res = await fetch("/api/compareAndSetPassword", {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(`Error: ${data?.message || "Failed to save changes"}`);
                return;
            }

            setDirty(false);
            toast.success("Password updated successfully 🎉");
        } catch (err) {
            toast.error(err.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    }


    return (
        <main className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    aria-label="Go back"
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Go back
                </button>
            </div>

            <header className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-neutral-100">Account settings</h1>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Manage your profile and property alerts.</p>
            </header>

            <div className="w-full rounded-2xl bg-white dark:bg-neutral-900 shadow-sm outline-1 outline-gray-200 dark:outline-neutral-800 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-[480px]">
                    <aside className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-neutral-800 bg-gray-50/60 dark:bg-neutral-900/60">
                        <nav className="p-2">
                            {tabs.map((t) => {
                                const selected = active === t;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setActive(t)}
                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${selected
                                            ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 shadow-sm ring-1 ring-gray-200 dark:ring-neutral-700"
                                            : "text-gray-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                                            }`}
                                    >
                                        <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-neutral-400" />
                                        {t}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="p-6">
                        {active === "Profile" && (
                            <>
                                <ProfileSection
                                    avatarUrl={avatarUrl}
                                    setAvatarUrl={setAvatarUrl}
                                    selectedFile={selectedFile}
                                    setSelectedFile={setSelectedFile}
                                    preview={preview}
                                    setPreview={setPreview}
                                    fullName={fullName}
                                    setFullName={setFullName}
                                    phone={phone}
                                    setPhone={setPhone}
                                    city={city}
                                    setCity={setCity}
                                />
                                <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-neutral-800 pt-4">
                                    <button
                                        disabled={!dirty || saving}
                                        className={`h-10 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition ${!dirty || saving ? "bg-blue-400 opacity-70" : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                        onClick={handleSaveDetails}
                                    >
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                </div>
                            </>

                        )}

                        {active === "Security" &&
                            <>
                                <SecuritySection pwd={pwd} setPwd={setPwd} />
                                <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-neutral-800 pt-4">
                                    <button
                                        disabled={!dirty || saving}
                                        className={`h-10 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition ${!dirty || saving ? "bg-blue-400 opacity-70" : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                        onClick={handleChangePassword}
                                    >
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                </div>
                            </>
                        }


                    </section>
                </div>
            </div >
        </main >
    );
}

function Section({ title, desc, children }) {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">{title}</h2>
                {desc && <p className="text-sm text-gray-500 dark:text-neutral-400">{desc}</p>}
            </div>
            <div className="grid gap-5">{children}</div>
        </div>
    );
}

function Field({ label, hint, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200">{label}</label>
            {children}
            {hint && <p className="text-xs text-gray-500 dark:text-neutral-400">{hint}</p>}
        </div>
    );
}

function Input({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
        />
    );
}

/* ---------- Profile Section (choose image only; saving happens in parent) ---------- */
function ProfileSection({
    avatarUrl,
    setAvatarUrl,
    selectedFile,
    setSelectedFile,
    preview,
    setPreview,
    fullName,
    setFullName,
    phone,
    setPhone,
    city,
    setCity,
}) {
    const onPick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setSelectedFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleRemove = () => {
        setAvatarUrl("/images/blank-profileImg.webp");
        setPreview("");
        setSelectedFile(null);
    };

    const displaySrc = preview || avatarUrl;

    return (
        <Section title="Profile" desc="Public information other buyers and agents may see on your inquiries.">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                    src={displaySrc}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900 shadow"
                />
                <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">
                        <input type="file" accept="image/*" className="hidden" onChange={onPick} />
                        Choose picture
                    </label>

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                    >
                        Remove
                    </button>
                </div>
            </div>

            <Field label="Full name">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Phone number">
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +234 810 000 0000" />
                </Field>
                <Field label="City / Area">
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lagos" />
                </Field>
            </div>
        </Section>
    );
}

/* ---------- Security Section (optional if you later PATCH password too) ---------- */
function SecuritySection({ pwd, setPwd }) {
    return (
        <Section title="Security" desc="Update your password.">
            <Field label="Current password">
                <Input
                    type="password"
                    value={pwd.current}
                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
                <Field label="New password">
                    <Input
                        type="password"
                        value={pwd.next}
                        onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                    />
                </Field>
                <Field label="Confirm new password">
                    <Input
                        type="password"
                        value={pwd.confirm}
                        onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                    />
                </Field>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
                Password must be 8+ characters with a number and a symbol.
            </p>
        </Section>
    );
}
