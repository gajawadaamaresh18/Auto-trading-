/**
 * Basket Analytics and Bulk Scan Service
 * 
 * Comprehensive analytics service for basket performance, signal analysis,
 * and bulk scanning functionality across multiple symbols.
 */

from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import asyncio
import uuid

from app.models.baskets import Basket, BasketSignal, BasketTrade, BasketAnalytics
from app.models.formulas import Formula
from app.services.market_data_service import MarketDataService
from app.services.formula_engine import FormulaEngine
from app.services.notification_service import NotificationService
from app.utils.logging import get_logger

logger = get_logger(__name__)

class BasketAnalyticsService:
    """Service for calculating and managing basket analytics."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def calculate_basket_analytics(self, basket_id: str) -> Dict:
        """Calculate comprehensive analytics for a basket."""
        try:
            # Get basket
            basket = self.db.query(Basket).filter(Basket.id == basket_id).first()
            if not basket:
                return None
            
            # Get signals and trades
            signals = self.db.query(BasketSignal).filter(
                BasketSignal.basket_id == basket_id
            ).all()
            
            trades = self.db.query(BasketTrade).filter(
                BasketTrade.basket_id == basket_id
            ).all()
            
            # Calculate analytics
            analytics = {
                "basket_id": basket_id,
                "calculated_at": datetime.utcnow(),
                
                # Signal Analytics
                "total_signals": len(signals),
                "active_signals": len([s for s in signals if s.status == "ACTIVE"]),
                "executed_signals": len([s for s in signals if s.status == "EXECUTED"]),
                "expired_signals": len([s for s in signals if s.status == "EXPIRED"]),
                
                # Trade Analytics
                "total_trades": len(trades),
                "open_trades": len([t for t in trades if t.status == "OPEN"]),
                "closed_trades": len([t for t in trades if t.status == "CLOSED"]),
                
                # Performance Metrics
                "win_rate": self._calculate_win_rate(trades),
                "avg_win": self._calculate_avg_win(trades),
                "avg_loss": self._calculate_avg_loss(trades),
                "profit_factor": self._calculate_profit_factor(trades),
                "max_drawdown": self._calculate_max_drawdown(trades),
                "sharpe_ratio": self._calculate_sharpe_ratio(trades),
                
                # P&L Analytics
                "total_pnl": self._calculate_total_pnl(trades),
                "total_pnl_percentage": self._calculate_total_pnl_percentage(trades),
                
                # Top Performers
                "best_performer": self._get_best_performer(trades),
                "worst_performer": self._get_worst_performer(trades),
                
                # Distribution Analytics
                "signals_by_formula": self._get_signals_by_formula(signals),
                "trades_by_symbol": self._get_trades_by_symbol(trades),
                
                # Performance by Period
                "performance_by_period": self._get_performance_by_period(trades),
                
                # Risk Metrics
                "risk_metrics": self._calculate_risk_metrics(trades),
                
                # Market Metrics
                "market_metrics": self._calculate_market_metrics(basket, signals, trades)
            }
            
            # Save analytics
            await self._save_basket_analytics(basket_id, analytics)
            
            # Update basket with cached analytics
            await self._update_basket_analytics(basket, analytics)
            
            logger.info(f"Basket analytics calculated for {basket_id}")
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error calculating basket analytics for {basket_id}: {str(e)}")
            raise
    
    def _calculate_win_rate(self, trades: List[BasketTrade]) -> float:
        """Calculate win rate from closed trades."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        if not closed_trades:
            return 0.0
        
        winning_trades = len([t for t in closed_trades if t.pnl > 0])
        return (winning_trades / len(closed_trades)) * 100
    
    def _calculate_avg_win(self, trades: List[BasketTrade]) -> float:
        """Calculate average win from closed trades."""
        winning_trades = [t for t in trades if t.status == "CLOSED" and t.pnl and t.pnl > 0]
        if not winning_trades:
            return 0.0
        
        return sum(t.pnl for t in winning_trades) / len(winning_trades)
    
    def _calculate_avg_loss(self, trades: List[BasketTrade]) -> float:
        """Calculate average loss from closed trades."""
        losing_trades = [t for t in trades if t.status == "CLOSED" and t.pnl and t.pnl < 0]
        if not losing_trades:
            return 0.0
        
        return sum(t.pnl for t in losing_trades) / len(losing_trades)
    
    def _calculate_profit_factor(self, trades: List[BasketTrade]) -> float:
        """Calculate profit factor from closed trades."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        if not closed_trades:
            return 0.0
        
        total_profit = sum(t.pnl for t in closed_trades if t.pnl > 0)
        total_loss = abs(sum(t.pnl for t in closed_trades if t.pnl < 0))
        
        if total_loss == 0:
            return float('inf') if total_profit > 0 else 0.0
        
        return total_profit / total_loss
    
    def _calculate_max_drawdown(self, trades: List[BasketTrade]) -> float:
        """Calculate maximum drawdown from closed trades."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        if not closed_trades:
            return 0.0
        
        # Sort by creation date
        closed_trades.sort(key=lambda t: t.created_at)
        
        peak = 0
        max_drawdown = 0
        running_pnl = 0
        
        for trade in closed_trades:
            running_pnl += trade.pnl
            if running_pnl > peak:
                peak = running_pnl
            
            drawdown = peak - running_pnl
            if drawdown > max_drawdown:
                max_drawdown = drawdown
        
        return max_drawdown
    
    def _calculate_sharpe_ratio(self, trades: List[BasketTrade]) -> float:
        """Calculate Sharpe ratio from closed trades."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        if len(closed_trades) < 2:
            return 0.0
        
        pnls = [t.pnl for t in closed_trades]
        avg_return = sum(pnls) / len(pnls)
        
        # Calculate standard deviation
        variance = sum((pnl - avg_return) ** 2 for pnl in pnls) / len(pnls)
        std_dev = variance ** 0.5
        
        if std_dev == 0:
            return 0.0
        
        # Assume risk-free rate of 0 for simplicity
        return avg_return / std_dev
    
    def _calculate_total_pnl(self, trades: List[BasketTrade]) -> float:
        """Calculate total P&L from closed trades."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        return sum(t.pnl for t in closed_trades)
    
    def _calculate_total_pnl_percentage(self, trades: List[BasketTrade]) -> float:
        """Calculate total P&L percentage from closed trades."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl_percentage is not None]
        if not closed_trades:
            return 0.0
        
        return sum(t.pnl_percentage for t in closed_trades)
    
    def _get_best_performer(self, trades: List[BasketTrade]) -> str:
        """Get best performing symbol."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        if not closed_trades:
            return "N/A"
        
        symbol_pnl = {}
        for trade in closed_trades:
            if trade.symbol not in symbol_pnl:
                symbol_pnl[trade.symbol] = 0
            symbol_pnl[trade.symbol] += trade.pnl
        
        if not symbol_pnl:
            return "N/A"
        
        return max(symbol_pnl.items(), key=lambda x: x[1])[0]
    
    def _get_worst_performer(self, trades: List[BasketTrade]) -> str:
        """Get worst performing symbol."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        if not closed_trades:
            return "N/A"
        
        symbol_pnl = {}
        for trade in closed_trades:
            if trade.symbol not in symbol_pnl:
                symbol_pnl[trade.symbol] = 0
            symbol_pnl[trade.symbol] += trade.pnl
        
        if not symbol_pnl:
            return "N/A"
        
        return min(symbol_pnl.items(), key=lambda x: x[1])[0]
    
    def _get_signals_by_formula(self, signals: List[BasketSignal]) -> Dict[str, int]:
        """Get signal count by formula."""
        formula_counts = {}
        for signal in signals:
            formula_id = signal.formula_id
            if formula_id not in formula_counts:
                formula_counts[formula_id] = 0
            formula_counts[formula_id] += 1
        
        return formula_counts
    
    def _get_trades_by_symbol(self, trades: List[BasketTrade]) -> Dict[str, int]:
        """Get trade count by symbol."""
        symbol_counts = {}
        for trade in trades:
            if trade.symbol not in symbol_counts:
                symbol_counts[trade.symbol] = 0
            symbol_counts[trade.symbol] += 1
        
        return symbol_counts
    
    def _get_performance_by_period(self, trades: List[BasketTrade]) -> Dict[str, float]:
        """Get performance by time period."""
        now = datetime.utcnow()
        
        daily_trades = [t for t in trades if t.created_at >= now - timedelta(days=1)]
        weekly_trades = [t for t in trades if t.created_at >= now - timedelta(weeks=1)]
        monthly_trades = [t for t in trades if t.created_at >= now - timedelta(days=30)]
        yearly_trades = [t for t in trades if t.created_at >= now - timedelta(days=365)]
        
        return {
            "daily": self._calculate_total_pnl_percentage(daily_trades),
            "weekly": self._calculate_total_pnl_percentage(weekly_trades),
            "monthly": self._calculate_total_pnl_percentage(monthly_trades),
            "yearly": self._calculate_total_pnl_percentage(yearly_trades)
        }
    
    def _calculate_risk_metrics(self, trades: List[BasketTrade]) -> Dict:
        """Calculate risk metrics."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.pnl is not None]
        
        if not closed_trades:
            return {
                "var_95": 0.0,
                "var_99": 0.0,
                "expected_shortfall": 0.0,
                "volatility": 0.0
            }
        
        pnls = [t.pnl for t in closed_trades]
        pnls.sort()
        
        # Calculate VaR (Value at Risk)
        var_95_index = int(len(pnls) * 0.05)
        var_99_index = int(len(pnls) * 0.01)
        
        var_95 = pnls[var_95_index] if var_95_index < len(pnls) else pnls[0]
        var_99 = pnls[var_99_index] if var_99_index < len(pnls) else pnls[0]
        
        # Calculate Expected Shortfall
        expected_shortfall = sum(pnls[:var_95_index]) / var_95_index if var_95_index > 0 else 0
        
        # Calculate Volatility
        avg_pnl = sum(pnls) / len(pnls)
        variance = sum((pnl - avg_pnl) ** 2 for pnl in pnls) / len(pnls)
        volatility = variance ** 0.5
        
        return {
            "var_95": var_95,
            "var_99": var_99,
            "expected_shortfall": expected_shortfall,
            "volatility": volatility
        }
    
    def _calculate_market_metrics(self, basket: Basket, signals: List[BasketSignal], trades: List[BasketTrade]) -> Dict:
        """Calculate market-related metrics."""
        return {
            "total_symbols": len(basket.symbols),
            "active_symbols": len(set(t.symbol for t in trades if t.status == "OPEN")),
            "signal_frequency": len(signals) / max(len(basket.symbols), 1),
            "trade_frequency": len(trades) / max(len(basket.symbols), 1),
            "avg_holding_period": self._calculate_avg_holding_period(trades)
        }
    
    def _calculate_avg_holding_period(self, trades: List[BasketTrade]) -> float:
        """Calculate average holding period in days."""
        closed_trades = [t for t in trades if t.status == "CLOSED" and t.closed_at]
        if not closed_trades:
            return 0.0
        
        total_days = 0
        for trade in closed_trades:
            days = (trade.closed_at - trade.created_at).days
            total_days += days
        
        return total_days / len(closed_trades)
    
    async def _save_basket_analytics(self, basket_id: str, analytics: Dict):
        """Save analytics to database."""
        try:
            # Create new analytics record
            analytics_record = BasketAnalytics(
                id=str(uuid.uuid4()),
                basket_id=basket_id,
                analytics_data=analytics,
                calculated_at=datetime.utcnow()
            )
            
            self.db.add(analytics_record)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error saving basket analytics: {str(e)}")
            self.db.rollback()
            raise
    
    async def _update_basket_analytics(self, basket: Basket, analytics: Dict):
        """Update basket with cached analytics."""
        try:
            basket.total_signals = analytics["total_signals"]
            basket.active_signals = analytics["active_signals"]
            basket.total_trades = analytics["total_trades"]
            basket.win_rate = analytics["win_rate"]
            basket.avg_return = analytics["total_pnl_percentage"]
            basket.max_drawdown = analytics["max_drawdown"]
            basket.updated_at = datetime.utcnow()
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error updating basket analytics: {str(e)}")
            self.db.rollback()
            raise

