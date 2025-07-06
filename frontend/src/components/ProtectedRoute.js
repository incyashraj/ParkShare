import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography, Container, Paper } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Checking authentication...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return children;
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // If admin access is required but user is not admin
  if (adminOnly && !currentUser.isAdmin && currentUser.email !== 'incyashraj@gmail.com') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LockOutlined sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page. Admin privileges required.
          </Typography>
          <Navigate to="/" replace />
        </Paper>
      </Container>
    );
  }

  // User is authenticated and has required permissions
  return children;
};

export default ProtectedRoute; 