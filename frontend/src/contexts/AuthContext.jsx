import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const navigate = useNavigate();

  const checkStatus = async () => {
    try {
      const response = await apiFetch("/api/checkStatus");
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
      console.error("Error checking auth status:", error);
      setUser(null);
    }

    setStatusLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiFetch("/api/login", {
        method: "POST",
        body: { email, password },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Data", data);
        // setUser(data.user);

        return true;
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
    return false;
  };

  const signup = async (email, password) => {
    try {
      const response = await apiFetch("/api/register", {
        method: "POST",
        body: { email, password }
      });
      if (response.ok) {
        const data = await response.json();
        // setUser(data.user);
        return true;
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
    return false;
  };

  const logout = async () => {
    await apiFetch("/api/logout", { method: "POST" });
    setUser(null);
    navigate("/signIn");
  };

  return (
    <AuthContext.Provider
      value={{
        checkStatus,
        user,
        setUser,
        statusLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
