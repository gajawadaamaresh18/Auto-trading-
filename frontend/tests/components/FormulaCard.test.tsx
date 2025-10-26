import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { FormulaCard } from '@/components/FormulaCard';
import { Formula } from '@/types';

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockFormula: Formula = {
  id: '1',
  name: 'Test Formula',
  description: 'A test formula for unit testing',
  blocks: [
    { id: '1', type: 'indicator', name: 'SMA', parameters: { period: 20 }, position: { x: 0, y: 0 } },
    { id: '2', type: 'condition', name: 'Price > SMA', parameters: {}, position: { x: 100, y: 0 } },
  ],
  riskLevel: 'medium',
  isPublic: true,
  authorId: 'user1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  performance: {
    totalReturn: 15.5,
    sharpeRatio: 1.2,
    maxDrawdown: -5.3,
  },
};

describe('FormulaCard', () => {
  const mockOnPress = jest.fn();
  const mockOnSubscribe = jest.fn();
  const mockOnClone = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with correct props and data', () => {
      const { getByText, getByTestId } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
          onEdit={mockOnEdit}
        />
      );

      expect(getByText('Test Formula')).toBeTruthy();
      expect(getByText('A test formula for unit testing')).toBeTruthy();
      expect(getByText('MEDIUM')).toBeTruthy();
      expect(getByText('2 blocks')).toBeTruthy();
      expect(getByText('Return: 15.50%')).toBeTruthy();
      expect(getByText('Sharpe: 1.20')).toBeTruthy();
    });

    it('renders without performance data', () => {
      const formulaWithoutPerformance = { ...mockFormula, performance: undefined };
      const { queryByText } = render(
        <FormulaCard
          formula={formulaWithoutPerformance}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
        />
      );

      expect(queryByText('Return:')).toBeNull();
      expect(queryByText('Sharpe:')).toBeNull();
    });

    it('renders with different risk levels', () => {
      const { rerender, getByText } = render(
        <FormulaCard
          formula={{ ...mockFormula, riskLevel: 'low' }}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
        />
      );
      expect(getByText('LOW')).toBeTruthy();

      rerender(
        <FormulaCard
          formula={{ ...mockFormula, riskLevel: 'high' }}
          onPress={mockOnPress}
          onSubscribe={mockOnPress}
          onClone={mockOnClone}
        />
      );
      expect(getByText('HIGH')).toBeTruthy();
    });

    it('renders without actions when showActions is false', () => {
      const { queryByTestId } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
          showActions={false}
        />
      );

      expect(queryByTestId('subscribe-button')).toBeNull();
      expect(queryByTestId('clone-button')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const { getByText } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
        />
      );

      fireEvent.press(getByText('Test Formula'));
      expect(mockOnPress).toHaveBeenCalledWith(mockFormula);
    });

    it('calls onSubscribe when subscribe button is pressed (not subscribed)', () => {
      const { getByTestId } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
          isSubscribed={false}
        />
      );

      fireEvent.press(getByTestId('subscribe-button'));
      expect(mockOnSubscribe).toHaveBeenCalledWith('1');
    });

    it('shows unsubscribe confirmation when subscribe button is pressed (subscribed)', async () => {
      const { getByTestId } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
          isSubscribed={true}
        />
      );

      fireEvent.press(getByTestId('subscribe-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Unsubscribe',
          'Are you sure you want to unsubscribe from this formula?',
          expect.any(Array)
        );
      });
    });

    it('calls onClone when clone button is pressed', async () => {
      const { getByTestId } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
        />
      );

      fireEvent.press(getByTestId('clone-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Clone Formula',
          'This will create a copy of the formula that you can edit.',
          expect.any(Array)
        );
      });
    });

    it('calls onEdit when edit button is pressed', () => {
      const { getByTestId } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
          onEdit={mockOnEdit}
        />
      );

      fireEvent.press(getByTestId('edit-button'));
      expect(mockOnEdit).toHaveBeenCalledWith('1');
    });
  });

  describe('Edge Cases', () => {
    it('handles long formula names with ellipsis', () => {
      const longNameFormula = {
        ...mockFormula,
        name: 'This is a very long formula name that should be truncated with ellipsis',
      };
      
      const { getByText } = render(
        <FormulaCard
          formula={longNameFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
        />
      );

      const titleElement = getByText(longNameFormula.name);
      expect(titleElement.props.numberOfLines).toBe(2);
    });

    it('handles long descriptions with ellipsis', () => {
      const longDescFormula = {
        ...mockFormula,
        description: 'This is a very long description that should be truncated with ellipsis to prevent layout issues',
      };
      
      const { getByText } = render(
        <FormulaCard
          formula={longDescFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
        />
      );

      const descElement = getByText(longDescFormula.description);
      expect(descElement.props.numberOfLines).toBe(3);
    });

    it('handles zero blocks', () => {
      const emptyFormula = { ...mockFormula, blocks: [] };
      const { getByText } = render(
        <FormulaCard
          formula={emptyFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
        />
      );

      expect(getByText('0 blocks')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper testIDs for testing', () => {
      const { getByTestId } = render(
        <FormulaCard
          formula={mockFormula}
          onPress={mockOnPress}
          onSubscribe={mockOnSubscribe}
          onClone={mockOnClone}
          onEdit={mockOnEdit}
        />
      );

      expect(getByTestId('subscribe-button')).toBeTruthy();
      expect(getByTestId('clone-button')).toBeTruthy();
      expect(getByTestId('edit-button')).toBeTruthy();
    });
  });
});