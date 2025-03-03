import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import SignUp from '../pages/Signup';
import Main from '../pages/Main'
import RoomPage from '../pages/RoomPage';
import { useAuth } from '../contexts/AuthContext';

const AppRouter = () => {
    const { user } = useAuth();

    const renderRoutes = () => {
        if (user) {
            return (
                <>
                    <Route path="/" element={<Main />} />
                    <Route path="/room/:roomId" element={<RoomPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </>
            );
        } else {
            return (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </>
            );
        }
    };

    return (
        <Routes>
            {renderRoutes()}
        </Routes>
    );
};

export default AppRouter;