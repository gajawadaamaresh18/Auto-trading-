import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Formula } from '../types';

interface FormulaCardProps {
  formula: Formula;
  layout: 'horizontal' | 'vertical';
  onPress: (formula: Formula) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const VERTICAL_CARD_WIDTH = (width - 48) / 2;

const FormulaCard: React.FC<FormulaCardProps> = ({ formula, layout, onPress }) => {
  const isHorizontal = layout === 'horizontal';
  const cardWidth = isHorizontal ? CARD_WIDTH : VERTICAL_CARD_WIDTH;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={12} color="#FFD700" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-border" size={12} color="#E0E0E0" />
      );
    }

    return stars;
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toFixed(2)}`;
  };

  const formatProfit = (profit: number, percentage: number) => {
    return `+${percentage.toFixed(1)}% (${profit.toLocaleString()})`;
  };

  if (isHorizontal) {
    return (
      <TouchableOpacity
        style={[styles.horizontalCard, { width: cardWidth }]}
        onPress={() => onPress(formula)}
        activeOpacity={0.8}
      >
        <View style={styles.horizontalContent}>
          <Image
            source={{ uri: formula.imageUrl || 'https://via.placeholder.com/120x80' }}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
          <View style={styles.horizontalInfo}>
            <View style={styles.headerRow}>
              <Text style={styles.formulaName} numberOfLines={1}>
                {formula.name}
              </Text>
              {formula.isVerified && (
                <Icon name="verified" size={16} color="#4CAF50" />
              )}
            </View>
            
            <Text style={styles.authorName} numberOfLines={1}>
              by {formula.author.name}
            </Text>
            
            <Text style={styles.description} numberOfLines={2}>
              {formula.description}
            </Text>
            
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {renderStars(formula.rating)}
              </View>
              <Text style={styles.ratingText}>
                {formula.rating.toFixed(1)} ({formula.totalRatings})
              </Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="download" size={14} color="#666" />
                <Text style={styles.statText}>{formula.downloads.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="trending-up" size={14} color="#4CAF50" />
                <Text style={[styles.statText, styles.profitText]}>
                  {formatProfit(formula.profit, formula.profitPercentage)}
                </Text>
              </View>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(formula.price, formula.currency)}</Text>
              {formula.isTopGainer && (
                <View style={styles.topGainerBadge}>
                  <Text style={styles.badgeText}>Top Gainer</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.verticalCard, { width: cardWidth }]}
      onPress={() => onPress(formula)}
      activeOpacity={0.8}
    >
      <View style={styles.verticalContent}>
        <Image
          source={{ uri: formula.imageUrl || 'https://via.placeholder.com/150x100' }}
          style={styles.verticalImage}
          resizeMode="cover"
        />
        
        <View style={styles.verticalInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.verticalFormulaName} numberOfLines={1}>
              {formula.name}
            </Text>
            {formula.isVerified && (
              <Icon name="verified" size={14} color="#4CAF50" />
            )}
          </View>
          
          <Text style={styles.verticalAuthorName} numberOfLines={1}>
            by {formula.author.name}
          </Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {renderStars(formula.rating)}
            </View>
            <Text style={styles.verticalRatingText}>
              {formula.rating.toFixed(1)}
            </Text>
          </View>
          
          <View style={styles.verticalStatsRow}>
            <View style={styles.verticalStatItem}>
              <Icon name="download" size={12} color="#666" />
              <Text style={styles.verticalStatText}>{formula.downloads.toLocaleString()}</Text>
            </View>
            <View style={styles.verticalStatItem}>
              <Icon name="trending-up" size={12} color="#4CAF50" />
              <Text style={[styles.verticalStatText, styles.profitText]}>
                +{formula.profitPercentage.toFixed(1)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.verticalPriceRow}>
            <Text style={styles.verticalPrice}>{formatPrice(formula.price, formula.currency)}</Text>
            {formula.isTopGainer && (
              <View style={styles.smallBadge}>
                <Text style={styles.smallBadgeText}>Top</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  horizontalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalContent: {
    flexDirection: 'row',
    padding: 12,
  },
  horizontalImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  horizontalInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  verticalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verticalContent: {
    padding: 12,
  },
  verticalImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  verticalInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  formulaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 4,
  },
  verticalFormulaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 4,
  },
  authorName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  verticalAuthorName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  verticalRatingText: {
    fontSize: 11,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verticalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  verticalStatText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  profitText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verticalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  verticalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  topGainerBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  smallBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  smallBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default FormulaCard;