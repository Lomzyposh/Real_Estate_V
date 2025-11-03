import React, { useEffect, useState } from "react";
import { FaWifi, FaParking, FaSwimmer, FaDumbbell, FaSnowflake, FaEye } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useLoader } from "../contexts/LoaderContext";
import { useSaved } from "../contexts/SavedContext";
import AllGallery from "../components/AllGallery";
import { BsAspectRatio, BsHouseDoor, BsDropletHalf } from "react-icons/bs";
import toast from "react-hot-toast";

export default function HomeDetails() {
    const { id } = useParams();
    const { setShowLoader } = useLoader();
    const [property, setProperty] = useState(null);
    const [showGallery, setShowGallery] = useState(false);
    const [localNote, setLocalNote] = useState('');


    const { isSaved, toggleSaved } = useSaved();
    const saved = isSaved(property ? property.property_id : null);

    useEffect(() => {
        if (property) {
            const city = property.city || property.location?.city || "";
            const street = property.street || property.location?.street || "";
            const zip = property.zip_code || property.location?.ZipCode || "";
            const price = property.price ? `$${Number(property.price).toLocaleString()}` : "";

            const descParts = [
                street && `${street}`,
                city && `${city}`,
                zip && `(${zip})`,
            ].filter(Boolean).join(", ");

            setLocalNote(`Hello, I would like to enquire about the property at ${descParts}${price ? ` listed for ${price}` : ""}. Please share more details.`);
        }
    }, [property]);


    useEffect(() => {
        const fetchDetails = async () => {
            setShowLoader(true);
            try {
                const response = await fetch(`/api/properties/${id}?t=${Date.now()}`);
                const data = await response.json();
                setProperty(data.property);
                console.log("Prop refreshed:", data.property);
            } catch (error) {
                console.error("Error fetching property details:", error);
            } finally {
                setShowLoader(false);
            }
        };

        fetchDetails();

        const handleFocus = () => fetchDetails();
        window.addEventListener("focus", handleFocus);

        return () => window.removeEventListener("focus", handleFocus);
    }, [id, setShowLoader]);


    if (!property) {
        return (
            <section className="max-w-6xl mx-auto px-4 py-10 text-gray-800 dark:text-white">
                <p>Loading property details...</p>
            </section>
        );
    }

    const fallbackAgent = {
        email: "alameenolomo@gmail.com",
        name: "Lomzy",
        profileUrl:
            "https://res.cloudinary.com/dt6udjm4i/image/upload/v1761397604/profile_pictures/utfbzbnb3pocqs22cnox.png",
        userId: "user000001",
    };

    const {
        street = "—",
        home_type = "Home",
        price = 0,
        sqft = 0,
        bedrooms = 0,
        bathrooms = 0,
        main_image,
        published,
        images: rawImages,
        more_text = "No description available.",
    } = property;

    const images = Array.isArray(rawImages) ? rawImages : [];
    const hasMain = Boolean(main_image);
    const hasGallery = images.length > 0;
    let specials = [];
    try {
        specials = JSON.parse(property.specials || "[]").map(s => s.item || s);
    } catch {
        specials = [];
    }
    const hasAnyImage = hasMain || hasGallery;
    const isPublished = published === true || published === 1 || published === "1";

    const agent = property.agent ? { ...property.agent } : fallbackAgent;

    const initials =
        (agent?.name || "")
            .split(" ")
            .map((x) => x[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "AG";

    return (
        <>
            {showGallery ? (
                <AllGallery images={images} setShowGallery={setShowGallery} />
            ) : (
                <section className="max-w-6xl mx-auto mt-20 px-4 py-10 text-gray-800 dark:text-white">

                    <div className="flex items-center justify-between mb-2">
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                aria-label="Go back"
                                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Go back
                            </button>
                        </div>

                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer
               bg-[#f3f3f3] dark:bg-[#373737]
               text-gray-700 dark:text-gray-200
               hover:bg-[#e9e9e9] dark:hover:bg-[#444]
               transition-all duration-300 hover:shadow-md select-none
               shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)]"

                        >
                            {saved ? (
                                <i className="bi bi-bookmark-fill text-amber-400 text-xl transition-transform duration-200 group-hover:scale-110"></i>
                            ) : (
                                <i className="bi bi-bookmark text-gray-400 text-xl transition-transform duration-200 group-hover:scale-110"></i>
                            )}
                            <span className="font-medium text-base">{saved ? "Saved" : "Save"}</span>
                        </button>
                        <button
                            onClick={() => toggleSaved(property.property_id)}
                            aria-label={saved ? "Remove from saved" : "Save home"}
                            className={`absolute top-3 right-3 grid place-items-center h-9 w-9 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur border border-black/10 dark:border-white/10 shadow
        ${saved ? "text-red-500" : "text-gray-700 dark:text-gray-200"}`}
                        >

                            <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 rounded-xl overflow-hidden">
                        {hasMain ? (
                            <img src={main_image} alt="Main property" className="w-full h-[400px] object-cover rounded-lg" />
                        ) : (
                            <NoImageBox className="h-[400px] rounded-lg" title="No Main Image" subtitle="This listing has no primary photo yet." />
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            {hasGallery ? (
                                images.slice(0, 4).map((img, idx) => {
                                    const isLastMore = idx === 3 && images.length > 4;
                                    if (isLastMore) {
                                        return (
                                            <div key={idx} className="relative cursor-pointer" onClick={() => setShowGallery(true)}>
                                                <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-[195px] object-cover rounded-lg" />
                                                <div className="absolute inset-0 bg-[#000000ac] bg-opacity-50 flex items-center justify-center rounded-lg">
                                                    <span className="text-white text-lg">+{images.length - 3} more</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return <img key={idx} src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-[195px] object-cover rounded-lg" />;
                                })
                            ) : (
                                <>
                                    <NoImageBox compact title="No Gallery Images" subtitle="Additional photos will appear here." />
                                    <NoImageBox compact />
                                    <NoImageBox compact />
                                    <NoImageBox compact />
                                </>
                            )}
                        </div>
                    </div>

                    {hasGallery && (
                        <div className="mt-3">
                            <button
                                onClick={() => setShowGallery(true)}
                                className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:underline"
                            >
                                Open full gallery
                            </button>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                            {isPublished ? (
                                <Badge tone="success">Active</Badge>
                            ) : (
                                <Badge tone="danger">InActive</Badge>
                            )}

                            <p className="text-gray-400">{street}</p>
                            <h2 className="text-3xl font-bold mt-2">${Number(price || 0).toLocaleString()}</h2>
                            <p className="text-gray-400 mt-2">Pricing details and terms</p>

                            <div className="flex items-center gap-8 mt-5 text-gray-800 dark:text-gray-200">
                                <div className="flex items-center gap-1">
                                    <BsAspectRatio className="text-gray-500" />
                                    <strong>{sqft || 0}</strong> sqft
                                </div>
                                <div className="flex items-center gap-1">
                                    <BsHouseDoor className="text-gray-500" />
                                    <strong>{bedrooms || 0}</strong> beds
                                </div>
                                <div className="flex items-center gap-1">
                                    <BsDropletHalf className="text-gray-500" />
                                    <strong>{bathrooms || 0}</strong> baths
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-6">
                                {agent?.profileUrl ? (
                                    <img
                                        src={agent.profileUrl}
                                        alt="agent"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 grid place-items-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                                        {initials}
                                    </div>
                                )}

                                <div>
                                    <p className="font-semibold">{agent?.agentName || "Agent"}</p>
                                    {property.agentApproved == 1 ? (
                                        <p className="text-sm text-green-600">Approved Agent</p>
                                    ) : (
                                        <p className="text-sm text-yellow-600">Pending Approval</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Reference Note (local only)
                                </label>
                                <textarea
                                    value={localNote}
                                    onChange={(e) => setLocalNote(e.target.value)}
                                    rows={3}
                                    placeholder="Add your enquiry or note about this property..."
                                    className="w-full resize-none px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
             bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200
             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none
             transition-all duration-200 font-[inter] leading-relaxed shadow-sm"
                                />

                            </div>


                            <button
                                onClick={() => {
                                    setLocalNote("");
                                    toast.success("Enquiry sent");

                                }}
                                className={`mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 ${!isPublished || !(property.agentApproved == 1) && "cursor-not-allowed opacity-70"}`}
                                disabled={!isPublished || !(property.agentApproved == 1)}
                            >
                                Send a request
                            </button>
                        </div>

                        <div className="flex flex-col flex-1 gap-5">
                            {
                                specials &&
                                <div className="special">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Special Features</h3>

                                    <div className="flex flex-wrap gap-2">
                                        {specials.map((feature, i) => (
                                            <div
                                                key={i}
                                                className="px-3 py-1 rounded-full text-sm font-medium
                      bg-[#f3f3f3] dark:bg-[#373737]
                      text-gray-700 dark:text-gray-200
                      hover:bg-gray-200 dark:hover:bg-[#4a4a4a]
                      transition-all duration-200 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),inset_0px_-2px_4px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.3)] cursor-default"
                                            >
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }

                            <div>
                                <h3 className="text-xl font-semibold mb-2">About {home_type}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-3 font-[inter]">{more_text}</p>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                                    <Feature icon={<FaWifi />} text="Wi-Fi" />
                                    <Feature icon={<FaParking />} text="Free parking" />
                                    <Feature icon={<FaSwimmer />} text="Swimming pool" />
                                    <Feature icon={<FaDumbbell />} text="Gym" />
                                    <Feature icon={<FaSnowflake />} text="Air conditioning" />
                                    <Feature icon={<FaEye />} text="Lake view" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

/* ---------- Small helpers ---------- */
function Feature({ icon, text }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-300">{icon}</span>
            <span>{text}</span>
        </div>
    );
}

function Badge({ tone = "neutral", children }) {
    const tones = {
        success:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        neutral: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-200",
    };
    return (
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${tones[tone]}`}>
            <span
                className={`inline-block w-2 h-2 rounded-full ${tone === "success" ? "bg-green-500" : tone === "danger" ? "bg-red-500" : "bg-gray-400"
                    }`}
            />
            {children}
        </div>
    );
}

function NoImageBox({ title = "No Image Available", subtitle = "Images will appear here.", compact = false, className = "" }) {
    return (
        <div
            className={[
                "w-full grid place-items-center text-center border border-dashed rounded-lg",
                "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111827]/40",
                compact ? "h-[195px] p-4" : "h-full p-6",
                className,
            ].join(" ")}
        >
            <div>
                <i className="bi bi-image text-3xl md:text-4xl text-gray-400" />
                {!compact && (
                    <>
                        <h4 className="mt-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                    </>
                )}
            </div>
        </div>
    );
}
