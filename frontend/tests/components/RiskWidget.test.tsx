import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { RiskWidget } from '@/components/RiskWidget';

// Mock Alert
jest.spyOn(Alert, 'alert');
jest.spyOn(Alert, 'prompt');

const mockRiskHistory = [
  { date: '2023-01-01', risk: 100 },
  { date: '2023-01-02', risk: 150 },
  { date: '2023-01-03', risk: 200 },
  { date: '2023-01-04', risk: 180 },
  { date: '2023-01-05', risk: 250 },
  { date: '2023-01-06', risk: 300 },
  { date: '2023-01-07', risk: 350 },
];

describe('RiskWidget', () => {
  const mockOnRiskExceeded = jest.fn();
  const mockOnAdjustRisk = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with correct props and data', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('Risk Management')).toBeTruthy();
      expect(getByText('Current Risk: $200.00')).toBeTruthy();
      expect(getByText('Max Risk: $500.00')).toBeTruthy();
      expect(getByText('40.0% of max risk')).toBeTruthy();
    });

    it('renders without risk history', () => {
      const { getByText, queryByText } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={[]}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('Risk Management')).toBeTruthy();
      expect(queryByText('Risk History (7 days)')).toBeNull();
    });

    it('shows blocked state when isBlocked is true', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
          isBlocked={true}
        />
      );

      const container = getByText('Risk Management').parent?.parent;
      expect(container?.props.style).toContainEqual(
        expect.objectContaining({ borderColor: '#F44336' })
      );
    });
  });

  describe('Risk Status Display', () => {
    it('shows NORMAL status for low risk', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('NORMAL')).toBeTruthy();
    });

    it('shows HIGH status for high risk (>80%)', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={450}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('HIGH')).toBeTruthy();
    });

    it('shows EXCEEDED status when risk exceeds maximum', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={600}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('EXCEEDED')).toBeTruthy();
    });
  });

  describe('Risk Exceeded Alert', () => {
    it('shows alert when risk is exceeded', async () => {
      render(
        <RiskWidget
          currentRisk={600}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Risk Limit Exceeded',
          'Your current risk level exceeds the maximum allowed. Trading has been blocked.',
          expect.any(Array)
        );
      });
    });

    it('calls onRiskExceeded when alert is dismissed', async () => {
      render(
        <RiskWidget
          currentRisk={600}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simulate alert dismissal
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const alertButtons = alertCall[2];
      alertButtons[0].onPress();

      expect(mockOnRiskExceeded).toHaveBeenCalled();
    });

    it('does not show alert when risk is not exceeded', () => {
      render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('Adjust Risk Functionality', () => {
    it('shows prompt when adjust risk button is pressed', async () => {
      const { getByTestId } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      fireEvent.press(getByTestId('adjust-risk-button'));

      await waitFor(() => {
        expect(Alert.prompt).toHaveBeenCalledWith(
          'Adjust Risk Limit',
          'Enter new maximum risk limit:',
          expect.any(Array),
          'plain-text',
          '500'
        );
      });
    });

    it('calls onAdjustRisk with valid input', async () => {
      const { getByTestId } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      fireEvent.press(getByTestId('adjust-risk-button'));

      await waitFor(() => {
        expect(Alert.prompt).toHaveBeenCalled();
      });

      // Simulate prompt confirmation with valid input
      const promptCall = (Alert.prompt as jest.Mock).mock.calls[0];
      const promptButtons = promptCall[2];
      promptButtons[1].onPress('750');

      expect(mockOnAdjustRisk).toHaveBeenCalledWith(750);
    });

    it('does not call onAdjustRisk with invalid input', async () => {
      const { getByTestId } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      fireEvent.press(getByTestId('adjust-risk-button'));

      await waitFor(() => {
        expect(Alert.prompt).toHaveBeenCalled();
      });

      // Simulate prompt confirmation with invalid input
      const promptCall = (Alert.prompt as jest.Mock).mock.calls[0];
      const promptButtons = promptCall[2];
      promptButtons[1].onPress('0'); // Invalid: 0 or negative

      expect(mockOnAdjustRisk).not.toHaveBeenCalled();
    });

    it('does not call onAdjustRisk when prompt is cancelled', async () => {
      const { getByTestId } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      fireEvent.press(getByTestId('adjust-risk-button'));

      await waitFor(() => {
        expect(Alert.prompt).toHaveBeenCalled();
      });

      // Simulate prompt cancellation
      const promptCall = (Alert.prompt as jest.Mock).mock.calls[0];
      const promptButtons = promptCall[2];
      promptButtons[0].onPress();

      expect(mockOnAdjustRisk).not.toHaveBeenCalled();
    });
  });

  describe('Chart Display', () => {
    it('renders chart with risk history data', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('Risk History (7 days)')).toBeTruthy();
    });

    it('does not render chart when no history data', () => {
      const { queryByText } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={[]}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(queryByText('Risk History (7 days)')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero current risk', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={0}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('Current Risk: $0.00')).toBeTruthy();
      expect(getByText('0.0% of max risk')).toBeTruthy();
    });

    it('handles very large numbers', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={999999.99}
          maxRisk={1000000}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('Current Risk: $999999.99')).toBeTruthy();
      expect(getByText('Max Risk: $1000000.00')).toBeTruthy();
    });

    it('handles decimal precision correctly', () => {
      const { getByText } = render(
        <RiskWidget
          currentRisk={123.456}
          maxRisk={500.789}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByText('Current Risk: $123.46')).toBeTruthy();
      expect(getByText('Max Risk: $500.79')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper testID for adjust risk button', () => {
      const { getByTestId } = render(
        <RiskWidget
          currentRisk={200}
          maxRisk={500}
          riskHistory={mockRiskHistory}
          onRiskExceeded={mockOnRiskExceeded}
          onAdjustRisk={mockOnAdjustRisk}
        />
      );

      expect(getByTestId('adjust-risk-button')).toBeTruthy();
    });
  });
});