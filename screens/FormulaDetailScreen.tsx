import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Formula } from '../types';
import { mockApiService } from '../services/api';

type FormulaDetailScreenRouteProp = RouteProp<RootStackParamList, 'FormulaDetail'>;
type FormulaDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FormulaDetail'>;

const { width } = Dimensions.get('window');

const FormulaDetailScreen: React.FC = () => {
  const route = useRoute<FormulaDetailScreenRouteProp>();
  const navigation = useNavigation<FormulaDetailScreenNavigationProp>();
  const { formulaId } = route.params;

  const [formula, setFormula] = useState<Formula | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    fetchFormulaDetails();
  }, [formulaId]);

  const fetchFormulaDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you'd fetch by ID
      const response = await mockApiService.getFormulas();
      const foundFormula = response.data.find(f => f.id === formulaId);
      
      if (foundFormula) {
        setFormula(foundFormula);
      } else {
        throw new Error('Formula not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load formula');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    Alert.alert(
      'Purchase Formula',
      `Are you sure you want to purchase "${formula?.name}" for ${formula?.currency} ${formula?.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            setIsPurchased(true);
            Alert.alert('Success', 'Formula purchased successfully!');
          },
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-border" size={16} color="#E0E0E0" />
      );
    }

    return stars;
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading formula details...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={64} color="#FF6B6B" />
      <Text style={styles.errorTitle}>Failed to Load</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchFormulaDetails}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error || !formula) {
    return renderErrorState();
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: formula.imageUrl || 'https://via.placeholder.com/400x200' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.heroGradient}
        />
        <View style={styles.heroContent}>
          <View style={styles.badgeContainer}>
            {formula.isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={16} color="#FFFFFF" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
            {formula.isTopGainer && (
              <View style={styles.topGainerBadge}>
                <Text style={styles.badgeText}>Top Gainer</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{formula.name}</Text>
          <Text style={styles.author}>by {formula.author.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(formula.rating)}
            </View>
            <Text style={styles.ratingText}>
              {formula.rating.toFixed(1)} ({formula.totalRatings} reviews)
            </Text>
          </View>
        </View>

        {/* Price and Purchase */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formula.currency} {formula.price.toFixed(2)}
            </Text>
            <Text style={styles.priceLabel}>One-time purchase</Text>
          </View>
          <TouchableOpacity
            style={[styles.purchaseButton, isPurchased && styles.purchasedButton]}
            onPress={handlePurchase}
            disabled={isPurchased}
          >
            <Text style={[styles.purchaseButtonText, isPurchased && styles.purchasedButtonText]}>
              {isPurchased ? 'Purchased' : 'Purchase'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="download" size={20} color="#007AFF" />
            <Text style={styles.statValue}>{formula.downloads.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>+{formula.profitPercentage.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg. Profit</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={20} color="#FF9800" />
            <Text style={styles.statValue}>
              {new Date(formula.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{formula.description}</Text>
        </View>

        {/* Category and Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category & Tags</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{formula.category}</Text>
          </View>
          <View style={styles.tagsContainer}>
            {formula.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.performanceContainer}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Total Profit</Text>
              <Text style={styles.performanceValue}>
                {formula.currency} {formula.profit.toLocaleString()}
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Profit Percentage</Text>
              <Text style={[styles.performanceValue, styles.profitValue]}>
                +{formula.profitPercentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Author Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Author</Text>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: formula.author.avatar || 'https://via.placeholder.com/50' }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{formula.author.name}</Text>
              <Text style={styles.authorDescription}>
                Experienced trader with verified strategies
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  heroContainer: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topGainerBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  purchasedButton: {
    backgroundColor: '#4CAF50',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  purchasedButtonText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  category: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  performanceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  profitValue: {
    color: '#4CAF50',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  authorDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default FormulaDetailScreen;