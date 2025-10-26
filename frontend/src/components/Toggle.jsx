import React from "react";

export default function Toggle({ checked, onChange, className = "" }) {
    return (
        <>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={[
                    "relative inline-flex w-12 h-6 items-center rounded-full transition-colors duration-200",
                    checked ? "bg-green-600" : "bg-gray-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                    "dark:ring-offset-[#0b0b0b]",
                    className,
                ].join(" ")}
            >

                <span
                    className={[
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200",
                        checked ? "translate-x-6" : "translate-x-1",
                    ].join(" ")}
                />
            </button>
        </>
    );
}
