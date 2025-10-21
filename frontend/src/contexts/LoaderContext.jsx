import { createContext, useContext, useState } from "react";

export const LoaderContext = createContext({
    showLoader: false,
    setShowLoader: () => { },
    loaderText: "",
    setLoaderText: () => { },
});

export function LoaderProvider({ children }) {
    const [showLoader, setShowLoader] = useState(false);
    const [loaderText, setLoaderText] = useState('Loading...')

    return (
        <LoaderContext.Provider value={{ showLoader, setShowLoader, setLoaderText, loaderText }}>
            {children}
        </LoaderContext.Provider>
    );
}

export const useLoader = () => useContext(LoaderContext);
