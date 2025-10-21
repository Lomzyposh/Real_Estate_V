import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedOverlay({
    seconds = 5,
    message = "You are not authorized to view this page.",
}) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const navigate = useNavigate();

    useEffect(() => {
        if (timeLeft <= 0) {
            navigate('/');
            return;
        }
        const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [timeLeft]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Unauthorized"
        >
            <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-neutral-900">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 flex items-center justify-center text-2xl">
                    !
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {message}
                </h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                    Redirecting in <span className="font-bold">{timeLeft}</span>…
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                        onClick={() => setTimeLeft(0)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 active:scale-95 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-white"
                    >
                        Continue
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-800 border border-neutral-300 hover:bg-neutral-100 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
