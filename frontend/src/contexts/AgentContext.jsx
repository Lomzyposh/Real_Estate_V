import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext';

export const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
    const { user, setUser } = useAuth();
    const [agentInfo, setAgentInfo] = useState([]);
    const [agentInfoLoading, setAgentInfoLoading] = useState(true);
    const [agentInfoError, setAgentInfoError] = useState(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            setAgentInfoLoading(true);
            setAgentInfoError(null);
            try {
                const res = await fetch('/api/agentDetails', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!res.ok) {
                    const msg = await res.text().catch(() => '');
                    throw new Error(msg || `Request failed with ${res.status}`);
                }

                const data = await res.json();

                if (alive) setAgentInfo(data);
            } catch (err) {
                if (alive) setAgentInfoError('Failed to load AgentInfo');
                console.error(err);
            } finally {
                if (alive) setAgentInfoLoading(false);
            }
        })();

        return () => { alive = false; };
    }, []);


    return (
        <AgentContext.Provider value={{ agentInfo, setAgentInfo, agentInfoLoading }}>
            {children}
        </AgentContext.Provider>
    )
}

export const useAgent = () => {
    const ctx = useContext(AgentContext);
    if (!ctx) throw new Error("AgentContext has to be in a Provider");

    return ctx;
};