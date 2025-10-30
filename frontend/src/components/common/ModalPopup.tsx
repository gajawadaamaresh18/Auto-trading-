/**
 * ModalPopup Component
 * 
 * Versatile modal component for trade confirmations, alerts, forms, and quick actions.
 * Supports various modal types with customizable content and actions.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import theme from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ModalAction {
  /** Action label */
  label: string;
  /** Action type for styling */
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  /** Whether action is disabled */
  disabled?: boolean;
  /** Whether action is loading */
  loading?: boolean;
  /** Action callback */
  onPress: () => void;
}

export interface ModalPopupProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Modal title */
  title?: string;
  /** Modal subtitle */
  subtitle?: string;
  /** Modal content */
  children?: React.ReactNode;
  /** Modal content text */
  content?: string;
  /** Modal type for styling */
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirmation' | 'custom';
  /** Modal size */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** Modal actions */
  actions?: ModalAction[];
  /** Primary action (shows as prominent button) */
  primaryAction?: ModalAction;
  /** Secondary action */
  secondaryAction?: ModalAction;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to close on backdrop press */
  closeOnBackdropPress?: boolean;
  /** Whether to close on escape */
  closeOnEscape?: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Custom icon */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Whether to show loading overlay */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Whether modal is scrollable */
  scrollable?: boolean;
  /** Maximum height for scrollable content */
  maxHeight?: number;
  /** Additional styling */
  style?: any;
  /** Content styling */
  contentStyle?: any;
}

