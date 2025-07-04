import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { LocalParking } from '@mui/icons-material';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#1E3A8A',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 2s infinite',
          }}
        >
          <LocalParking
            sx={{
              fontSize: 24,
              color: '#1E3A8A',
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          animation: 'fadeInOut 2s infinite',
        }}
      >
        {message}
      </Typography>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

export default LoadingSpinner; 