import {
  Box,
  LinearProgress,
  Typography,
  Paper,
  Fade,
  Slide,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ProgressIndicator = ({ 
  status = 'idle', 
  message = '', 
  progress = 0, 
  show = false 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'loading':
        return '#1E3A8A';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckIcon sx={{ color: getStatusColor() }} />;
      case 'error':
        return <ErrorIcon sx={{ color: getStatusColor() }} />;
      case 'loading':
        return null;
      default:
        return <InfoIcon sx={{ color: getStatusColor() }} />;
    }
  };

  if (!show) return null;

  return (
    <Slide direction="down" in={show} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          p: 2,
          minWidth: 300,
          maxWidth: 500,
          borderRadius: 3,
          border: `2px solid ${getStatusColor()}`,
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          {getStatusIcon()}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: getStatusColor(),
              flex: 1,
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Typography>
        </Box>
        
        {message && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: status === 'loading' ? 1 : 0,
            }}
          >
            {message}
          </Typography>
        )}
        
        {status === 'loading' && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#E5E7EB',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStatusColor(),
                  borderRadius: 3,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                mt: 0.5,
                display: 'block',
                textAlign: 'center',
              }}
            >
              {progress}%
            </Typography>
          </Box>
        )}
      </Paper>
    </Slide>
  );
};

export default ProgressIndicator;