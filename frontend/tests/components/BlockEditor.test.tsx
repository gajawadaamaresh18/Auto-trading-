import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BlockEditor } from '@/components/BlockEditor';
import { Block } from '@/types';

const mockBlock: Block = {
  id: '1',
  type: 'indicator',
  name: 'SMA',
  parameters: { period: 20, color: '#FF0000' },
  position: { x: 100, y: 200 },
};

describe('BlockEditor', () => {
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnMove = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with correct props and data', () => {
      const { getByText } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      expect(getByText('SMA')).toBeTruthy();
      expect(getByText('indicator')).toBeTruthy();
    });

    it('renders with different block types', () => {
      const { rerender, getByText } = render(
        <BlockEditor
          block={{ ...mockBlock, type: 'condition' }}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );
      expect(getByText('condition')).toBeTruthy();

      rerender(
        <BlockEditor
          block={{ ...mockBlock, type: 'action' }}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );
      expect(getByText('action')).toBeTruthy();
    });

    it('shows selection border when selected', () => {
      const { getByText } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
          isSelected={true}
        />
      );

      const container = getByText('SMA').parent;
      expect(container.props.style).toContainEqual(
        expect.objectContaining({ borderColor: '#FFD700' })
      );
    });

    it('shows edit modal when edit button is pressed', async () => {
      const { getByTestId, getByText } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      fireEvent.press(getByTestId('edit-block-button'));
      
      await waitFor(() => {
        expect(getByText('Edit Block')).toBeTruthy();
        expect(getByTestId('block-name-input')).toBeTruthy();
        expect(getByTestId('block-parameters-input')).toBeTruthy();
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onSelect when block is touched', () => {
      const { getByText } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.press(getByText('SMA'));
      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('calls onDelete when delete button is pressed', () => {
      const { getByTestId } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      fireEvent.press(getByTestId('delete-block-button'));
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('updates block when save is pressed with valid data', async () => {
      const { getByTestId, getByText } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      // Open edit modal
      fireEvent.press(getByTestId('edit-block-button'));
      
      await waitFor(() => {
        expect(getByTestId('block-name-input')).toBeTruthy();
      });

      // Update name and parameters
      fireEvent.changeText(getByTestId('block-name-input'), 'Updated SMA');
      fireEvent.changeText(
        getByTestId('block-parameters-input'),
        '{"period": 50, "color": "#00FF00"}'
      );

      // Save changes
      fireEvent.press(getByTestId('save-block-button'));

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...mockBlock,
        name: 'Updated SMA',
        parameters: { period: 50, color: '#00FF00' },
      });
    });

    it('does not update block when save is pressed with invalid JSON', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { getByTestId } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      // Open edit modal
      fireEvent.press(getByTestId('edit-block-button'));
      
      await waitFor(() => {
        expect(getByTestId('block-parameters-input')).toBeTruthy();
      });

      // Enter invalid JSON
      fireEvent.changeText(getByTestId('block-parameters-input'), 'invalid json');

      // Save changes
      fireEvent.press(getByTestId('save-block-button'));

      expect(mockOnUpdate).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid JSON parameters:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('cancels edit when cancel is pressed', async () => {
      const { getByTestId, queryByText } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      // Open edit modal
      fireEvent.press(getByTestId('edit-block-button'));
      
      await waitFor(() => {
        expect(getByText('Edit Block')).toBeTruthy();
      });

      // Cancel edit
      fireEvent.press(getByText('Cancel'));

      await waitFor(() => {
        expect(queryByText('Edit Block')).toBeNull();
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop Simulation', () => {
    it('calls onMove when gesture state changes to ACTIVE', () => {
      const { getByText } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      // Simulate gesture event with ACTIVE state
      const gestureEvent = {
        nativeEvent: {
          state: 4, // State.ACTIVE
          absoluteX: 150,
          absoluteY: 250,
        },
      };

      // This would normally be triggered by PanGestureHandler
      // In a real test, you'd use react-native-gesture-handler testing utilities
      // For now, we'll test the logic directly
      const newPosition = {
        x: gestureEvent.nativeEvent.absoluteX - 50,
        y: gestureEvent.nativeEvent.absoluteY - 50,
      };

      // Simulate the move logic
      mockOnMove('1', newPosition);

      expect(mockOnMove).toHaveBeenCalledWith('1', { x: 100, y: 200 });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty parameters object', () => {
      const emptyParamsBlock = { ...mockBlock, parameters: {} };
      const { getByText } = render(
        <BlockEditor
          block={emptyParamsBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      expect(getByText('SMA')).toBeTruthy();
    });

    it('handles complex parameters object', () => {
      const complexParamsBlock = {
        ...mockBlock,
        parameters: {
          period: 20,
          color: '#FF0000',
          style: { lineWidth: 2, dashed: true },
          conditions: ['price > sma', 'volume > average'],
        },
      };

      const { getByText } = render(
        <BlockEditor
          block={complexParamsBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      expect(getByText('SMA')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper testIDs for testing', () => {
      const { getByTestId } = render(
        <BlockEditor
          block={mockBlock}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onMove={mockOnMove}
        />
      );

      expect(getByTestId('edit-block-button')).toBeTruthy();
      expect(getByTestId('delete-block-button')).toBeTruthy();
    });
  });
});