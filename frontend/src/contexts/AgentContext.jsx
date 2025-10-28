// src/contexts/AgentContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const { user, statusLoading } = useAuth();
  const [agentInfo, setAgentInfo] = useState([]);
  const [agentInfoLoading, setAgentInfoLoading] = useState(true);
  const [agentInfoError, setAgentInfoError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();

    if (statusLoading) return;

    if (!user) {
      setAgentInfo([]);
      setAgentInfoError(null);
      setAgentInfoLoading(false);
      return;
    }

    (async () => {
      setAgentInfoLoading(true);
      setAgentInfoError(null);
      try {
        const res = await fetch('/api/agentDetails', {
          method: 'GET',
          credentials: 'include',
          signal: ac.signal,
        });

        if (res.status === 401) {
          setAgentInfo([]);
          setAgentInfoError(null);
          return;
        }

        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(msg || `Request failed with ${res.status}`);
        }

        const data = await res.json();
        setAgentInfo(Array.isArray(data) ? data : (data.items ?? []));
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setAgentInfoError('Failed to load AgentInfo');
      } finally {
        setAgentInfoLoading(false);
      }
    })();

    return () => ac.abort();
  }, [statusLoading, user?.userId]);

  return (
    <AgentContext.Provider value={{ agentInfo, setAgentInfo, agentInfoLoading, agentInfoError }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('AgentContext has to be in a Provider');
  return ctx;
};