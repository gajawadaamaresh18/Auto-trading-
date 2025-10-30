/**
 * Welcome Tour Screen
 * 
 * Hero carousel introduction screen with one-tap explore demo and skip option.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface WelcomeSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
  color: string;
}

export interface WelcomeTourScreenProps {
  /** Callback when user starts onboarding */
  onStartOnboarding: () => void;
  /** Callback when user skips onboarding */
  onSkipOnboarding: () => void;
  /** Callback when user explores demo */
  onExploreDemo: () => void;
  /** Additional styling */
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Welcome Slides Configuration
const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to FormulaTrader',
    subtitle: 'Algorithmic Trading Made Simple',
    description: 'Discover, subscribe to, and execute proven trading strategies with just a few taps.',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Welcome',
    icon: 'rocket',
    color: theme.colors.primary[500],
  },
  {
    id: 'marketplace',
    title: 'Formula Marketplace',
    subtitle: 'Discover Proven Strategies',
    description: 'Browse hundreds of trading formulas created by expert traders and quantitative analysts.',
    image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Marketplace',
    icon: 'storefront',
    color: theme.colors.success[500],
  },
  {
    id: 'automation',
    title: 'Automated Execution',
    subtitle: 'Trade While You Sleep',
    description: 'Set up your strategies to run automatically with built-in risk management and monitoring.',
    image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Automation',
    icon: 'settings',
    color: theme.colors.warning[500],
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    subtitle: 'Track Your Performance',
    description: 'Monitor your portfolio performance with detailed analytics and risk metrics.',
    image: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Analytics',
    icon: 'analytics',
    color: theme.colors.error[500],
  },
];

// Main Welcome Tour Screen Component
const WelcomeTourScreen: React.FC<WelcomeTourScreenProps> = ({
  onStartOnboarding,
  onSkipOnboarding,
  onExploreDemo,
  style,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const slideWidth = screenWidth;
  const totalSlides = WELCOME_SLIDES.length;

  // Handle scroll events
  const handleScroll = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(contentOffsetX / slideWidth);
    
    if (slideIndex !== currentSlide && !isScrolling) {
      setCurrentSlide(slideIndex);
    }
  }, [currentSlide, isScrolling, slideWidth]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setIsScrolling(false);
  }, []);

  // Navigate to specific slide
  const goToSlide = useCallback((index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * slideWidth,
        animated: true,
      });
    }
    setCurrentSlide(index);
  }, [slideWidth]);

  // Render slide content
  const renderSlide = useCallback((slide: WelcomeSlide, index: number) => (
    <View key={slide.id} style={styles.slide}>
      <View style={styles.slideContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
          <Ionicons name={slide.icon as any} size={48} color={theme.colors.text.inverse} />
        </View>
        
        {/* Image placeholder */}
        <View style={styles.imageContainer}>
          <View style={[styles.imagePlaceholder, { backgroundColor: slide.color }]}>
            <Ionicons name="image" size={32} color={theme.colors.text.inverse} />
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.textContent}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </View>
      </View>
    </View>
  ), []);

  // Render pagination dots
  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {WELCOME_SLIDES.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            index === currentSlide && styles.paginationDotActive,
          ]}
          onPress={() => goToSlide(index)}
        />
      ))}
    </View>
  );

  // Render action buttons
  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={onExploreDemo}
      >
        <Ionicons name="play" size={20} color={theme.colors.text.inverse} />
        <Text style={styles.exploreButtonText}>Explore Demo</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={onStartOnboarding}
      >
        <Text style={styles.startButtonText}>Start Tour</Text>
        <Ionicons name="arrow-forward" size={20} color={theme.colors.primary[500]} />
      </TouchableOpacity>
    </View>
  );

  // Render skip button
  const renderSkipButton = () => (
    <TouchableOpacity
      style={styles.skipButton}
      onPress={onSkipOnboarding}
    >
      <Text style={styles.skipButtonText}>Skip</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, style]}>
      {/* Skip Button */}
      {renderSkipButton()}
      
      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {WELCOME_SLIDES.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>
      
      {/* Pagination */}
      {renderPagination()}
      
      {/* Action Buttons */}
      {renderActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  // Skip button styles
  skipButton: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.md,
    zIndex: 100,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  skipButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  
  // Slide styles
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  
  // Icon styles
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  
  // Image styles
  imageContainer: {
    marginBottom: theme.spacing.xl,
  },
  imagePlaceholder: {
    width: 200,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  // Text content styles
  textContent: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  slideTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  slideSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary[500],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  slideDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  // Pagination styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.neutral[300],
    marginHorizontal: theme.spacing.xs,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.primary[500],
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  
  // Action buttons styles
  actionButtonsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[800],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  exploreButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.inverse,
    marginLeft: theme.spacing.sm,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  startButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary[500],
    marginRight: theme.spacing.sm,
  },
});

export default WelcomeTourScreen;
