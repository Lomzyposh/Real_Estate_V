import React from "react";
import { useAuth } from "../contexts/AuthContext";
import UnauthorizedOverlay from "./UnAuth";

export default function RequireAgent({ children }) {
    const { user, statusLoading } = useAuth();

    if (statusLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-neutral-600 dark:text-neutral-200">
                Checking authorization...
            </div>
        );
    }

    if (!user || user.role !== "agent") {
        return <UnauthorizedOverlay message="Only agents can view this page." />;
    }

    return children;
}