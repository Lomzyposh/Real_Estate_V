import React from "react";

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm w-full">
                <p className="text-center text-gray-800 dark:text-gray-200 mb-6">
                    {message}
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => onConfirm(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => onCancel(false)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}
