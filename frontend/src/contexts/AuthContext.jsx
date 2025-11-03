import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const navigate = useNavigate();

    const checkStatus = async () => {

        try {
            const response = await fetch('/api/checkStatus', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser(null);
        }

        setStatusLoading(false);
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Data", data)
                // setUser(data.user);

                return true;
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
        return false;
    };

    const signup = async (email, password) => {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                // setUser(data.user);
                return true;
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
        return false;
    };

    const logout = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        setUser(null);
        navigate('/signIn')

    };

    return (
        <AuthContext.Provider value={{ checkStatus, user, setUser, statusLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
