import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (!loading) {
      setShowContent(true);
    }
    
    // Fallback: show content after 3 seconds even if loading is stuck
    const timeout = setTimeout(() => {
      setShowContent(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !showContent) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
