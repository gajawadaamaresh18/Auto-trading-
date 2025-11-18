"""
Simplified Technical Indicator Backend
Works without TA-Lib, using only pandas_ta and numpy
"""

import numpy as np
import pandas as pd
from typing import Union, Tuple, List, Dict, Any
import warnings

warnings.filterwarnings('ignore')

class SimpleIndicatorBackend:
    """
    Simplified backend class for technical indicators using pandas_ta and numpy
    """
    
    def __init__(self):
        self.pandas_ta_available = True
        
        try:
            import pandas_ta as pta
            self.pta = pta
        except ImportError:
            self.pandas_ta_available = False
            print("Warning: pandas_ta not available. Some indicators will not work.")
    
    def _to_numpy(self, data: Union[pd.Series, np.ndarray, List]) -> np.ndarray:
        """Convert input to numpy array"""
        if isinstance(data, pd.Series):
            return data.values
        elif isinstance(data, list):
            return np.array(data)
        return data

    def _to_pandas_series(self, data: Union[pd.Series, np.ndarray, List]) -> pd.Series:
        """Convert input to pandas Series"""
        if isinstance(data, pd.Series):
            return data
        elif isinstance(data, list):
            return pd.Series(data)
        return pd.Series(data)

    # === TREND INDICATORS ===
    
    def sma(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Simple Moving Average"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.sma(close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_sma(close, period)
    
    def ema(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Exponential Moving Average"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.ema(close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_ema(close, period)
    
    def wma(self, close: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Weighted Moving Average"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.wma(close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_wma(close, period)
    
    def vwma(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray], period: int = 20) -> np.ndarray:
        """Volume Weighted Moving Average"""
        close_series = self._to_pandas_series(close)
        volume_series = self._to_pandas_series(volume)
        if self.pandas_ta_available:
            result = self.pta.vwma(close_series, volume_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_vwma(close, volume, period)

    # === MOMENTUM INDICATORS ===
    
    def rsi(self, close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Relative Strength Index"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.rsi(close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_rsi(close, period)
    
    def stoch(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
              close: Union[pd.Series, np.ndarray], k_period: int = 14, d_period: int = 3, 
              smooth_k: int = 1) -> Tuple[np.ndarray, np.ndarray]:
        """Stochastic Oscillator"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.stoch(high_series, low_series, close_series, k=k_period, d=d_period, smooth_k=smooth_k)
            if result is not None and len(result.columns) >= 2:
                return result.iloc[:, 0].values, result.iloc[:, 1].values
            else:
                return np.full(len(close_series), np.nan), np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_stoch(high, low, close, k_period, d_period)
    
    def williams_r(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                   close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Williams %R"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.willr(high_series, low_series, close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_williams_r(high, low, close, period)
    
    def cci(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Commodity Channel Index"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.cci(high_series, low_series, close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_cci(high, low, close, period)
    
    def roc(self, close: Union[pd.Series, np.ndarray], period: int = 10) -> np.ndarray:
        """Rate of Change"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.roc(close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_roc(close, period)
    
    def momentum(self, close: Union[pd.Series, np.ndarray], period: int = 10) -> np.ndarray:
        """Momentum"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.mom(close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_momentum(close, period)
    
    def macd(self, close: Union[pd.Series, np.ndarray], fast_period: int = 12, 
             slow_period: int = 26, signal_period: int = 9) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """MACD"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.macd(close_series, fast=fast_period, slow=slow_period, signal=signal_period)
            if result is not None and len(result.columns) >= 3:
                return result.iloc[:, 0].values, result.iloc[:, 1].values, result.iloc[:, 2].values
            else:
                return (np.full(len(close_series), np.nan), 
                       np.full(len(close_series), np.nan), 
                       np.full(len(close_series), np.nan))
        else:
            # Fallback to numpy implementation
            return self._numpy_macd(close, fast_period, slow_period, signal_period)

    # === VOLATILITY INDICATORS ===
    
    def atr(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Average True Range"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.atr(high_series, low_series, close_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_atr(high, low, close, period)
    
    def bbands(self, close: Union[pd.Series, np.ndarray], period: int = 20, 
               std_dev: float = 2, ma_type: int = 0) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Bollinger Bands"""
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.bbands(close_series, length=period, std=std_dev)
            if result is not None and len(result.columns) >= 3:
                return result.iloc[:, 0].values, result.iloc[:, 1].values, result.iloc[:, 2].values
            else:
                return (np.full(len(close_series), np.nan), 
                       np.full(len(close_series), np.nan), 
                       np.full(len(close_series), np.nan))
        else:
            # Fallback to numpy implementation
            return self._numpy_bbands(close, period, std_dev)
    
    def kc(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
           close: Union[pd.Series, np.ndarray], period: int = 20, multiplier: float = 2) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Keltner Channels"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.kc(high_series, low_series, close_series, length=period, scalar=multiplier)
            if result is not None and len(result.columns) >= 3:
                return result.iloc[:, 0].values, result.iloc[:, 1].values, result.iloc[:, 2].values
            else:
                return (np.full(len(close_series), np.nan), 
                       np.full(len(close_series), np.nan), 
                       np.full(len(close_series), np.nan))
        else:
            # Fallback to numpy implementation
            return self._numpy_kc(high, low, close, period, multiplier)

    # === VOLUME INDICATORS ===
    
    def obv(self, close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """On Balance Volume"""
        close_series = self._to_pandas_series(close)
        volume_series = self._to_pandas_series(volume)
        if self.pandas_ta_available:
            result = self.pta.obv(close_series, volume_series)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_obv(close, volume)
    
    def ad(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
           close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Accumulation/Distribution Line"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        volume_series = self._to_pandas_series(volume)
        if self.pandas_ta_available:
            result = self.pta.ad(high_series, low_series, close_series, volume_series)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_ad(high, low, close, volume)
    
    def cmf(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray], 
            period: int = 20) -> np.ndarray:
        """Chaikin Money Flow"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        volume_series = self._to_pandas_series(volume)
        if self.pandas_ta_available:
            result = self.pta.cmf(high_series, low_series, close_series, volume_series, length=period)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_cmf(high, low, close, volume, period)
    
    def vwap(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
             close: Union[pd.Series, np.ndarray], volume: Union[pd.Series, np.ndarray]) -> np.ndarray:
        """Volume Weighted Average Price"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        volume_series = self._to_pandas_series(volume)
        if self.pandas_ta_available:
            result = self.pta.vwap(high_series, low_series, close_series, volume_series)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_vwap(high, low, close, volume)

    # === TREND STRENGTH INDICATORS ===
    
    def adx(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
            close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Average Directional Index"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.adx(high_series, low_series, close_series, length=period)
            if result is not None and len(result.columns) >= 1:
                return result.iloc[:, 0].values  # First column is ADX
            else:
                return np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_adx(high, low, close, period)
    
    def plus_di(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                 close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Plus Directional Indicator"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.adx(high_series, low_series, close_series, length=period)
            if result is not None and len(result.columns) >= 2:
                return result.iloc[:, 1].values  # Second column is +DI
            else:
                return np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_plus_di(high, low, close, period)
    
    def minus_di(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                  close: Union[pd.Series, np.ndarray], period: int = 14) -> np.ndarray:
        """Minus Directional Indicator"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.adx(high_series, low_series, close_series, length=period)
            if result is not None and len(result.columns) >= 3:
                return result.iloc[:, 2].values  # Third column is -DI
            else:
                return np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_minus_di(high, low, close, period)
    
    def aroon(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
              period: int = 14) -> Tuple[np.ndarray, np.ndarray]:
        """Aroon"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        if self.pandas_ta_available:
            result = self.pta.aroon(high_series, low_series, length=period)
            if result is not None and len(result.columns) >= 2:
                return result.iloc[:, 0].values, result.iloc[:, 1].values
            else:
                return (np.full(len(high_series), np.nan), 
                       np.full(len(high_series), np.nan))
        else:
            # Fallback to numpy implementation
            return self._numpy_aroon(high, low, period)

    # === CUSTOM INDICATORS ===
    
    def supertrend(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
                   close: Union[pd.Series, np.ndarray], period: int = 10, multiplier: float = 3) -> Tuple[np.ndarray, np.ndarray]:
        """Supertrend"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.supertrend(high_series, low_series, close_series, length=period, multiplier=multiplier)
            if result is not None and len(result.columns) >= 2:
                return result.iloc[:, 0].values, result.iloc[:, 1].values
            else:
                return (np.full(len(close_series), np.nan), 
                       np.full(len(close_series), np.nan))
        else:
            # Fallback to numpy implementation
            return self._numpy_supertrend(high, low, close, period, multiplier)
    
    def psar(self, high: Union[pd.Series, np.ndarray], low: Union[pd.Series, np.ndarray], 
             close: Union[pd.Series, np.ndarray], step: float = 0.02, maximum: float = 0.2) -> np.ndarray:
        """Parabolic SAR"""
        high_series = self._to_pandas_series(high)
        low_series = self._to_pandas_series(low)
        close_series = self._to_pandas_series(close)
        if self.pandas_ta_available:
            result = self.pta.psar(high_series, low_series, close_series, step=step, max_step=maximum)
            return result.values if result is not None else np.full(len(close_series), np.nan)
        else:
            # Fallback to numpy implementation
            return self._numpy_psar(high, low, close, step, maximum)

    # === NUMPY FALLBACK IMPLEMENTATIONS ===
    
    def _numpy_sma(self, data: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of SMA"""
        data = self._to_numpy(data)
        result = np.full(len(data), np.nan)
        for i in range(period - 1, len(data)):
            result[i] = np.mean(data[i - period + 1:i + 1])
        return result
    
    def _numpy_ema(self, data: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of EMA"""
        data = self._to_numpy(data)
        alpha = 2.0 / (period + 1)
        result = np.full(len(data), np.nan)
        result[0] = data[0]
        for i in range(1, len(data)):
            result[i] = alpha * data[i] + (1 - alpha) * result[i - 1]
        return result
    
    def _numpy_wma(self, data: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of WMA"""
        data = self._to_numpy(data)
        result = np.full(len(data), np.nan)
        weights = np.arange(1, period + 1)
        for i in range(period - 1, len(data)):
            result[i] = np.average(data[i - period + 1:i + 1], weights=weights)
        return result
    
    def _numpy_vwma(self, close: np.ndarray, volume: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of VWMA"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        result = np.full(len(close), np.nan)
        for i in range(period - 1, len(close)):
            window_close = close[i - period + 1:i + 1]
            window_volume = volume[i - period + 1:i + 1]
            result[i] = np.average(window_close, weights=window_volume)
        return result
    
    def _numpy_rsi(self, data: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of RSI"""
        data = self._to_numpy(data)
        deltas = np.diff(data)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        result = np.full(len(data), np.nan)
        
        for i in range(period, len(data)):
            avg_gain = np.mean(gains[i - period:i])
            avg_loss = np.mean(losses[i - period:i])
            
            if avg_loss == 0:
                result[i] = 100
            else:
                rs = avg_gain / avg_loss
                result[i] = 100 - (100 / (1 + rs))
        
        return result
    
    def _numpy_stoch(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, 
                    k_period: int, d_period: int) -> Tuple[np.ndarray, np.ndarray]:
        """Numpy implementation of Stochastic"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        k_values = np.full(len(close), np.nan)
        d_values = np.full(len(close), np.nan)
        
        for i in range(k_period - 1, len(close)):
            high_window = high[i - k_period + 1:i + 1]
            low_window = low[i - k_period + 1:i + 1]
            close_val = close[i]
            
            highest_high = np.max(high_window)
            lowest_low = np.min(low_window)
            
            if highest_high != lowest_low:
                k_values[i] = 100 * (close_val - lowest_low) / (highest_high - lowest_low)
            else:
                k_values[i] = 50
        
        # Calculate %D (simple moving average of %K)
        for i in range(d_period - 1, len(k_values)):
            d_values[i] = np.mean(k_values[i - d_period + 1:i + 1])
        
        return k_values, d_values
    
    def _numpy_williams_r(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of Williams %R"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        result = np.full(len(close), np.nan)
        
        for i in range(period - 1, len(close)):
            high_window = high[i - period + 1:i + 1]
            low_window = low[i - period + 1:i + 1]
            close_val = close[i]
            
            highest_high = np.max(high_window)
            lowest_low = np.min(low_window)
            
            if highest_high != lowest_low:
                result[i] = -100 * (highest_high - close_val) / (highest_high - lowest_low)
            else:
                result[i] = -50
        
        return result
    
    def _numpy_cci(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of CCI"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        result = np.full(len(close), np.nan)
        
        for i in range(period - 1, len(close)):
            high_window = high[i - period + 1:i + 1]
            low_window = low[i - period + 1:i + 1]
            close_window = close[i - period + 1:i + 1]
            
            tp = (high_window + low_window + close_window) / 3
            sma_tp = np.mean(tp)
            mad = np.mean(np.abs(tp - sma_tp))
            
            if mad != 0:
                result[i] = (tp[-1] - sma_tp) / (0.015 * mad)
            else:
                result[i] = 0
        
        return result
    
    def _numpy_roc(self, data: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of ROC"""
        data = self._to_numpy(data)
        result = np.full(len(data), np.nan)
        
        for i in range(period, len(data)):
            if data[i - period] != 0:
                result[i] = 100 * (data[i] - data[i - period]) / data[i - period]
            else:
                result[i] = 0
        
        return result
    
    def _numpy_momentum(self, data: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of Momentum"""
        data = self._to_numpy(data)
        result = np.full(len(data), np.nan)
        
        for i in range(period, len(data)):
            result[i] = data[i] - data[i - period]
        
        return result
    
    def _numpy_macd(self, data: np.ndarray, fast_period: int, slow_period: int, signal_period: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Numpy implementation of MACD"""
        data = self._to_numpy(data)
        
        # Calculate EMAs
        fast_ema = self._numpy_ema(data, fast_period)
        slow_ema = self._numpy_ema(data, slow_period)
        
        # MACD line
        macd_line = fast_ema - slow_ema
        
        # Signal line (EMA of MACD)
        signal_line = self._numpy_ema(macd_line, signal_period)
        
        # Histogram
        histogram = macd_line - signal_line
        
        return macd_line, signal_line, histogram
    
    def _numpy_atr(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of ATR"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        # Calculate true range
        tr = np.full(len(high), np.nan)
        tr[0] = high[0] - low[0]
        
        for i in range(1, len(high)):
            tr[i] = max(
                high[i] - low[i],
                abs(high[i] - close[i - 1]),
                abs(low[i] - close[i - 1])
            )
        
        # Calculate ATR as SMA of TR
        return self._numpy_sma(tr, period)
    
    def _numpy_bbands(self, data: np.ndarray, period: int, std_dev: float) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Numpy implementation of Bollinger Bands"""
        data = self._to_numpy(data)
        
        # Calculate SMA
        sma = self._numpy_sma(data, period)
        
        # Calculate standard deviation
        std = np.full(len(data), np.nan)
        for i in range(period - 1, len(data)):
            std[i] = np.std(data[i - period + 1:i + 1])
        
        # Calculate bands
        upper_band = sma + (std_dev * std)
        lower_band = sma - (std_dev * std)
        
        return upper_band, sma, lower_band
    
    def _numpy_kc(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int, multiplier: float) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Numpy implementation of Keltner Channels"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        # Calculate ATR
        atr = self._numpy_atr(high, low, close, period)
        
        # Calculate EMA of close
        ema = self._numpy_ema(close, period)
        
        # Calculate bands
        upper_band = ema + (multiplier * atr)
        lower_band = ema - (multiplier * atr)
        
        return upper_band, ema, lower_band
    
    def _numpy_obv(self, close: np.ndarray, volume: np.ndarray) -> np.ndarray:
        """Numpy implementation of OBV"""
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        
        result = np.zeros(len(close))
        result[0] = volume[0]
        
        for i in range(1, len(close)):
            if close[i] > close[i - 1]:
                result[i] = result[i - 1] + volume[i]
            elif close[i] < close[i - 1]:
                result[i] = result[i - 1] - volume[i]
            else:
                result[i] = result[i - 1]
        
        return result
    
    def _numpy_ad(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, volume: np.ndarray) -> np.ndarray:
        """Numpy implementation of A/D Line"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        
        result = np.zeros(len(close))
        
        for i in range(len(close)):
            if high[i] != low[i]:
                clv = ((close[i] - low[i]) - (high[i] - close[i])) / (high[i] - low[i])
                result[i] = clv * volume[i]
            else:
                result[i] = 0
        
        return np.cumsum(result)
    
    def _numpy_cmf(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, volume: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of CMF"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        
        # Calculate money flow multiplier
        mfm = np.zeros(len(close))
        for i in range(len(close)):
            if high[i] != low[i]:
                mfm[i] = ((close[i] - low[i]) - (high[i] - close[i])) / (high[i] - low[i])
            else:
                mfm[i] = 0
        
        # Calculate money flow volume
        mfv = mfm * volume
        
        # Calculate CMF as ratio of sum of MFV to sum of volume
        result = np.full(len(close), np.nan)
        for i in range(period - 1, len(close)):
            mfv_sum = np.sum(mfv[i - period + 1:i + 1])
            volume_sum = np.sum(volume[i - period + 1:i + 1])
            if volume_sum != 0:
                result[i] = mfv_sum / volume_sum
            else:
                result[i] = 0
        
        return result
    
    def _numpy_vwap(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, volume: np.ndarray) -> np.ndarray:
        """Numpy implementation of VWAP"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        volume = self._to_numpy(volume)
        
        # Calculate typical price
        typical_price = (high + low + close) / 3
        
        # Calculate VWAP
        result = np.full(len(close), np.nan)
        cumulative_tp_volume = 0
        cumulative_volume = 0
        
        for i in range(len(close)):
            cumulative_tp_volume += typical_price[i] * volume[i]
            cumulative_volume += volume[i]
            if cumulative_volume > 0:
                result[i] = cumulative_tp_volume / cumulative_volume
            else:
                result[i] = typical_price[i]
        
        return result
    
    def _numpy_adx(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of ADX (simplified)"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        # Calculate directional movement
        dm_plus = np.zeros(len(high))
        dm_minus = np.zeros(len(high))
        
        for i in range(1, len(high)):
            high_diff = high[i] - high[i - 1]
            low_diff = low[i - 1] - low[i]
            
            if high_diff > low_diff and high_diff > 0:
                dm_plus[i] = high_diff
            if low_diff > high_diff and low_diff > 0:
                dm_minus[i] = low_diff
        
        # Calculate true range
        tr = self._numpy_atr(high, low, close, 1)
        
        # Calculate directional indicators
        di_plus = 100 * self._numpy_sma(dm_plus, period) / self._numpy_sma(tr, period)
        di_minus = 100 * self._numpy_sma(dm_minus, period) / self._numpy_sma(tr, period)
        
        # Calculate ADX
        dx = 100 * np.abs(di_plus - di_minus) / (di_plus + di_minus)
        adx = self._numpy_sma(dx, period)
        
        return adx
    
    def _numpy_plus_di(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of +DI"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        # Calculate directional movement
        dm_plus = np.zeros(len(high))
        for i in range(1, len(high)):
            high_diff = high[i] - high[i - 1]
            low_diff = low[i - 1] - low[i]
            if high_diff > low_diff and high_diff > 0:
                dm_plus[i] = high_diff
        
        # Calculate true range
        tr = self._numpy_atr(high, low, close, 1)
        
        # Calculate +DI
        di_plus = 100 * self._numpy_sma(dm_plus, period) / self._numpy_sma(tr, period)
        
        return di_plus
    
    def _numpy_minus_di(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int) -> np.ndarray:
        """Numpy implementation of -DI"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        # Calculate directional movement
        dm_minus = np.zeros(len(high))
        for i in range(1, len(high)):
            high_diff = high[i] - high[i - 1]
            low_diff = low[i - 1] - low[i]
            if low_diff > high_diff and low_diff > 0:
                dm_minus[i] = low_diff
        
        # Calculate true range
        tr = self._numpy_atr(high, low, close, 1)
        
        # Calculate -DI
        di_minus = 100 * self._numpy_sma(dm_minus, period) / self._numpy_sma(tr, period)
        
        return di_minus
    
    def _numpy_aroon(self, high: np.ndarray, low: np.ndarray, period: int) -> Tuple[np.ndarray, np.ndarray]:
        """Numpy implementation of Aroon"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        
        aroon_up = np.full(len(high), np.nan)
        aroon_down = np.full(len(high), np.nan)
        
        for i in range(period - 1, len(high)):
            # Aroon Up: period since highest high
            high_window = high[i - period + 1:i + 1]
            highest_high_idx = np.argmax(high_window)
            aroon_up[i] = 100 * (period - 1 - highest_high_idx) / (period - 1)
            
            # Aroon Down: period since lowest low
            low_window = low[i - period + 1:i + 1]
            lowest_low_idx = np.argmin(low_window)
            aroon_down[i] = 100 * (period - 1 - lowest_low_idx) / (period - 1)
        
        return aroon_down, aroon_up
    
    def _numpy_supertrend(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, 
                          period: int, multiplier: float) -> Tuple[np.ndarray, np.ndarray]:
        """Numpy implementation of Supertrend"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        # Calculate ATR
        atr = self._numpy_atr(high, low, close, period)
        
        # Calculate basic upper and lower bands
        hl2 = (high + low) / 2
        upper_band = hl2 + (multiplier * atr)
        lower_band = hl2 - (multiplier * atr)
        
        # Calculate final upper and lower bands
        final_upper_band = np.full(len(close), np.nan)
        final_lower_band = np.full(len(close), np.nan)
        
        for i in range(1, len(close)):
            if upper_band[i] < final_upper_band[i-1] or close[i-1] > final_upper_band[i-1]:
                final_upper_band[i] = upper_band[i]
            else:
                final_upper_band[i] = final_upper_band[i-1]
            
            if lower_band[i] > final_lower_band[i-1] or close[i-1] < final_lower_band[i-1]:
                final_lower_band[i] = lower_band[i]
            else:
                final_lower_band[i] = final_lower_band[i-1]
        
        # Calculate Supertrend
        supertrend = np.full(len(close), np.nan)
        direction = np.full(len(close), np.nan)
        
        for i in range(1, len(close)):
            if close[i] <= final_lower_band[i]:
                supertrend[i] = final_lower_band[i]
                direction[i] = -1
            elif close[i] >= final_upper_band[i]:
                supertrend[i] = final_upper_band[i]
                direction[i] = 1
            else:
                supertrend[i] = supertrend[i-1]
                direction[i] = direction[i-1]
        
        return supertrend, direction
    
    def _numpy_psar(self, high: np.ndarray, low: np.ndarray, close: np.ndarray, 
                    step: float, maximum: float) -> np.ndarray:
        """Numpy implementation of Parabolic SAR"""
        high = self._to_numpy(high)
        low = self._to_numpy(low)
        close = self._to_numpy(close)
        
        psar = np.full(len(close), np.nan)
        trend = np.full(len(close), np.nan)
        af = np.full(len(close), np.nan)
        
        # Initialize
        psar[0] = low[0]
        trend[0] = 1
        af[0] = step
        
        for i in range(1, len(close)):
            # Calculate PSAR
            if trend[i-1] == 1:
                psar[i] = psar[i-1] + af[i-1] * (high[i-1] - psar[i-1])
            else:
                psar[i] = psar[i-1] + af[i-1] * (low[i-1] - psar[i-1])
            
            # Check for trend reversal
            if trend[i-1] == 1:
                if low[i] <= psar[i]:
                    trend[i] = -1
                    psar[i] = high[i-1]
                    af[i] = step
                else:
                    trend[i] = 1
                    if high[i] > high[i-1]:
                        af[i] = min(af[i-1] + step, maximum)
                    else:
                        af[i] = af[i-1]
            else:
                if high[i] >= psar[i]:
                    trend[i] = 1
                    psar[i] = low[i-1]
                    af[i] = step
                else:
                    trend[i] = -1
                    if low[i] < low[i-1]:
                        af[i] = min(af[i-1] + step, maximum)
                    else:
                        af[i] = af[i-1]
        
        return psar

    # === UTILITY METHODS ===
    
    def get_available_indicators(self) -> List[str]:
        """Get list of available indicator methods"""
        methods = [method for method in dir(self) if not method.startswith('_') and callable(getattr(self, method))]
        return [method for method in methods if method not in ['get_available_indicators', 'calculate_indicator', 'get_indicator_info']]
    
    def calculate_indicator(self, indicator_name: str, data: Dict[str, Union[pd.Series, np.ndarray]], 
                           **kwargs) -> Union[np.ndarray, Tuple[np.ndarray, ...]]:
        """Calculate indicator by name with data and parameters"""
        if not hasattr(self, indicator_name):
            raise ValueError(f"Indicator '{indicator_name}' not found")
        
        method = getattr(self, indicator_name)
        return method(**data, **kwargs)
    
    def get_indicator_info(self, indicator_name: str) -> Dict[str, Any]:
        """Get information about an indicator"""
        if not hasattr(self, indicator_name):
            raise ValueError(f"Indicator '{indicator_name}' not found")
        
        method = getattr(self, indicator_name)
        import inspect
        sig = inspect.signature(method)
        
        return {
            'name': indicator_name,
            'docstring': method.__doc__,
            'parameters': list(sig.parameters.keys()),
            'return_annotation': sig.return_annotation
        }


# Example usage and testing
if __name__ == "__main__":
    # Create sample data
    np.random.seed(42)
    n = 100
    close = 100 + np.cumsum(np.random.randn(n) * 0.5)
    high = close + np.random.rand(n) * 2
    low = close - np.random.rand(n) * 2
    volume = np.random.randint(1000, 10000, n)
    
    # Initialize backend
    backend = SimpleIndicatorBackend()
    
    # Test some indicators
    print("Testing simplified indicators...")
    
    # Test SMA
    sma_result = backend.sma(close, period=20)
    print(f"SMA (first 5 values): {sma_result[:5]}")
    
    # Test RSI
    rsi_result = backend.rsi(close, period=14)
    print(f"RSI (first 5 values): {rsi_result[:5]}")
    
    # Test MACD
    macd, macd_signal, macd_hist = backend.macd(close)
    print(f"MACD (first 5 values): {macd[:5]}")
    
    # Test Bollinger Bands
    bb_upper, bb_middle, bb_lower = backend.bbands(close, period=20, std_dev=2)
    print(f"BB Upper (first 5 values): {bb_upper[:5]}")
    
    print(f"\nAvailable indicators: {len(backend.get_available_indicators())}")
    print("Simplified backend initialized successfully!")