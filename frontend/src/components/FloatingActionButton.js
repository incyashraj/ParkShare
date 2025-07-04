import React, { useState } from 'react';
import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MyLocation as LocationIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FloatingActionButton = ({ onLocationClick, onFilterClick }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: <SearchIcon />,
      name: 'Search Spots',
      action: () => navigate('/search'),
    },
    {
      icon: <AddIcon />,
      name: 'List Spot',
      action: () => navigate('/list'),
    },
    {
      icon: <LocationIcon />,
      name: 'My Location',
      action: onLocationClick,
    },
    {
      icon: <FilterIcon />,
      name: 'Filters',
      action: onFilterClick,
    },
  ];

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Zoom in>
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{
            '& .MuiFab-primary': {
              width: 56,
              height: 56,
              backgroundColor: '#1E3A8A',
              '&:hover': {
                backgroundColor: '#1E40AF',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .MuiSpeedDialAction-fab': {
              backgroundColor: 'white',
              color: '#1E3A8A',
              '&:hover': {
                backgroundColor: '#f8fafc',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
          icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.action();
                setOpen(false);
              }}
              sx={{
                '& .MuiSpeedDialAction-staticTooltip': {
                  backgroundColor: '#1E3A8A',
                  color: 'white',
                },
              }}
            />
          ))}
        </SpeedDial>
      </Zoom>
    </Box>
  );
};

export default FloatingActionButton; 