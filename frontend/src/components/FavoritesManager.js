import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  LocalParking as ParkingIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Create as CreateIcon,
} from '@mui/icons-material';

const FavoritesManager = ({ user }) => {
  const [favorites, setFavorites] = useState([]);
  const [folders, setFolders] = useState([
    { id: 'all', name: 'All Favorites', count: 0 },
    { id: 'nearby', name: 'Nearby Spots', count: 0 },
    { id: 'affordable', name: 'Affordable', count: 0 },
    { id: 'premium', name: 'Premium Spots', count: 0 },
  ]);
  const [currentFolder, setCurrentFolder] = useState('all');
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockFavorites = [
      {
        id: 1,
        spotId: 'spot1',
        name: 'Downtown Premium Parking',
        location: '123 Main St, Downtown',
        price: 15,
        rating: 4.5,
        image: 'https://placehold.co/400x200/1E3A8A/FFFFFF?text=Premium+Parking',
        folder: 'premium',
        addedAt: new Date('2024-01-15'),
        notes: 'Great spot near the office',
      },
      {
        id: 2,
        spotId: 'spot2',
        name: 'Mall Parking Garage',
        location: '456 Shopping Ave',
        price: 8,
        rating: 4.2,
        image: 'https://placehold.co/400x200/059669/FFFFFF?text=Mall+Parking',
        folder: 'affordable',
        addedAt: new Date('2024-01-10'),
        notes: 'Convenient for shopping',
      },
      {
        id: 3,
        spotId: 'spot3',
        name: 'Airport Long-term Parking',
        location: '789 Airport Blvd',
        price: 12,
        rating: 4.8,
        image: 'https://placehold.co/400x200/7C3AED/FFFFFF?text=Airport+Parking',
        folder: 'nearby',
        addedAt: new Date('2024-01-05'),
        notes: 'Perfect for travel',
      },
    ];
    setFavorites(mockFavorites);
    updateFolderCounts(mockFavorites);
  }, []);

  const updateFolderCounts = (favs) => {
    const counts = { all: favs.length, nearby: 0, affordable: 0, premium: 0 };
    favs.forEach(fav => {
      if (counts[fav.folder] !== undefined) {
        counts[fav.folder]++;
      }
    });
    
    setFolders(prev => prev.map(folder => ({
      ...folder,
      count: counts[folder.id] || 0
    })));
  };

  const filteredFavorites = currentFolder === 'all' 
    ? favorites 
    : favorites.filter(fav => fav.folder === currentFolder);

  const handleAddToFavorites = (spot) => {
    const newFavorite = {
      id: Date.now(),
      spotId: spot.id,
      name: spot.location,
      location: spot.location,
      price: spot.hourlyRate,
      rating: spot.rating || 0,
      image: spot.images?.[0] || 'https://placehold.co/400x200/1E3A8A/FFFFFF?text=Parking+Spot',
      folder: 'all',
      addedAt: new Date(),
      notes: '',
    };
    setFavorites(prev => [...prev, newFavorite]);
    updateFolderCounts([...favorites, newFavorite]);
  };

  const handleRemoveFromFavorites = (favoriteId) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
    setFavorites(updatedFavorites);
    updateFolderCounts(updatedFavorites);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: `folder_${Date.now()}`,
        name: newFolderName.trim(),
        count: 0,
      };
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setOpenFolderDialog(false);
    }
  };

  const handleEditFolder = () => {
    if (editingFolder && newFolderName.trim()) {
      setFolders(prev => prev.map(folder => 
        folder.id === editingFolder.id 
          ? { ...folder, name: newFolderName.trim() }
          : folder
      ));
      setNewFolderName('');
      setEditingFolder(null);
      setOpenFolderDialog(false);
    }
  };

  const handleDeleteFolder = (folderId) => {
    if (folderId !== 'all') {
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      setFavorites(prev => prev.map(fav => 
        fav.folder === folderId ? { ...fav, folder: 'all' } : fav
      ));
      if (currentFolder === folderId) {
        setCurrentFolder('all');
      }
    }
  };

  const handleMoveToFolder = (favoriteId, folderId) => {
    setFavorites(prev => prev.map(fav => 
      fav.id === favoriteId ? { ...fav, folder: folderId } : fav
    ));
  };

  const handleBookSpot = (favorite) => {
    navigate(`/book/${favorite.spotId}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          My Favorites
        </Typography>
        <Badge badgeContent={favorites.length} color="primary">
          <FavoriteIcon color="primary" />
        </Badge>
      </Box>

      {/* Folders Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentFolder} 
            onChange={(e, newValue) => setCurrentFolder(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {folders.map((folder) => (
              <Tab
                key={folder.id}
                value={folder.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderIcon fontSize="small" />
                    {folder.name}
                    <Chip label={folder.count} size="small" />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* Folder Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<CreateIcon />}
          onClick={() => {
            setEditingFolder(null);
            setNewFolderName('');
            setOpenFolderDialog(true);
          }}
        >
          New Folder
        </Button>
        {currentFolder !== 'all' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteFolder(currentFolder)}
          >
            Delete Folder
          </Button>
        )}
      </Box>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FavoriteBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No favorites in this folder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentFolder === 'all' 
              ? 'Start adding parking spots to your favorites!'
              : 'No spots in this folder yet.'
            }
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredFavorites.map((favorite) => (
            <Grid item xs={12} sm={6} md={4} key={favorite.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={favorite.image}
                  alt={favorite.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {favorite.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {favorite.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MoneyIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      ${favorite.price}/hour
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Rating value={favorite.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({favorite.rating})
                    </Typography>
                  </Box>
                  {favorite.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      "{favorite.notes}"
                    </Typography>
                  )}
                  <Chip 
                    label={folders.find(f => f.id === favorite.folder)?.name || 'All'} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleBookSpot(favorite)}
                    variant="contained"
                  >
                    Book Now
                  </Button>
                  <IconButton 
                    size="small" 
                    onClick={() => handleRemoveFromFavorites(favorite.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Folder Dialog */}
      <Dialog open={openFolderDialog} onClose={() => setOpenFolderDialog(false)}>
        <DialogTitle>
          {editingFolder ? 'Edit Folder' : 'Create New Folder'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFolderDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingFolder ? handleEditFolder : handleCreateFolder}
            variant="contained"
          >
            {editingFolder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FavoritesManager;