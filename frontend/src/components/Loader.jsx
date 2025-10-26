import React from "react";
import { useLoader } from "../contexts/LoaderContext";

export default function Loader({ logo = "/images/homeLogo.png" }) {
    const { showLoader, loaderText } = useLoader();
    if (!showLoader) return null;


    return (
        <div className="w-[100vw] h-[100vh] fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-emerald-800 animate-ping" />
                    <img
                        src={logo}
                        alt="Loading..."
                        className="relative w-15 h-15 animate-spin rounded-full object-contain drop-shadow"
                    />
                </div>
                {loaderText && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 animate-pulse">
                        {loaderText}
                    </p>
                )}
            </div>
        </div>
    );
}
