// src/contexts/SavedContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const SavedContext = createContext(null);
export { SavedContext };

function toIdStr(id) {
    // normalize everything to string to avoid includes() mismatch
    if (id == null) return "";
    return String(id);
}

export function SavedProvider({ children }) {
    const { user } = useAuth(); // expects { userId, token? }
    const [savedSet, setSavedSet] = useState(() => new Set());
    const [loading, setLoading] = useState(false);
    const pending = useRef(new Set()); // prevent double-click races

    // --- API helpers
    async function fetchSaved() {
        try {
            setLoading(true);
            const headers = { "Content-Type": "application/json" };
            if (user?.token) headers.Authorization = `Bearer ${user.token}`;

            const res = await fetch("/api/getSaved", {
                method: "GET",
                credentials: "include",
                headers,
            });

            if (!res.ok) throw new Error(`fetchSaved ${res.status}`);
            const data = await res.json();
            const list = Array.isArray(data?.saved) ? data.saved : [];
            
            setSavedSet(new Set(list.map(toIdStr)));
        } catch (err) {
            console.error("Error fetching saved:", err);
            if (!user?.userId) {
                const raw = localStorage.getItem("savedProperties") || "[]";
                try {
                    const arr = JSON.parse(raw);
                    setSavedSet(new Set((Array.isArray(arr) ? arr : []).map(toIdStr)));
                } catch {
                    setSavedSet(new Set());
                }
            } else {
                setSavedSet(new Set());
            }
        } finally {
            setLoading(false);
        }
    }

    // persist guest saves locally
    function persistGuest(nextSet) {
        if (user?.userId) return;
        const arr = Array.from(nextSet);
        localStorage.setItem("savedProperties", JSON.stringify(arr));
    }

    const isSaved = useMemo(
        () => (propertyId) => savedSet.has(toIdStr(propertyId)),
        [savedSet]
    );

    const toggleSaved = async (propertyId) => {
        const id = toIdStr(propertyId);
        if (!id) return;

        if (pending.current.has(id)) return;
        pending.current.add(id);

        setSavedSet((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            persistGuest(next);
            return next;
        });

        try {
            if (user?.userId) {
                const headers = { "Content-Type": "application/json" };
                if (user?.token) headers.Authorization = `Bearer ${user.token}`;

                const res = await fetch("/api/saved", {
                    method: "POST",
                    credentials: "include",
                    headers,
                    body: JSON.stringify({ propertyId: id }),
                });
                if (!res.ok) throw new Error(`toggleSaved ${res.status}`);
                const data = await res.json();
                if (!data?.success) await fetchSaved();
            }
        } catch (err) {
            console.error("toggleSaved error:", err);
            setSavedSet((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                persistGuest(next);
                return next;
            });
            if (user?.userId) await fetchSaved();
        } finally {
            pending.current.delete(id);
        }
    };

    const saved = useMemo(() => Array.from(savedSet), [savedSet]);

    useEffect(() => {
        if (user?.userId) {
            fetchSaved();
        } else {
            const raw = localStorage.getItem("savedProperties") || "[]";
            try {
                const arr = JSON.parse(raw);
                setSavedSet(new Set((Array.isArray(arr) ? arr : []).map(toIdStr)));
            } catch {
                setSavedSet(new Set());
            }
        }
    }, [user?.userId]);

    const value = useMemo(
        () => ({ saved, loading, isSaved, toggleSaved, fetchSaved, setSaved: (arr) => setSavedSet(new Set((arr || []).map(toIdStr))) }),
        [saved, loading]
    );

    return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export const useSaved = () => {
    const ctx = useContext(SavedContext);
    if (!ctx) throw new Error("useSaved must be used within <SavedProvider>");
    return ctx;
};
