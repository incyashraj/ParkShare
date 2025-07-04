import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Surface,
  Avatar,
  Chip,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface ParkingSpot {
  id: string;
  location: string;
  hourlyRate: string;
  rating: number;
  available: boolean;
  distance?: number;
}

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [nearbySpots, setNearbySpots] = useState<ParkingSpot[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const theme = useTheme();
  const { user } = useAuth();

  // Mock data for demo
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock nearby spots
    setNearbySpots([
      {
        id: '1',
        location: 'Downtown Parking Garage',
        hourlyRate: '$5/hour',
        rating: 4.5,
        available: true,
        distance: 0.2,
      },
      {
        id: '2',
        location: 'Central Mall Parking',
        hourlyRate: '$3/hour',
        rating: 4.2,
        available: true,
        distance: 0.8,
      },
      {
        id: '3',
        location: 'Street Parking - Main St',
        hourlyRate: '$2/hour',
        rating: 3.8,
        available: false,
        distance: 1.2,
      },
    ]);

    // Mock recent bookings
    setRecentBookings([
      {
        id: '1',
        location: 'Downtown Parking Garage',
        date: '2024-01-15',
        duration: '2 hours',
        amount: '$10',
        status: 'completed',
      },
      {
        id: '2',
        location: 'Central Mall Parking',
        date: '2024-01-14',
        duration: '1 hour',
        amount: '$3',
        status: 'completed',
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      loadData();
      setRefreshing(false);
    }, 1000);
  };

  const renderSpotCard = (spot: ParkingSpot) => (
    <Card key={spot.id} style={styles.spotCard}>
      <Card.Content>
        <View style={styles.spotHeader}>
          <View style={styles.spotInfo}>
            <Text style={[styles.spotLocation, { color: theme.colors.onSurface }]}>
              {spot.location}
            </Text>
            <Text style={[styles.spotRate, { color: theme.colors.primary }]}>
              {spot.hourlyRate}
            </Text>
          </View>
          <View style={styles.spotMeta}>
            <Chip
              icon="star"
              mode="outlined"
              style={styles.ratingChip}
            >
              {spot.rating}
            </Chip>
            {spot.distance && (
              <Text style={[styles.distance, { color: theme.colors.onSurfaceVariant }]}>
                {spot.distance}km away
              </Text>
            )}
          </View>
        </View>
        <View style={styles.spotFooter}>
          <Chip
            mode={spot.available ? 'flat' : 'outlined'}
            style={[
              styles.availabilityChip,
              spot.available && { backgroundColor: theme.colors.primary }
            ]}
          >
            {spot.available ? 'Available' : 'Occupied'}
          </Chip>
          <Button
            mode="contained"
            compact
            disabled={!spot.available}
            style={styles.bookButton}
          >
            Book Now
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBookingCard = (booking: any) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <Card.Content>
        <View style={styles.bookingHeader}>
          <Text style={[styles.bookingLocation, { color: theme.colors.onSurface }]}>
            {booking.location}
          </Text>
          <Chip
            mode="outlined"
            style={styles.statusChip}
          >
            {booking.status}
          </Chip>
        </View>
        <View style={styles.bookingDetails}>
          <Text style={[styles.bookingDate, { color: theme.colors.onSurfaceVariant }]}>
            {booking.date} • {booking.duration}
          </Text>
          <Text style={[styles.bookingAmount, { color: theme.colors.primary }]}>
            {booking.amount}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userName, { color: theme.colors.primary }]}>
                {user?.username || 'User'}
              </Text>
            </View>
            <Avatar.Text
              size={50}
              label={user?.username?.charAt(0).toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          </View>
        </Surface>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="car" size={24} color={theme.colors.primary} />
              <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>5</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Active Bookings
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="wallet" size={24} color={theme.colors.primary} />
              <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>$45</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Saved This Month
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Nearby Spots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Nearby Spots
            </Text>
            <Button mode="text" compact>
              View All
            </Button>
          </View>
          {nearbySpots.map(renderSpotCard)}
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Bookings
            </Text>
            <Button mode="text" compact>
              View All
            </Button>
          </View>
          {recentBookings.map(renderBookingCard)}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {/* Navigate to Add Spot */}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  spotCard: {
    marginBottom: 12,
    elevation: 2,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  spotInfo: {
    flex: 1,
  },
  spotLocation: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  spotRate: {
    fontSize: 14,
    fontWeight: '500',
  },
  spotMeta: {
    alignItems: 'flex-end',
  },
  ratingChip: {
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
  },
  spotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityChip: {
    marginRight: 8,
  },
  bookButton: {
    borderRadius: 20,
  },
  bookingCard: {
    marginBottom: 8,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingLocation: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusChip: {
    height: 24,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: 14,
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 