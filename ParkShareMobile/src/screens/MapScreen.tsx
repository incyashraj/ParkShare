import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  useTheme,
  ActivityIndicator,
  Card,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';

const { width, height } = Dimensions.get('window');

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  price: number;
  rating: number;
  distance: number;
  available: boolean;
  latitude: number;
  longitude: number;
  features: string[];
}

const MapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  useEffect(() => {
    loadSpots();
  }, []);

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
        latitude: 37.7749,
        longitude: -122.4194,
        features: ['Covered', 'Security', '24/7'],
      },
      {
        id: '2',
        title: 'Mall Parking Garage',
        address: '456 Shopping Ave',
        price: 8,
        rating: 4.2,
        distance: 1.2,
        available: true,
        latitude: 37.7849,
        longitude: -122.4094,
        features: ['Covered', 'Easy Access'],
      },
      {
        id: '3',
        title: 'Airport Long-term',
        address: '789 Airport Blvd',
        price: 25,
        rating: 4.6,
        distance: 5.0,
        available: false,
        latitude: 37.7649,
        longitude: -122.4294,
        features: ['Shuttle', 'Security'],
      },
    ];

    setSpots(mockSpots);
    setLoading(false);
  };

  const renderMapPlaceholder = () => (
    <Surface style={styles.mapContainer} elevation={2}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color="#9CA3AF" />
        <Text variant="titleMedium" style={styles.mapTitle}>
          Interactive Map
        </Text>
        <Text variant="bodyMedium" style={styles.mapSubtitle}>
          {spots.length} parking spots nearby
        </Text>
        
        {/* Mock map markers */}
        <View style={styles.markersContainer}>
          {spots.map((spot, index) => (
            <View
              key={spot.id}
              style={[
                styles.marker,
                {
                  left: 50 + (index * 80),
                  top: 100 + (index * 60),
                  backgroundColor: spot.available ? '#10B981' : '#EF4444',
                }
              ]}
            >
              <Text style={styles.markerText}>${spot.price}</Text>
            </View>
          ))}
        </View>
      </View>
    </Surface>
  );

  const renderSpotList = () => (
    <Surface style={styles.spotList} elevation={3}>
      <Text variant="titleMedium" style={styles.listTitle}>
        Nearby Parking Spots
      </Text>
      
      {spots.map((spot) => (
        <Card
          key={spot.id}
          style={styles.spotCard}
          mode="outlined"
          onPress={() => setSelectedSpot(spot)}
        >
          <Card.Content>
            <View style={styles.spotHeader}>
              <View style={styles.spotInfo}>
                <Text variant="titleSmall" style={styles.spotTitle}>
                  {spot.title}
                </Text>
                <Text variant="bodySmall" style={styles.spotAddress}>
                  {spot.address}
                </Text>
              </View>
              <View style={styles.spotMeta}>
                <Text variant="titleMedium" style={styles.spotPrice}>
                  ${spot.price}/hr
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text variant="bodySmall" style={styles.rating}>
                    {spot.rating}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.spotDetails}>
              <Text variant="bodySmall" style={styles.distance}>
                {spot.distance} km away
              </Text>
              <Chip
                mode={spot.available ? "flat" : "outlined"}
                style={[
                  styles.availabilityChip,
                  { backgroundColor: spot.available ? '#10B981' : '#EF4444' }
                ]}
                textStyle={{ color: spot.available ? '#FFFFFF' : '#EF4444' }}
              >
                {spot.available ? 'Available' : 'Occupied'}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      ))}
    </Surface>
  );

  const renderSelectedSpot = () => {
    if (!selectedSpot) return null;

    return (
      <Surface style={styles.selectedSpotCard} elevation={4}>
        <View style={styles.selectedSpotHeader}>
          <Text variant="titleMedium" style={styles.selectedSpotTitle}>
            {selectedSpot.title}
          </Text>
          <Button
            mode="text"
            onPress={() => setSelectedSpot(null)}
            compact
          >
            Close
          </Button>
        </View>
        
        <Text variant="bodyMedium" style={styles.selectedSpotAddress}>
          {selectedSpot.address}
        </Text>
        
        <View style={styles.selectedSpotDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="cash" size={16} color="#6B7280" />
            <Text variant="bodyMedium" style={styles.detailText}>
              ${selectedSpot.price}/hour
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="star" size={16} color="#6B7280" />
            <Text variant="bodyMedium" style={styles.detailText}>
              {selectedSpot.rating} stars
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="navigate" size={16} color="#6B7280" />
            <Text variant="bodyMedium" style={styles.detailText}>
              {selectedSpot.distance} km away
            </Text>
          </View>
        </View>
        
        <View style={styles.selectedSpotActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedSpot(null);
              navigation.navigate('SpotDetail', { spotId: selectedSpot.id });
            }}
            style={styles.actionButton}
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedSpot(null);
              navigation.navigate('Booking', { spotId: selectedSpot.id });
            }}
            disabled={!selectedSpot.available}
            style={styles.actionButton}
          >
            {selectedSpot.available ? 'Book Now' : 'Unavailable'}
          </Button>
        </View>
      </Surface>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderMapPlaceholder()}
      {renderSpotList()}
      {renderSelectedSpot()}
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
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  mapTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  mapSubtitle: {
    color: '#6B7280',
    marginBottom: 32,
  },
  markersContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  spotList: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  listTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  spotCard: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  spotInfo: {
    flex: 1,
  },
  spotTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  spotAddress: {
    color: '#6B7280',
    marginTop: 2,
  },
  spotMeta: {
    alignItems: 'flex-end',
  },
  spotPrice: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    marginLeft: 4,
    color: '#6B7280',
  },
  spotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  distance: {
    color: '#6B7280',
  },
  availabilityChip: {
    height: 24,
  },
  selectedSpotCard: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    elevation: 8,
  },
  selectedSpotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedSpotTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  selectedSpotAddress: {
    color: '#6B7280',
    marginBottom: 12,
  },
  selectedSpotDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#374151',
  },
  selectedSpotActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default MapScreen; 