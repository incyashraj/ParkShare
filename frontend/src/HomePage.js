import React, { useState, useEffect } from 'react';
import './styles/animations.css';
import HeroSection from './components/HeroSection';
import Dashboard from './components/Dashboard';
import { Box } from '@mui/material';
import { auth } from './firebase';

function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {user ? <Dashboard /> : <HeroSection />}
    </Box>
  );
}

export default HomePage;
