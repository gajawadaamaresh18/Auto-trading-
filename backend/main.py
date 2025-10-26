"""
FastAPI application for risk control system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

from services.risk import RiskService, TradeData, RiskConfig, RiskValidationResult


app = FastAPI(
    title="Risk Control API",
    description="API for validating trades against risk parameters",
    version="1.0.0"
)

# Add CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize risk service
risk_service = RiskService()


class TradeRequest(BaseModel):
    """Request model for trade validation"""
    symbol: str
    entry_price: float
    position_size: float
    stop_loss: float
    take_profit: float
    stop_loss_type: str
    take_profit_type: str
    current_price: float
    portfolio_value: float
    leverage: float = 1.0


class RiskConfigRequest(BaseModel):
    """Request model for risk configuration"""
    max_portfolio_risk: float
    max_position_size: float
    max_risk_per_trade: float
    max_drawdown: float
    min_risk_reward_ratio: float = 1.0
    max_leverage: float = 1.0


class ValidationRequest(BaseModel):
    """Request model for trade validation with risk config"""
    trade: TradeRequest
    risk_config: RiskConfigRequest


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Risk Control API is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "risk-control"}


@app.post("/api/risk/validate")
async def validate_trade(request: ValidationRequest):
    """
    Validate a trade against risk parameters
    """
    try:
        # Convert request to internal data structures
        trade_data = TradeData(
            symbol=request.trade.symbol,
            entry_price=request.trade.entry_price,
            position_size=request.trade.position_size,
            stop_loss=request.trade.stop_loss,
            take_profit=request.trade.take_profit,
            stop_loss_type=request.trade.stop_loss_type,
            take_profit_type=request.trade.take_profit_type,
            current_price=request.trade.current_price,
            portfolio_value=request.trade.portfolio_value,
            leverage=request.trade.leverage
        )
        
        risk_config = RiskConfig(
            max_portfolio_risk=request.risk_config.max_portfolio_risk,
            max_position_size=request.risk_config.max_position_size,
            max_risk_per_trade=request.risk_config.max_risk_per_trade,
            max_drawdown=request.risk_config.max_drawdown,
            min_risk_reward_ratio=request.risk_config.min_risk_reward_ratio,
            max_leverage=request.risk_config.max_leverage
        )
        
        # Validate trade
        result = risk_service.validate_trade(trade_data, risk_config)
        
        return {
            "status": result.status,
            "message": result.message,
            "risk_metrics": {
                "risk_amount": result.risk_metrics.risk_amount,
                "reward_amount": result.risk_metrics.reward_amount,
                "risk_reward_ratio": result.risk_metrics.risk_reward_ratio,
                "portfolio_risk_percentage": result.risk_metrics.portfolio_risk_percentage,
                "position_risk_percentage": result.risk_metrics.position_risk_percentage,
                "leverage_risk": result.risk_metrics.leverage_risk,
                "is_risky": result.risk_metrics.is_risky,
                "violations": result.risk_metrics.violations,
                "warnings": result.risk_metrics.warnings,
                "recommendations": result.risk_metrics.recommendations
            },
            "suggested_adjustments": result.suggested_adjustments
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")


@app.post("/api/risk/calculate")
async def calculate_risk_metrics(request: ValidationRequest):
    """
    Calculate risk metrics without validation
    """
    try:
        # Convert request to internal data structures
        trade_data = TradeData(
            symbol=request.trade.symbol,
            entry_price=request.trade.entry_price,
            position_size=request.trade.position_size,
            stop_loss=request.trade.stop_loss,
            take_profit=request.trade.take_profit,
            stop_loss_type=request.trade.stop_loss_type,
            take_profit_type=request.trade.take_profit_type,
            current_price=request.trade.current_price,
            portfolio_value=request.trade.portfolio_value,
            leverage=request.trade.leverage
        )
        
        risk_config = RiskConfig(
            max_portfolio_risk=request.risk_config.max_portfolio_risk,
            max_position_size=request.risk_config.max_position_size,
            max_risk_per_trade=request.risk_config.max_risk_per_trade,
            max_drawdown=request.risk_config.max_drawdown,
            min_risk_reward_ratio=request.risk_config.min_risk_reward_ratio,
            max_leverage=request.risk_config.max_leverage
        )
        
        # Calculate risk metrics
        risk_metrics = risk_service.calculate_risk_metrics(trade_data, risk_config)
        
        return {
            "risk_amount": risk_metrics.risk_amount,
            "reward_amount": risk_metrics.reward_amount,
            "risk_reward_ratio": risk_metrics.risk_reward_ratio,
            "portfolio_risk_percentage": risk_metrics.portfolio_risk_percentage,
            "position_risk_percentage": risk_metrics.position_risk_percentage,
            "leverage_risk": risk_metrics.leverage_risk,
            "is_risky": risk_metrics.is_risky,
            "violations": risk_metrics.violations,
            "warnings": risk_metrics.warnings,
            "recommendations": risk_metrics.recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")


@app.post("/api/risk/calculate-max-position")
async def calculate_max_position_size(
    entry_price: float,
    stop_loss: float,
    stop_loss_type: str,
    portfolio_value: float,
    max_risk_percentage: float
):
    """
    Calculate maximum position size based on risk parameters
    """
    try:
        max_size = risk_service.calculate_max_position_size(
            entry_price, stop_loss, stop_loss_type, portfolio_value, max_risk_percentage
        )
        
        return {
            "max_position_size": max_size,
            "max_risk_amount": portfolio_value * max_risk_percentage
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")


@app.post("/api/risk/calculate-optimal-tp")
async def calculate_optimal_take_profit(
    entry_price: float,
    stop_loss: float,
    stop_loss_type: str,
    min_risk_reward_ratio: float
):
    """
    Calculate optimal take profit based on risk:reward ratio
    """
    try:
        optimal_tp = risk_service.calculate_optimal_take_profit(
            entry_price, stop_loss, stop_loss_type, min_risk_reward_ratio
        )
        
        return {
            "optimal_take_profit": optimal_tp,
            "risk_reward_ratio": min_risk_reward_ratio
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)