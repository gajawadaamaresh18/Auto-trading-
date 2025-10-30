/**
 * FormulaCard Component Tests
 * 
 * Comprehensive unit tests for the FormulaCard component covering
 * rendering, props, interactions, and edge cases.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import FormulaCard from '../../components/formulas/FormulaCard';
import theme from '../../theme';

// Mock data
const mockFormula = {
  id: 'formula-1',
  name: 'Momentum Strategy',
  description: 'A momentum-based trading strategy',
  category: 'momentum',
  performanceScore: 85.5,
  riskScore: 65.2,
  totalSubscribers: 1250,
  totalTrades: 3420,
  isFree: false,
  pricePerMonth: 29.99,
  creator: {
    id: 'user-1',
    name: 'John Trader',
    avatar: 'https://example.com/avatar.jpg',
  },
  sparklineData: [100, 105, 102, 108, 115, 110, 125, 130, 128, 135],
  averageReturn: 12.5,
  winRate: 68.5,
  maxDrawdown: -8.2,
  sharpeRatio: 1.45,
  createdAt: '2023-01-15T10:30:00Z',
  updatedAt: '2023-12-01T15:45:00Z',
};

const mockSubscription = {
  id: 'sub-1',
  status: 'active',
  subscribedAt: '2023-06-01T00:00:00Z',
  expiresAt: '2024-06-01T00:00:00Z',
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('FormulaCard', () => {
  const defaultProps = {
    formula: mockFormula,
    onPress: jest.fn(),
    onSubscribe: jest.fn(),
    onUnsubscribe: jest.fn(),
    subscription: null,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders formula information correctly', () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      expect(getByText('Momentum Strategy')).toBeTruthy();
      expect(getByText('A momentum-based trading strategy')).toBeTruthy();
      expect(getByText('John Trader')).toBeTruthy();
      expect(getByText('1,250')).toBeTruthy(); // subscribers
      expect(getByText('3,420')).toBeTruthy(); // trades
      expect(getByTestId('sparkline-chart')).toBeTruthy();
    });

    it('renders performance metrics correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      expect(getByText('85.5%')).toBeTruthy(); // performance score
      expect(getByText('68.5%')).toBeTruthy(); // win rate
      expect(getByText('12.5%')).toBeTruthy(); // average return
    });

    it('renders pricing information for paid formulas', () => {
      const { getByText } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      expect(getByText('$29.99')).toBeTruthy();
      expect(getByText('/month')).toBeTruthy();
    });

    it('renders free badge for free formulas', () => {
      const freeFormula = { ...mockFormula, isFree: true };
      const { getByText } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} formula={freeFormula} />
        </TestWrapper>
      );

      expect(getByText('FREE')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.press(getByTestId('formula-card'));
      expect(defaultProps.onPress).toHaveBeenCalledWith(mockFormula.id);
    });

    it('calls onSubscribe when subscribe button is pressed', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.press(getByTestId('subscribe-button'));
      expect(defaultProps.onSubscribe).toHaveBeenCalledWith(mockFormula.id);
    });

    it('calls onUnsubscribe when unsubscribe button is pressed', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} subscription={mockSubscription} />
        </TestWrapper>
      );

      fireEvent.press(getByTestId('unsubscribe-button'));
      expect(defaultProps.onUnsubscribe).toHaveBeenCalledWith(mockSubscription.id);
    });
  });

  describe('Subscription States', () => {
    it('shows subscribe button when not subscribed', () => {
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      expect(getByTestId('subscribe-button')).toBeTruthy();
      expect(queryByTestId('unsubscribe-button')).toBeNull();
    });

    it('shows unsubscribe button when subscribed', () => {
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} subscription={mockSubscription} />
        </TestWrapper>
      );

      expect(getByTestId('unsubscribe-button')).toBeTruthy();
      expect(queryByTestId('subscribe-button')).toBeNull();
    });

    it('shows loading state when isLoading is true', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} isLoading={true} />
        </TestWrapper>
      );

      expect(getByTestId('loading-spinner')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing sparkline data gracefully', () => {
      const formulaWithoutSparkline = { ...mockFormula, sparklineData: [] };
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} formula={formulaWithoutSparkline} />
        </TestWrapper>
      );

      expect(getByTestId('sparkline-chart')).toBeTruthy();
    });

    it('handles zero subscribers gracefully', () => {
      const formulaWithZeroSubscribers = { ...mockFormula, totalSubscribers: 0 };
      const { getByText } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} formula={formulaWithZeroSubscribers} />
        </TestWrapper>
      );

      expect(getByText('0')).toBeTruthy();
    });

    it('handles very long formula names', () => {
      const formulaWithLongName = {
        ...mockFormula,
        name: 'This is a very long formula name that should be truncated properly',
      };
      const { getByText } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} formula={formulaWithLongName} />
        </TestWrapper>
      );

      expect(getByText(formulaWithLongName.name)).toBeTruthy();
    });

    it('handles missing creator information', () => {
      const formulaWithoutCreator = { ...mockFormula, creator: null };
      const { getByText } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} formula={formulaWithoutCreator} />
        </TestWrapper>
      );

      expect(getByText('Unknown Creator')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      expect(getByLabelText('Formula card: Momentum Strategy')).toBeTruthy();
      expect(getByLabelText('Subscribe to Momentum Strategy')).toBeTruthy();
    });

    it('supports screen readers', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      const card = getByTestId('formula-card');
      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityHint).toBe('Tap to view formula details');
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors correctly', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      const card = getByTestId('formula-card');
      expect(card.props.style).toMatchObject({
        backgroundColor: theme.colors.background.card,
        borderColor: theme.colors.border.light,
      });
    });

    it('supports dark mode', () => {
      const darkTheme = {
        ...theme,
        colors: {
          ...theme.colors,
          background: { primary: '#000000', card: '#1C1C1E' },
          text: { primary: '#FFFFFF', secondary: '#8E8E93' },
        },
      };

      const { getByTestId } = render(
        <ThemeProvider theme={darkTheme}>
          <FormulaCard {...defaultProps} />
        </ThemeProvider>
      );

      const card = getByTestId('formula-card');
      expect(card.props.style.backgroundColor).toBe('#1C1C1E');
    });
  });

  describe('Performance', () => {
    it('renders without unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return (
          <TestWrapper>
            <FormulaCard {...defaultProps} />
          </TestWrapper>
        );
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles rapid button presses gracefully', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <FormulaCard {...defaultProps} />
        </TestWrapper>
      );

      const subscribeButton = getByTestId('subscribe-button');
      
      // Rapid fire button presses
      fireEvent.press(subscribeButton);
      fireEvent.press(subscribeButton);
      fireEvent.press(subscribeButton);

      await waitFor(() => {
        expect(defaultProps.onSubscribe).toHaveBeenCalledTimes(3);
      });
    });
  });
});
