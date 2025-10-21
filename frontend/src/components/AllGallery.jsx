import { div } from "framer-motion/client";
import React from "react";

const AllGallery = ({ images, setShowGallery }) => {
    const spanStyles = [
        "col-span-1 row-span-1",
        "col-span-2 row-span-1",
        "col-span-1 row-span-2",
        "col-span-2 row-span-2",
    ];

    return (
        <div className="max-w-6xl mx-auto mt-20 px-4 py-10 text-gray-800 dark:text-white">
           
            <button
                  onClick={() => setShowGallery(false)}
                className="text-gray-300 hover:text-black dark:hover:text-white mb-6 flex items-center gap-2 cursor-pointer"
            >
                <span className="me-2">
                    <i className="bi bi-arrow-left"></i>
                </span>
                Back to Details
            </button>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4">
                {images?.map((img, idx) => {
                    const span = spanStyles[idx % spanStyles.length];
                    return (
                        <div
                            key={idx}
                            className={`relative overflow-hidden rounded-2xl shadow-md hover:scale-[1.03] transition-transform duration-300 ease-out bg-gray-100 ${span}`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <img
                                src={img.url}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-300" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AllGallery;