const ModalPopup: React.FC<ModalPopupProps> = ({
  visible,
  title,
  subtitle,
  children,
  content,
  type = 'info',
  size = 'medium',
  actions = [],
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnEscape = true,
  onClose,
  icon,
  loading = false,
  loadingMessage = 'Loading...',
  scrollable = false,
  maxHeight,
  style,
  contentStyle,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          color: theme.colors.success[500],
          backgroundColor: theme.colors.success[50],
          icon: 'checkmark-circle',
        };
      case 'warning':
        return {
          color: theme.colors.warning[500],
          backgroundColor: theme.colors.warning[50],
          icon: 'warning',
        };
      case 'error':
        return {
          color: theme.colors.error[500],
          backgroundColor: theme.colors.error[50],
          icon: 'close-circle',
        };
      case 'confirmation':
        return {
          color: theme.colors.primary[500],
          backgroundColor: theme.colors.primary[50],
          icon: 'help-circle',
        };
      case 'custom':
        return {
          color: theme.colors.neutral[500],
          backgroundColor: theme.colors.neutral[50],
          icon: 'information-circle',
        };
      default:
        return {
          color: theme.colors.primary[500],
          backgroundColor: theme.colors.primary[50],
          icon: 'information-circle',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          title: styles.smallTitle,
          content: styles.smallContent,
          maxWidth: screenWidth * 0.8,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          title: styles.largeTitle,
          content: styles.largeContent,
          maxWidth: screenWidth * 0.9,
        };
      case 'fullscreen':
        return {
          container: styles.fullscreenContainer,
          title: styles.fullscreenTitle,
          content: styles.fullscreenContent,
          maxWidth: screenWidth,
        };
      default:
        return {
          container: styles.mediumContainer,
          title: styles.mediumTitle,
          content: styles.mediumContent,
          maxWidth: screenWidth * 0.85,
        };
    }
  };

  const getActionButtonStyle = (actionType: string) => {
    switch (actionType) {
      case 'primary':
        return {
          button: styles.primaryButton,
          text: styles.primaryButtonText,
        };
      case 'secondary':
        return {
          button: styles.secondaryButton,
          text: styles.secondaryButtonText,
        };
      case 'danger':
        return {
          button: styles.dangerButton,
          text: styles.dangerButtonText,
        };
      case 'success':
        return {
          button: styles.successButton,
          text: styles.successButtonText,
        };
      default:
        return {
          button: styles.defaultButton,
          text: styles.defaultButtonText,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const sizeStyles = getSizeStyles();
  const displayIcon = icon || typeConfig.icon;

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const renderActions = () => {
    const allActions = [
      ...(secondaryAction ? [secondaryAction] : []),
      ...actions,
      ...(primaryAction ? [primaryAction] : []),
    ];

    if (allActions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {allActions.map((action, index) => {
          const buttonStyles = getActionButtonStyle(action.type || 'default');
          const isPrimary = action === primaryAction;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                buttonStyles.button,
                isPrimary && styles.primaryActionButton,
                action.disabled && styles.disabledButton,
              ]}
              onPress={action.onPress}
              disabled={action.disabled || action.loading}
              activeOpacity={0.8}
            >
              {action.loading ? (
                <Text style={[styles.actionButtonText, buttonStyles.text]}>
                  Loading...
                </Text>
              ) : (
                <Text style={[styles.actionButtonText, buttonStyles.text]}>
                  {action.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderContent = () => {
    if (children) {
      return children;
    }

    if (content) {
      return (
        <Text style={[styles.contentText, sizeStyles.content]}>
          {content}
        </Text>
      );
    }

    return null;
  };

  const ModalContent = () => (
    <Animated.View
      style={[
        styles.modalContainer,
        sizeStyles.container,
        { 
          maxWidth: sizeStyles.maxWidth,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
        },
        style,
      ]}
    >
      {/* Header */}
      {(title || subtitle || showCloseButton) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {displayIcon && (
              <View style={[styles.iconContainer, { backgroundColor: typeConfig.backgroundColor }]}>
                <Ionicons 
                  name={displayIcon} 
                  size={24} 
                  color={typeConfig.color} 
                />
              </View>
            )}
            
            <View style={styles.textContainer}>
              {title && (
                <Text style={[styles.title, sizeStyles.title]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={styles.subtitle}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={theme.colors.text.secondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      <View style={[styles.contentContainer, contentStyle]}>
        {scrollable ? (
          <ScrollView
            style={[
              styles.scrollableContent,
              maxHeight && { maxHeight },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        ) : (
          renderContent()
        )}
      </View>

      {/* Actions */}
      {renderActions()}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Ionicons 
              name="hourglass-outline" 
              size={32} 
              color={theme.colors.primary[500]} 
            />
            <Text style={styles.loadingText}>
              {loadingMessage}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeOnEscape ? onClose : undefined}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <BlurView
            intensity={20}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <View style={styles.modalWrapper}>
            <ModalContent />
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  
  // Modal container
  modalContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.xl,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  closeButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  
  // Content styles
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  contentText: {
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  scrollableContent: {
    maxHeight: 300,
  },
  
  // Actions styles
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryActionButton: {
    marginLeft: 0,
    marginRight: theme.spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Button variants
  primaryButton: {
    backgroundColor: theme.colors.primary[500],
  },
  primaryButtonText: {
    color: theme.colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  secondaryButtonText: {
    color: theme.colors.text.primary,
  },
  dangerButton: {
    backgroundColor: theme.colors.error[500],
  },
  dangerButtonText: {
    color: theme.colors.text.inverse,
  },
  successButton: {
    backgroundColor: theme.colors.success[500],
  },
  successButtonText: {
    color: theme.colors.text.inverse,
  },
  defaultButton: {
    backgroundColor: theme.colors.neutral[100],
  },
  defaultButtonText: {
    color: theme.colors.text.primary,
  },
  
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  
  // Size variants
  smallContainer: {
    padding: theme.spacing.md,
  },
  smallTitle: {
    fontSize: theme.typography.fontSize.lg,
  },
  smallContent: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  mediumContainer: {
    padding: theme.spacing.lg,
  },
  mediumTitle: {
    fontSize: theme.typography.fontSize.xl,
  },
  mediumContent: {
    fontSize: theme.typography.fontSize.base,
  },
  
  largeContainer: {
    padding: theme.spacing.xl,
  },
  largeTitle: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  largeContent: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  fullscreenContainer: {
    flex: 1,
    borderRadius: 0,
    padding: theme.spacing.xl,
  },
  fullscreenTitle: {
    fontSize: theme.typography.fontSize['3xl'],
  },
  fullscreenContent: {
    fontSize: theme.typography.fontSize.xl,
  },
});

export default ModalPopup;
