// src/components/RequireAdmin.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const role = user?.role || user?.accountType || user?.type;
    const isAdmin = /admin/i.test(String(role || ""));

    if (!user) {
        // Not logged in
        return (
            <div className="min-h-[50vh] grid place-items-center text-center p-6">
                <div>
                    <h2 className="text-xl font-semibold">Please sign in</h2>
                    <p className="text-sm text-gray-500 mt-1">You need an account to continue.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-4 px-4 py-2 rounded-lg border border-indigo-300 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
                    >
                        Go to login
                    </button>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[50vh] grid place-items-center text-center p-6">
                <div>
                    <h2 className="text-xl font-semibold">Access restricted</h2>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
