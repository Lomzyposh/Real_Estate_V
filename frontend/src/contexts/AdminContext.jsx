// src/contexts/AdminContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useLoader } from "./LoaderContext";

/**
 * AdminContext centralizes platform-wide datasets:
 * - users (all), agents (all), properties (all)
 * It exposes loading state and small helpers.
 *
 * Endpoints expected (adjust to your server.js):
 *  GET /api/admin/users
 *  GET /api/admin/agents
 *  GET /api/admin/properties
 *
 * All requests use `credentials: 'include'` to support cookie sessions.
 */

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
    const { user } = useAuth();
    const { setShowLoader } = useLoader();

    const [users, setUsers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let alive = true;
        const controller = new AbortController();

        async function loadAll() {
            setLoading(true);
            setError(null);
            try {
                const role = user?.role || user?.accountType || user?.type;
                // if (!role || !/admin/i.test(String(role))) {
                //     if (alive) {
                //         setUsers([]); setAgents([]); setProperties([]);
                //         setLoading(false);
                //     }
                //     return;
                // }

                const [uRes, aRes, pRes] = await Promise.all([
                    fetch("/api/admin/users", { credentials: "include", signal: controller.signal }),
                    fetch("/api/admin/agents", { credentials: "include", signal: controller.signal }),
                    fetch("/api/admin/properties", { credentials: "include", signal: controller.signal }),
                ]);

                const bad = [uRes, aRes, pRes].find((r) => !r.ok);
                if (bad) {
                    const txt = await bad.text().catch(() => "");
                    throw new Error(txt || `Admin fetch failed with ${bad.status}`);
                }

                const [uJson, aJson, pJson] = await Promise.all([uRes.json(), aRes.json(), pRes.json()]);

                if (!alive) return;
                setUsers(Array.isArray(uJson) ? uJson : uJson?.data || []);
                setAgents(Array.isArray(aJson) ? aJson : aJson?.data || []);
                setProperties(Array.isArray(pJson) ? pJson : pJson?.data || []);
            } catch (err) {
                if (!alive) return;
                setError(err?.message || "Failed to load admin datasets.");
            } finally {
                if (alive) setLoading(false);
            }
        }

        loadAll();
        return () => {
            alive = false;
            controller.abort();
        };
    }, [user]);

    useEffect(() => setShowLoader(Boolean(loading)), [loading, setShowLoader]);

    const totals = useMemo(() => {
        const totalUsers = users.length;
        const totalAgents = agents.length;
        const totalProps = properties.length;

        const forRent = properties.filter((p) => /rent/i.test(p?.status || "")).length;
        const forSale = properties.filter((p) => /sale/i.test(p?.status || "")).length;

        const pending = properties.filter((p) =>
            /(submitted|under_review|pending|awaiting)/i.test(p?.status || "")
        ).length;

        return { totalUsers, totalAgents, totalProps, forRent, forSale, pending };
    }, [users, agents, properties]);

    const togglePublished = async (propertyId, desired) => {
        const idx = properties.findIndex((p) => String(p.property_id) === String(propertyId));
        if (idx < 0) return false;

        const prev = properties[idx]?.isPublished === true;
        const next = typeof desired === "boolean" ? desired : !prev;
    
        setProperties((list) =>
            list.map((p) =>
                String(p.property_id) === String(propertyId) ? { ...p, isPublished: next } : p
            )
        );

        try {
            const res = await fetch(`/api/admin/properties/${propertyId}/published`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ published: next }),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `Failed (${res.status})`);
            }

            const updated = await res.json();

            setProperties((list) =>
                list.map((p) =>
                    String(p.property_id) === String(propertyId) ? { ...p, ...updated } : p
                )
            );

            return true;
        } catch (err) {
            setProperties((list) =>
                list.map((p) =>
                    String(p.property_id) === String(propertyId) ? { ...p, isPublished: prev } : p
                )
            );
            setError(err?.message || "Failed to toggle property publish state.");
            return false;
        }
    };


    const value = useMemo(
        () => ({
            users,
            agents,
            properties,
            loading,
            error,
            totals,
            togglePublished,
            refetch: async () => {
                try {
                    const [uRes, aRes, pRes] = await Promise.all([
                        fetch("/api/admin/users", { credentials: "include" }),
                        fetch("/api/admin/agents", { credentials: "include" }),
                        fetch("/api/admin/properties", { credentials: "include" }),
                    ]);
                    const [uJson, aJson, pJson] = await Promise.all([uRes.json(), aRes.json(), pRes.json()]);
                    setUsers(Array.isArray(uJson) ? uJson : uJson?.data || []);
                    setAgents(Array.isArray(aJson) ? aJson : aJson?.data || []);
                    setProperties(Array.isArray(pJson) ? pJson : pJson?.data || []);
                } catch (_) { }
            },
        }),
        [users, agents, properties, loading, error, totals]
    );

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within <AdminProvider>");
    return ctx;
}
