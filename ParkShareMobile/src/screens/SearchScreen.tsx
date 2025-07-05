import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Button,
  Surface,
  useTheme,
  ActivityIndicator,
  Divider,
  List,
  Switch,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AndroidSpotCard from '../components/AndroidSpotCard';
import { NavigationProp } from '../types/navigation';

const { width } = Dimensions.get('window');

interface SearchFilters {
  priceRange: [number, number];
  distance: number;
  rating: number;
  features: string[];
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'distance' | 'price' | 'rating' | 'popularity';
}

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  price: number;
  rating: number;
  distance: number;
  available: boolean;
  image?: string;
  features: string[];
  isFavorite?: boolean;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 50],
    distance: 10,
    rating: 0,
    features: [],
    availability: 'all',
    sortBy: 'distance',
  });

  const availableFeatures = [
    'Covered', 'Security', '24/7', 'Easy Access', 'Shuttle', 
    'EV Charging', 'Wheelchair Access', 'Valet', 'Self-Park'
  ];

  useEffect(() => {
    loadSpots();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, spots]);

  const loadSpots = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSpots: ParkingSpot[] = [
      {
        id: '1',
        title: 'Downtown Premium Parking',
        address: '123 Main St, Downtown',
        price: 15,
        rating: 4.8,
        distance: 0.5,
        available: true,
        features: ['Covered', 'Security', '24/7'],
        isFavorite: false,
      },
      {
        id: '2',
        title: 'Mall Parking Garage',
        address: '456 Shopping Ave',
        price: 8,
        rating: 4.2,
        distance: 1.2,
        available: true,
        features: ['Covered', 'Easy Access'],
        isFavorite: true,
      },
      {
        id: '3',
        title: 'Airport Long-term',
        address: '789 Airport Blvd',
        price: 25,
        rating: 4.6,
        distance: 5.0,
        available: false,
        features: ['Shuttle', 'Security'],
        isFavorite: false,
      },
      {
        id: '4',
        title: 'Street Parking - Main St',
        address: '321 Main Street',
        price: 5,
        rating: 3.9,
        distance: 0.8,
        available: true,
        features: ['Easy Access'],
        isFavorite: false,
      },
      {
        id: '5',
        title: 'Business Center Garage',
        address: '555 Business Ave',
        price: 12,
        rating: 4.4,
        distance: 2.1,
        available: true,
        features: ['Covered', 'Security', 'EV Charging'],
        isFavorite: false,
      },
    ];

    setSpots(mockSpots);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...spots];

    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(spot =>
        spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(spot =>
      spot.price >= filters.priceRange[0] && spot.price <= filters.priceRange[1]
    );

    // Distance filter
    filtered = filtered.filter(spot => spot.distance <= filters.distance);

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(spot => spot.rating >= filters.rating);
    }

    // Features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(spot =>
        filters.features.some(feature => spot.features.includes(feature))
      );
    }

    // Availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter(spot =>
        filters.availability === 'available' ? spot.available : !spot.available
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredSpots(filtered);
  };

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const toggleFavorite = (spotId: string) => {
    setSpots(prev => prev.map(spot =>
      spot.id === spotId ? { ...spot, isFavorite: !spot.isFavorite } : spot
    ));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 50],
      distance: 10,
      rating: 0,
      features: [],
      availability: 'all',
      sortBy: 'distance',
    });
  };

  const renderFiltersDialog = () => (
    <Portal>
      <Dialog visible={showFilters} onDismiss={() => setShowFilters(false)}>
        <Dialog.Title>Search Filters</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.filterContent}>
            {/* Price Range */}
            <Text variant="titleSmall" style={styles.filterSectionTitle}>
              Price Range
            </Text>
            <View style={styles.priceRangeContainer}>
              <Text variant="bodySmall">${filters.priceRange[0]} - ${filters.priceRange[1]}/hr</Text>
              <View style={styles.buttonRow}>
                {[10, 20, 30, 40, 50].map((price) => (
                  <Button
                    key={price}
                    mode={filters.priceRange[1] === price ? "contained" : "outlined"}
                    onPress={() => setFilters(prev => ({ ...prev, priceRange: [0, price] }))}
                    style={styles.filterButton}
                    compact
                  >
                    ${price}
                  </Button>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Distance */}
            <Text variant="titleSmall" style={styles.filterSectionTitle}>
              Maximum Distance
            </Text>
            <View style={styles.distanceContainer}>
              <Text variant="bodySmall">{filters.distance} km</Text>
              <View style={styles.buttonRow}>
                {[5, 10, 15, 20].map((distance) => (
                  <Button
                    key={distance}
                    mode={filters.distance === distance ? "contained" : "outlined"}
                    onPress={() => setFilters(prev => ({ ...prev, distance }))}
                    style={styles.filterButton}
                    compact
                  >
                    {distance}km
                  </Button>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Rating */}
            <Text variant="titleSmall" style={styles.filterSectionTitle}>
              Minimum Rating
            </Text>
            <View style={styles.ratingContainer}>
              <Text variant="bodySmall">{filters.rating}+ stars</Text>
              <View style={styles.buttonRow}>
                {[0, 3, 3.5, 4, 4.5, 5].map((rating) => (
                  <Button
                    key={rating}
                    mode={filters.rating === rating ? "contained" : "outlined"}
                    onPress={() => setFilters(prev => ({ ...prev, rating }))}
                    style={styles.filterButton}
                    compact
                  >
                    {rating === 0 ? "Any" : `${rating}+`}
                  </Button>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Features */}
            <Text variant="titleSmall" style={styles.filterSectionTitle}>
              Features
            </Text>
            <View style={styles.featuresGrid}>
              {availableFeatures.map((feature) => (
                <Chip
                  key={feature}
                  selected={filters.features.includes(feature)}
                  onPress={() => toggleFeature(feature)}
                  style={styles.featureChip}
                  mode="outlined"
                >
                  {feature}
                </Chip>
              ))}
            </View>

            <Divider style={styles.divider} />

            {/* Availability */}
            <Text variant="titleSmall" style={styles.filterSectionTitle}>
              Availability
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value as any }))}
              value={filters.availability}
            >
              <RadioButton.Item label="All Spots" value="all" />
              <RadioButton.Item label="Available Only" value="available" />
              <RadioButton.Item label="Unavailable Only" value="unavailable" />
            </RadioButton.Group>

            <Divider style={styles.divider} />

            {/* Sort By */}
            <Text variant="titleSmall" style={styles.filterSectionTitle}>
              Sort By
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
              value={filters.sortBy}
            >
              <RadioButton.Item label="Distance" value="distance" />
              <RadioButton.Item label="Price" value="price" />
              <RadioButton.Item label="Rating" value="rating" />
              <RadioButton.Item label="Popularity" value="popularity" />
            </RadioButton.Group>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={clearFilters}>Clear All</Button>
          <Button onPress={() => setShowFilters(false)}>Apply</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.priceRange[1] < 50) {
      activeFilters.push(`$${filters.priceRange[1]}/hr max`);
    }
    if (filters.distance < 10) {
      activeFilters.push(`${filters.distance}km max`);
    }
    if (filters.rating > 0) {
      activeFilters.push(`${filters.rating}+ stars`);
    }
    if (filters.features.length > 0) {
      activeFilters.push(`${filters.features.length} features`);
    }
    if (filters.availability !== 'all') {
      activeFilters.push(filters.availability);
    }

    if (activeFilters.length === 0) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <Text variant="bodySmall" style={styles.activeFiltersTitle}>
          Active Filters:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activeFilters.map((filter, index) => (
            <Chip
              key={index}
              compact
              style={styles.activeFilterChip}
              onPress={() => clearFilters()}
            >
              {filter}
            </Chip>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Searching for parking spots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <Surface style={styles.searchHeader} elevation={2}>
        <Searchbar
          placeholder="Search parking spots..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
        <Button
          mode="outlined"
          onPress={() => setShowFilters(true)}
          icon="filter-variant"
          style={styles.headerFilterButton}
        >
          Filters
        </Button>
      </Surface>

      {/* Active Filters */}
      {renderActiveFilters()}

      {/* Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {filteredSpots.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#9CA3AF" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No parking spots found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Try adjusting your search criteria or filters
            </Text>
            <Button
              mode="contained"
              onPress={clearFilters}
              style={styles.clearFiltersButton}
            >
              Clear Filters
            </Button>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text variant="titleMedium" style={styles.resultsCount}>
                {filteredSpots.length} parking spot{filteredSpots.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            
            {filteredSpots.map((spot) => (
              <AndroidSpotCard
                key={spot.id}
                {...spot}
                onPress={() => navigation.navigate('SpotDetail', { spotId: spot.id })}
                onBook={() => navigation.navigate('Booking', { spotId: spot.id })}
                onToggleFavorite={() => toggleFavorite(spot.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {renderFiltersDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  searchHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
    borderRadius: 12,
  },
  headerFilterButton: {
    borderRadius: 12,
  },
  activeFiltersContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activeFiltersTitle: {
    marginBottom: 8,
    color: '#6B7280',
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: '#E0E7FF',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  clearFiltersButton: {
    borderRadius: 12,
  },
  filterContent: {
    maxHeight: 400,
  },
  filterSectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  priceRangeContainer: {
    marginBottom: 16,
  },
  distanceContainer: {
    marginBottom: 16,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  slider: {
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  filterButton: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default SearchScreen; 