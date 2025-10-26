import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const PropertiesContext = createContext();

export const PropertiesProvider = ({ children }) => {
    const [properties, setProperties] = useState([]);
    const [propertiesLoading, setPropertiesLoading] = useState(true);

    useEffect(() => {
        const fetchProp = async () => {
            try {
                const res = await fetch("/api/properties");
                const data = await res.json();

                if (!res.ok) {
                    console.error("Error Fetching:", data?.message || res.statusText);
                    return;
                }

                setProperties(data.properties);
                console.log(data.properties)
            } catch (err) {
                console.error("Network error:", err);
            } finally {
                setPropertiesLoading(false);
                
            }
        };

        fetchProp();


    }, []);



    return (
        <PropertiesContext.Provider
            value={{
                propertiesLoading,
                setPropertiesLoading,
                properties
            }}
        >
            {children}
        </PropertiesContext.Provider>
    );
};

export const useProperties = () => useContext(PropertiesContext);
