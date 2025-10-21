import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

export const SavedContext = createContext();

export const SavedProvider = ({ children }) => {
    const { user } = useAuth(); // expecting { id, email, ... } when logged in
    const [saved, setSaved] = useState([]); // array of propertyIds (numbers)
    const [loading, setLoading] = useState(false);

    const fetchsaved = async () => {
        try {
            // setLoading(true);
            // const res = await fetch('/api/getSaved', {
            //     method: 'GET',
            //     credentials: 'include',
            //     headers: { 'Content-Type': 'application/json' }
            // });
            // if (res.ok) {
            //     const data = await res.json();
            //     setSaved(Array.isArray(data.saved) ? data.saved : []);
            // } else {
            //     setSaved([]);
            // }
        } catch (error) {
            console.error("Error fetching saved:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSaved = async (propertyId) => {
        try {
            setSaved(prev => prev.includes(propertyId)
                ? prev.filter(id => id !== propertyId)
                : [...prev, propertyId]
            );

            const res = await fetch('/api/saved', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId })
            });

            if (!res.ok) {
                setSaved(prev => prev.includes(propertyId)
                    ? prev.filter(id => id !== propertyId)
                    : [...prev, propertyId]
                );
                throw new Error('Toggle failed');
            }

            const data = await res.json();
            if (!data?.success) await fetchsaved();
        } catch (err) {
            console.error('toggleSaved error:', err);
            await fetchsaved();
        }
    };

    const isSaved = useMemo(
        () => (propertyId) => saved.includes(propertyId),
        [saved]
    );

    useEffect(() => {
        if (user?.userId) fetchsaved();
        else setSaved([]);
    }, [user?.userId]);

    return (
        <SavedContext.Provider
            value={{ saved, setSaved, loading, fetchsaved, toggleSaved, isSaved }}
        >
            {children}
        </SavedContext.Provider>
    );
};

export const useSaved = () => useContext(SavedContext);
