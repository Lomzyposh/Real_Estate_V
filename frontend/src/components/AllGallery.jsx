import React from "react";

const AllGallery = ({ images = [], setShowGallery }) => {
    const spanStyles = [
        "col-span-1 row-span-1",
        "col-span-2 row-span-1",
        "col-span-1 row-span-2",
        "col-span-2 row-span-2",
    ];

    const hasImages = Array.isArray(images) && images.length > 0;

    return (
        <div className="max-w-6xl mx-auto mt-20 px-4 py-10 text-gray-800 dark:text-white">
            {/* Back Button */}
            <button
                onClick={() => setShowGallery(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white mb-6 flex items-center gap-2 cursor-pointer transition-colors"
            >
                <i className="bi bi-arrow-left text-lg"></i>
                <span className="text-sm font-medium">Back to Details</span>
            </button>

            {/* If no images */}
            {!hasImages ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-[#111827]/40 text-center">
                    <i className="bi bi-image text-5xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        No Images Available
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        This property has no gallery images at the moment.
                    </p>
                </div>
            ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4">
                    {images.map((img, idx) => {
                        const span = spanStyles[idx % spanStyles.length];
                        return (
                            <div
                                key={idx}
                                className={`relative overflow-hidden rounded-2xl shadow-md hover:scale-[1.03] transition-transform duration-300 ease-out bg-gray-100 dark:bg-[#1e293b] ${span}`}
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
            )}
        </div>
    );
};

export default AllGallery;
