import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  FAB,
  Divider,
  List,
  Surface,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { NavigationProp } from '../types/navigation';

const { width } = Dimensions.get('window');

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
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nearbySpots, setNearbySpots] = useState<ParkingSpot[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSpots: 0,
    activeBookings: 0,
    totalSpent: 0,
  });

  // Mock data for demonstration
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNearbySpots([
      {
        id: '1',
        title: 'Downtown Premium Parking',
        address: '123 Main St, Downtown',
        price: 15,
        rating: 4.8,
        distance: 0.5,
        available: true,
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
        features: ['Shuttle', 'Security'],
      },
    ]);

    setRecentBookings([
      {
        id: '1',
        spotTitle: 'Downtown Premium Parking',
        date: '2024-01-15',
        duration: '2 hours',
        amount: 30,
        status: 'completed',
      },
      {
        id: '2',
        spotTitle: 'Mall Parking Garage',
        date: '2024-01-14',
        duration: '4 hours',
        amount: 32,
        status: 'active',
      },
    ]);

    setStats({
      totalSpots: 156,
      activeBookings: 2,
      totalSpent: 245,
    });

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderSpotCard = (spot: ParkingSpot) => (
    <Card key={spot.id} style={styles.spotCard} mode="elevated">
      <Card.Cover 
        source={{ uri: spot.image || 'https://via.placeholder.com/300x200/1E3A8A/FFFFFF?text=Parking+Spot' }}
        style={styles.spotImage}
      />
      <Card.Content style={styles.spotContent}>
        <View style={styles.spotHeader}>
          <Text variant="titleMedium" style={styles.spotTitle}>
            {spot.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.rating}>
              {spot.rating}
            </Text>
          </View>
        </View>
        
        <Text variant="bodySmall" style={styles.spotAddress}>
          <Ionicons name="location" size={14} color="#9CA3AF" />
          {' '}{spot.address}
        </Text>
        
        <View style={styles.spotDetails}>
          <Text variant="bodySmall" style={styles.distance}>
            <Ionicons name="navigate" size={14} color="#9CA3AF" />
            {' '}{spot.distance} km away
          </Text>
          <Text variant="titleMedium" style={styles.price}>
            ${spot.price}/hr
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {spot.features.map((feature, index) => (
            <Chip 
              key={index} 
              compact 
              style={styles.featureChip}
              textStyle={styles.featureText}
            >
              {feature}
            </Chip>
          ))}
        </View>

        <View style={styles.spotActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('SpotDetail', { spotId: spot.id })}
            style={styles.viewButton}
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Booking', { spotId: spot.id })}
            disabled={!spot.available}
            style={styles.bookButton}
          >
            {spot.available ? 'Book Now' : 'Unavailable'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsCard = () => (
    <Surface style={styles.statsCard} elevation={2}>
      <Text variant="titleMedium" style={styles.statsTitle}>
        Your Parking Stats
      </Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text variant="headlineSmall" style={styles.statNumber}>
            {stats.totalSpots}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Spots Used
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineSmall" style={styles.statNumber}>
            {stats.activeBookings}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Active Bookings
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineSmall" style={styles.statNumber}>
            ${stats.totalSpent}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Total Spent
          </Text>
        </View>
      </View>
    </Surface>
  );

  const renderRecentBookings = () => (
    <Surface style={styles.bookingsCard} elevation={2}>
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Bookings
        </Text>
        <Button
          mode="text"
          onPress={() => navigation.navigate('Bookings')}
          compact
        >
          View All
        </Button>
      </View>
      
      {recentBookings.map((booking) => (
        <List.Item
          key={booking.id}
          title={booking.spotTitle}
          description={`${booking.date} • ${booking.duration}`}
                       left={(props) => (
               <List.Icon 
                 {...props} 
                 icon={booking.status === 'active' ? 'clock' : 'check-circle'} 
                 color={booking.status === 'active' ? theme.colors.primary : '#10B981'}
               />
             )}
          right={() => (
            <Text variant="bodyMedium" style={styles.bookingAmount}>
              ${booking.amount}
            </Text>
          )}
          style={styles.bookingItem}
        />
      ))}
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your parking data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text variant="headlineSmall" style={styles.welcomeTitle}>
                Welcome back, {user?.username || 'User'}!
              </Text>
              <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
                Find the perfect parking spot near you
              </Text>
            </View>
            <Avatar.Text 
              size={50} 
              label={user?.username?.charAt(0).toUpperCase() || 'U'} 
              style={styles.userAvatar}
            />
          </View>
        </View>

        {/* Stats Card */}
        {renderStatsCard()}

        {/* Quick Actions */}
        <Surface style={styles.quickActionsCard} elevation={2}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <Button
              mode="contained-tonal"
              icon="map-marker"
              onPress={() => navigation.navigate('Map')}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionContent}
            >
              Find Nearby
            </Button>
            <Button
              mode="contained-tonal"
              icon="plus"
              onPress={() => navigation.navigate('AddSpot')}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionContent}
            >
              Add Spot
            </Button>
            <Button
              mode="contained-tonal"
              icon="calendar"
              onPress={() => navigation.navigate('Bookings')}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionContent}
            >
              My Bookings
            </Button>
            <Button
              mode="contained-tonal"
              icon="settings"
              onPress={() => navigation.navigate('Settings')}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionContent}
            >
              Settings
            </Button>
          </View>
        </Surface>

        {/* Recent Bookings */}
        {renderRecentBookings()}

        {/* Nearby Spots */}
        <View style={styles.nearbySection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Nearby Parking Spots
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Search')}
              compact
            >
              View All
            </Button>
          </View>
          
          {nearbySpots.map(renderSpotCard)}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddSpot')}
        label="Add Spot"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
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
  welcomeSection: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: '#6B7280',
  },
  userAvatar: {
    backgroundColor: '#1E3A8A',
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  statLabel: {
    color: '#6B7280',
    marginTop: 4,
  },
  quickActionsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 80) / 2,
    marginBottom: 12,
  },
  quickActionContent: {
    height: 48,
  },
  bookingsCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  bookingItem: {
    paddingHorizontal: 20,
  },
  bookingAmount: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  nearbySection: {
    margin: 20,
    marginTop: 0,
  },
  spotCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  spotImage: {
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  spotContent: {
    padding: 16,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotTitle: {
    fontWeight: 'bold',
    flex: 1,
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  spotAddress: {
    color: '#6B7280',
    marginBottom: 12,
  },
  spotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  distance: {
    color: '#6B7280',
  },
  price: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
  },
  spotActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
  },
  bookButton: {
    flex: 1,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default HomeScreen; 