class BasketScanService:
    """Service for bulk scanning baskets for trading signals."""
    
    def __init__(self, db: Session):
        self.db = db
        self.market_data_service = MarketDataService(db)
        self.formula_engine = FormulaEngine(db)
        self.notification_service = NotificationService(db)
    
    async def scan_basket(self, basket_id: str, scan_request: Dict, user_id: str) -> Dict:
        """Scan a basket for trading signals."""
        try:
            # Get basket
            basket = self.db.query(Basket).filter(
                Basket.id == basket_id,
                Basket.created_by == user_id
            ).first()
            
            if not basket:
                raise ValueError("Basket not found")
            
            # Get assigned formulas
            formulas = self.db.query(Formula).filter(
                Formula.id.in_(basket.assigned_formulas)
            ).all()
            
            if not formulas:
                raise ValueError("No formulas assigned to basket")
            
            # Get market data for all symbols
            market_data = await self._get_market_data_for_symbols(basket.symbols)
            
            # Scan each symbol with each formula
            scan_results = []
            signals_generated = 0
            
            for symbol in basket.symbols:
                if symbol not in market_data:
                    continue
                
                symbol_data = market_data[symbol]
                
                for formula in formulas:
                    try:
                        # Run formula on symbol data
                        formula_result = await self.formula_engine.evaluate_formula(
                            formula.id, symbol, symbol_data
                        )
                        
                        if formula_result and formula_result.get("signal"):
                            signal = formula_result["signal"]
                            
                            # Create basket signal
                            basket_signal = await self._create_basket_signal(
                                basket_id, formula.id, symbol, signal, user_id
                            )
                            
                            if basket_signal:
                                signals_generated += 1
                                scan_results.append({
                                    "symbol": symbol,
                                    "formula_id": formula.id,
                                    "formula_name": formula.name,
                                    "signal": signal,
                                    "signal_id": basket_signal.id
                                })
                    
                    except Exception as e:
                        logger.error(f"Error scanning {symbol} with formula {formula.id}: {str(e)}")
                        continue
            
            # Update basket scan time
            basket.last_scan_time = datetime.utcnow()
            self.db.commit()
            
            # Send notifications if enabled
            if basket.settings.get("notifications", False) and signals_generated > 0:
                await self._send_scan_notifications(basket, signals_generated, user_id)
            
            logger.info(f"Basket {basket_id} scanned: {signals_generated} signals generated")
            
            return {
                "basket_id": basket_id,
                "scan_time": datetime.utcnow(),
                "symbols_scanned": len(basket.symbols),
                "formulas_used": len(formulas),
                "signals_generated": signals_generated,
                "scan_results": scan_results
            }
            
        except Exception as e:
            logger.error(f"Error scanning basket {basket_id}: {str(e)}")
            raise
    
    async def _get_market_data_for_symbols(self, symbols: List[str]) -> Dict:
        """Get market data for all symbols in basket."""
        try:
            market_data = {}
            
            # Get data for each symbol
            for symbol in symbols:
                try:
                    data = await self.market_data_service.get_symbol_data(symbol)
                    if data:
                        market_data[symbol] = data
                except Exception as e:
                    logger.error(f"Error getting market data for {symbol}: {str(e)}")
                    continue
            
            return market_data
            
        except Exception as e:
            logger.error(f"Error getting market data for symbols: {str(e)}")
            raise
    
    async def _create_basket_signal(self, basket_id: str, formula_id: str, symbol: str, 
                                  signal: Dict, user_id: str) -> Optional[BasketSignal]:
        """Create a basket signal from formula result."""
        try:
            basket_signal = BasketSignal(
                id=str(uuid.uuid4()),
                basket_id=basket_id,
                formula_id=formula_id,
                symbol=symbol,
                action=signal.get("action", "BUY"),
                price=signal.get("price", 0.0),
                quantity=signal.get("quantity", 1),
                stop_loss=signal.get("stop_loss"),
                take_profit=signal.get("take_profit"),
                signal_strength=signal.get("strength", 5),
                confidence=signal.get("confidence", 50.0),
                reason=signal.get("reason", ""),
                status="ACTIVE",
                created_at=datetime.utcnow()
            )
            
            self.db.add(basket_signal)
            self.db.commit()
            
            return basket_signal
            
        except Exception as e:
            logger.error(f"Error creating basket signal: {str(e)}")
            self.db.rollback()
            return None
    
    async def _send_scan_notifications(self, basket: Basket, signals_generated: int, user_id: str):
        """Send notifications about scan results."""
        try:
            if signals_generated > 0:
                await self.notification_service.send_basket_scan_notification(
                    user_id, basket, signals_generated
                )
            
        except Exception as e:
            logger.error(f"Error sending scan notifications: {str(e)}")
    
    async def bulk_scan_baskets(self, user_id: str, basket_ids: List[str] = None) -> Dict:
        """Perform bulk scan on multiple baskets."""
        try:
            # Get baskets to scan
            query = self.db.query(Basket).filter(
                Basket.created_by == user_id,
                Basket.is_active == True
            )
            
            if basket_ids:
                query = query.filter(Basket.id.in_(basket_ids))
            
            baskets = query.all()
            
            if not baskets:
                return {"message": "No active baskets found"}
            
            # Scan each basket
            scan_results = []
            total_signals = 0
            
            for basket in baskets:
                try:
                    result = await self.scan_basket(
                        basket.id, 
                        {"bulk_scan": True}, 
                        user_id
                    )
                    
                    scan_results.append(result)
                    total_signals += result["signals_generated"]
                    
                except Exception as e:
                    logger.error(f"Error scanning basket {basket.id}: {str(e)}")
                    scan_results.append({
                        "basket_id": basket.id,
                        "error": str(e)
                    })
            
            logger.info(f"Bulk scan completed: {total_signals} signals generated across {len(baskets)} baskets")
            
            return {
                "scan_time": datetime.utcnow(),
                "baskets_scanned": len(baskets),
                "total_signals": total_signals,
                "scan_results": scan_results
            }
            
        except Exception as e:
            logger.error(f"Error in bulk scan: {str(e)}")
            raise
    
    async def schedule_basket_scans(self):
        """Schedule automatic basket scans based on frequency."""
        try:
            # Get baskets that need scanning
            now = datetime.utcnow()
            
            baskets_to_scan = []
            
            # Check hourly scans
            hourly_baskets = self.db.query(Basket).filter(
                Basket.scan_frequency == "HOURLY",
                Basket.is_active == True,
                or_(
                    Basket.last_scan_time.is_(None),
                    Basket.last_scan_time < now - timedelta(hours=1)
                )
            ).all()
            
            baskets_to_scan.extend(hourly_baskets)
            
            # Check daily scans
            daily_baskets = self.db.query(Basket).filter(
                Basket.scan_frequency == "DAILY",
                Basket.is_active == True,
                or_(
                    Basket.last_scan_time.is_(None),
                    Basket.last_scan_time < now - timedelta(days=1)
                )
            ).all()
            
            baskets_to_scan.extend(daily_baskets)
            
            # Check weekly scans
            weekly_baskets = self.db.query(Basket).filter(
                Basket.scan_frequency == "WEEKLY",
                Basket.is_active == True,
                or_(
                    Basket.last_scan_time.is_(None),
                    Basket.last_scan_time < now - timedelta(weeks=1)
                )
            ).all()
            
            baskets_to_scan.extend(weekly_baskets)
            
            # Scan baskets
            if baskets_to_scan:
                logger.info(f"Scheduling scans for {len(baskets_to_scan)} baskets")
                
                for basket in baskets_to_scan:
                    try:
                        await self.scan_basket(
                            basket.id,
                            {"scheduled_scan": True},
                            basket.created_by
                        )
                    except Exception as e:
                        logger.error(f"Error in scheduled scan for basket {basket.id}: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in scheduled basket scans: {str(e)}")

# Export services
__all__ = [
    "BasketAnalyticsService",
    "BasketScanService"
]
