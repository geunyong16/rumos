// frontend/src/components/routes/AgentRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AgentRoute = ({ children }) => {
  const { isAuthenticated, isAgent, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated && isAgent ? children : <Navigate to="/login" />;
};

export default AgentRoute;