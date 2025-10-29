// src/components/PropertyQuickAdd.jsx
import React, { useMemo, useRef, useState } from "react";
import { useAdmin } from "../contexts/AdminContext";
import { AgentComboBox } from "./AgentCombox";
import { toast } from "react-toastify";

const PROPERTY_TYPES = ["House", "Townhouse", "Condo", "Apartment", "Duplex"];
const HOME_TYPES = ["SingleFamily", "Townhouse", "Condominium", "Loft"];
const STATUSES = ["For Sale", "For Rent"];

function FieldError({ msg }) {
    return <p className="text-xs text-red-500">{msg}</p>;
}

/* ---------- Multi-upload helper you provided (kept) ---------- */
export async function uploadImagesToServer(files, endpoint = "/api/uploads/images") {
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));

    const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Upload failed");

    return data.files || []; // [{url, public_id, ...}]
}

function InlineMultiUpload({ value = [], onChange, disabled }) {
    const [busy, setBusy] = useState(false);
    const inputRef = useRef();

    const pick = () => inputRef.current?.click();

    const onFiles = async (e) => {
        const files = e.target.files;
        if (!files?.length) return;
        try {
            setBusy(true);
            const uploaded = await uploadImagesToServer(files, "/api/uploads/images");
            const next = [...value, ...uploaded];
            onChange?.(next);
        } catch (err) {
            alert(err.message || "Upload failed");
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const removeAt = (idx) => {
        const next = value.filter((_, i) => i !== idx);
        onChange?.(next);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={pick}
                    disabled={disabled || busy}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50"
                >
                    {busy ? "Uploading…" : "Select Images"}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFiles}
                    className="hidden"
                />
                {value?.length > 0 && (
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                        {value.length} photo{value.length > 1 ? "s" : ""} selected
                    </span>
                )}
            </div>

            {value?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {value.map((img, i) => (
                        <div
                            key={img.public_id || img.url || i}
                            className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10"
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="w-full h-32 object-cover"
                                loading="lazy"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(i)}
                                className="absolute top-1 right-1 rounded-full px-2 py-0.5 text-xs bg-black/70 text-white"
                                title="Remove"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PropertyQuickAdd({ onCreated }) {
    const { agents = [], loading: agentsLoading } = useAdmin();

    const [step, setStep] = useState(0);
    const [nextLock, setNextLock] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        agentId: "",
        property_type: "House",
        home_type: "SingleFamily",
        status: "For Sale",

        price: "",
        bedrooms: "",
        bathrooms: "",
        sqft: "",

        street: "",
        city: "",
        zip_code: "",
        latitude: "",
        longitude: "",

        year_built: "",
        acres: "",
        parking_spaces: "",

        main_image: "",
        images: [],
        hoa_has: false,
        hoa_fee: "",
        electric: "Circuit Breakers",
        sewer: "Public Sewer",
        water: "Public",
    });

    const set = (key) => (e) => {
        const v =
            e?.target?.type === "checkbox"
                ? e.target.checked
                : e?.target?.value ?? e;
        setForm((f) => ({ ...f, [key]: v }));
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    // keep images setter to also auto-fill main_image (first image) if empty
    const setImages = (imgs) => {
        setForm((f) => {
            const next = { ...f, images: imgs };
            if (!next.main_image && imgs[0]?.url) {
                next.main_image = imgs[0].url;
            }
            return next;
        });
        setErrors((prev) => {
            if (!prev.images) return prev;
            const n = { ...prev };
            delete n.images;
            return n;
        });
    };

    const toNumberOrNull = (v) => {
        const s = String(v ?? "").trim();
        if (s === "") return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    };

    const isPositiveNumber = (v) => {
        const n = toNumberOrNull(v);
        return n !== null && n > 0;
    };

    const isNonNegativeNumber = (v) => {
        const n = toNumberOrNull(v);
        return n !== null && n >= 0;
    };

    const isUrlLike = (v) => {
        const s = String(v || "").trim();
        if (!s) return true;
        try {
            const u = new URL(s);
            return !!u.protocol && !!u.hostname;
        } catch {
            return false;
        }
    };

    const canNextFromStep0 = useMemo(
        () => !!String(form.agentId).trim(),
        [form.agentId]
    );

    const canNextFromStep1 = useMemo(() => {
        return (
            !!form.property_type &&
            !!form.home_type &&
            !!form.status &&
            isPositiveNumber(form.price) &&
            isPositiveNumber(form.bedrooms) &&
            isPositiveNumber(form.bathrooms) &&
            isPositiveNumber(form.sqft)
        );
    }, [form]);

    const canNextFromStep2 = useMemo(() => {
        return !!form.street.trim() && !!form.zip_code.trim() && !!form.city;
    }, [form]);

    const isFinalStep = step === 4;

    const canSubmit = useMemo(
        () => isFinalStep && canNextFromStep0 && canNextFromStep1 && canNextFromStep2,
        [isFinalStep, canNextFromStep0, canNextFromStep1, canNextFromStep2]
    );

    const validateStep = (stepIndex, setErr = true) => {
        const stepErrors = {};

        if (stepIndex === 0) {
            if (!form.agentId.trim()) stepErrors.agentId = "Select an agent.";
        }

        if (stepIndex === 1) {
            if (!form.property_type) stepErrors.property_type = "Required.";
            if (!form.home_type) stepErrors.home_type = "Required.";
            if (!form.status) stepErrors.status = "Required.";
            if (!isPositiveNumber(form.price)) stepErrors.price = "Enter valid price.";
            if (!isPositiveNumber(form.bedrooms)) stepErrors.bedrooms = "Enter valid number.";
            if (!isPositiveNumber(form.bathrooms)) stepErrors.bathrooms = "Enter valid number.";
            if (!isPositiveNumber(form.sqft)) stepErrors.sqft = "Enter valid sqft.";

        }

        if (stepIndex === 2) {
            if (!form.street.trim()) stepErrors.street = "Street is required.";
            if (!form.city.trim()) stepErrors.city = "City is required.";
            if (!form.zip_code.trim()) stepErrors.zip_code = "ZIP code is required.";
            if (String(form.latitude).trim() && toNumberOrNull(form.latitude) === null)
                stepErrors.latitude = "Latitude must be a number.";
            if (String(form.longitude).trim() && toNumberOrNull(form.longitude) === null)
                stepErrors.longitude = "Longitude must be a number.";
        }

        if (stepIndex === 3) {
            const ybRaw = String(form.year_built).trim();
            if (ybRaw) {
                const yb = toNumberOrNull(form.year_built);
                if (yb === null) {
                    stepErrors.year_built = "Year built must be a number.";
                } else {
                    const currentYear = new Date().getFullYear();
                    if (yb > currentYear) {
                        alert(`Year built can’t be in the future (>${currentYear} `);
                        stepErrors.year_built = `Year built can’t be in the future (>${currentYear}).`;
                    }
                    // Optional: basic lower bound
                    // else if (yb < 1800) {
                    //   stepErrors.year_built = "Year built looks too old. Please check.";
                    // }
                }
            }

            if (String(form.acres).trim() && !isNonNegativeNumber(form.acres))
                stepErrors.acres = "Acres must be a number.";
            if (String(form.parking_spaces).trim() && !isNonNegativeNumber(form.parking_spaces))
                stepErrors.parking_spaces = "Parking spaces must be a number.";
        }


        if (stepIndex === 4) {
            if (!isUrlLike(form.main_image)) stepErrors.main_image = "Invalid image URL.";
            if (form.hoa_has) {
                if (!String(form.hoa_fee).trim() || !isNonNegativeNumber(form.hoa_fee))
                    stepErrors.hoa_fee = "Enter valid HOA fee.";
            }
            if (!String(form.electric).trim()) stepErrors.electric = "Electric required.";
            if (!String(form.sewer).trim()) stepErrors.sewer = "Sewer required.";
            if (!String(form.water).trim()) stepErrors.water = "Water required.";
        }

        if (setErr) setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const attemptNext = () => {
        if (nextLock) return;
        if (validateStep(step, true)) {
            setNextLock(true);
            setStep((s) => Math.min(4, s + 1));
            setTimeout(() => setNextLock(false), 200);
        }
    };

    const onFormKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (step < 4) attemptNext();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step < 4) {
            attemptNext();
            return;
        }

        const validAll =
            validateStep(0, true) &&
            validateStep(1, true) &&
            validateStep(2, true) &&
            validateStep(4, true);
        if (!validAll) return;

        setSubmitting(true);
        setError("");

        const payload = {
            agentId: form.agentId,
            property_type: form.property_type,
            home_type: form.home_type,
            status: form.status,
            price: toNumberOrNull(form.price),
            bedrooms: toNumberOrNull(form.bedrooms),
            bathrooms: toNumberOrNull(form.bathrooms),
            sqft: toNumberOrNull(form.sqft),
            street: form.street,
            city: form.city,
            zip_code: form.zip_code,
            latitude: toNumberOrNull(form.latitude),
            longitude: toNumberOrNull(form.longitude),
            year_built: toNumberOrNull(form.year_built),
            acres: toNumberOrNull(form.acres),
            parking_spaces: toNumberOrNull(form.parking_spaces),

            main_image: form.main_image || (form.images[0]?.url ?? null),

            images: form.images?.map((x) => ({ url: x.url, public_id: x.public_id })) || [],

            hoa_has: form.hoa_has ? 1 : 0,
            hoa_fee: form.hoa_has ? toNumberOrNull(form.hoa_fee) : null,
            electric: form.electric,
            sewer: form.sewer,
            water: form.water,
            is_demo: 0,
        };

        try {
            const res = await fetch("/api/add/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `Failed (${res.status})`);
            }
            const created = await res.json();
            toast.success(`Property Uploaded Successfully ✅`);
            onCreated?.(created);

            setForm((f) => ({
                ...f,
                price: "",
                bedrooms: "",
                bathrooms: "",
                sqft: "",
                street: "",
                city: "",
                zip_code: "",
                latitude: "",
                longitude: "",
                year_built: "",
                acres: "",
                parking_spaces: "",
                main_image: "",
                images: [],
                hoa_has: false,
                hoa_fee: "",
            }));
            setErrors({});
            setStep(0);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            onSubmitCapture={(e) => {
                if (step < 4) {
                    e.preventDefault();
                    attemptNext();
                }
            }}
            onKeyDown={onFormKeyDown}
            className="w-full max-w-4xl mx-auto rounded-2xl p-8 md:p-10 shadow-xl bg-transparent backdrop-blur border dark:border-white/10"
            id="addForm"
        >
            <header className="mb-10 text-center">
                <h2 className="font-['Prata'] text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">
                    Have a property you’d like to sell?
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Fill in your property details below to get started.
                </p>
                <div className="mt-4 text-sm text-gray-800 dark:text-gray-200">
                    Step <b className="text-orange-500">{step + 1}</b>/5
                </div>
            </header>

            {step === 0 && (
                <div className="grid gap-4 text-[#333] dark:text-white">
                    <AgentComboBox
                        agents={agents}
                        value={form.agentId}
                        onChange={set("agentId")}
                        loading={agentsLoading}
                    />
                    {errors.agentId && <FieldError msg={errors.agentId} />}
                </div>
            )}

            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Property Type" options={PROPERTY_TYPES} value={form.property_type} onChange={set("property_type")} />
                    <Select label="Home Type" options={HOME_TYPES} value={form.home_type} onChange={set("home_type")} />
                    <Select label="Status" options={STATUSES} value={form.status} onChange={set("status")} />
                    <Input label="Price (₦ / $)" type="number" value={form.price} onChange={set("price")} required />
                    <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={set("bedrooms")} required />
                    <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={set("bathrooms")} required />
                    <Input label="Square Feet" type="number" value={form.sqft} onChange={set("sqft")} required />
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="City" value={form.city} onChange={set("city")} required />
                    <Input label="Street" value={form.street} onChange={set("street")} required />
                    <Input label="ZIP / Postal Code" value={form.zip_code} onChange={set("zip_code")} required />
                    <Input label="Latitude" type="number" value={form.latitude} onChange={set("latitude")} />
                    <Input label="Longitude" type="number" value={form.longitude} onChange={set("longitude")} />
                </div>
            )}

            {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Year Built" type="number" value={form.year_built} onChange={set("year_built")} />
                    <Input label="Lot Size (acres)" type="number" value={form.acres} onChange={set("acres")} />
                    <Input label="Parking Spaces" type="number" value={form.parking_spaces} onChange={set("parking_spaces")} />
                </div>
            )}

            {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Multi image uploader */}
                    <div className="md:col-span-2">
                        <label className="block">
                            <span className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                                Property Photos
                            </span>
                            <InlineMultiUpload
                                value={form.images}
                                onChange={setImages}
                            />
                        </label>
                        {errors.images && <FieldError msg={errors.images} />}
                    </div>

                    <Input label="Main Image URL (optional)" value={form.main_image} onChange={set("main_image")} />
                    <Checkbox label="Has HOA?" checked={!!form.hoa_has} onChange={set("hoa_has")} id="hoa_has" />
                    {form.hoa_has && <Input label="HOA Fee" type="number" value={form.hoa_fee} onChange={set("hoa_fee")} />}
                    <Input label="Electric" value={form.electric} onChange={set("electric")} />
                    <Input label="Sewer" value={form.sewer} onChange={set("sewer")} />
                    <Input label="Water" value={form.water} onChange={set("water")} />
                </div>
            )}

            <div className="mt-8 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="px-4 py-2 text-[#333] dark:text-white rounded-xl border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-60"
                    disabled={step === 0 || submitting}
                >
                    Back
                </button>

                <div className="flex items-center gap-3">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                attemptNext();
                            }}
                            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all disabled:opacity-50"
                            disabled={
                                submitting ||
                                (step === 0 && !canNextFromStep0) ||
                                (step === 1 && !canNextFromStep1) ||
                                (step === 2 && !canNextFromStep2)
                            }
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all disabled:opacity-50"
                            disabled={submitting || !canSubmit}
                        >
                            {submitting ? "Saving…" : "Save Property"}
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}

function Input({ label, required, ...rest }) {
    return (
        <label className="block">
            <span className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                {label}
                {required ? " *" : ""}
            </span>
            <input
                {...rest}
                className="w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-zinc-900/60 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400/30"
            />
        </label>
    );
}

function Select({ label, options = [], value, onChange }) {
    return (
        <label className="block">
            <span className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                {label}
            </span>
            <select
                value={value}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-zinc-900/60 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400/30"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </label>
    );
}

function Checkbox({ id, label, checked, onChange }) {
    return (
        <div className="flex items-center gap-3">
            <input
                id={id}
                type="checkbox"
                checked={!!checked}
                onChange={onChange}
                className="h-4 w-4 accent-orange-500"
            />
            <label htmlFor={id} className="text-sm text-gray-700 dark:text-gray-200">
                {label}
            </label>
        </div>
    );
}
