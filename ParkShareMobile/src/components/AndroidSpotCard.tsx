import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Surface,
  useTheme,
  IconButton,
  Badge,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AndroidSpotCardProps {
  id: string;
  title: string;
  address: string;
  price: number;
  rating: number;
  distance: number;
  available: boolean;
  image?: string;
  features: string[];
  onPress: () => void;
  onBook: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const AndroidSpotCard: React.FC<AndroidSpotCardProps> = ({
  id,
  title,
  address,
  price,
  rating,
  distance,
  available,
  image,
  features,
  onPress,
  onBook,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const theme = useTheme();

  return (
    <Surface style={styles.container} elevation={Platform.OS === 'android' ? 4 : 2}>
      <Card style={styles.card} mode="elevated">
        {/* Image with overlay */}
        <View style={styles.imageContainer}>
          <Card.Cover
            source={{ 
              uri: image || 'https://via.placeholder.com/400x200/1E3A8A/FFFFFF?text=Parking+Spot' 
            }}
            style={styles.image}
          />
          
          {/* Status badge */}
          <View style={styles.statusContainer}>
            <Badge
              style={[
                styles.statusBadge,
                { backgroundColor: available ? '#10B981' : '#EF4444' }
              ]}
            >
              {available ? 'Available' : 'Occupied'}
            </Badge>
          </View>

          {/* Favorite button */}
          {onToggleFavorite && (
            <IconButton
              icon={isFavorite ? 'heart' : 'heart-outline'}
              iconColor={isFavorite ? '#EF4444' : '#FFFFFF'}
              size={24}
              style={styles.favoriteButton}
              onPress={onToggleFavorite}
            />
          )}

          {/* Price overlay */}
          <View style={styles.priceOverlay}>
            <Text style={styles.priceText}>${price}/hr</Text>
          </View>
        </View>

        <Card.Content style={styles.content}>
          {/* Header with title and rating */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text variant="bodySmall" style={styles.rating}>
                  {rating}
                </Text>
              </View>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text variant="bodySmall" style={styles.address} numberOfLines={1}>
              {address}
            </Text>
          </View>

          {/* Distance */}
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate" size={16} color="#6B7280" />
            <Text variant="bodySmall" style={styles.distance}>
              {distance} km away
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.slice(0, 3).map((feature, index) => (
              <Chip
                key={index}
                compact
                style={styles.featureChip}
                textStyle={styles.featureText}
                mode="outlined"
              >
                {feature}
              </Chip>
            ))}
            {features.length > 3 && (
              <Chip
                compact
                style={styles.featureChip}
                textStyle={styles.featureText}
                mode="outlined"
              >
                +{features.length - 3} more
              </Chip>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onPress}
              style={styles.viewButton}
              contentStyle={styles.buttonContent}
            >
              Details
            </Button>
            <Button
              mode="contained"
              onPress={onBook}
              disabled={!available}
              style={[
                styles.bookButton,
                !available && styles.disabledButton
              ]}
              contentStyle={styles.buttonContent}
              buttonColor={available ? theme.colors.primary : '#9CA3AF'}
            >
              {available ? 'Book Now' : 'Unavailable'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  statusBadge: {
    borderRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    color: '#1F2937',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    color: '#92400E',
    fontWeight: 'bold',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  address: {
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distance: {
    color: '#6B7280',
    marginLeft: 4,
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
    borderColor: '#E5E7EB',
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  bookButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    height: 44,
  },
});

export default AndroidSpotCard; 