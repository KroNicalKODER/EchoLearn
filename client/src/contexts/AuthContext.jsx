import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for authentication
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setToken(JSON.parse(token));
            setUser(JSON.parse(localStorage.getItem("user")));
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem("token", JSON.stringify(userData.token));
        localStorage.setItem("user", JSON.stringify(userData.user));
        setUser(userData.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};