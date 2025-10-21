import React, { useEffect, useState } from "react";
import { FaWifi, FaParking, FaSwimmer, FaDumbbell, FaSnowflake, FaEye } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useLoader } from "../contexts/LoaderContext";
import { useSaved } from "../contexts/savedContext";
import AllGallery from "../components/AllGallery";
import { BsAspectRatio, BsHouseDoor, BsDropletHalf, BsHeart, BsHeartFill } from "react-icons/bs";

export default function HomeDetails() {
    const { id } = useParams();
    const { setShowLoader } = useLoader();
    const [property, setProperty] = useState(null);
    const [showGallery, setShowGallery] = useState(false);

    const { isSaved, toggleSaved } = useSaved();
    const saved = isSaved(property ? property.property_id : null);

    useEffect(() => {
        const fetchDetails = async () => {
            setShowLoader(true);
            try {
                const response = await fetch(`/api/properties/${id}`);
                const data = await response.json();
                setProperty(data.property);
                console.log(data.property);

            } catch (error) {
                console.error("Error fetching property details:", error);

            } finally {
                setShowLoader(false);
            }
        }
        fetchDetails();
    }, []);


    if (!property) {
        return (
            <section className="max-w-6xl mx-auto px-4 py-10 text-gray-800 dark:text-white">
                <p>Loading property details...</p>
            </section>
        );
    }

    const {
        street,
        price,
        sqft,
        bedrooms,
        bathrooms,
        agent = { name: "Maddie Molina" },
        main_image,
        images = [],
        more_text = "No description available."
    } = property;

    return (
        <>
            {
                showGallery ? <AllGallery images={images} setShowGallery={setShowGallery} /> : (
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
                                onClick={() => toggleSaved(property.property_id)}
                            >
                                {saved ? (
                                    <i className="bi bi-bookmark-fill text-amber-400 text-xl transition-transform duration-200 group-hover:scale-110"></i>
                                ) : (
                                    <i className="bi bi-bookmark text-gray-400 text-xl transition-transform duration-200 group-hover:scale-110"></i>
                                )}
                                <span className="font-medium text-base">
                                    {saved ? "Saved" : "Save"}
                                </span>
                            </button>

                        </div>

                        <div className="grid md:grid-cols-2 gap-3 rounded-xl overflow-hidden">
                            <img
                                src={main_image}
                                alt="main"
                                className="w-full h-[400px] object-cover rounded-lg"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                {images.slice(1, 5).map((img, idx) =>
                                    idx === 3 && images.length > 5 ? (
                                        <div key={idx} className="relative cursor-pointer" onClick={() => setShowGallery(true)}>
                                            <img
                                                src={img.url}
                                                alt={`sub-${idx}`}
                                                className="w-full h-[195px] object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-[#000000ac] bg-opacity-50 flex items-center justify-center rounded-lg">
                                                <span className="text-white text-lg">+{images.length - 4} more</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            key={idx}
                                            src={img.url}
                                            alt={`sub-${idx}`}
                                            className="w-full h-[195px] object-cover rounded-lg"
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <p className="text-gray-400">{street}</p>
                                <h2 className="text-3xl font-bold mt-2">${Number(price).toLocaleString()}</h2>
                                <p className="text-gray-400 mt-2">Pricing details and terms</p>

                                <div className="flex items-center gap-8 mt-5 text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center gap-1">
                                        <BsAspectRatio className="text-gray-500" />
                                        <strong>{sqft}</strong> sqft
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BsHouseDoor className="text-gray-500" />
                                        <strong>{bedrooms}</strong> beds
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BsDropletHalf className="text-gray-500" />
                                        <strong>{bathrooms}</strong> baths
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-6">
                                    <img
                                        src="https://i.pravatar.cc/40"
                                        alt="agent"
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <p className="font-semibold">{agent.name}</p>
                                        <p className="text-gray-500 text-sm">Agent</p>
                                    </div>
                                </div>

                                <button className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900">
                                    Send a request
                                </button>
                            </div>

                            <div className="flex flex-col flex-1 gap-5">
                                <div className="special">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                                        Special Features
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "Eating Area - Breakfast Bar",
                                            "Island",
                                            "Custom Cabinetry",
                                            "Solid Surface Counter",
                                            "Updated Kitchen",
                                        ].map((feature, i) => (
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

                                <div>
                                    <h3 className="text-xl font-semibold mb-2">About apartment</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-3">{more_text}</p>

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

                        {/* <div className="mt-10 flex gap-3">
                            <button className="border px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                                Save
                            </button>
                            <button className="border px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                                Share
                            </button>
                        </div> */}
                    </section>
                )}
        </>
    );

}

function Feature({ icon, text }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-300">{icon}</span>
            <span>{text}</span>
        </div>
    );
}
